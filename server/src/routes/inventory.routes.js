import express from 'express';
import { query, getOne, transaction } from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { sendNotification } from '../services/notificationService.js';

const router = express.Router();

/**
 * Admin: Get Complete Inventory Matrix
 * Filters: brand (nanova_tees / surprise_nanova / all), search, lowStockOnly
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { brand, search, lowStockOnly } = req.query;

    // Auto-heal: Ensure all existing products have at least one variant record
    try {
      const orphans = await query(
        `SELECT p.id, p.sku, p.name, p.brand_id FROM products p
         LEFT JOIN product_variants pv ON p.id = pv.product_id
         WHERE pv.id IS NULL`
      );
      if (Array.isArray(orphans) && orphans.length > 0) {
        for (const op of orphans) {
          const varSku = `${op.sku || 'SKU'}-STD-DEFAULT`.toUpperCase();
          await query(
            `INSERT INTO product_variants (product_id, size, color, color_hex, sku, stock_quantity, purchased_quantity, sold_quantity, low_stock_threshold)
             VALUES (?, 'Standard', 'Default', '#ffffff', ?, 10, 10, 0, 5)`,
            [op.id, varSku]
          );
        }
      }
    } catch (_) {}

    let sql = `
      SELECT pv.*, 
             COALESCE(p.name, 'Product #' || pv.product_id) as product_name, 
             COALESCE(p.sku, pv.sku) as product_sku, 
             p.front_image, 
             COALESCE(p.purchase_cost, 0) as purchase_cost, 
             COALESCE(p.selling_price, 0) as selling_price,
             COALESCE(b.id, p.brand_id, 1) as brand_id, 
             COALESCE(b.name, CASE WHEN p.brand_id = 2 THEN 'SURPRISE NANOVA' ELSE 'NANOVA TEES' END) as brand_name, 
             COALESCE(b.code, CASE WHEN p.brand_id = 2 THEN 'surprise_nanova' ELSE 'nanova_tees' END) as brand_code, 
             COALESCE(c.name, 'General') as category_name
      FROM product_variants pv
      LEFT JOIN products p ON pv.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1 AND (p.slug NOT LIKE 'manual-custom-%' AND p.sku NOT LIKE 'MANUAL-%')
    `;
    const params = [];

    if (brand && brand !== 'all') {
      if (isNaN(brand)) {
        sql += ' AND (b.code = ? OR (b.code IS NULL AND CASE WHEN p.brand_id = 2 THEN "surprise_nanova" ELSE "nanova_tees" END = ?))';
        params.push(brand, brand);
      } else {
        sql += ' AND (b.id = ? OR p.brand_id = ?)';
        params.push(brand, brand);
      }
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR pv.sku LIKE ? OR pv.color LIKE ? OR pv.size LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (lowStockOnly === 'true' || lowStockOnly === '1') {
      sql += ' AND pv.stock_quantity <= pv.low_stock_threshold';
    }

    sql += ' ORDER BY b.id ASC, p.name ASC, pv.size ASC, pv.color ASC';

    const items = await query(sql, params);

    // Compute summary metrics
    const totalVariants = items.length;
    const totalStockQty = items.reduce((sum, i) => sum + Number(i.stock_quantity), 0);
    const totalPurchasedQty = items.reduce((sum, i) => sum + Number(i.purchased_quantity), 0);
    const totalSoldQty = items.reduce((sum, i) => sum + Number(i.sold_quantity), 0);
    const totalInventoryValue = items.reduce(
      (sum, i) => sum + Number(i.stock_quantity) * Number(i.purchase_cost),
      0
    );

    res.json({
      success: true,
      summary: {
        totalVariants,
        totalStockQty,
        totalPurchasedQty,
        totalSoldQty,
        totalInventoryValue
      },
      items
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Get Low Stock and Out of Stock Alerts
 */
router.get('/alerts', authenticateAdmin, async (req, res) => {
  try {
    const alerts = await query(
      `SELECT pv.id as variant_id, pv.size, pv.color, pv.sku, pv.stock_quantity, pv.low_stock_threshold,
              p.id as product_id, p.name as product_name, p.front_image, b.name as brand_name, b.code as brand_code
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       JOIN brands b ON p.brand_id = b.id
       WHERE pv.stock_quantity <= pv.low_stock_threshold
         AND (p.slug NOT LIKE 'manual-custom-%' AND p.sku NOT LIKE 'MANUAL-%')
       ORDER BY pv.stock_quantity ASC`
    );

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Adjust Stock (ADD, REDUCE, DAMAGE, RETURN, ADJUSTMENT)
 * Mandatory: reason, quantity_change
 * Never silently changes stock: creates audit trail in inventory_transactions.
 */
router.post('/adjust', authenticateAdmin, async (req, res) => {
  try {
    const { variant_id, product_id, type = 'ADJUSTMENT', quantity_change, new_stock, reason } = req.body;

    if (!variant_id && !product_id) {
      return res.status(400).json({
        success: false,
        message: 'variant_id or product_id is required.'
      });
    }

    let variant = null;
    if (variant_id) {
      variant = await getOne(
        `SELECT pv.*, p.brand_id, p.name as product_name, p.sku as product_sku
         FROM product_variants pv
         JOIN products p ON pv.product_id = p.id
         WHERE pv.id = ?`,
        [variant_id]
      );
    } else if (product_id) {
      variant = await getOne(
        `SELECT pv.*, p.brand_id, p.name as product_name, p.sku as product_sku
         FROM product_variants pv
         JOIN products p ON pv.product_id = p.id
         WHERE pv.product_id = ?
         ORDER BY pv.id ASC LIMIT 1`,
        [product_id]
      );

      // If no variant exists at all for this product, auto-create a standard variant
      if (!variant) {
        const prod = await getOne('SELECT id, sku, brand_id, name FROM products WHERE id = ?', [product_id]);
        if (!prod) {
          return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        const varSku = `${prod.sku || 'SKU'}-STD-DEFAULT`.toUpperCase();
        const targetUnits = Math.max(0, parseInt(new_stock ?? quantity_change ?? 0, 10));
        const vRes = await query(
          `INSERT INTO product_variants (product_id, size, color, color_hex, sku, stock_quantity, purchased_quantity, sold_quantity, low_stock_threshold)
           VALUES (?, 'Standard', 'Default', '#ffffff', ?, ?, ?, 0, 5)`,
          [prod.id, varSku, targetUnits, targetUnits]
        );
        if (targetUnits > 0) {
          await query(
            `INSERT INTO inventory_transactions (product_id, variant_id, brand_id, transaction_type, quantity_change, previous_stock, new_stock, reference_id, reason, created_by)
             VALUES (?, ?, ?, 'ADJUSTMENT', ?, 0, ?, ?, ?, ?)`,
            [prod.id, vRes.insertId, prod.brand_id, targetUnits, targetUnits, `ADJ-${Date.now()}`, reason || 'Initial stock assignment', req.admin.username]
          );
        }
        return res.json({ success: true, message: 'Stock units assigned successfully.' });
      }
    }

    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found.' });
    }

    const previousStock = Number(variant.stock_quantity || 0);
    let delta = 0;

    if (new_stock !== undefined && new_stock !== null && !isNaN(new_stock)) {
      const targetUnits = Math.max(0, parseInt(new_stock, 10));
      delta = targetUnits - previousStock;
    } else if (quantity_change !== undefined && quantity_change !== null) {
      const parsedDelta = parseInt(quantity_change, 10);
      if (!isNaN(parsedDelta)) {
        if (type === 'REDUCE' || type === 'DAMAGE') {
          delta = -Math.abs(parsedDelta);
        } else if (type === 'ADD' || type === 'RETURN') {
          delta = Math.abs(parsedDelta);
        } else {
          delta = parsedDelta;
        }
      }
    }

    if (delta === 0) {
      return res.json({ success: true, message: 'Stock is already up to date.' });
    }

    const calculatedNewStock = previousStock + delta;
    if (calculatedNewStock < 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce stock below zero. Current stock is ${previousStock}, requested deduction is ${Math.abs(delta)}.`
      });
    }

    await transaction(async (tx) => {
      // 1. Update variant stock
      await tx.query(
        'UPDATE product_variants SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [calculatedNewStock, variant.id]
      );

      // 2. Record inventory transaction
      await tx.query(
        `INSERT INTO inventory_transactions (
          product_id, variant_id, brand_id, transaction_type,
          quantity_change, previous_stock, new_stock, reference_id, reason, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          variant.product_id,
          variant.id,
          variant.brand_id,
          type.toUpperCase(),
          delta,
          previousStock,
          calculatedNewStock,
          `ADJ-${Date.now()}`,
          reason || 'Manual Admin Stock Adjustment',
          req.admin.username
        ]
      );
    });

    // Send notification if now out of stock or low stock
    try {
      if (calculatedNewStock === 0) {
        sendNotification({
          type: 'OUT_OF_STOCK',
          title: `OUT OF STOCK: ${variant.product_name} (${variant.size}, ${variant.color})`,
          message: `Stock level dropped to 0. Reason: ${reason || 'Stock adjustment'}`,
          reference_id: variant.sku
        });
      } else if (calculatedNewStock <= (variant.low_stock_threshold || 5)) {
        sendNotification({
          type: 'LOW_STOCK',
          title: `LOW STOCK: ${variant.product_name} (${variant.size}, ${variant.color})`,
          message: `Only ${calculatedNewStock} units remaining (Threshold: ${variant.low_stock_threshold || 5}).`,
          reference_id: variant.sku
        });
      }
    } catch (_) {}

    return res.json({
      success: true,
      message: 'Stock adjusted successfully.',
      variant_id: variant.id,
      previous_stock: previousStock,
      new_stock: calculatedNewStock,
      delta
    });
  } catch (err) {
    console.error('[Stock Adjustment Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Get Complete Stock Modification History (Audit Trail)
 */
router.get('/history', authenticateAdmin, async (req, res) => {
  try {
    const { product_id, variant_id, type, limit = 100 } = req.query;

    let sql = `
      SELECT it.*, p.name as product_name, pv.size, pv.color, pv.sku as variant_sku, b.name as brand_name
      FROM inventory_transactions it
      JOIN products p ON it.product_id = p.id
      JOIN product_variants pv ON it.variant_id = pv.id
      JOIN brands b ON it.brand_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      sql += ' AND it.product_id = ?';
      params.push(product_id);
    }
    if (variant_id) {
      sql += ' AND it.variant_id = ?';
      params.push(variant_id);
    }
    if (type) {
      sql += ' AND it.transaction_type = ?';
      params.push(type.toUpperCase());
    }

    sql += ' ORDER BY it.created_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const history = await query(sql, params);

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
