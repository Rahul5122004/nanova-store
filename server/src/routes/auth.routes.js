import express from 'express';
import bcrypt from 'bcryptjs';
import { query, getOne } from '../db/index.js';
import { signToken, authenticateAdmin } from '../middleware/auth.js';
import { config } from '../config/db.config.js';

const router = express.Router();

/**
 * Admin Login
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required.'
      });
    }

    const admin = await getOne(
      'SELECT * FROM admins WHERE username = ? OR email = ?',
      [username, username]
    );

    if (!admin || !admin.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or account is inactive.'
      });
    }

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Update last login
    await query('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);

    const token = signToken(admin);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('[Auth Error]:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

/**
 * Get Authenticated Admin Profile
 * GET /api/auth/me
 */
router.get('/me', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

/**
 * Update Profile
 * PUT /api/auth/profile
 */
router.put('/profile', authenticateAdmin, async (req, res) => {
  try {
    const { full_name, email, username } = req.body;

    await query(
      'UPDATE admins SET full_name = ?, email = ?, username = ? WHERE id = ?',
      [full_name, email, username, req.admin.id]
    );

    const updated = await getOne('SELECT id, username, email, full_name, role FROM admins WHERE id = ?', [req.admin.id]);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      admin: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Change Password
 * PUT /api/auth/change-password
 */
router.put('/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const admin = await getOne('SELECT password_hash FROM admins WHERE id = ?', [req.admin.id]);
    const match = await bcrypt.compare(current_password, admin.password_hash);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    await query('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, req.admin.id]);

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Initial Administrator Setup (If none exists)
 * POST /api/auth/setup
 */
router.post('/setup', async (req, res) => {
  try {
    const { setup_key, username, email, password, full_name } = req.body;

    if (setup_key !== config.adminSetupKey) {
      return res.status(403).json({
        success: false,
        message: 'Invalid administrative setup key.'
      });
    }

    const existingAdminCount = await getOne('SELECT COUNT(*) as count FROM admins');
    if (existingAdminCount && Number(existingAdminCount.count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Administrator account already exists. Please login normally.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password || 'NanovaAdmin@2026', salt);

    const result = await query(
      `INSERT INTO admins (username, email, password_hash, full_name, role)
       VALUES (?, ?, ?, ?, 'SUPER_ADMIN')`,
      [username || 'admin', email || 'admin@nanova.com', hash, full_name || 'Nanova Business Owner']
    );

    res.json({
      success: true,
      message: 'Super administrator created successfully!',
      adminId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
