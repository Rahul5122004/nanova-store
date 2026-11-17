import express from 'express';
import { query, getOne, transaction } from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { uploadQrCode, uploadPaymentProof } from '../middleware/upload.js';
import { sendNotification } from '../services/notificationService.js';

const router = express.Router();

/**
 * Public & Admin: Get Payment Settings & QR
 * GET /api/payments/settings
 */
router.get('/settings', async (req, res) => {
  try {
    let settings = await getOne('SELECT * FROM payment_settings LIMIT 1');
    if (!settings) {
      await query(
        `INSERT INTO payment_settings (id, qr_image_url, upi_id, account_name, instructions, qr_enabled, cod_enabled)
         VALUES (1, '/uploads/qr/default_qr.png', '', 'NANOVA ENTERPRISES', 'Scan QR using any UPI app (GPay, PhonePe, Paytm). Complete payment and enter the 12-digit UTR/Reference ID below with screenshot.', 1, 1)`
      );
      settings = await getOne('SELECT * FROM payment_settings LIMIT 1');
    }

    res.json({
      success: true,
      settings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Update Payment Settings & Upload QR Image
 * PUT /api/payments/settings
 */
router.put(
  '/settings',
  authenticateAdmin,
  uploadQrCode.single('qr_image'),
  async (req, res) => {
    try {
      const {
        upi_id,
        account_name,
        instructions,
        qr_enabled,
        cod_enabled,
        delivery_charge_flat,
        free_delivery_threshold,
        gst_enabled,
        gst_rate_percent
      } = req.body;

      const existing = await getOne('SELECT * FROM payment_settings LIMIT 1');
      const qrImageUrl = req.file
        ? `/uploads/qr/${req.file.filename}`
        : req.body.qr_image_url || existing?.qr_image_url;

      await query(
        `UPDATE payment_settings SET
          qr_image_url = ?,
          upi_id = COALESCE(?, upi_id),
          account_name = COALESCE(?, account_name),
          instructions = COALESCE(?, instructions),
          qr_enabled = COALESCE(?, qr_enabled),
          cod_enabled = COALESCE(?, cod_enabled),
          delivery_charge_flat = COALESCE(?, delivery_charge_flat),
          free_delivery_threshold = COALESCE(?, free_delivery_threshold),
          gst_enabled = COALESCE(?, gst_enabled),
          gst_rate_percent = COALESCE(?, gst_rate_percent),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1`,
        [
          qrImageUrl,
          upi_id,
          account_name,
          instructions,
          qr_enabled !== undefined ? Number(qr_enabled) : undefined,
          cod_enabled !== undefined ? Number(cod_enabled) : undefined,
          delivery_charge_flat,
          free_delivery_threshold,
          gst_enabled !== undefined ? Number(gst_enabled) : undefined,
          gst_rate_percent
        ]
      );

      res.json({
        success: true,
        message: 'Payment configuration updated successfully.',
        qr_image_url: qrImageUrl
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * Public: Customer Submits Payment Proof (UPI Ref ID and/or Screenshot)
 * POST /api/payments/:orderId/submit-proof
 */
router.post(
  '/:orderId/submit-proof',
  uploadPaymentProof.single('screenshot'),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { upi_ref_id } = req.body;

      const order = await getOne('SELECT * FROM orders WHERE id = ? OR order_number = ?', [orderId, orderId]);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const screenshotUrl = req.file ? `/uploads/payments/${req.file.filename}` : null;

      const existingPayment = await getOne('SELECT * FROM payments WHERE order_id = ?', [order.id]);

      if (existingPayment) {
        await query(
          `UPDATE payments SET
            upi_ref_id = COALESCE(?, upi_ref_id),
            screenshot_url = COALESCE(?, screenshot_url),
            status = 'PENDING',
            rejection_reason = NULL
           WHERE id = ?`,
          [upi_ref_id, screenshotUrl, existingPayment.id]
        );
      } else {
        await query(
          `INSERT INTO payments (order_id, payment_method, upi_ref_id, screenshot_url, amount, status)
           VALUES (?, 'UPI_QR', ?, ?, ?, 'PENDING')`,
          [order.id, upi_ref_id, screenshotUrl, order.final_amount]
        );
      }

      await query(
        "UPDATE orders SET payment_status = 'PENDING_VERIFICATION', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [order.id]
      );

      // Alert Admin of Payment Pending Verification
      sendNotification({
        type: 'PAYMENT_PENDING',
        title: `PAYMENT AWAITING VERIFICATION: #${order.order_number}`,
        message: `Customer submitted UPI Reference ID: ${upi_ref_id || 'Uploaded Screenshot'} for Rs. ${Number(order.final_amount).toFixed(2)}.`,
        reference_id: order.order_number
      });

      res.json({
        success: true,
        message: 'Payment details submitted successfully! The admin will verify and confirm shortly.',
        screenshot_url: screenshotUrl
      });
    } catch (err) {
      console.error('[Submit Proof Error]:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * Admin: List Pending Payments for Manual Verification
 * GET /api/payments/pending
 */
router.get('/pending', authenticateAdmin, async (req, res) => {
  try {
    const list = await query(
      `SELECT p.*, o.order_number, o.final_amount, o.created_at as order_date,
              c.full_name as customer_name, c.phone as customer_phone, b.name as brand_name
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN customers c ON o.customer_id = c.id
       JOIN brands b ON o.brand_id = b.id
       WHERE p.status = 'PENDING'
       ORDER BY p.created_at ASC`
    );

    res.json({
      success: true,
      count: list.length,
      payments: list
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Verify or Reject Payment
 * PUT /api/payments/:id/verify
 */
router.put('/:id/verify', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejection_reason } = req.body; // action: 'APPROVE' | 'REJECT'

    const payment = await getOne(
      `SELECT p.*, o.id as order_id, o.order_number, o.brand_id, c.phone as customer_phone
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN customers c ON o.customer_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    if (action === 'APPROVE') {
      await transaction(async (tx) => {
        await tx.query(
          `UPDATE payments SET status = 'VERIFIED', verified_by = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [req.admin.username, id]
        );
        await tx.query(
          `UPDATE orders SET payment_status = 'VERIFIED', order_status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [payment.order_id]
        );
      });

      sendNotification({
        type: 'PAYMENT_VERIFIED',
        title: `PAYMENT APPROVED: #${payment.order_number}`,
        message: `Payment of Rs. ${Number(payment.amount).toFixed(2)} verified by ${req.admin.username}. Order status updated to CONFIRMED.`,
        reference_id: payment.order_number
      });

      res.json({ success: true, message: 'Payment approved and order confirmed.' });
    } else if (action === 'REJECT') {
      await transaction(async (tx) => {
        await tx.query(
          `UPDATE payments SET status = 'REJECTED', rejection_reason = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [rejection_reason || 'Invalid transaction reference or amount mismatch.', req.admin.username, id]
        );
        await tx.query(
          `UPDATE orders SET payment_status = 'FAILED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [payment.order_id]
        );
      });

      res.json({ success: true, message: 'Payment rejected. Customer will see payment failed status.' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid action. Must be APPROVE or REJECT.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
