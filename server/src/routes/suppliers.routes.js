import express from 'express';
import { query, getOne } from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const suppliers = await query('SELECT * FROM suppliers ORDER BY id ASC');
    for (const s of suppliers) {
      const stats = await getOne(
        `SELECT COUNT(*) as purchase_count, COALESCE(SUM(total_amount), 0) as total_bought
         FROM purchases WHERE supplier_id = ?`,
        [s.id]
      );
      s.total_purchases = stats.purchase_count;
      s.total_spent = stats.total_bought;
    }
    res.json({ success: true, suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, company_name, phone, email, address, notes } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Supplier name and phone are required.' });
    }

    const result = await query(
      `INSERT INTO suppliers (name, company_name, phone, email, address, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, company_name, phone, email, address, notes]
    );

    res.status(201).json({ success: true, message: 'Supplier added.', supplierId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company_name, phone, email, address, notes } = req.body;

    await query(
      `UPDATE suppliers SET name = ?, company_name = ?, phone = ?, email = ?, address = ?, notes = ? WHERE id = ?`,
      [name, company_name, phone, email, address, notes, id]
    );

    res.json({ success: true, message: 'Supplier updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT COUNT(*) as count FROM purchases WHERE supplier_id = ?', [id]);
    if (existing && Number(existing.count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete supplier with recorded purchase orders.'
      });
    }
    await query('DELETE FROM suppliers WHERE id = ?', [id]);
    res.json({ success: true, message: 'Supplier deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
