import express from 'express';
import { query, getOne } from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { uploadExpenseReceipt } from '../middleware/upload.js';

const router = express.Router();

/**
 * Admin: List Expenses
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { brand, category, startDate, endDate } = req.query;

    let sql = `
      SELECT e.*, b.name as brand_name, b.code as brand_code
      FROM expenses e
      LEFT JOIN brands b ON e.brand_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (brand && brand !== 'all') {
      if (brand === 'common') {
        sql += ' AND e.brand_id IS NULL';
      } else if (isNaN(brand)) {
        sql += ' AND b.code = ?';
        params.push(brand);
      } else {
        sql += ' AND e.brand_id = ?';
        params.push(brand);
      }
    }

    if (category && category !== 'ALL') {
      sql += ' AND e.category = ?';
      params.push(category.toUpperCase());
    }

    if (startDate) {
      sql += ' AND e.expense_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND e.expense_date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY e.expense_date DESC, e.id DESC';

    const expenses = await query(sql, params);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Group by category
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });

    res.json({
      success: true,
      totalExpenses,
      categoryTotals,
      count: expenses.length,
      expenses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Add Expense with optional Receipt Image
 */
router.post(
  '/',
  authenticateAdmin,
  uploadExpenseReceipt.single('receipt'),
  async (req, res) => {
    try {
      const { brand_id, category, amount, expense_date, description } = req.body;

      if (!category || !amount || !description) {
        return res.status(400).json({
          success: false,
          message: 'Category, amount, and description are required.'
        });
      }

      const receiptUrl = req.file ? `/uploads/expenses/${req.file.filename}` : null;
      const parsedBrandId = brand_id && brand_id !== 'common' && brand_id !== '' ? brand_id : null;

      const result = await query(
        `INSERT INTO expenses (brand_id, category, amount, expense_date, description, receipt_url, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          parsedBrandId,
          category.toUpperCase(),
          Number(amount),
          expense_date || new Date().toISOString().split('T')[0],
          description,
          receiptUrl,
          req.admin.username
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Expense recorded successfully.',
        expenseId: result.insertId
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * Admin: Delete Expense
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM expenses WHERE id = ?', [id]);
    res.json({ success: true, message: 'Expense deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
