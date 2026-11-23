import express from 'express';
import { query, getOne, transaction } from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { sendNotification } from '../services/notificationService.js';
import { generateInvoicePdf, generateThankYouCardPdf } from '../services/invoiceService.js';

const router = express.Router();

/**
 * Public: Customer Places Order
 * POST /api/orders
 */
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      items,
      brand_code = 'nanova_tees',
      payment_method = 'UPI_QR',
      notes = ''
    } = req.body;

    // 1. Validate customer details
    if (!customer?.full_name || !customer?.phone || !customer?.address || !customer?.city || !customer?.pin_code) {
      return res.status(400).json({
        success: false,
        message: 'Complete customer details (name, phone, address, city, pin code) are required.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Shopping cart is empty. Please add products.'
      });
    }

    // 2. Fetch Brand
    const brand = await getOne('SELECT id, code, name, phone FROM brands WHERE code = ?', [brand_code]);
    if (!brand) {
      return res.status(400).json({ success: false, message: 'Invalid brand specified.' });
    }

    // 3. Check Payment & Delivery Settings
    const paySettings = await getOne('SELECT * FROM payment_settings LIMIT 1');
    const flatDelivery = Number(paySettings?.delivery_charge_flat || 60);
    const freeDeliveryThreshold = Number(paySettings?.free_delivery_threshold || 999);

    // 4. Validate stock for each item before initiating transaction
    for (const item of items) {
      const variant = await getOne(
        `SELECT pv.*, p.name as product_name
         FROM product_variants pv
         JOIN products p ON pv.product_id = p.id
         WHERE pv.id = ?`,
        [item.variant_id]
      );

      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Item not found: ${item.product_name || 'Unknown item'}`
        });
      }

      if (Number(variant.stock_quantity) < Number(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${variant.product_name} (${variant.size}, ${variant.color}). Available: ${variant.stock_quantity}, Requested: ${item.quantity}`
        });
      }
    }

    // 5. Execute Order Placement inside Transaction
    const orderResult = await transaction(async (tx) => {
      // Find or Create Customer
      let existingCustomer = await tx.getOne('SELECT id, total_orders, total_spent FROM customers WHERE phone = ?', [customer.phone]);
      let customerId;

      if (existingCustomer) {
        customerId = existingCustomer.id;
        await tx.query(
          `UPDATE customers SET 
            full_name = ?, email = COALESCE(?, email), address = ?, city = ?, district = ?, state = ?, pin_code = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [customer.full_name, customer.email || null, customer.address, customer.city, customer.district || customer.city, customer.state || 'Tamil Nadu', customer.pin_code, customerId]
        );
      } else {
        const custRes = await tx.query(
          `INSERT INTO customers (full_name, phone, email, address, city, district, state, pin_code, total_orders, total_spent, last_order_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)`,
          [customer.full_name, customer.phone, customer.email || null, customer.address, customer.city, customer.district || customer.city, customer.state || 'Tamil Nadu', customer.pin_code]
        );
        customerId = custRes.insertId;
      }

      // Generate Unique Order Number
      const year = new Date().getFullYear();
      const countRow = await tx.getOne('SELECT COUNT(*) as cnt FROM orders');
      const seq = String(Number(countRow.cnt) + 1).padStart(4, '0');
      const orderNumber = `NAN-${year}-${seq}`;

      // Calculate totals and COGS
      let subtotal = 0;
      let totalCogs = 0;
      let totalQty = 0;

      for (const item of items) {
        const lineTotal = Number(item.unit_price) * Number(item.quantity);
        const lineCost = Number(item.unit_cost || 0) * Number(item.quantity);
        subtotal += lineTotal;
        totalCogs += lineCost;
        totalQty += Number(item.quantity);
      }

      const deliveryCharges = subtotal >= freeDeliveryThreshold ? 0.00 : flatDelivery;
      const discountAmount = Number(req.body.discount_amount || 0);
      const finalAmount = Math.max(0, subtotal + deliveryCharges - discountAmount);

      // Create Order
      const ordRes = await tx.query(
        `INSERT INTO orders (
          order_number, customer_id, brand_id, total_quantity,
          subtotal, delivery_charges, discount_amount, final_amount, cogs_amount,
          payment_method, payment_status, order_status, stock_deducted, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_VERIFICATION', 'NEW', 1, ?)`,
        [
          orderNumber,
          customerId,
          brand.id,
          totalQty,
          subtotal,
          deliveryCharges,
          discountAmount,
          finalAmount,
          totalCogs,
          payment_method,
          notes
        ]
      );
      const orderId = ordRes.insertId;

      // Insert Order Items and Deduct Inventory
      for (const item of items) {
        const lineTotal = Number(item.unit_price) * Number(item.quantity);

        await tx.query(
          `INSERT INTO order_items (
            order_id, product_id, variant_id, product_name, size, color, quantity, unit_price, unit_cost, subtotal, custom_note
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.variant_id,
            item.product_name,
            item.size,
            item.color,
            item.quantity,
            item.unit_price,
            item.unit_cost || 0,
            lineTotal,
            item.custom_note || null
          ]
        );

        // Fetch current stock to record exact previous and new stock in audit log
        const currentVariant = await tx.getOne('SELECT stock_quantity, sold_quantity FROM product_variants WHERE id = ?', [item.variant_id]);
        const prevStock = Number(currentVariant.stock_quantity);
        const newStock = prevStock - Number(item.quantity);
        const newSold = Number(currentVariant.sold_quantity) + Number(item.quantity);

        // Deduct variant stock
        await tx.query(
          `UPDATE product_variants SET stock_quantity = ?, sold_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [newStock, newSold, item.variant_id]
        );

        // Record audit transaction
        await tx.query(
          `INSERT INTO inventory_transactions (
            product_id, variant_id, brand_id, transaction_type,
            quantity_change, previous_stock, new_stock, reference_id, reason, created_by
          ) VALUES (?, ?, ?, 'SALE', ?, ?, ?, ?, 'Customer Order Placement', 'STOREFRONT')`,
          [
            item.product_id,
            item.variant_id,
            brand.id,
            -Number(item.quantity),
            prevStock,
            newStock,
            orderNumber
          ]
        );
      }

      // Create Payment Entry
      await tx.query(
        `INSERT INTO payments (order_id, payment_method, upi_ref_id, amount, status)
         VALUES (?, ?, ?, ?, 'PENDING')`,
        [orderId, payment_method, req.body.upi_ref_id || null, finalAmount]
      );

      // Update customer lifetime metrics
      await tx.query(
        `UPDATE customers SET 
          total_orders = total_orders + 1,
          total_spent = total_spent + ?,
          last_order_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [finalAmount, customerId]
      );

      return {
        orderId,
        orderNumber,
        finalAmount,
        subtotal,
        deliveryCharges,
        discountAmount,
        totalQty,
        brandName: brand.name
      };
    });

    // 6. Asynchronously generate PDF invoice so it is ready immediately
    generateInvoicePdf(orderResult.orderId).catch((e) =>
      console.warn('[Order PDF generation warning]:', e.message)
    );

    // 7. Dispatch Real-Time Admin Notification with Sound Alert
    const firstItem = items[0];
    const notifMessage = `Order ${orderResult.orderNumber} placed by ${customer.full_name} (${customer.phone}). Business: ${orderResult.brandName}. Product: ${firstItem.product_name} (${firstItem.size}, ${firstItem.color}). Qty: ${firstItem.quantity}. Amount: Rs. ${orderResult.finalAmount.toFixed(2)}. Address: ${customer.address}, ${customer.city}.`;

    sendNotification({
      type: 'NEW_ORDER',
      title: `NEW ORDER RECEIVED! #${orderResult.orderNumber}`,
      message: notifMessage,
      reference_id: orderResult.orderNumber,
      soundAlert: true
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: orderResult
    });
  } catch (err) {
    console.error('[Create Order Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Public: Customer Tracks Order by Order Number and optional Phone
 * GET /api/orders/track/:orderNumber
 */
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { phone } = req.query;

    let sql = `
      SELECT o.*, c.full_name as customer_name, c.phone as customer_phone,
             c.address, c.city, c.district, c.state, c.pin_code,
             b.name as brand_name, b.code as brand_code, b.phone as brand_phone,
             p.upi_ref_id, p.status as payment_verification_status
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN brands b ON o.brand_id = b.id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.order_number = ?
    `;
    const params = [orderNumber];

    if (phone) {
      sql += ' AND c.phone = ?';
      params.push(phone);
    }

    const order = await getOne(sql, params);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found. Please verify your Order ID and phone number.'
      });
    }

    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const invoice = await getOne('SELECT invoice_number, pdf_path FROM invoices WHERE order_id = ?', [order.id]);

    res.json({
      success: true,
      order: {
        ...order,
        items,
        invoice
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: List Orders with Full Filters
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { brand, status, payment_status, search, startDate, endDate, limit = 100 } = req.query;

    let sql = `
      SELECT o.*, c.full_name as customer_name, c.phone as customer_phone, c.city,
             b.name as brand_name, b.code as brand_code, b.phone as brand_phone,
             p.upi_ref_id, p.screenshot_url, p.status as payment_verification_status
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN brands b ON o.brand_id = b.id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE 1=1
    `;
    const params = [];

    if (brand && brand !== 'all') {
      if (isNaN(brand)) {
        sql += ' AND b.code = ?';
        params.push(brand);
      } else {
        sql += ' AND b.id = ?';
        params.push(brand);
      }
    }

    if (status && status !== 'ALL') {
      sql += ' AND o.order_status = ?';
      params.push(status);
    }

    if (payment_status && payment_status !== 'ALL') {
      sql += ' AND o.payment_status = ?';
      params.push(payment_status);
    }

    if (search) {
      sql += ' AND (o.order_number LIKE ? OR c.full_name LIKE ? OR c.phone LIKE ? OR p.upi_ref_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (startDate) {
      sql += ' AND DATE(o.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND DATE(o.created_at) <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY o.created_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const orders = await query(sql, params);

    // Attach items preview to each order
    for (const ord of orders) {
      ord.items = await query('SELECT product_name, size, color, quantity, unit_price FROM order_items WHERE order_id = ?', [ord.id]);
    }

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Get Order Details
 */
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await getOne(
      `SELECT o.*, c.full_name as customer_name, c.phone as customer_phone, c.email as customer_email,
              c.address, c.city, c.district, c.state, c.pin_code,
              b.name as brand_name, b.code as brand_code, b.phone as brand_phone,
              p.id as payment_id, p.payment_method, p.upi_ref_id, p.screenshot_url, p.status as payment_verification_status, p.rejection_reason
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       JOIN brands b ON o.brand_id = b.id
       LEFT JOIN payments p ON o.id = p.order_id
       WHERE o.id = ?`,
      [id]
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const invoice = await getOne('SELECT * FROM invoices WHERE order_id = ?', [order.id]);

    // Create handy click-to-call and WhatsApp links
    const cleanCustomerPhone = order.customer_phone.replace(/\D/g, '');
    const whatsAppMessage = encodeURIComponent(
      `Hello ${order.customer_name}, greetings from ${order.brand_name}! Regarding your order #${order.order_number} for Rs. ${Number(order.final_amount).toFixed(2)}, current status: ${order.order_status}.`
    );

    order.callUrl = `tel:${order.customer_phone}`;
    order.whatsappUrl = `https://wa.me/91${cleanCustomerPhone}?text=${whatsAppMessage}`;

    res.json({
      success: true,
      order: {
        ...order,
        items,
        invoice
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Update Order Status
 * If status changed to CANCELLED: EXACT-ONCE stock restoration!
 */
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, cancellation_reason } = req.body;

    const order = await getOne('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await transaction(async (tx) => {
      // If cancelling and stock was previously deducted, restore stock exactly once
      if (order_status === 'CANCELLED' && order.stock_deducted === 1) {
        const items = await tx.query('SELECT * FROM order_items WHERE order_id = ?', [id]);

        for (const item of items) {
          const variant = await tx.getOne('SELECT stock_quantity, sold_quantity FROM product_variants WHERE id = ?', [item.variant_id]);
          if (variant) {
            const prevStock = Number(variant.stock_quantity);
            const restoredStock = prevStock + Number(item.quantity);
            const newSold = Math.max(0, Number(variant.sold_quantity) - Number(item.quantity));

            // Restore variant stock
            await tx.query(
              'UPDATE product_variants SET stock_quantity = ?, sold_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [restoredStock, newSold, item.variant_id]
            );

            // Log EXACT-ONCE cancel restoration in inventory_transactions
            await tx.query(
              `INSERT INTO inventory_transactions (
                product_id, variant_id, brand_id, transaction_type,
                quantity_change, previous_stock, new_stock, reference_id, reason, created_by
              ) VALUES (?, ?, ?, 'CANCEL_RESTORE', ?, ?, ?, ?, ?, ?)`,
              [
                item.product_id,
                item.variant_id,
                order.brand_id,
                Number(item.quantity),
                prevStock,
                restoredStock,
                order.order_number,
                `Order Cancelled: ${cancellation_reason || 'Customer cancellation'}`,
                req.admin.username
              ]
            );
          }
        }

        // Mark stock as no longer deducted
        await tx.query(
          `UPDATE orders SET order_status = ?, cancellation_reason = ?, stock_deducted = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [order_status, cancellation_reason || 'Cancelled by admin', id]
        );
      } else {
        await tx.query(
          `UPDATE orders SET order_status = ?, cancellation_reason = COALESCE(?, cancellation_reason), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [order_status, cancellation_reason || null, id]
        );
      }
    });

    res.json({
      success: true,
      message: `Order status updated to ${order_status}.`
    });
  } catch (err) {
    console.error('[Update Order Status Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Apply or Update Discount on an Order
 * PUT /api/orders/:id/discount
 */
router.put('/:id/discount', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const discountAmount = Math.max(0, parseFloat(req.body.discount_amount || 0));

    const order = await getOne('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const subtotal = Number(order.subtotal || 0);
    const deliveryCharges = Number(order.delivery_charges || 0);
    const newFinalAmount = Math.max(0, subtotal + deliveryCharges - discountAmount);

    // Update order amounts
    await query(
      `UPDATE orders SET discount_amount = ?, final_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [discountAmount, newFinalAmount, id]
    );

    // Update invoices table if an invoice exists
    await query(
      `UPDATE invoices SET discount_amount = ?, total_amount = ? WHERE order_id = ?`,
      [discountAmount, newFinalAmount, id]
    );

    // Regenerate invoice PDF with the updated discount
    try {
      await generateInvoicePdf(id);
    } catch (e) {
      console.warn('[Regenerate invoice error on discount update]:', e.message);
    }

    res.json({
      success: true,
      message: `Discount of Rs. ${discountAmount.toFixed(2)} applied successfully!`,
      order: {
        id: Number(id),
        subtotal,
        delivery_charges: deliveryCharges,
        discount_amount: discountAmount,
        final_amount: newFinalAmount
      }
    });
  } catch (err) {
    console.error('[Update Discount Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Public & Admin: Download or view invoice PDF
 * GET /api/orders/:id/invoice
 */
router.get('/:id/invoice', async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceInfo = await generateInvoicePdf(id);

    res.download(invoiceInfo.filePath, `${invoiceInfo.invoiceNumber}.pdf`);
  } catch (err) {
    console.error('[Download Invoice Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Public & Admin: Download or view standalone Thank You Card PDF
 * GET /api/orders/:id/thank-you-card
 */
router.get('/:id/thank-you-card', async (req, res) => {
  try {
    const { id } = req.params;
    const cardInfo = await generateThankYouCardPdf(id);

    res.download(cardInfo.filePath, `${cardInfo.cardFilename}`);
  } catch (err) {
    console.error('[Download Thank You Card Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Create Manual Offline / Direct Customer Bill
 * Adds directly into database, updates stock (if variant chosen),
 * automatically integrates into Brand & Combined Profit & Loss,
 * and generates downloadable PDF Invoice & Thank You Card.
 * POST /api/orders/manual-bill
 */
router.post('/manual-bill', authenticateAdmin, async (req, res) => {
  try {
    const {
      customer,
      items,
      brand_code = 'nanova_tees',
      payment_status = 'PAID',
      payment_method = 'Cash',
      delivery_charges = 0,
      discount_amount = 0,
      notes = ''
    } = req.body;

    // 1. Validation
    if (!customer?.full_name || !customer?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer Full Name and Phone Number are required.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one product item to generate the bill.'
      });
    }

    // 2. Fetch Brand
    const brand = await getOne('SELECT id, code, name, phone FROM brands WHERE code = ?', [brand_code]);
    if (!brand) {
      return res.status(400).json({ success: false, message: 'Invalid brand specified.' });
    }

    // 3. Ensure a fallback manual product & variant exists in DB for custom items
    let fallbackProduct = await getOne(
      'SELECT id FROM products WHERE slug = ? AND brand_id = ?',
      [`manual-custom-${brand.code}`, brand.id]
    );

    if (!fallbackProduct) {
      const fallbackProdRes = await query(
        `INSERT INTO products (brand_id, category_id, sku, name, slug, description, selling_price, purchase_cost, is_active)
         VALUES (?, 1, ?, ?, ?, 'Bespoke custom items created via Manual Bill Generator', 0.00, 0.00, 1)`,
        [brand.id, `MANUAL-${brand.code.toUpperCase()}`, `${brand.name} Custom Order Item`, `manual-custom-${brand.code}`]
      );
      const fallbackProdId = fallbackProdRes.insertId;

      const fallbackVarRes = await query(
        `INSERT INTO product_variants (product_id, sku, size, color, color_hex, stock_quantity, low_stock_threshold)
         VALUES (?, ?, 'Standard', 'Custom', '#111111', 99999, 0)`,
        [fallbackProdId, `VAR-MANUAL-${brand.code.toUpperCase()}`]
      );

      fallbackProduct = {
        id: fallbackProdId,
        default_variant_id: fallbackVarRes.insertId
      };
    } else {
      const defaultVar = await getOne('SELECT id FROM product_variants WHERE product_id = ? LIMIT 1', [fallbackProduct.id]);
      fallbackProduct.default_variant_id = defaultVar ? defaultVar.id : 1;
    }

    // 4. Execute Transaction
    const orderResult = await transaction(async (tx) => {
      // Find or Create Customer
      const cleanPhone = customer.phone.trim();
      let existingCustomer = await tx.getOne('SELECT id, total_orders, total_spent FROM customers WHERE phone = ?', [cleanPhone]);
      let customerId;

      const custAddress = customer.address?.trim() || 'Direct Store Sale / Counter';
      const custCity = customer.city?.trim() || 'Coimbatore';
      const custDistrict = customer.district?.trim() || custCity;
      const custState = customer.state?.trim() || 'Tamil Nadu';
      const custPin = customer.pin_code?.trim() || '641001';

      if (existingCustomer) {
        customerId = existingCustomer.id;
        await tx.query(
          `UPDATE customers SET 
            full_name = ?, email = COALESCE(?, email), address = ?, city = ?, district = ?, state = ?, pin_code = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [customer.full_name, customer.email || null, custAddress, custCity, custDistrict, custState, custPin, customerId]
        );
      } else {
        const custRes = await tx.query(
          `INSERT INTO customers (full_name, phone, email, address, city, district, state, pin_code, total_orders, total_spent, last_order_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)`,
          [customer.full_name, cleanPhone, customer.email || null, custAddress, custCity, custDistrict, custState, custPin]
        );
        customerId = custRes.insertId;
      }

      // Generate Unique Order Number
      const year = new Date().getFullYear();
      const countRow = await tx.getOne('SELECT COUNT(*) as cnt FROM orders');
      const seq = String(Number(countRow.cnt) + 1).padStart(4, '0');
      const orderNumber = `MAN-${year}-${seq}`;

      // Calculate totals and COGS
      let subtotal = 0;
      let totalCogs = 0;
      let totalQty = 0;

      for (const item of items) {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const unitPrice = Math.max(0, parseFloat(item.unit_price) || 0);
        const unitCost = Math.max(0, parseFloat(item.unit_cost) || 0);

        subtotal += unitPrice * qty;
        totalCogs += unitCost * qty;
        totalQty += qty;
      }

      const deliveryFee = Math.max(0, parseFloat(delivery_charges) || 0);
      const discount = Math.max(0, parseFloat(discount_amount) || 0);
      const finalAmount = Math.max(0, subtotal + deliveryFee - discount);

      const isPaid = payment_status.toUpperCase() === 'PAID';
      const orderStatus = isPaid ? 'COMPLETED' : 'CONFIRMED';
      const finalPaymentStatus = isPaid ? 'PAID' : 'PENDING';

      // Insert Order
      const ordRes = await tx.query(
        `INSERT INTO orders (
          order_number, customer_id, brand_id, total_quantity,
          subtotal, delivery_charges, discount_amount, final_amount, cogs_amount,
          payment_method, payment_status, order_status, stock_deducted, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          orderNumber,
          customerId,
          brand.id,
          totalQty,
          subtotal,
          deliveryFee,
          discount,
          finalAmount,
          totalCogs,
          payment_method,
          finalPaymentStatus,
          orderStatus,
          notes ? `[MANUAL BILL] ${notes}` : '[MANUAL BILL] Direct customer invoice created by admin'
        ]
      );
      const orderId = ordRes.insertId;

      // Insert Order Items and Update Inventory if real variant linked
      for (const item of items) {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const unitPrice = Math.max(0, parseFloat(item.unit_price) || 0);
        const unitCost = Math.max(0, parseFloat(item.unit_cost) || 0);
        const lineTotal = unitPrice * qty;

        const prodId = item.product_id ? Number(item.product_id) : fallbackProduct.id;
        const varId = item.variant_id ? Number(item.variant_id) : fallbackProduct.default_variant_id;
        const prodName = item.product_name?.trim() || 'Custom Item';
        const size = item.size?.trim() || 'Standard';
        const color = item.color?.trim() || 'Default';

        await tx.query(
          `INSERT INTO order_items (
            order_id, product_id, variant_id, product_name, size, color, quantity, unit_price, unit_cost, subtotal, custom_note
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            prodId,
            varId,
            prodName,
            size,
            color,
            qty,
            unitPrice,
            unitCost,
            lineTotal,
            item.notes || null
          ]
        );

        // If user linked an actual existing catalog variant, deduct warehouse stock
        if (item.variant_id && item.variant_id !== fallbackProduct.default_variant_id) {
          await tx.query(
            `UPDATE product_variants 
             SET stock_quantity = MAX(0, stock_quantity - ?),
                 sold_quantity = sold_quantity + ?
             WHERE id = ?`,
            [qty, qty, item.variant_id]
          );

          await tx.query(
            `INSERT INTO inventory_transactions (
              variant_id, transaction_type, quantity_change, previous_stock, new_stock, reference_id, reference_type, notes
            ) SELECT id, 'SALE', -?, stock_quantity + ?, stock_quantity, ?, 'MANUAL_BILL', 'Deducted via Manual Bill'
            FROM product_variants WHERE id = ?`,
            [qty, qty, orderNumber, item.variant_id]
          );
        }
      }

      // Record Payment record
      if (isPaid) {
        await tx.query(
          `INSERT INTO payments (
            order_id, payment_method, amount, status, verified_by, verified_at
          ) VALUES (?, ?, ?, 'VERIFIED', ?, CURRENT_TIMESTAMP)`,
          [orderId, payment_method, finalAmount, req.admin?.username || 'admin']
        );
      } else {
        await tx.query(
          `INSERT INTO payments (
            order_id, payment_method, amount, status
          ) VALUES (?, ?, ?, 'PENDING')`,
          [orderId, payment_method, finalAmount]
        );
      }

      // Create Invoice Record
      const invoiceNumber = `INV-${orderNumber.replace('NAN-', '')}`;
      const todayDate = new Date().toISOString().split('T')[0];
      await tx.query(
        `INSERT INTO invoices (
          invoice_number, order_id, brand_id, customer_name, customer_phone, customer_address,
          subtotal, delivery_charges, discount_amount, gst_rate, gst_amount, total_amount, invoice_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, 0.00, ?, ?)`,
        [
          invoiceNumber,
          orderId,
          brand.id,
          customer.full_name,
          cleanPhone,
          `${custAddress}, ${custCity}, ${custState} - ${custPin}`,
          subtotal,
          deliveryFee,
          discount,
          finalAmount,
          todayDate
        ]
      );

      // Update customer total spend & orders count
      await tx.query(
        `UPDATE customers 
         SET total_orders = total_orders + 1,
             total_spent = total_spent + ?,
             last_order_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [isPaid ? finalAmount : 0, customerId]
      );

      return {
        orderId,
        orderNumber,
        invoiceNumber,
        finalAmount,
        subtotal,
        totalCogs,
        grossProfit: finalAmount - totalCogs,
        paymentStatus: finalPaymentStatus
      };
    });

    // 5. Generate Luxury PDF Invoice & Thank You Card immediately
    try {
      await generateInvoicePdf(orderResult.orderId);
    } catch (pdfErr) {
      console.warn('[Manual Bill PDF Generation Warning]:', pdfErr.message);
    }

    // 6. Push real-time notification
    try {
      sendNotification(
        'Manual Bill Created',
        `New manual bill #${orderResult.orderNumber} for Rs. ${orderResult.finalAmount.toFixed(2)} (${brand.name}) created. Status: ${orderResult.paymentStatus}.`,
        'ORDER',
        orderResult.orderId
      );
    } catch (notifErr) {
      console.warn('[Notification Warning]:', notifErr.message);
    }

    res.json({
      success: true,
      message: `Manual bill #${orderResult.orderNumber} created successfully! Added to ${brand.name} & Combined Profit & Loss.`,
      order: orderResult,
      invoiceUrl: `/api/orders/${orderResult.orderId}/invoice`,
      cardUrl: `/api/orders/${orderResult.orderId}/thank-you-card`
    });
  } catch (err) {
    console.error('[Manual Bill Error]:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create manual bill.' });
  }
});

export default router;
