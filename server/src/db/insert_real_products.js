import { initDatabase, query, getOne } from './index.js';

async function insertRealProducts() {
  await initDatabase();
  console.log('[Catalog] Inserting real user uploaded products...');

  const realProducts = [
    // 1. Captain America Iconic Style Tee (NANOVA TEES)
    {
      brand_id: 1,
      category_id: 3, // Printed T-Shirts
      sku: 'NT-MAR-001',
      name: 'Captain America Iconic Style Tee',
      slug: 'captain-america-iconic-style-tee',
      description: "ICONIC STYLE • WEAR YOUR FANDOM. More than a t-shirt, it's a statement. Marvel-inspired everyday style. Features iconic vibranium shield chest print and full Captain America comic artwork on back. 100% breathable premium combed cotton, dropped shoulder regular fit.",
      purchase_cost: 320,
      selling_price: 799,
      front_image: '/images/products/tee-captain-america.jpg',
      back_image: '/images/products/tee-captain-america-alt.jpg',
      model_3d_type: 'image_only',
      customization_allowed: 0,
      is_active: 1,
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'S', color: 'Vintage White', color_hex: '#f5f5f7', stock: 15 },
        { size: 'M', color: 'Vintage White', color_hex: '#f5f5f7', stock: 25 },
        { size: 'L', color: 'Vintage White', color_hex: '#f5f5f7', stock: 35 },
        { size: 'XL', color: 'Vintage White', color_hex: '#f5f5f7', stock: 25 },
        { size: 'XXL', color: 'Vintage White', color_hex: '#f5f5f7', stock: 10 }
      ]
    },

    // 2. Spider-Man Wear The Legend Streetwear (NANOVA TEES)
    {
      brand_id: 1,
      category_id: 3, // Printed T-Shirts
      sku: 'NT-MAR-002',
      name: 'Spider-Man Wear The Legend Streetwear',
      slug: 'spider-man-wear-the-legend-streetwear',
      description: "SPIDER-MAN • WEAR THE LEGEND. Iconic design, premium comfort, superior style. More than a hero. Features front spider emblem on chest with skyline silhouette, and iconic upside-down Spider-Man 3D typography on back. Ultra-soft breathable heavyweight fabric.",
      purchase_cost: 320,
      selling_price: 799,
      front_image: '/images/products/tee-spiderman.jpg',
      back_image: '/images/products/tee-spiderman.jpg',
      model_3d_type: 'image_only',
      customization_allowed: 0,
      is_active: 1,
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'S', color: 'Off White', color_hex: '#f0f0f4', stock: 15 },
        { size: 'M', color: 'Off White', color_hex: '#f0f0f4', stock: 25 },
        { size: 'L', color: 'Off White', color_hex: '#f0f0f4', stock: 35 },
        { size: 'XL', color: 'Off White', color_hex: '#f0f0f4', stock: 25 },
        { size: 'XXL', color: 'Off White', color_hex: '#f0f0f4', stock: 10 }
      ]
    },

    // 3. Customised Coffee Cup (SURPRISE NANOVA) - ₹349
    {
      brand_id: 2,
      category_id: 10, // Personalized Gifts
      sku: 'SN-MUG-001',
      name: 'Customised Coffee cup',
      slug: 'customised-coffee-cup',
      description: 'Made with your memories, just for you. ☕ Customise your mug with a name or photo and make every sip feel special. ✨ Premium ceramic, microwave safe, name print or photo print. Perfect gift for birthdays and special moments.',
      purchase_cost: 120,
      selling_price: 349,
      front_image: '/images/products/gift-custom-mug.jpg',
      back_image: null,
      model_3d_type: 'image_only',
      customization_allowed: 1,
      customization_placeholder: 'Enter name or text to print (e.g. Saanvi)',
      is_active: 1,
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'Standard (325ml)', color: 'Gloss White', color_hex: '#ffffff', stock: 50 }
      ]
    },

    // 4. Customised Temperature Water Bottle (SURPRISE NANOVA) - ₹399
    {
      brand_id: 2,
      category_id: 10, // Personalized Gifts
      sku: 'SN-BOT-002',
      name: 'Customised Temperature water bottle',
      slug: 'customised-temperature-water-bottle',
      description: 'Carry your name, carry your vibe! 💕 A customised temperature bottle made extra special just for you. ✨ Touch to check temperature, keeps drinks hot & cold for 12+ hours, wide mouth easy to clean, non-slip base, leak proof premium stainless steel. Stay hydrated, stay cute! 💧',
      purchase_cost: 150,
      selling_price: 399,
      front_image: '/images/products/gift-temp-bottle.jpg',
      back_image: null,
      model_3d_type: 'image_only',
      customization_allowed: 1,
      customization_placeholder: 'Enter name to engrave (e.g. Leela)',
      is_active: 1,
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: '500ml', color: 'Matte Black', color_hex: '#111111', stock: 40 }
      ]
    },

    // 5. Spotify Photo Keychain (SURPRISE NANOVA) - ₹99
    {
      brand_id: 2,
      category_id: 10, // Personalized Gifts
      sku: 'SN-KEY-003',
      name: 'Spotify Photo keychain',
      slug: 'spotify-photo-keychain',
      description: 'Personalized Photo Music Keychain 💙 Your photo, your song, your memory — beautifully made into a keychain you can carry everywhere. ✨🔑 Scannable Spotify barcode plays your favorite song instantly on your phone. High-grade scratch resistant acrylic with luxury gift box packaging.',
      purchase_cost: 30,
      selling_price: 99,
      front_image: '/images/products/gift-spotify-keychain.jpg',
      back_image: null,
      model_3d_type: 'image_only',
      customization_allowed: 1,
      customization_placeholder: 'Enter song name, artist & person name (e.g. Naveen S)',
      is_active: 1,
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'Standard (Acrylic)', color: 'Crystal Clear', color_hex: '#ffffff', stock: 100 }
      ]
    },

    // 6. Panda Doll with Name (SURPRISE NANOVA) - ₹140
    {
      brand_id: 2,
      category_id: 7, // Birthday Gifts
      sku: 'SN-PAN-004',
      name: 'Panda doll with Name',
      slug: 'panda-doll-with-name',
      description: 'Personalized Panda Night Lamp 🐼 A cute companion that glows with warmth and your personal touch. 💛 Your name, your light. Warm LED soft glow for peaceful nights, customized name beautifully engraved, safe & durable child-safe silicone material. Perfect gift for birthdays, return gifts & special moments.',
      purchase_cost: 50,
      selling_price: 140,
      front_image: '/images/products/gift-panda-lamp.jpg',
      back_image: null,
      model_3d_type: 'image_only',
      customization_allowed: 1,
      customization_placeholder: 'Enter name to engrave (e.g. Laddu / Priya)',
      is_active: 1,
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'Mini LED Doll', color: 'Warm Glow', color_hex: '#fffae0', stock: 60 }
      ]
    },

    // 7. Customized Leather Wallet (Boys) (SURPRISE NANOVA) - ₹449
    {
      brand_id: 2,
      category_id: 10, // Personalized Gifts
      sku: 'SN-WAL-005',
      name: 'Customized wallet (Boys)',
      slug: 'customized-wallet-boys',
      description: "Custom engraved premium leather wallet with personal photo engraving, brass metal nameplate, and inspirational quote. 'Dream it Believe it Achieve it'. Includes multiple card slots, hidden cash compartments, and exquisite luxury black gift box packaging.",
      purchase_cost: 180,
      selling_price: 449,
      front_image: '/images/products/gift-custom-wallet.jpg',
      back_image: null,
      model_3d_type: 'image_only',
      customization_allowed: 1,
      customization_placeholder: 'Enter name & quote to engrave (e.g. Naveen S)',
      is_active: 1,
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      variants: [
        { size: 'Bifold', color: 'Tan Brown', color_hex: '#8b4513', stock: 35 }
      ]
    }
  ];

  for (const p of realProducts) {
    // Check if exists by SKU
    const existing = await getOne('SELECT id FROM products WHERE sku = ?', [p.sku]);
    let prodId;

    if (existing) {
      console.log(`Product SKU ${p.sku} already exists (ID ${existing.id}). Updating images & details...`);
      await query(
        `UPDATE products SET 
          name = ?, slug = ?, description = ?, purchase_cost = ?, selling_price = ?,
          front_image = ?, back_image = ?, model_3d_type = 'image_only',
          customization_allowed = ?, customization_placeholder = ?, is_featured = 1
         WHERE id = ?`,
        [p.name, p.slug, p.description, p.purchase_cost, p.selling_price, p.front_image, p.back_image, p.customization_allowed, p.customization_placeholder || '', existing.id]
      );
      prodId = existing.id;
    } else {
      const res = await query(
        `INSERT INTO products (
          brand_id, category_id, sku, name, slug, description, purchase_cost, selling_price,
          front_image, back_image, model_3d_type, customization_allowed, customization_placeholder,
          is_active, is_featured, is_new_arrival, is_best_seller
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'image_only', ?, ?, 1, 1, 1, 1)`,
        [p.brand_id, p.category_id, p.sku, p.name, p.slug, p.description, p.purchase_cost, p.selling_price, p.front_image, p.back_image, p.customization_allowed, p.customization_placeholder || '']
      );
      prodId = res.insertId;
      console.log(`Created product "${p.name}" (ID ${prodId}, SKU ${p.sku})`);
    }

    // Insert or update variants
    for (const v of p.variants) {
      const vSku = `${p.sku}-${v.size.replace(/\s+/g, '')}-${v.color.replace(/\s+/g, '')}`.toUpperCase();
      const existingVar = await getOne('SELECT id FROM product_variants WHERE product_id = ? AND size = ? AND color = ?', [prodId, v.size, v.color]);
      if (!existingVar) {
        await query(
          `INSERT INTO product_variants (product_id, size, color, color_hex, sku, stock_quantity, purchased_quantity, sold_quantity, low_stock_threshold)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, 5)`,
          [prodId, v.size, v.color, v.color_hex, vSku, v.stock, v.stock]
        );
      }
    }
  }

  console.log('All real products inserted successfully!');
  process.exit(0);
}

insertRealProducts().catch(err => {
  console.error('Error inserting real products:', err);
  process.exit(1);
});
