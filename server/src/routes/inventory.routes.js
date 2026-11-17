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

    let sql = `
      SELECT pv.*, p.name as product_name, p.sku as product_sku, p.front_image, p.purchase_cost, p.selling_price,
             b.id as brand_id, b.name as brand_name, b.code as brand_code, c.name as category_name
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      JOIN brands b ON p.brand_id = b.id
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (brand && brand !== 'all') {
      if (isNaN(brand)) {
        sql += ' AND b.code = ?';
        params.push(brand);
      } else {
        sql += ' AND b.id = ?';
        params.push(brand);
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
    const { variant_id, type = 'ADJUSTMENT', quantity_change, reason } = req.body;

    if (!variant_id || !quantity_change || !reason) {
      return res.status(400).json({
        success: false,
        message: 'variant_id, quantity_change (non-zero), and a detailed reason are required.'
      });
    }

    const delta = parseInt(quantity_change, 10);
    if (isNaN(delta) || delta === 0) {
      return res.status(400).json({
        success: false,
        message: 'quantity_change must be a non-zero integer.'
      });
    }

    const variant = await getOne(
      `SELECT pv.*, p.brand_id, p.name as product_name
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.id = ?`,
      [variant_id]
    );

    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found.' });
    }

    const previousStock = Number(variant.stock_quantity);
    const newStock = previousStock + delta;

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce stock below zero. Current stock is ${previousStock}, requested deduction is ${Math.abs(delta)}.`
      });
    }

    await transaction(async (tx) => {
      // 1. Update variant stock
      await tx.query(
        'UPDATE product_variants SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStock, variant_id]
      );

      // 2. Record inventory transaction
      await tx.query(
        `INSERT INTO inventory_transactions (
          product_id, variant_id, brand_id, transaction_type,
          quantity_change, previous_stock, new_stock, reference_id, reason, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          variant.product_id,
          variant_id,
          variant.brand_id,
          type.toUpperCase(),
          delta,
          previousStock,
          newStock,
          `ADJ-${Date.now()}`,
          reason,
          req.admin.username
        ]
      );
    });

    // Send notification if now out of stock or low stock
    if (newStock === 0) {
      sendNotification({
        type: 'OUT_OF_STOCK',
        title: `OUT OF STOCK: ${variant.product_name} (${variant.size}, ${variant.color})`,
        message: `Stock level dropped to 0. Reason: ${reason}`,
        reference_id: variant.sku
      });
    } else if (newStock <= variant.low_stock_threshold) {
      sendNotification({
        type: 'LOW_STOCK',
        title: `LOW STOCK: ${variant.product_name} (${variant.size}, ${variant.color})`,
        message: `Only ${newStock} units remaining (Threshold: ${variant.low_stock_threshold}).`,
        reference_id: variant.sku
      });
    }

    res.json({
      success: true,
      message: 'Stock updated and audit transaction recorded successfully.',
      variant_id,
      previousStock,
      newStock,
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
