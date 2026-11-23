import bcrypt from 'bcryptjs';
import { initDatabase, query, getOne, getActiveClient } from './index.js';
import { createTablesIfNotExist } from './schema.js';

export async function seedDatabase(force = false) {
  await initDatabase();
  await createTablesIfNotExist();

  try {
    await query('PRAGMA foreign_keys = OFF');
  } catch (_) {}

  console.log('[Seed] Checking if seed is required...');
  const prodCountRow = await getOne('SELECT COUNT(*) as cnt FROM products WHERE slug NOT LIKE "manual-custom-%"');
  const prodCount = Number(prodCountRow?.cnt || 0);

  if (prodCount > 0 && !force) {
    console.log(`[Seed] Database already has ${prodCount} products. Skipping seed.`);
    return;
  }

  console.log('[Seed] Starting complete database initialization & seeding...');

  // 1. Super Admin
  const existingAdmin = await getOne('SELECT id FROM admins WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('NanovaAdmin@2026', salt);
    await query(
      `INSERT INTO admins (username, email, password_hash, full_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin', 'admin@nanova.com', passwordHash, 'Nanova Business Owner', 'SUPER_ADMIN', 1]
    );
    console.log('[Seed] Super admin created: admin / NanovaAdmin@2026');
  }

  // 2. Brands
  const brandCountRow = await getOne('SELECT COUNT(*) as cnt FROM brands');
  if (!brandCountRow || Number(brandCountRow.cnt) === 0) {
    await query(
      `INSERT INTO brands (id, code, name, tagline, phone, whatsapp, instagram_handle, instagram_url, logo_symbol, theme_mode)
       VALUES 
       (1, 'nanova_tees', 'NANOVA TEES', 'WEAR YOUR VIBE.', '6382092001', '6382092001', '@nanova_tees', 'https://www.instagram.com/nanova_tees?utm_source=qr&psln=MXd1OXo3Z21rZmh1bQ==', 'N-GEOMETRIC', 'dark'),
       (2, 'surprise_nanova', 'SURPRISE NANOVA', 'MAKE EVERY MOMENT SPECIAL.', '89035 41632', '8903541632', '@surprise_nanova', 'https://www.instagram.com/surprise_nanova?utm_source=qr&srtk=aWowazJlY3lzeGx1', 'N-GEOMETRIC', 'luxury')`
    );
  }

  // 3. Categories
  const catCountRow = await getOne('SELECT COUNT(*) as cnt FROM categories');
  if (!catCountRow || Number(catCountRow.cnt) === 0) {
    const categories = [
      // Nanova Tees
      { brand_id: 1, name: 'Oversized T-Shirts', slug: 'oversized-tees', desc: 'Heavyweight 240+ GSM dropped shoulder streetwear silhouettes.' },
      { brand_id: 1, name: 'Regular Fit T-Shirts', slug: 'regular-fit-tees', desc: 'Everyday breathable 100% combed cotton premium essentials.' },
      { brand_id: 1, name: 'Printed T-Shirts', slug: 'printed-tees', desc: 'High-density screen & puff printed expressive street graphics.' },
      { brand_id: 1, name: 'Custom T-Shirts', slug: 'custom-tees', desc: 'Personalized artwork and bespoke typography for your crew.' },
      { brand_id: 1, name: 'New Arrivals', slug: 'new-arrivals-tees', desc: 'The freshest seasonal drops and limited edition pieces.' },
      { brand_id: 1, name: 'Best Sellers', slug: 'best-sellers-tees', desc: 'Customer-favorite streetwear staples with unmatched reviews.' },
      
      // Surprise Nanova
      { brand_id: 2, name: 'Birthday Gifts', slug: 'birthday-gifts', desc: 'Memorable birthday hampers curated with love and joy.' },
      { brand_id: 2, name: 'Anniversary Gifts', slug: 'anniversary-gifts', desc: 'Romantic custom keepsakes celebrating cherished milestones.' },
      { brand_id: 2, name: 'Couple Gifts', slug: 'couple-gifts', desc: 'Harmonious matching treasures crafted for two hearts.' },
      { brand_id: 2, name: 'Personalized Gifts', slug: 'personalized-gifts', desc: 'Bespoke engravings, customized names, and unique photos.' },
      { brand_id: 2, name: 'Gift Hampers', slug: 'gift-hampers', desc: 'All-in-one curated luxury hampers for grand celebrations.' },
      { brand_id: 2, name: 'Surprise Boxes', slug: 'surprise-boxes', desc: 'Exploding photo boxes and layered experiential mystery gifts.' },
      { brand_id: 2, name: 'Customized Gifts', slug: 'customized-gifts', desc: 'Tailor-made customized gifts designed to your specific wishes.' },
      { brand_id: 2, name: 'Special Occasion Gifts', slug: 'special-occasion-gifts', desc: 'Festival, convocation, farewell, and milestone treasures.' }
    ];

    for (const cat of categories) {
      await query(
        `INSERT INTO categories (brand_id, name, slug, description, sort_order, is_active)
         VALUES (?, ?, ?, ?, 0, 1)`,
        [cat.brand_id, cat.name, cat.slug, cat.desc]
      );
    }
  }

  // 4. Suppliers
  const supCountRow = await getOne('SELECT COUNT(*) as cnt FROM suppliers');
  if (!supCountRow || Number(supCountRow.cnt) === 0) {
    await query(
      `INSERT INTO suppliers (name, company_name, phone, email, address, notes)
       VALUES 
       ('Arun Kumar', 'Tirupur Knitwear & Fabrics', '9842109876', 'tirupurknits@supply.com', 'Avinashi Road, Tirupur, Tamil Nadu', 'High quality 240 GSM single jersey cotton supplier.'),
       ('Meenakshi S.', 'Royal Box & Keepsakes', '9443210987', 'royalbox@supply.com', 'Cross Cut Road, Coimbatore, Tamil Nadu', 'Handmade luxury rigid boxes, velvet lining, ribbons.')`
    );
  }

  if (force) {
    // If force re-seeding, clean sample purchases and catalog products so no duplicate SKUs occur
    try {
      await query("DELETE FROM purchase_items WHERE purchase_id IN (SELECT id FROM purchases WHERE purchase_number LIKE 'PO-%')");
      await query("DELETE FROM purchases WHERE purchase_number LIKE 'PO-%'");
    } catch (_) {}

    const sampleSlugs = [
      'cyber-nova-oversized-heavyweight-tee',
      'wear-your-vibe-monochrome-street-tee',
      'custom-signature-crewneck-tee',
      'grand-birthday-golden-mystery-hamper',
      'eternal-love-couple-memory-box',
      'surprise-hexagonal-exploding-photo-box',
      'captain-america-iconic-style-tee',
      'spider-man-wear-the-legend-streetwear',
      'customised-coffee-cup',
      'customised-temperature-water-bottle',
      'spotify-photo-keychain',
      'panda-doll-with-name',
      'customized-wallet-boys'
    ];
    for (const slug of sampleSlugs) {
      const p = await getOne('SELECT id FROM products WHERE slug = ?', [slug]);
      if (p) {
        await query('DELETE FROM inventory_transactions WHERE product_id = ?', [p.id]);
        await query('DELETE FROM purchase_items WHERE product_id = ?', [p.id]);
        await query('DELETE FROM product_variants WHERE product_id = ?', [p.id]);
        await query('DELETE FROM products WHERE id = ?', [p.id]);
      }
    }
  }

  // 5. Products & Variants (with separate size/colour stock isolation)
  const products = [
    // NANOVA TEES
    {
      brand_id: 1,
      category_id: 1,
      sku: 'NT-OVR-001',
      name: 'Cyber Nova Oversized Heavyweight Tee',
      slug: 'cyber-nova-oversized-heavyweight-tee',
      description: 'Engineered from 250 GSM French Terry cotton. Relaxed streetwear fit featuring the iconic geometric NANOVA high-density puff print on chest and statement typographic back art.',
      purchase_cost: 320.00,
      selling_price: 799.00,
      front_image: '/images/products/tee-cyber-front.png',
      back_image: '/images/products/tee-cyber-back.png',
      model_3d_type: 'garment',
      customization_allowed: 0,
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'S', color: 'Midnight Black', color_hex: '#111111', stock: 12, purchased: 20, sold: 8 },
        { size: 'M', color: 'Midnight Black', color_hex: '#111111', stock: 18, purchased: 30, sold: 12 },
        { size: 'L', color: 'Midnight Black', color_hex: '#111111', stock: 15, purchased: 40, sold: 25 },
        { size: 'XL', color: 'Midnight Black', color_hex: '#111111', stock: 15, purchased: 25, sold: 10 },
        { size: 'XXL', color: 'Midnight Black', color_hex: '#111111', stock: 10, purchased: 15, sold: 5 },
        { size: 'M', color: 'Optic White', color_hex: '#f5f5f7', stock: 14, purchased: 20, sold: 6 },
        { size: 'L', color: 'Optic White', color_hex: '#f5f5f7', stock: 16, purchased: 25, sold: 9 }
      ]
    },
    {
      brand_id: 1,
      category_id: 3,
      sku: 'NT-PRN-002',
      name: 'Wear Your Vibe Monochrome Street Tee',
      slug: 'wear-your-vibe-monochrome-street-tee',
      description: 'Signature brand graphic tee celebrating raw energy. 220 GSM bio-washed combed cotton with soft-hand discharge print.',
      purchase_cost: 260.00,
      selling_price: 649.00,
      front_image: '/images/products/tee-vibe-front.png',
      back_image: '/images/products/tee-vibe-back.png',
      model_3d_type: 'garment',
      customization_allowed: 0,
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 0,
      variants: [
        { size: 'S', color: 'Anthracite Grey', color_hex: '#333333', stock: 8, purchased: 15, sold: 7 },
        { size: 'M', color: 'Anthracite Grey', color_hex: '#333333', stock: 22, purchased: 30, sold: 8 },
        { size: 'L', color: 'Anthracite Grey', color_hex: '#333333', stock: 18, purchased: 25, sold: 7 },
        { size: 'XL', color: 'Anthracite Grey', color_hex: '#333333', stock: 11, purchased: 15, sold: 4 }
      ]
    },
    {
      brand_id: 1,
      category_id: 4,
      sku: 'NT-CUS-003',
      name: 'Custom Signature Crewneck Tee',
      slug: 'custom-signature-crewneck-tee',
      description: 'Order your customized quote, date or initials. Premium 100% cotton canvas ready for your custom vibe.',
      purchase_cost: 280.00,
      selling_price: 699.00,
      front_image: '/images/products/tee-custom-front.png',
      back_image: '/images/products/tee-custom-back.png',
      model_3d_type: 'garment',
      customization_allowed: 1,
      customization_placeholder: 'Enter text, name or custom date to print on back/front',
      is_featured: 1,
      is_new_arrival: 0,
      is_best_seller: 1,
      variants: [
        { size: 'S', color: 'Pure White', color_hex: '#ffffff', stock: 15, purchased: 20, sold: 5 },
        { size: 'M', color: 'Pure White', color_hex: '#ffffff', stock: 20, purchased: 25, sold: 5 },
        { size: 'L', color: 'Pure White', color_hex: '#ffffff', stock: 25, purchased: 30, sold: 5 },
        { size: 'XL', color: 'Pure White', color_hex: '#ffffff', stock: 10, purchased: 15, sold: 5 }
      ]
    },

    // SURPRISE NANOVA
    {
      brand_id: 2,
      category_id: 7,
      sku: 'SN-BOX-001',
      name: 'Grand Birthday Golden Mystery Hamper',
      slug: 'grand-birthday-golden-mystery-hamper',
      description: 'A luxurious multi-layered surprise gifting experience. Includes personalized celebration scroll, artisan chocolates, golden fairy light bottle, customized wooden plaque, and scented candles.',
      purchase_cost: 550.00,
      selling_price: 1399.00,
      front_image: '/images/products/gift-box-gold.png',
      back_image: null,
      model_3d_type: 'giftbox',
      customization_allowed: 1,
      customization_placeholder: 'Enter Recipient Name, Birthday Date, and your heartfelt message',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'Standard Hamper', color: 'Royal Midnight Gold', color_hex: '#b38b3f', stock: 18, purchased: 30, sold: 12 },
        { size: 'Deluxe Hamper', color: 'Blush Rose Gold', color_hex: '#d48a94', stock: 14, purchased: 20, sold: 6 }
      ]
    },
    {
      brand_id: 2,
      category_id: 8,
      sku: 'SN-ANN-002',
      name: 'Eternal Love Couple Memory Box',
      slug: 'eternal-love-couple-memory-box',
      description: 'Preserve your love story with this handcrafted velvet keepsake box featuring couple polaroid string lights, customized acrylic song plaque with your Spotify code, and personalized message card.',
      purchase_cost: 480.00,
      selling_price: 1199.00,
      front_image: '/images/products/gift-box-couple.png',
      back_image: null,
      model_3d_type: 'giftbox',
      customization_allowed: 1,
      customization_placeholder: 'Enter Couple Names, Anniversary Date, Favorite Song & Artist',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'Standard Keepsake', color: 'Crimson Velvet', color_hex: '#8b1e2d', stock: 22, purchased: 35, sold: 13 },
        { size: 'Grand Keepsake', color: 'Emerald Green', color_hex: '#1e4835', stock: 12, purchased: 18, sold: 6 }
      ]
    },
    {
      brand_id: 2,
      category_id: 12,
      sku: 'SN-EXP-003',
      name: 'Surprise Hexagonal Exploding Photo Box',
      slug: 'surprise-hexagonal-exploding-photo-box',
      description: 'Open the lid to reveal 4 cascaded layers with 24 photo slots, pop-up greeting cards, and a hidden center gift compartment for rings or sweet treats.',
      purchase_cost: 310.00,
      selling_price: 849.00,
      front_image: '/images/products/gift-box-explode.png',
      back_image: null,
      model_3d_type: 'giftbox',
      customization_allowed: 1,
      customization_placeholder: 'Provide 12-24 photos or personalized wishes via WhatsApp after placing order',
      is_featured: 1,
      is_new_arrival: 0,
      is_best_seller: 1,
      variants: [
        { size: '4-Tier Box', color: 'Classic Black & Gold', color_hex: '#1a1a1a', stock: 16, purchased: 25, sold: 9 }
      ]
    },

    // 4. REAL MARVEL TEES DROP
    {
      brand_id: 1,
      category_id: 3,
      sku: 'NT-MAR-001',
      name: 'Captain America Iconic Style Tee',
      slug: 'captain-america-iconic-style-tee',
      description: "ICONIC STYLE • WEAR YOUR FANDOM. More than a t-shirt, it's a statement. Marvel-inspired everyday style. Features iconic vibranium shield chest print and full Captain America comic artwork on back. 100% breathable premium combed cotton, dropped shoulder regular fit.",
      purchase_cost: 320.00,
      selling_price: 799.00,
      front_image: '/images/products/tee-captain-america.jpg',
      back_image: '/images/products/tee-captain-america-alt.jpg',
      model_3d_type: 'image_only',
      customization_allowed: 0,
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'S', color: 'Vintage White', color_hex: '#f5f5f7', stock: 15, purchased: 15, sold: 0 },
        { size: 'M', color: 'Vintage White', color_hex: '#f5f5f7', stock: 25, purchased: 25, sold: 0 },
        { size: 'L', color: 'Vintage White', color_hex: '#f5f5f7', stock: 35, purchased: 35, sold: 0 },
        { size: 'XL', color: 'Vintage White', color_hex: '#f5f5f7', stock: 25, purchased: 25, sold: 0 },
        { size: 'XXL', color: 'Vintage White', color_hex: '#f5f5f7', stock: 10, purchased: 10, sold: 0 }
      ]
    },
    {
      brand_id: 1,
      category_id: 3,
      sku: 'NT-MAR-002',
      name: 'Spider-Man Wear The Legend Streetwear',
      slug: 'spider-man-wear-the-legend-streetwear',
      description: "SPIDER-MAN • WEAR THE LEGEND. Iconic design, premium comfort, superior style. More than a hero. Features front spider emblem on chest with skyline silhouette, and iconic upside-down Spider-Man 3D typography on back. Ultra-soft breathable heavyweight fabric.",
      purchase_cost: 320.00,
      selling_price: 799.00,
      front_image: '/images/products/tee-spiderman.jpg',
      back_image: '/images/products/tee-spiderman.jpg',
      model_3d_type: 'image_only',
      customization_allowed: 0,
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'S', color: 'Off White', color_hex: '#f0f0f4', stock: 15, purchased: 15, sold: 0 },
        { size: 'M', color: 'Off White', color_hex: '#f0f0f4', stock: 25, purchased: 25, sold: 0 },
        { size: 'L', color: 'Off White', color_hex: '#f0f0f4', stock: 35, purchased: 35, sold: 0 },
        { size: 'XL', color: 'Off White', color_hex: '#f0f0f4', stock: 25, purchased: 25, sold: 0 },
        { size: 'XXL', color: 'Off White', color_hex: '#f0f0f4', stock: 10, purchased: 10, sold: 0 }
      ]
    },

    // 5. REAL GIFTING REPERTOIRE
    {
      brand_id: 2,
      category_id: 10,
      sku: 'SN-MUG-001',
      name: 'Customised Coffee cup',
      slug: 'customised-coffee-cup',
      description: 'Made with your memories, just for you. ☕ Customise your mug with a name or photo and make every sip feel special. ✨ Premium ceramic, microwave safe, name print or photo print. Perfect gift for birthdays and special moments.',
      purchase_cost: 120.00,
      selling_price: 349.00,
      front_image: '/images/products/gift-custom-mug.jpg',
      back_image: null,
      model_3d_type: 'image_only',
      customization_allowed: 1,
      customization_placeholder: 'Enter name or text to print (e.g. Saanvi)',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'Standard (325ml)', color: 'Gloss White', color_hex: '#ffffff', stock: 50, purchased: 50, sold: 0 }
      ]
    },
    {
      brand_id: 2,
      category_id: 10,
      sku: 'SN-BOT-002',
      name: 'Customised Temperature water bottle',
      slug: 'customised-temperature-water-bottle',
      description: 'Carry your name, carry your vibe! 💕 A customised temperature bottle made extra special just for you. ✨ Touch to check temperature, keeps drinks hot & cold for 12+ hours, wide mouth easy to clean, non-slip base, leak proof premium stainless steel. Stay hydrated, stay cute! 💧',
      purchase_cost: 150.00,
      selling_price: 399.00,
      front_image: '/images/products/gift-temp-bottle.jpg',
      back_image: null,
      model_3d_type: 'image_only',
      customization_allowed: 1,
      customization_placeholder: 'Enter name to engrave (e.g. Leela)',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: '500ml', color: 'Matte Black', color_hex: '#111111', stock: 40, purchased: 40, sold: 0 }
      ]
    },
    {
      brand_id: 2,
      category_id: 10,
      sku: 'SN-KEY-003',
      name: 'Spotify Photo keychain',
      slug: 'spotify-photo-keychain',
      description: 'Personalized Photo Music Keychain 💙 Your photo, your song, your memory — beautifully made into a keychain you can carry everywhere. ✨🔑 Scannable Spotify barcode plays your favorite song instantly on your phone. High-grade scratch resistant acrylic with luxury gift box packaging.',
      purchase_cost: 30.00,
      selling_price: 99.00,
      front_image: '/images/products/gift-spotify-keychain.jpg',
      back_image: null,
      model_3d_type: 'image_only',
      customization_allowed: 1,
      customization_placeholder: 'Enter song name, artist & person name (e.g. Naveen S)',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'Standard (Acrylic)', color: 'Crystal Clear', color_hex: '#ffffff', stock: 100, purchased: 100, sold: 0 }
      ]
    },
    {
      brand_id: 2,
      category_id: 7,
      sku: 'SN-PAN-004',
      name: 'Panda doll with Name',
      slug: 'panda-doll-with-name',
      description: 'Personalized Panda Night Lamp 🐼 A cute companion that glows with warmth and your personal touch. 💛 Your name, your light. Warm LED soft glow for peaceful nights, customized name beautifully engraved, safe & durable child-safe silicone material. Perfect gift for birthdays, return gifts & special moments.',
      purchase_cost: 50.00,
      selling_price: 140.00,
      front_image: '/images/products/gift-panda-lamp.jpg',
      back_image: null,
      model_3d_type: 'image_only',
      customization_allowed: 1,
      customization_placeholder: 'Enter name to engrave (e.g. Laddu / Priya)',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'Mini LED Doll', color: 'Warm Glow', color_hex: '#fffae0', stock: 60, purchased: 60, sold: 0 }
      ]
    },
    {
      brand_id: 2,
      category_id: 10,
      sku: 'SN-WAL-005',
      name: 'Customized wallet (Boys)',
      slug: 'customized-wallet-boys',
      description: "Custom engraved premium leather wallet with personal photo engraving, brass metal nameplate, and inspirational quote. 'Dream it Believe it Achieve it'. Includes multiple card slots, hidden cash compartments, and exquisite luxury black gift box packaging.",
      purchase_cost: 180.00,
      selling_price: 449.00,
      front_image: '/images/products/gift-custom-wallet.jpg',
      back_image: null,
      model_3d_type: 'image_only',
      customization_allowed: 1,
      customization_placeholder: 'Enter name & quote to engrave (e.g. Naveen S)',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'Bifold', color: 'Tan Brown', color_hex: '#8b4513', stock: 35, purchased: 35, sold: 0 }
      ]
    }
  ];

  for (const p of products) {
    // Ensure clean insert without unique constraint errors
    const existingP = await getOne('SELECT id FROM products WHERE sku = ? OR slug = ?', [p.sku, p.slug]);
    if (existingP) {
      await query('DELETE FROM inventory_transactions WHERE product_id = ?', [existingP.id]);
      await query('DELETE FROM purchase_items WHERE product_id = ?', [existingP.id]);
      await query('DELETE FROM product_variants WHERE product_id = ?', [existingP.id]);
      await query('DELETE FROM products WHERE id = ?', [existingP.id]);
    }

    const prodRes = await query(
      `INSERT INTO products (brand_id, category_id, sku, name, slug, description, purchase_cost, selling_price, front_image, back_image, model_3d_type, customization_allowed, customization_placeholder, is_active, is_featured, is_new_arrival, is_best_seller)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [
        p.brand_id,
        p.category_id,
        p.sku,
        p.name,
        p.slug,
        p.description,
        p.purchase_cost,
        p.selling_price,
        p.front_image,
        p.back_image,
        p.model_3d_type,
        p.customization_allowed,
        p.customization_placeholder || null,
        p.is_featured,
        p.is_new_arrival,
        p.is_best_seller
      ]
    );

    const productId = prodRes.insertId;

    for (const v of p.variants) {
      const varSku = `${p.sku}-${v.size.replace(/\s+/g, '')}-${v.color.replace(/\s+/g, '')}`.toUpperCase();
      const varRes = await query(
        `INSERT INTO product_variants (product_id, size, color, color_hex, sku, stock_quantity, purchased_quantity, sold_quantity, low_stock_threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5)`,
        [productId, v.size, v.color, v.color_hex, varSku, v.stock, v.purchased, v.sold]
      );

      const variantId = varRes.insertId;

      // Record initial inventory purchase transaction
      await query(
        `INSERT INTO inventory_transactions (product_id, variant_id, brand_id, transaction_type, quantity_change, previous_stock, new_stock, reference_id, reason, created_by)
         VALUES (?, ?, ?, 'PURCHASE', ?, 0, ?, 'INITIAL-STOCK', 'Initial Stock Intake & Purchase', 'SYSTEM')`,
        [productId, variantId, p.brand_id, v.purchased, v.stock]
      );
    }
  }

  // 6. Sample Supplier Purchases
  const purCountRow = await getOne('SELECT COUNT(*) as cnt FROM purchases');
  if (!purCountRow || Number(purCountRow.cnt) === 0) {
    const firstProduct = await getOne('SELECT id, purchase_cost FROM products WHERE brand_id = 1 LIMIT 1');
    const firstVariant = firstProduct ? await getOne('SELECT id, size, color FROM product_variants WHERE product_id = ? LIMIT 1', [firstProduct.id]) : null;
    
    if (firstProduct && firstVariant) {
      const purRes1 = await query(
        `INSERT INTO purchases (purchase_number, supplier_id, brand_id, purchase_date, total_amount, additional_expenses, notes, created_by)
         VALUES ('PO-NT-2026-001', 1, 1, '2026-11-15', ?, 350.00, 'Batch intake of 240 GSM single jersey cotton tees.', 'admin')`,
        [Number(firstProduct.purchase_cost) * 60]
      );
      await query(
        `INSERT INTO purchase_items (purchase_id, product_id, variant_id, size, color, quantity, unit_cost, total_cost)
         VALUES (?, ?, ?, ?, ?, 60, ?, ?)`,
        [purRes1.insertId, firstProduct.id, firstVariant.id, firstVariant.size, firstVariant.color, firstProduct.purchase_cost, Number(firstProduct.purchase_cost) * 60]
      );
    }

    const giftProduct = await getOne('SELECT id, purchase_cost FROM products WHERE brand_id = 2 LIMIT 1');
    const giftVariant = giftProduct ? await getOne('SELECT id, size, color FROM product_variants WHERE product_id = ? LIMIT 1', [giftProduct.id]) : null;
    if (giftProduct && giftVariant) {
      const purRes2 = await query(
        `INSERT INTO purchases (purchase_number, supplier_id, brand_id, purchase_date, total_amount, additional_expenses, notes, created_by)
         VALUES ('PO-SN-2026-002', 2, 2, '2026-11-16', ?, 200.00, 'Curated luxury boxes and bespoke keepsake craft supplies.', 'admin')`,
        [Number(giftProduct.purchase_cost) * 40]
      );
      await query(
        `INSERT INTO purchase_items (purchase_id, product_id, variant_id, size, color, quantity, unit_cost, total_cost)
         VALUES (?, ?, ?, ?, ?, 40, ?, ?)`,
        [purRes2.insertId, giftProduct.id, giftVariant.id, giftVariant.size, giftVariant.color, giftProduct.purchase_cost, Number(giftProduct.purchase_cost) * 40]
      );
    }
    console.log('[Seed] Sample supplier purchase orders populated.');
  }

  // 7. Audit Log
  await query(
    `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, ip_address)
     VALUES (1, 'SYSTEM_INITIALIZATION', 'SYSTEM', '1', 'Initial database schema and business catalog successfully populated. Ready for fresh operations.', '127.0.0.1')`
  );

  try {
    await query('PRAGMA foreign_keys = ON');
  } catch (_) {}

  console.log('[Seed] Database initialization and fresh catalog setup completed successfully!');
}

// Allow direct execution
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase(true)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}

export default seedDatabase;
