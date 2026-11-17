import { initDatabase, query } from './index.js';

async function clearAllProducts() {
  await initDatabase();
  console.log('[Clean] Removing all products, variants, and order history...');

  await query('DELETE FROM order_items');
  await query('DELETE FROM invoices');
  await query('DELETE FROM payments');
  await query('DELETE FROM orders');
  await query('DELETE FROM inventory_transactions');
  await query('DELETE FROM product_images');
  await query('DELETE FROM product_variants');
  await query('DELETE FROM products');

  // Verify counts
  const prods = await query('SELECT count(*) as c FROM products');
  const vars = await query('SELECT count(*) as c FROM product_variants');
  const ords = await query('SELECT count(*) as c FROM orders');

  console.log(`[Clean] Done! Products: ${prods[0].c}, Variants: ${vars[0].c}, Orders: ${ords[0].c}`);
  process.exit(0);
}

clearAllProducts().catch(err => {
  console.error('Error clearing products:', err);
  process.exit(1);
});
