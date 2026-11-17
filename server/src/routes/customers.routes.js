import express from 'express';
import { query, getOne } from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { search, limit = 100 } = req.query;

    let sql = `SELECT * FROM customers WHERE 1=1`;
    const params = [];

    if (search) {
      sql += ` AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR city LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY total_spent DESC, last_order_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const customers = await query(sql, params);

    res.json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await getOne('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const orders = await query(
      `SELECT o.*, b.name as brand_name 
       FROM orders o 
       JOIN brands b ON o.brand_id = b.id 
       WHERE o.customer_id = ? 
       ORDER BY o.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      customer: {
        ...customer,
        orders
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Delete customer and cleanup their order history
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await query('SELECT id FROM orders WHERE customer_id = ?', [id]);
    for (const ord of orders) {
      await query('DELETE FROM order_items WHERE order_id = ?', [ord.id]);
      await query('DELETE FROM invoices WHERE order_id = ?', [ord.id]);
      await query('DELETE FROM payments WHERE order_id = ?', [ord.id]);
    }
    await query('DELETE FROM orders WHERE customer_id = ?', [id]);
    await query('DELETE FROM customers WHERE id = ?', [id]);

    res.json({ success: true, message: 'Customer and related records deleted successfully.' });
  } catch (err) {
    console.error('[Delete Customer Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
