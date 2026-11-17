import { initDatabase, query } from './index.js';

async function resetToFresh() {
  console.log('[Reset] Connecting to database...');
  await initDatabase();

  console.log('[Reset] Clearing sample orders, invoices, payments, expenses, notifications...');
  await query('DELETE FROM invoices');
  await query('DELETE FROM order_items');
  await query('DELETE FROM payments');
  await query('DELETE FROM orders');
  await query('DELETE FROM expenses');
  await query('DELETE FROM notifications');
  await query('DELETE FROM customers');
  await query('DELETE FROM purchases');
  await query('DELETE FROM purchase_items');

  // Reset variant sold quantities to 0 and stock back to full purchased quantity
  console.log('[Reset] Resetting inventory sold counters to 0 and full available stock...');
  await query('UPDATE product_variants SET sold_quantity = 0, stock_quantity = purchased_quantity');

  // Remove any SALE transactions from inventory_transactions
  await query("DELETE FROM inventory_transactions WHERE transaction_type = 'SALE'");

  console.log('[Reset] Database successfully cleared to 100% FRESH state!');
  console.log('Orders: 0 | Revenue: 0 | Expenses: 0 | Pending Payments: 0');
}

resetToFresh()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Reset Error]:', err);
    process.exit(1);
  });
