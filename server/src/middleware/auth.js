import jwt from 'jsonwebtoken';
import { config } from '../config/db.config.js';
import { getOne } from '../db/index.js';

export function signToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export async function authenticateAdmin(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing Bearer token.'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    const admin = await getOne(
      'SELECT id, username, email, full_name, role, is_active FROM admins WHERE id = ?',
      [decoded.id]
    );

    if (!admin || !admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled or no longer exists.'
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}
