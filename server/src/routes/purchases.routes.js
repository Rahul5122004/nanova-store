import express from 'express';
import { query, getOne, transaction } from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Admin: List All Purchases
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { brand, supplier_id, limit = 100 } = req.query;

    let sql = `
      SELECT pu.*, 
             COALESCE(s.name, 'Direct Procurement') as supplier_name, 
             COALESCE(s.company_name, 'Wholesale Vendor') as supplier_company, 
             COALESCE(s.phone, '-') as supplier_phone,
             COALESCE(b.name, CASE WHEN pu.brand_id = 2 THEN 'SURPRISE NANOVA' ELSE 'NANOVA TEES' END) as brand_name, 
             COALESCE(b.code, CASE WHEN pu.brand_id = 2 THEN 'surprise_nanova' ELSE 'nanova_tees' END) as brand_code
      FROM purchases pu
      LEFT JOIN suppliers s ON pu.supplier_id = s.id
      LEFT JOIN brands b ON pu.brand_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (brand && brand !== 'all') {
      if (isNaN(brand)) {
        sql += ' AND (b.code = ? OR (b.code IS NULL AND CASE WHEN pu.brand_id = 2 THEN "surprise_nanova" ELSE "nanova_tees" END = ?))';
        params.push(brand, brand);
      } else {
        sql += ' AND (b.id = ? OR pu.brand_id = ?)';
        params.push(brand, brand);
      }
    }

    if (supplier_id) {
      sql += ' AND pu.supplier_id = ?';
      params.push(supplier_id);
    }

    sql += ' ORDER BY pu.purchase_date DESC, pu.id DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const purchases = await query(sql, params);

    for (const p of purchases) {
      p.items = await query(
        `SELECT pi.*, COALESCE(pr.name, 'Procured Product Item') as product_name
         FROM purchase_items pi
         LEFT JOIN products pr ON pi.product_id = pr.id
         WHERE pi.purchase_id = ?`,
        [p.id]
      );
    }

    res.json({
      success: true,
      count: purchases.length,
      purchases
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Record New Purchase Restock
 * Automatically increments variant stock and purchased_quantity,
 * and records inventory audit transaction.
 */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      supplier_id,
      brand_id,
      purchase_date,
      additional_expenses = 0,
      notes = '',
      items // [{ product_id, variant_id, size, color, quantity, unit_cost }]
    } = req.body;

    if (!supplier_id || !brand_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Supplier, brand, and at least one purchase item are required.'
      });
    }

    const year = new Date().getFullYear();
    const countRow = await getOne('SELECT COUNT(*) as cnt FROM purchases');
    const purchaseNumber = `PUR-${year}-${String(Number(countRow.cnt) + 1).padStart(3, '0')}`;

    let totalAmount = 0;
    for (const it of items) {
      totalAmount += Number(it.quantity) * Number(it.unit_cost);
    }

    const purchaseId = await transaction(async (tx) => {
      // 1. Create Purchase record
      const pRes = await tx.query(
        `INSERT INTO purchases (
          purchase_number, supplier_id, brand_id, purchase_date,
          total_amount, additional_expenses, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          purchaseNumber,
          supplier_id,
          brand_id,
          purchase_date || new Date().toISOString().split('T')[0],
          totalAmount,
          Number(additional_expenses || 0),
          notes,
          req.admin.username
        ]
      );

      const newPurchaseId = pRes.insertId;

      // 2. Insert items, update variant stock & log audit
      for (const item of items) {
        const itemTotal = Number(item.quantity) * Number(item.unit_cost);

        await tx.query(
          `INSERT INTO purchase_items (
            purchase_id, product_id, variant_id, size, color, quantity, unit_cost, total_cost
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newPurchaseId,
            item.product_id,
            item.variant_id,
            item.size,
            item.color,
            item.quantity,
            item.unit_cost,
            itemTotal
          ]
        );

        // Fetch current stock
        const currentVariant = await tx.getOne('SELECT stock_quantity, purchased_quantity FROM product_variants WHERE id = ?', [item.variant_id]);
        if (currentVariant) {
          const prevStock = Number(currentVariant.stock_quantity);
          const newStock = prevStock + Number(item.quantity);
          const newPurchased = Number(currentVariant.purchased_quantity) + Number(item.quantity);

          // Update product variant stock
          await tx.query(
            'UPDATE product_variants SET stock_quantity = ?, purchased_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newStock, newPurchased, item.variant_id]
          );

          // Update base product purchase_cost
          await tx.query(
            'UPDATE products SET purchase_cost = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [item.unit_cost, item.product_id]
          );

          // Log audit transaction
          await tx.query(
            `INSERT INTO inventory_transactions (
              product_id, variant_id, brand_id, transaction_type,
              quantity_change, previous_stock, new_stock, reference_id, reason, created_by
            ) VALUES (?, ?, ?, 'PURCHASE', ?, ?, ?, ?, ?, ?)`,
            [
              item.product_id,
              item.variant_id,
              brand_id,
              Number(item.quantity),
              prevStock,
              newStock,
              purchaseNumber,
              `Purchase Intake #${purchaseNumber}`,
              req.admin.username
            ]
          );
        }
      }

      return newPurchaseId;
    });

    res.status(201).json({
      success: true,
      message: 'Purchase recorded and stock quantities updated successfully!',
      purchaseId,
      purchaseNumber
    });
  } catch (err) {
    console.error('[Create Purchase Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
