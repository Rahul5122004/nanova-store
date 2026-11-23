import express from 'express';
import { query, getOne } from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { uploadProductImages } from '../middleware/upload.js';

const router = express.Router();

/**
 * Public & Admin: List products
 * Query params: brand (code or id), category (slug or id), search, featured, limit
 */
router.get('/', async (req, res) => {
  try {
    const { brand, category, search, featured, activeOnly = 'true' } = req.query;

    let sql = `
      SELECT p.*, 
             COALESCE(b.name, 'NANOVA') as brand_name, 
             COALESCE(b.code, CASE WHEN p.brand_id = 2 THEN 'surprise_nanova' ELSE 'nanova_tees' END) as brand_code, 
             COALESCE(c.name, 'All') as category_name, 
             COALESCE(c.slug, 'all') as category_slug
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (activeOnly === 'true') {
      sql += ' AND p.is_active = 1';
    }

    if (brand && brand !== 'all' && brand !== 'ALL') {
      if (isNaN(brand)) {
        sql += ` AND (b.code = ? OR REPLACE(b.code, '_', '-') = ? OR (p.brand_id = 1 AND ? IN ('nanova_tees', 'nanova-tees', 'tees')) OR (p.brand_id = 2 AND ? IN ('surprise_nanova', 'surprise-nanova', 'gifts')))`;
        params.push(brand, brand, brand, brand);
      } else {
        sql += ' AND p.brand_id = ?';
        params.push(brand);
      }
    }

    if (category && category !== 'all' && category !== 'ALL') {
      if (isNaN(category)) {
        sql += ' AND (c.slug = ? OR c.name LIKE ?)';
        params.push(category, `%${category}%`);
      } else {
        sql += ' AND p.category_id = ?';
        params.push(category);
      }
    }

    if (featured === '1' || featured === 'true') {
      sql += ' AND p.is_featured = 1';
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY p.is_featured DESC, p.created_at DESC';

    const products = await query(sql, params);

    // Attach variants and total stock for each product
    for (const prod of products) {
      const variants = await query(
        `SELECT id, size, color, color_hex, sku, stock_quantity, purchased_quantity, sold_quantity, low_stock_threshold
         FROM product_variants
         WHERE product_id = ?
         ORDER BY id ASC`,
        [prod.id]
      );
      prod.variants = variants;
      prod.total_stock = variants.reduce((sum, v) => sum + Number(v.stock_quantity), 0);
      prod.in_stock = prod.total_stock > 0;
    }

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    console.error('[Get Products Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Public & Admin: Get single product by ID or Slug
 */
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = !isNaN(idOrSlug);

    const product = await getOne(
      `SELECT p.*, 
              COALESCE(b.name, 'NANOVA') as brand_name, 
              COALESCE(b.code, CASE WHEN p.brand_id = 2 THEN 'surprise_nanova' ELSE 'nanova_tees' END) as brand_code, 
              COALESCE(b.phone, '6382092001') as brand_phone, 
              COALESCE(b.instagram_handle, CASE WHEN p.brand_id = 2 THEN '@surprise_nanova' ELSE '@nanova_tees' END) as instagram_handle, 
              COALESCE(c.name, 'All') as category_name, 
              COALESCE(c.slug, 'all') as category_slug
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${isId ? 'p.id = ?' : 'p.slug = ?'}`,
      [idOrSlug]
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Fetch size & colour variants with exact stock
    const variants = await query(
      `SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC`,
      [product.id]
    );

    // Fetch additional gallery images
    const images = await query(
      `SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC`,
      [product.id]
    );

    product.variants = variants;
    product.images = images;
    product.total_stock = variants.reduce((sum, v) => sum + Number(v.stock_quantity), 0);
    product.in_stock = product.total_stock > 0;

    res.json({
      success: true,
      product
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Create Product
 * Supports single image upload (accepted via 'image' or 'front_image' field)
 */
router.post(
  '/',
  authenticateAdmin,
  uploadProductImages.any(),
  async (req, res) => {
    try {
      const {
        brand_id,
        category_id,
        sku,
        name,
        slug,
        description,
        purchase_cost,
        selling_price,
        model_3d_type = 'garment',
        customization_allowed = 0,
        customization_placeholder = '',
        is_featured = 1,
        is_new_arrival = 1,
        is_best_seller = 0,
        variantsJson,
        variants: bodyVariants,
        initial_stock,
        stock_quantity,
        units
      } = req.body;

      const uploadedFile = req.files?.find(f => f.fieldname === 'image' || f.fieldname === 'front_image') || req.files?.[0];
      const singleImgUrl = uploadedFile
        ? `/uploads/products/${uploadedFile.filename}`
        : req.body.image_url || req.body.front_image_url || '/images/products/tee-cyber-front.png';

      const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const prefix = Number(brand_id) === 1 ? 'NT' : 'SN';
      const cleanName = (name || 'ITEM').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const finalSku = (sku && sku.trim()) ? sku.trim().toUpperCase() : `${prefix}-${cleanName}-${randomSuffix}`;

      const prodRes = await query(
        `INSERT INTO products (
          brand_id, category_id, sku, name, slug, description,
          purchase_cost, selling_price, front_image, back_image,
          model_3d_type, customization_allowed, customization_placeholder,
          is_active, is_featured, is_new_arrival, is_best_seller
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, 1, ?, ?, ?)`,
        [
          brand_id,
          category_id,
          finalSku,
          name,
          finalSlug,
          description,
          Number(purchase_cost || 0),
          Number(selling_price || 0),
          singleImgUrl,
          model_3d_type,
          customization_allowed ? 1 : 0,
          customization_placeholder,
          is_featured ? 1 : 0,
          is_new_arrival ? 1 : 0,
          is_best_seller ? 1 : 0
        ]
      );

      const productId = prodRes.insertId;

      // Parse and insert variants (supports variants, variantsJson, and direct stock units)
      const rawVariants = req.body.variants || req.body.variantsJson || bodyVariants;
      let variantsList = [];
      if (rawVariants) {
        try {
          variantsList = typeof rawVariants === 'string' ? JSON.parse(rawVariants) : rawVariants;
        } catch (e) {
          variantsList = [];
        }
      }

      const directUnits = Number(initial_stock || stock_quantity || units || req.body.initial_stock || req.body.stock_quantity || req.body.units || 0);

      // If variants array is empty, automatically create a standard variant with directUnits
      if (!Array.isArray(variantsList) || variantsList.length === 0) {
        variantsList = [
          { size: 'Standard', color: 'Default', color_hex: '#ffffff', stock_quantity: directUnits || 10, low_stock_threshold: 5 }
        ];
      }

      for (const v of variantsList) {
        const vSku = `${finalSku}-${(v.size || 'STD').replace(/\s+/g, '')}-${(v.color || 'CLR').replace(/\s+/g, '')}`.toUpperCase();
        const initStock = Number(v.stock_quantity || 0);

        const vRes = await query(
          `INSERT INTO product_variants (product_id, size, color, color_hex, sku, stock_quantity, purchased_quantity, sold_quantity, low_stock_threshold)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
          [productId, v.size, v.color, v.color_hex || '#000000', vSku, initStock, initStock, v.low_stock_threshold || 5]
        );

        if (initStock > 0) {
          await query(
            `INSERT INTO inventory_transactions (product_id, variant_id, brand_id, transaction_type, quantity_change, previous_stock, new_stock, reference_id, reason, created_by)
             VALUES (?, ?, ?, 'PURCHASE', ?, 0, ?, 'INITIAL-PRODUCT-CREATION', 'Initial stock assignment on product create', ?)`,
            [productId, vRes.insertId, brand_id, initStock, initStock, req.admin.username]
          );
        }
      }

      res.status(201).json({
        success: true,
        message: 'Product created successfully!',
        productId
      });
    } catch (err) {
      console.error('[Create Product Error]:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * Admin: Update Product
 */
router.put(
  '/:id',
  authenticateAdmin,
  uploadProductImages.any(),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        brand_id,
        category_id,
        name,
        sku,
        description,
        purchase_cost,
        selling_price,
        is_active,
        is_featured,
        is_new_arrival,
        is_best_seller,
        customization_allowed,
        customization_placeholder
      } = req.body;

      const existing = await getOne('SELECT * FROM products WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const uploadedFile = req.files?.find(f => f.fieldname === 'image' || f.fieldname === 'front_image') || req.files?.[0];
      const singleImgUrl = uploadedFile
        ? `/uploads/products/${uploadedFile.filename}`
        : req.body.image_url || req.body.front_image_url || existing.front_image;

      await query(
        `UPDATE products SET
          brand_id = COALESCE(?, brand_id),
          category_id = COALESCE(?, category_id),
          name = COALESCE(?, name),
          sku = COALESCE(?, sku),
          description = COALESCE(?, description),
          purchase_cost = COALESCE(?, purchase_cost),
          selling_price = COALESCE(?, selling_price),
          front_image = ?,
          is_active = COALESCE(?, is_active),
          is_featured = COALESCE(?, is_featured),
          is_new_arrival = COALESCE(?, is_new_arrival),
          is_best_seller = COALESCE(?, is_best_seller),
          customization_allowed = COALESCE(?, customization_allowed),
          customization_placeholder = COALESCE(?, customization_placeholder),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          brand_id,
          category_id,
          name,
          sku,
          description,
          purchase_cost,
          selling_price,
          singleImgUrl,
          is_active,
          is_featured,
          is_new_arrival,
          is_best_seller,
          customization_allowed,
          customization_placeholder,
          id
        ]
      );

      // Also update single variant stock if stock_quantity or initial_stock is provided
      const directUnits = req.body.stock_quantity ?? req.body.initial_stock ?? req.body.units;
      if (directUnits !== undefined && directUnits !== null && !isNaN(directUnits)) {
        const targetUnits = Math.max(0, parseInt(directUnits, 10));
        const vars = await query('SELECT id, stock_quantity FROM product_variants WHERE product_id = ? ORDER BY id ASC', [id]);
        if (vars.length > 0) {
          const firstV = vars[0];
          const diff = targetUnits - Number(firstV.stock_quantity);
          await query('UPDATE product_variants SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [targetUnits, firstV.id]);
          if (diff !== 0) {
            await query(
              `INSERT INTO inventory_transactions (product_id, variant_id, brand_id, transaction_type, quantity_change, previous_stock, new_stock, reference_id, reason, created_by)
               VALUES (?, ?, ?, 'ADJUSTMENT', ?, ?, ?, ?, 'Stock update via Product Edit', ?)`,
              [id, firstV.id, existing.brand_id, diff, firstV.stock_quantity, targetUnits, `ADJ-${Date.now()}`, req.admin.username]
            );
          }
        }
      }

      res.json({
        success: true,
        message: 'Product updated successfully.'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * Admin: Delete Product (Cascade clean foreign keys)
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM inventory_transactions WHERE product_id = ?', [id]);
    await query('DELETE FROM order_items WHERE product_id = ?', [id]);
    await query('DELETE FROM product_images WHERE product_id = ?', [id]);
    await query('DELETE FROM product_variants WHERE product_id = ?', [id]);
    await query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('[Delete Product Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
