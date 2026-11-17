import nodemailer from 'nodemailer';
import { query, getOne } from '../db/index.js';

let ioInstance = null;

export function setSocketIO(io) {
  ioInstance = io;
  console.log('[NotificationService] Socket.IO instance registered.');
}

export function getSocketIO() {
  return ioInstance;
}

/**
 * Dispatch notification in real-time, save to database, and trigger email if configured
 */
export async function sendNotification({ type, title, message, reference_id = null, soundAlert = true }) {
  try {
    // 1. Insert into database
    const result = await query(
      `INSERT INTO notifications (type, title, message, reference_id, is_read)
       VALUES (?, ?, ?, ?, 0)`,
      [type, title, message, reference_id]
    );

    const notificationPayload = {
      id: result.insertId,
      type,
      title,
      message,
      reference_id,
      is_read: 0,
      soundAlert,
      created_at: new Date().toISOString()
    };

    // 2. Broadcast via Socket.IO
    if (ioInstance) {
      ioInstance.emit('notification:new', notificationPayload);
      if (type === 'NEW_ORDER') {
        ioInstance.emit('order:new', notificationPayload);
      } else if (type === 'PAYMENT_PENDING') {
        ioInstance.emit('payment:pending', notificationPayload);
      } else if (type === 'LOW_STOCK' || type === 'OUT_OF_STOCK') {
        ioInstance.emit('stock:alert', notificationPayload);
      }
    }

    // 3. Attempt email dispatch if configured
    dispatchEmailAlert({ title, message }).catch((e) =>
      console.warn('[NotificationService] Email alert skipped or failed:', e.message)
    );

    return notificationPayload;
  } catch (err) {
    console.error('[NotificationService] Error sending notification:', err);
  }
}

async function dispatchEmailAlert({ title, message }) {
  const hostSetting = await getOne("SELECT setting_value FROM business_settings WHERE setting_key = 'email_smtp_host'");
  const userSetting = await getOne("SELECT setting_value FROM business_settings WHERE setting_key = 'email_smtp_user'");
  const passSetting = await getOne("SELECT setting_value FROM business_settings WHERE setting_key = 'email_smtp_pass'");
  const portSetting = await getOne("SELECT setting_value FROM business_settings WHERE setting_key = 'email_smtp_port'");
  const enabledSetting = await getOne("SELECT setting_value FROM business_settings WHERE setting_key = 'email_smtp_enabled'");

  if (!enabledSetting || enabledSetting.setting_value !== '1') return;
  if (!hostSetting?.setting_value || !userSetting?.setting_value || !passSetting?.setting_value) return;

  const transporter = nodemailer.createTransport({
    host: hostSetting.setting_value,
    port: parseInt(portSetting?.setting_value || '587', 10),
    secure: parseInt(portSetting?.setting_value || '587', 10) === 465,
    auth: {
      user: userSetting.setting_value,
      pass: passSetting.setting_value
    }
  });

  await transporter.sendMail({
    from: `"Nanova Notification System" <${userSetting.setting_value}>`,
    to: userSetting.setting_value, // Notify the owner
    subject: `[NANOVA ALERT] ${title}`,
    text: message,
    html: `<div style="font-family: sans-serif; padding: 20px; border-left: 4px solid #111;">
      <h2 style="margin-top:0;">${title}</h2>
      <p style="font-size: 16px; color: #333;">${message}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"/>
      <small style="color: #888;">NANOVA Dual-Brand Automated Notification System</small>
    </div>`
  });
}
