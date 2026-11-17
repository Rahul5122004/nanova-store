import express from 'express';
import { query, getOne } from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { uploadGalleryImage } from '../middleware/upload.js';

const router = express.Router();

/**
 * Public & Admin: List gallery moments
 * Query params: brand, activeOnly
 */
router.get('/', async (req, res) => {
  try {
    const { brand, activeOnly = 'true' } = req.query;

    let sql = `
      SELECT g.*, b.name as brand_name, b.code as brand_code, b.instagram_url as brand_instagram_url
      FROM gallery_moments g
      LEFT JOIN brands b ON g.brand_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (activeOnly === 'true') {
      sql += ' AND g.is_active = 1';
    }

    if (brand && brand !== 'all') {
      if (brand === 'nanova_tees' || brand === '1') {
        sql += ' AND g.brand_id = 1';
      } else if (brand === 'surprise_nanova' || brand === '2') {
        sql += ' AND g.brand_id = 2';
      }
    }

    sql += ' ORDER BY g.sort_order ASC, g.created_at DESC';

    const moments = await query(sql, params);

    res.json({
      success: true,
      count: moments.length,
      moments
    });
  } catch (err) {
    console.error('[Get Gallery Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Add new gallery moment
 */
router.post('/', authenticateAdmin, uploadGalleryImage.any(), async (req, res) => {
  try {
    const {
      brand_id = 1,
      title,
      instagram_url,
      likes_count = '1.2k',
      customer_name = '',
      sort_order = 0,
      is_active = 1
    } = req.body;

    const uploadedFile = req.files?.[0];
    const imageUrl = uploadedFile
      ? `/uploads/gallery/${uploadedFile.filename}`
      : req.body.image_url || '/images/products/tee-cyber-front.png';

    // Default Instagram URL if not provided
    const defaultInsta = Number(brand_id) === 2
      ? 'https://www.instagram.com/surprise_nanova?utm_source=qr&srtk=aWowazJlY3lzeGx1'
      : 'https://www.instagram.com/nanova_tees?utm_source=qr&psln=MXd1OXo3Z21rZmh1bQ==';

    const finalInstaUrl = instagram_url && instagram_url.trim() ? instagram_url.trim() : defaultInsta;

    const result = await query(
      `INSERT INTO gallery_moments (brand_id, title, image_url, instagram_url, likes_count, customer_name, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(brand_id),
        title || 'Community Moment',
        imageUrl,
        finalInstaUrl,
        likes_count,
        customer_name,
        Number(sort_order),
        is_active ? 1 : 0
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Gallery moment created successfully!',
      momentId: result.insertId
    });
  } catch (err) {
    console.error('[Create Gallery Moment Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Update gallery moment
 */
router.put('/:id', authenticateAdmin, uploadGalleryImage.any(), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      brand_id,
      title,
      instagram_url,
      likes_count,
      customer_name,
      sort_order,
      is_active
    } = req.body;

    const existing = await getOne('SELECT * FROM gallery_moments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Moment not found.' });
    }

    const uploadedFile = req.files?.[0];
    const imageUrl = uploadedFile
      ? `/uploads/gallery/${uploadedFile.filename}`
      : req.body.image_url || existing.image_url;

    await query(
      `UPDATE gallery_moments SET
        brand_id = COALESCE(?, brand_id),
        title = COALESCE(?, title),
        image_url = ?,
        instagram_url = COALESCE(?, instagram_url),
        likes_count = COALESCE(?, likes_count),
        customer_name = COALESCE(?, customer_name),
        sort_order = COALESCE(?, sort_order),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [
        brand_id,
        title,
        imageUrl,
        instagram_url,
        likes_count,
        customer_name,
        sort_order,
        is_active,
        id
      ]
    );

    res.json({ success: true, message: 'Gallery moment updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Delete gallery moment
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM gallery_moments WHERE id = ?', [id]);
    res.json({ success: true, message: 'Gallery moment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
