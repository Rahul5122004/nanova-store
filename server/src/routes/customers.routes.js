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
 * Admin: Create New Customer manually
 * POST /api/customers
 */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      full_name,
      phone,
      email,
      address,
      city,
      district,
      state,
      pin_code
    } = req.body;

    if (!full_name?.trim() || !phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer Full Name and Mobile Phone are required.'
      });
    }

    const cleanPhone = phone.trim();

    // Check if phone number already exists
    const existing = await getOne('SELECT id, full_name FROM customers WHERE phone = ?', [cleanPhone]);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A customer with phone ${cleanPhone} already exists (${existing.full_name}).`
      });
    }

    const insertRes = await query(
      `INSERT INTO customers (
        full_name, phone, email, address, city, district, state, pin_code,
        total_orders, total_spent, last_order_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        full_name.trim(),
        cleanPhone,
        email?.trim() || null,
        address?.trim() || 'Direct Store Customer',
        city?.trim() || 'Coimbatore',
        district?.trim() || city?.trim() || 'Coimbatore',
        state?.trim() || 'Tamil Nadu',
        pin_code?.trim() || '641001'
      ]
    );

    const newCustomer = await getOne('SELECT * FROM customers WHERE id = ?', [insertRes.insertId]);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully!',
      customer: newCustomer
    });
  } catch (err) {
    console.error('[Create Customer Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Update / Edit Customer Details
 * PUT /api/customers/:id
 */
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      phone,
      email,
      address,
      city,
      district,
      state,
      pin_code
    } = req.body;

    if (!full_name?.trim() || !phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer Full Name and Mobile Phone are required.'
      });
    }

    const customer = await getOne('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const cleanPhone = phone.trim();

    // Ensure phone number does not conflict with another customer
    const phoneConflict = await getOne('SELECT id, full_name FROM customers WHERE phone = ? AND id != ?', [cleanPhone, id]);
    if (phoneConflict) {
      return res.status(400).json({
        success: false,
        message: `Phone number ${cleanPhone} is already used by customer ${phoneConflict.full_name}.`
      });
    }

    const newAddress = address?.trim() || customer.address || 'Direct Store Customer';
    const newCity = city?.trim() || customer.city || 'Coimbatore';
    const newDistrict = district?.trim() || customer.district || newCity;
    const newState = state?.trim() || customer.state || 'Tamil Nadu';
    const newPin = pin_code?.trim() || customer.pin_code || '641001';

    await query(
      `UPDATE customers SET
        full_name = ?,
        phone = ?,
        email = ?,
        address = ?,
        city = ?,
        district = ?,
        state = ?,
        pin_code = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        full_name.trim(),
        cleanPhone,
        email?.trim() || null,
        newAddress,
        newCity,
        newDistrict,
        newState,
        newPin,
        id
      ]
    );

    // Also update customer name & phone in future invoice copies for this customer
    try {
      const fullAddressString = `${newAddress}, ${newCity}, ${newState} - ${newPin}`;
      await query(
        `UPDATE invoices 
         SET customer_name = ?, customer_phone = ?, customer_address = ?
         WHERE order_id IN (SELECT id FROM orders WHERE customer_id = ?)`,
        [full_name.trim(), cleanPhone, fullAddressString, id]
      );
    } catch (invErr) {
      console.warn('[Sync Invoices Warning]:', invErr.message);
    }

    const updatedCustomer = await getOne('SELECT * FROM customers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Customer ${updatedCustomer.full_name} updated successfully!`,
      customer: updatedCustomer
    });
  } catch (err) {
    console.error('[Update Customer Error]:', err);
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
