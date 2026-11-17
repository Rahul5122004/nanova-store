-- =====================================================================
-- NANOVA: PREMIUM DUAL-BRAND E-COMMERCE & BUSINESS AUTOMATION DATABASE
-- Brands: NANOVA TEES & SURPRISE NANOVA
-- Architecture: Single centralized database with strict brand partitioning,
-- accurate COGS tracking, size/color variant matrix, and audit trails.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `nanova_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nanova_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. ADMINS TABLE
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(60) NOT NULL UNIQUE,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER') DEFAULT 'SUPER_ADMIN',
    `is_active` TINYINT(1) DEFAULT 1,
    `last_login` DATETIME NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_admin_username` (`username`),
    INDEX `idx_admin_email` (`email`)
) ENGINE=InnoDB;

-- 2. BRANDS TABLE (Nanova Tees & Surprise Nanova)
DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `tagline` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(25) NOT NULL,
    `whatsapp` VARCHAR(25) NOT NULL,
    `instagram_handle` VARCHAR(100) NOT NULL,
    `instagram_url` VARCHAR(255) NOT NULL,
    `logo_symbol` VARCHAR(50) DEFAULT 'N-GEOMETRIC',
    `theme_mode` VARCHAR(30) DEFAULT 'dark',
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. CATEGORIES TABLE
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `brand_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(255) NULL,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_brand_slug` (`brand_id`, `slug`),
    INDEX `idx_category_brand` (`brand_id`)
) ENGINE=InnoDB;

-- 4. PRODUCTS TABLE
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `brand_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `sku` VARCHAR(60) NOT NULL UNIQUE,
    `name` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(220) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `purchase_cost` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `selling_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `front_image` VARCHAR(255) NULL,
    `back_image` VARCHAR(255) NULL,
    `model_3d_type` VARCHAR(50) DEFAULT 'garment',
    `customization_allowed` TINYINT(1) DEFAULT 0,
    `customization_placeholder` VARCHAR(255) NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `is_featured` TINYINT(1) DEFAULT 0,
    `is_new_arrival` TINYINT(1) DEFAULT 0,
    `is_best_seller` TINYINT(1) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
    INDEX `idx_product_brand` (`brand_id`),
    INDEX `idx_product_category` (`category_id`)
) ENGINE=InnoDB;

-- 5. PRODUCT VARIANTS TABLE (Exact Size + Colour stock isolation)
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `size` VARCHAR(30) NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    `color_hex` VARCHAR(15) DEFAULT '#000000',
    `sku` VARCHAR(80) NOT NULL UNIQUE,
    `stock_quantity` INT NOT NULL DEFAULT 0,
    `purchased_quantity` INT NOT NULL DEFAULT 0,
    `sold_quantity` INT NOT NULL DEFAULT 0,
    `low_stock_threshold` INT NOT NULL DEFAULT 5,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_product_size_color` (`product_id`, `size`, `color`),
    INDEX `idx_variant_product` (`product_id`)
) ENGINE=InnoDB;

-- 6. PRODUCT IMAGES TABLE
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `view_side` ENUM('front', 'back', 'gallery', 'detail') DEFAULT 'gallery',
    `sort_order` INT DEFAULT 0,
    `alt_text` VARCHAR(200) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    INDEX `idx_image_product` (`product_id`)
) ENGINE=InnoDB;

-- 7. SUPPLIERS TABLE
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(120) NOT NULL,
    `company_name` VARCHAR(150) NULL,
    `phone` VARCHAR(30) NOT NULL,
    `email` VARCHAR(120) NULL,
    `address` TEXT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. PURCHASES TABLE
DROP TABLE IF EXISTS `purchases`;
CREATE TABLE `purchases` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `purchase_number` VARCHAR(50) NOT NULL UNIQUE,
    `supplier_id` INT NOT NULL,
    `brand_id` INT NOT NULL,
    `purchase_date` DATE NOT NULL,
    `total_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `additional_expenses` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `created_by` VARCHAR(60) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE CASCADE,
    INDEX `idx_purchase_brand` (`brand_id`),
    INDEX `idx_purchase_date` (`purchase_date`)
) ENGINE=InnoDB;

-- 9. PURCHASE ITEMS TABLE
DROP TABLE IF EXISTS `purchase_items`;
CREATE TABLE `purchase_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `purchase_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `variant_id` INT NOT NULL,
    `size` VARCHAR(30) NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    `quantity` INT NOT NULL,
    `unit_cost` DECIMAL(12, 2) NOT NULL,
    `total_cost` DECIMAL(14, 2) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 10. INVENTORY TRANSACTIONS TABLE (Audit log of every stock change)
DROP TABLE IF EXISTS `inventory_transactions`;
CREATE TABLE `inventory_transactions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `variant_id` INT NOT NULL,
    `brand_id` INT NOT NULL,
    `transaction_type` ENUM('PURCHASE', 'SALE', 'ADJUSTMENT', 'DAMAGE', 'RETURN', 'CANCEL_RESTORE') NOT NULL,
    `quantity_change` INT NOT NULL,
    `previous_stock` INT NOT NULL,
    `new_stock` INT NOT NULL,
    `reference_id` VARCHAR(100) NULL,
    `reason` TEXT NOT NULL,
    `created_by` VARCHAR(60) DEFAULT 'SYSTEM',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE,
    INDEX `idx_inv_tx_variant` (`variant_id`),
    INDEX `idx_inv_tx_date` (`created_at`)
) ENGINE=InnoDB;

-- 11. CUSTOMERS TABLE
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(25) NOT NULL UNIQUE,
    `email` VARCHAR(120) NULL,
    `address` TEXT NOT NULL,
    `city` VARCHAR(80) NOT NULL,
    `district` VARCHAR(80) NOT NULL,
    `state` VARCHAR(80) NOT NULL,
    `pin_code` VARCHAR(15) NOT NULL,
    `total_orders` INT DEFAULT 0,
    `total_spent` DECIMAL(14, 2) DEFAULT 0.00,
    `last_order_at` DATETIME NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_customer_phone` (`phone`)
) ENGINE=InnoDB;

-- 12. ORDERS TABLE
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_number` VARCHAR(50) NOT NULL UNIQUE,
    `customer_id` INT NOT NULL,
    `brand_id` INT NOT NULL,
    `total_quantity` INT NOT NULL DEFAULT 1,
    `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `delivery_charges` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `final_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `cogs_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `payment_method` ENUM('UPI_QR', 'COD') DEFAULT 'UPI_QR',
    `payment_status` ENUM('PENDING_VERIFICATION', 'VERIFIED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING_VERIFICATION',
    `order_status` ENUM('NEW', 'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'NEW',
    `stock_deducted` TINYINT(1) DEFAULT 1,
    `notes` TEXT NULL,
    `cancellation_reason` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE CASCADE,
    INDEX `idx_order_number` (`order_number`),
    INDEX `idx_order_brand` (`brand_id`),
    INDEX `idx_order_status` (`order_status`),
    INDEX `idx_order_date` (`created_at`)
) ENGINE=InnoDB;

-- 13. ORDER ITEMS TABLE
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `variant_id` INT NOT NULL,
    `product_name` VARCHAR(200) NOT NULL,
    `size` VARCHAR(30) NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    `quantity` INT NOT NULL,
    `unit_price` DECIMAL(12, 2) NOT NULL,
    `unit_cost` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `subtotal` DECIMAL(14, 2) NOT NULL,
    `custom_note` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 14. INVOICES TABLE
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
    `order_id` INT NOT NULL UNIQUE,
    `brand_id` INT NOT NULL,
    `customer_name` VARCHAR(120) NOT NULL,
    `customer_phone` VARCHAR(25) NOT NULL,
    `customer_address` TEXT NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `delivery_charges` DECIMAL(10, 2) NOT NULL,
    `discount_amount` DECIMAL(10, 2) NOT NULL,
    `gst_rate` DECIMAL(5, 2) DEFAULT 0.00,
    `gst_amount` DECIMAL(10, 2) DEFAULT 0.00,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `pdf_path` VARCHAR(255) NULL,
    `invoice_date` DATE NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE CASCADE,
    INDEX `idx_invoice_number` (`invoice_number`)
) ENGINE=InnoDB;

-- 15. PAYMENTS TABLE (QR & UPI manual verification)
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `payment_method` ENUM('UPI_QR', 'COD') DEFAULT 'UPI_QR',
    `upi_ref_id` VARCHAR(100) NULL,
    `screenshot_url` VARCHAR(255) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
    `verified_by` VARCHAR(60) NULL,
    `verified_at` DATETIME NULL,
    `rejection_reason` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    INDEX `idx_payment_status` (`status`)
) ENGINE=InnoDB;

-- 16. EXPENSES TABLE (Operating Expenses for P&L)
DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `brand_id` INT NULL,
    `category` ENUM('PACKAGING', 'PRINTING', 'DELIVERY', 'TRANSPORTATION', 'MARKETING', 'OTHER') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `expense_date` DATE NOT NULL,
    `description` TEXT NOT NULL,
    `receipt_url` VARCHAR(255) NULL,
    `created_by` VARCHAR(60) DEFAULT 'ADMIN',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL,
    INDEX `idx_expense_date` (`expense_date`),
    INDEX `idx_expense_category` (`category`)
) ENGINE=InnoDB;

-- 17. NOTIFICATIONS TABLE
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `type` ENUM('NEW_ORDER', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'LOW_STOCK', 'OUT_OF_STOCK') NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `reference_id` VARCHAR(100) NULL,
    `is_read` TINYINT(1) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_notif_unread` (`is_read`, `created_at`)
) ENGINE=InnoDB;

-- 18. BUSINESS SETTINGS TABLE
DROP TABLE IF EXISTS `business_settings`;
CREATE TABLE `business_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` TEXT NULL,
    `setting_group` VARCHAR(50) DEFAULT 'GENERAL',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 19. PAYMENT SETTINGS TABLE
DROP TABLE IF EXISTS `payment_settings`;
CREATE TABLE `payment_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `qr_image_url` VARCHAR(255) NULL,
    `upi_id` VARCHAR(100) NULL,
    `account_name` VARCHAR(120) NULL,
    `instructions` TEXT NULL,
    `qr_enabled` TINYINT(1) DEFAULT 1,
    `cod_enabled` TINYINT(1) DEFAULT 1,
    `delivery_charge_flat` DECIMAL(8, 2) DEFAULT 60.00,
    `free_delivery_threshold` DECIMAL(10, 2) DEFAULT 999.00,
    `gst_enabled` TINYINT(1) DEFAULT 0,
    `gst_rate_percent` DECIMAL(5, 2) DEFAULT 0.00,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 20. AUDIT LOGS TABLE
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` INT NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(60) NOT NULL,
    `entity_id` VARCHAR(100) NULL,
    `details` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- INITIAL ESSENTIAL SEED DATA
-- =====================================================================

-- Insert Brands with exact customer specifications
INSERT INTO `brands` (`id`, `code`, `name`, `tagline`, `phone`, `whatsapp`, `instagram_handle`, `instagram_url`, `logo_symbol`, `theme_mode`)
VALUES
(1, 'nanova_tees', 'NANOVA TEES', 'WEAR YOUR VIBE.', '6382092001', '6382092001', '@surprise_nova_11.11', 'https://www.instagram.com/surprise_nova_11.11/', 'N-GEOMETRIC', 'dark'),
(2, 'surprise_nanova', 'SURPRISE NANOVA', 'MAKE EVERY MOMENT SPECIAL.', '89035 41632', '8903541632', '@surprise_nova_11.11', 'https://www.instagram.com/surprise_nova_11.11/', 'N-GEOMETRIC', 'luxury')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Insert Payment Settings Defaults
INSERT INTO `payment_settings` (`id`, `qr_image_url`, `upi_id`, `account_name`, `instructions`, `qr_enabled`, `cod_enabled`, `delivery_charge_flat`, `free_delivery_threshold`)
VALUES
(1, '/uploads/qr/default_qr.png', '', 'NANOVA ENTERPRISES', 'Scan QR using any UPI app (GPay, PhonePe, Paytm). Complete payment and enter the 12-digit UTR/Reference ID below with screenshot.', 1, 1, 60.00, 999.00)
ON DUPLICATE KEY UPDATE `updated_at`=CURRENT_TIMESTAMP;

-- Insert Business Settings Defaults
INSERT INTO `business_settings` (`setting_key`, `setting_value`, `setting_group`)
VALUES
('site_title', 'NANOVA | Premium Fashion & Curated Surprises', 'GENERAL'),
('home_hero_title', 'ONE DESTINATION. TWO DIFFERENT EXPERIENCES.', 'HERO'),
('home_hero_subtitle', 'Discover your style. Celebrate your special moments.', 'HERO'),
('nanova_tees_announcement', 'NEW STREETWEAR DROP AVAILABLE • FLAT 10% OFF FIRST ORDER', 'ANNOUNCEMENT'),
('surprise_nanova_announcement', 'HANDCRAFTED SURPRISE GIFT BOXES • EXPRESS DISPATCH ACROSS INDIA', 'ANNOUNCEMENT'),
('email_smtp_enabled', '0', 'NOTIFICATION'),
('email_smtp_host', '', 'NOTIFICATION'),
('email_smtp_port', '587', 'NOTIFICATION'),
('email_smtp_user', '', 'NOTIFICATION'),
('email_smtp_pass', '', 'NOTIFICATION')
ON DUPLICATE KEY UPDATE `setting_value`=VALUES(`setting_value`);
