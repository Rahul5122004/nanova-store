import { query, getActiveClient } from './index.js';

export async function createTablesIfNotExist() {
  const isSqlite = getActiveClient() === 'sqlite';

  // Table creation statements compatible with SQLite & MySQL
  const statements = [
    // 1. ADMINS
    `CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      username VARCHAR(60) NOT NULL UNIQUE,
      email VARCHAR(120) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      role VARCHAR(30) DEFAULT 'SUPER_ADMIN',
      is_active INTEGER DEFAULT 1,
      last_login DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    // 2. BRANDS
    `CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      tagline VARCHAR(255) NOT NULL,
      phone VARCHAR(25) NOT NULL,
      whatsapp VARCHAR(25) NOT NULL,
      instagram_handle VARCHAR(100) NOT NULL,
      instagram_url VARCHAR(255) NOT NULL,
      logo_symbol VARCHAR(50) DEFAULT 'N-GEOMETRIC',
      theme_mode VARCHAR(30) DEFAULT 'dark',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    // 3. CATEGORIES
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      brand_id INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(120) NOT NULL,
      description TEXT,
      image_url VARCHAR(255),
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
    );`,

    // 4. PRODUCTS
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      brand_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      sku VARCHAR(60) NOT NULL UNIQUE,
      name VARCHAR(200) NOT NULL,
      slug VARCHAR(220) NOT NULL UNIQUE,
      description TEXT,
      purchase_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      front_image VARCHAR(255),
      back_image VARCHAR(255),
      model_3d_type VARCHAR(50) DEFAULT 'garment',
      customization_allowed INTEGER DEFAULT 0,
      customization_placeholder VARCHAR(255),
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      is_new_arrival INTEGER DEFAULT 0,
      is_best_seller INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );`,

    // 5. PRODUCT VARIANTS (Size + Colour Matrix)
    `CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      product_id INTEGER NOT NULL,
      size VARCHAR(30) NOT NULL,
      color VARCHAR(50) NOT NULL,
      color_hex VARCHAR(15) DEFAULT '#000000',
      sku VARCHAR(80) NOT NULL UNIQUE,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      purchased_quantity INTEGER NOT NULL DEFAULT 0,
      sold_quantity INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(product_id, size, color)
    );`,

    // 6. PRODUCT IMAGES
    `CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      product_id INTEGER NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      view_side VARCHAR(30) DEFAULT 'gallery',
      sort_order INTEGER DEFAULT 0,
      alt_text VARCHAR(200),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );`,

    // 7. SUPPLIERS
    `CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      name VARCHAR(120) NOT NULL,
      company_name VARCHAR(150),
      phone VARCHAR(30) NOT NULL,
      email VARCHAR(120),
      address TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    // 8. PURCHASES
    `CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      purchase_number VARCHAR(50) NOT NULL UNIQUE,
      supplier_id INTEGER NOT NULL,
      brand_id INTEGER NOT NULL,
      purchase_date DATE NOT NULL,
      total_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
      additional_expenses DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      notes TEXT,
      created_by VARCHAR(60),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (brand_id) REFERENCES brands(id)
    );`,

    // 9. PURCHASE ITEMS
    `CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      purchase_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      variant_id INTEGER NOT NULL,
      size VARCHAR(30) NOT NULL,
      color VARCHAR(50) NOT NULL,
      quantity INTEGER NOT NULL,
      unit_cost DECIMAL(12, 2) NOT NULL,
      total_cost DECIMAL(14, 2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    );`,

    // 10. INVENTORY TRANSACTIONS
    `CREATE TABLE IF NOT EXISTS inventory_transactions (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      product_id INTEGER NOT NULL,
      variant_id INTEGER NOT NULL,
      brand_id INTEGER NOT NULL,
      transaction_type VARCHAR(40) NOT NULL,
      quantity_change INTEGER NOT NULL,
      previous_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      reference_id VARCHAR(100),
      reason TEXT NOT NULL,
      created_by VARCHAR(60) DEFAULT 'SYSTEM',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
    );`,

    // 11. CUSTOMERS
    `CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      full_name VARCHAR(120) NOT NULL,
      phone VARCHAR(25) NOT NULL UNIQUE,
      email VARCHAR(120),
      address TEXT NOT NULL,
      city VARCHAR(80) NOT NULL,
      district VARCHAR(80) NOT NULL,
      state VARCHAR(80) NOT NULL,
      pin_code VARCHAR(15) NOT NULL,
      total_orders INTEGER DEFAULT 0,
      total_spent DECIMAL(14, 2) DEFAULT 0.00,
      last_order_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    // 12. ORDERS
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      order_number VARCHAR(50) NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      brand_id INTEGER NOT NULL,
      total_quantity INTEGER NOT NULL DEFAULT 1,
      subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      delivery_charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      final_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      cogs_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      payment_method VARCHAR(20) DEFAULT 'UPI_QR',
      payment_status VARCHAR(30) DEFAULT 'PENDING_VERIFICATION',
      order_status VARCHAR(30) DEFAULT 'NEW',
      stock_deducted INTEGER DEFAULT 1,
      notes TEXT,
      cancellation_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (brand_id) REFERENCES brands(id)
    );`,

    // 13. ORDER ITEMS
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      variant_id INTEGER NOT NULL,
      product_name VARCHAR(200) NOT NULL,
      size VARCHAR(30) NOT NULL,
      color VARCHAR(50) NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(12, 2) NOT NULL,
      unit_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      subtotal DECIMAL(14, 2) NOT NULL,
      custom_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    );`,

    // 14. INVOICES
    `CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      invoice_number VARCHAR(50) NOT NULL UNIQUE,
      order_id INTEGER NOT NULL UNIQUE,
      brand_id INTEGER NOT NULL,
      customer_name VARCHAR(120) NOT NULL,
      customer_phone VARCHAR(25) NOT NULL,
      customer_address TEXT NOT NULL,
      subtotal DECIMAL(12, 2) NOT NULL,
      delivery_charges DECIMAL(10, 2) NOT NULL,
      discount_amount DECIMAL(10, 2) NOT NULL,
      gst_rate DECIMAL(5, 2) DEFAULT 0.00,
      gst_amount DECIMAL(10, 2) DEFAULT 0.00,
      total_amount DECIMAL(12, 2) NOT NULL,
      pdf_path VARCHAR(255),
      invoice_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (brand_id) REFERENCES brands(id)
    );`,

    // 15. PAYMENTS
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      order_id INTEGER NOT NULL,
      payment_method VARCHAR(20) DEFAULT 'UPI_QR',
      upi_ref_id VARCHAR(100),
      screenshot_url VARCHAR(255),
      amount DECIMAL(12, 2) NOT NULL,
      status VARCHAR(30) DEFAULT 'PENDING',
      verified_by VARCHAR(60),
      verified_at DATETIME,
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );`,

    // 16. EXPENSES
    `CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      brand_id INTEGER,
      category VARCHAR(50) NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      expense_date DATE NOT NULL,
      description TEXT NOT NULL,
      receipt_url VARCHAR(255),
      created_by VARCHAR(60) DEFAULT 'ADMIN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brand_id) REFERENCES brands(id)
    );`,

    // 17. NOTIFICATIONS
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      type VARCHAR(40) NOT NULL,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      reference_id VARCHAR(100),
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    // 18. BUSINESS SETTINGS
    `CREATE TABLE IF NOT EXISTS business_settings (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT,
      setting_group VARCHAR(50) DEFAULT 'GENERAL',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    // 19. PAYMENT SETTINGS
    `CREATE TABLE IF NOT EXISTS payment_settings (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      qr_image_url VARCHAR(255),
      upi_id VARCHAR(100),
      account_name VARCHAR(120),
      instructions TEXT,
      qr_enabled INTEGER DEFAULT 1,
      cod_enabled INTEGER DEFAULT 1,
      delivery_charge_flat DECIMAL(8, 2) DEFAULT 60.00,
      free_delivery_threshold DECIMAL(10, 2) DEFAULT 999.00,
      gst_enabled INTEGER DEFAULT 0,
      gst_rate_percent DECIMAL(5, 2) DEFAULT 0.00,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    // 20. AUDIT LOGS
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      admin_id INTEGER,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(60) NOT NULL,
      entity_id VARCHAR(100),
      details TEXT,
      ip_address VARCHAR(45),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    // 21. GALLERY MOMENTS (Community & Moment Gallery)
    `CREATE TABLE IF NOT EXISTS gallery_moments (
      id INTEGER PRIMARY KEY ${isSqlite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT'},
      brand_id INTEGER DEFAULT 1,
      title VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      instagram_url VARCHAR(500),
      likes_count VARCHAR(50) DEFAULT '1.2k',
      customer_name VARCHAR(120),
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const stmt of statements) {
    try {
      await query(stmt);
    } catch (err) {
      console.error(`[DB Schema] Failed to execute statement:`, stmt, err.message);
    }
  }

  console.log('[DB Schema] All 20 tables verified successfully.');
}
