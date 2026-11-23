import express from 'express';
import { query, getOne } from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { getSocketIO } from '../services/notificationService.js';

const router = express.Router();

/**
 * Public & Admin: Get All Settings and Brands Contacts
 */
router.get('/', async (req, res) => {
  try {
    const brands = await query('SELECT * FROM brands ORDER BY id ASC');
    const settingsRows = await query('SELECT setting_key, setting_value, setting_group FROM business_settings');

    const settings = {};
    settingsRows.forEach((r) => {
      settings[r.setting_key] = r.setting_value;
    });

    res.json({
      success: true,
      brands,
      settings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Update Business Contacts & Brand Info
 * PUT /api/settings/brands/:id
 */
router.put('/brands/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, whatsapp, instagram_handle, instagram_url, tagline } = req.body;

    await query(
      `UPDATE brands SET 
        phone = COALESCE(?, phone),
        whatsapp = COALESCE(?, whatsapp),
        instagram_handle = COALESCE(?, instagram_handle),
        instagram_url = COALESCE(?, instagram_url),
        tagline = COALESCE(?, tagline)
       WHERE id = ?`,
      [phone, whatsapp, instagram_handle, instagram_url, tagline, id]
    );

    // Broadcast realtime update to all storefront tabs
    const io = getSocketIO();
    if (io) {
      io.emit('settings:updated');
    }

    res.json({ success: true, message: 'Brand contacts updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Update General Business Settings
 * PUT /api/settings
 */
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { settings } = req.body; // { key: value }

    if (settings && typeof settings === 'object') {
      for (const [key, value] of Object.entries(settings)) {
        await query(
          `INSERT INTO business_settings (setting_key, setting_value)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = ?`,
          [key, String(value), String(value)]
        ).catch(async () => {
          // SQLite fallback for ON DUPLICATE KEY
          await query(
            `INSERT OR REPLACE INTO business_settings (setting_key, setting_value) VALUES (?, ?)`,
            [key, String(value)]
          );
        });
      }
    }

    // Broadcast realtime update to all storefront tabs
    const io = getSocketIO();
    if (io) {
      io.emit('settings:updated');
    }

    res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Delete All Products Only
 * POST /api/settings/delete-all-products
 */
router.post('/delete-all-products', authenticateAdmin, async (req, res) => {
  try {
    try {
      await query('PRAGMA foreign_keys = OFF');
    } catch (_) {}
    await query('DELETE FROM inventory_transactions');
    await query('DELETE FROM purchase_items');
    await query('DELETE FROM product_images');
    await query('DELETE FROM product_variants');
    await query('DELETE FROM products');
    try {
      await query('PRAGMA foreign_keys = ON');
    } catch (_) {}

    res.json({
      success: true,
      message: 'All catalog products, variants, and stock transactions have been deleted.'
    });
  } catch (err) {
    console.error('[Delete All Products Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Delete All Customers Only
 * POST /api/settings/delete-all-customers
 */
router.post('/delete-all-customers', authenticateAdmin, async (req, res) => {
  try {
    try {
      await query('PRAGMA foreign_keys = OFF');
    } catch (_) {}
    await query('DELETE FROM customers');
    try {
      await query('PRAGMA foreign_keys = ON');
    } catch (_) {}

    res.json({
      success: true,
      message: 'All customer profiles and contact directories have been deleted.'
    });
  } catch (err) {
    console.error('[Delete All Customers Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Delete All Orders & Bills Only
 * POST /api/settings/delete-all-orders
 */
router.post('/delete-all-orders', authenticateAdmin, async (req, res) => {
  try {
    await query('DELETE FROM order_items');
    await query('DELETE FROM invoices');
    await query('DELETE FROM payments');
    await query('DELETE FROM orders');

    res.json({
      success: true,
      message: 'All customer orders, manual generated bills, invoices, and payment receipts have been deleted.'
    });
  } catch (err) {
    console.error('[Delete All Orders Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Delete All Purchases Only
 * POST /api/settings/delete-all-purchases
 */
router.post('/delete-all-purchases', authenticateAdmin, async (req, res) => {
  try {
    await query('DELETE FROM purchase_items');
    await query('DELETE FROM purchases');

    res.json({
      success: true,
      message: 'All supplier purchase batches have been deleted.'
    });
  } catch (err) {
    console.error('[Delete All Purchases Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Delete All Expenses Only
 * POST /api/settings/delete-all-expenses
 */
router.post('/delete-all-expenses', authenticateAdmin, async (req, res) => {
  try {
    await query('DELETE FROM expenses');

    res.json({
      success: true,
      message: 'All recorded expenses have been deleted.'
    });
  } catch (err) {
    console.error('[Delete All Expenses Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Seed / Restore Sample Catalog Products & Stock
 * POST /api/settings/seed-catalog
 */
router.post('/seed-catalog', authenticateAdmin, async (req, res) => {
  try {
    const { seedDatabase } = await import('../db/seed.js');
    await seedDatabase(true);

    res.json({
      success: true,
      message: 'Sample products, stock, and supplier purchases restored successfully!'
    });
  } catch (err) {
    console.error('[Seed Catalog Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Master Reset - Wipe All Data to make website 100% blank
 * POST /api/settings/reset-all
 */
router.post('/reset-all', authenticateAdmin, async (req, res) => {
  try {
    await query('DELETE FROM order_items');
    await query('DELETE FROM invoices');
    await query('DELETE FROM payments');
    await query('DELETE FROM orders');
    await query('DELETE FROM purchase_items');
    await query('DELETE FROM purchases');
    await query('DELETE FROM inventory_transactions');
    await query('DELETE FROM product_images');
    await query('DELETE FROM product_variants');
    await query('DELETE FROM products');
    try {
      await query('PRAGMA foreign_keys = OFF');
    } catch (_) {}
    await query('DELETE FROM customers');
    try {
      await query('PRAGMA foreign_keys = ON');
    } catch (_) {}
    await query('DELETE FROM expenses');
    await query('DELETE FROM notifications');

    res.json({
      success: true,
      message: 'Website data completely wiped. The website is now 100% fresh and blank!'
    });
  } catch (err) {
    console.error('[Reset All Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
