import ExcelJS from 'exceljs';
import { query, getOne } from '../db/index.js';

/**
 * Generate Excel workbook for various report types
 */
export async function generateExcelReport(type, params = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NANOVA E-Commerce Platform';
  workbook.created = new Date();

  const brandFilter = params.brand_id ? 'AND o.brand_id = ?' : '';
  const brandParams = params.brand_id ? [params.brand_id] : [];

  if (type === 'sales' || type === 'daily-sales' || type === 'monthly-sales') {
    const sheet = workbook.addWorksheet('Sales Report');
    sheet.columns = [
      { header: 'Order ID', key: 'order_number', width: 16 },
      { header: 'Date', key: 'created_at', width: 18 },
      { header: 'Brand', key: 'brand_name', width: 18 },
      { header: 'Customer', key: 'customer_name', width: 20 },
      { header: 'Phone', key: 'customer_phone', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Items Qty', key: 'total_quantity', width: 12 },
      { header: 'Subtotal (INR)', key: 'subtotal', width: 15 },
      { header: 'Delivery (INR)', key: 'delivery_charges', width: 15 },
      { header: 'Discount (INR)', key: 'discount_amount', width: 15 },
      { header: 'Final Amount (INR)', key: 'final_amount', width: 18 },
      { header: 'Payment Method', key: 'payment_method', width: 15 },
      { header: 'Payment Status', key: 'payment_status', width: 18 },
      { header: 'Order Status', key: 'order_status', width: 15 }
    ];

    const orders = await query(
      `SELECT o.*, 
              COALESCE(c.full_name, 'Guest Customer') as customer_name, 
              COALESCE(c.phone, 'N/A') as customer_phone, 
              COALESCE(c.city, 'N/A') as city, 
              COALESCE(b.name, 'NANOVA') as brand_name
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       LEFT JOIN brands b ON o.brand_id = b.id
       WHERE 1=1 ${brandFilter}
       ORDER BY o.created_at DESC`,
      brandParams
    );

    orders.forEach((o) => {
      sheet.addRow({
        order_number: o.order_number,
        created_at: new Date(o.created_at).toLocaleString('en-IN'),
        brand_name: o.brand_name,
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        city: o.city,
        total_quantity: o.total_quantity,
        subtotal: Number(o.subtotal).toFixed(2),
        delivery_charges: Number(o.delivery_charges).toFixed(2),
        discount_amount: Number(o.discount_amount).toFixed(2),
        final_amount: Number(o.final_amount).toFixed(2),
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        order_status: o.order_status
      });
    });

    formatHeaderRow(sheet);
  } else if (type === 'inventory') {
    const sheet = workbook.addWorksheet('Inventory Report');
    sheet.columns = [
      { header: 'Brand', key: 'brand_name', width: 18 },
      { header: 'Product Name', key: 'product_name', width: 28 },
      { header: 'Category', key: 'category_name', width: 18 },
      { header: 'Size', key: 'size', width: 14 },
      { header: 'Colour', key: 'color', width: 18 },
      { header: 'Variant SKU', key: 'variant_sku', width: 22 },
      { header: 'Purchased Qty', key: 'purchased_quantity', width: 15 },
      { header: 'Sold Qty', key: 'sold_quantity', width: 12 },
      { header: 'Remaining Stock', key: 'stock_quantity', width: 16 },
      { header: 'Unit Cost (INR)', key: 'purchase_cost', width: 15 },
      { header: 'Selling Price (INR)', key: 'selling_price', width: 18 },
      { header: 'Stock Value (INR)', key: 'stock_value', width: 18 },
      { header: 'Status', key: 'status', width: 14 }
    ];

    const inventory = await query(
      `SELECT pv.*, p.name as product_name, p.purchase_cost, p.selling_price, 
              COALESCE(c.name, 'All') as category_name, 
              COALESCE(b.name, 'NANOVA') as brand_name
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       ORDER BY b.id, p.name, pv.size, pv.color`
    );

    inventory.forEach((row) => {
      const stockVal = Number(row.stock_quantity) * Number(row.purchase_cost);
      let status = 'In Stock';
      if (row.stock_quantity === 0) status = 'Out of Stock';
      else if (row.stock_quantity <= row.low_stock_threshold) status = 'Low Stock';

      sheet.addRow({
        brand_name: row.brand_name,
        product_name: row.product_name,
        category_name: row.category_name,
        size: row.size,
        color: row.color,
        variant_sku: row.sku,
        purchased_quantity: row.purchased_quantity,
        sold_quantity: row.sold_quantity,
        stock_quantity: row.stock_quantity,
        purchase_cost: Number(row.purchase_cost).toFixed(2),
        selling_price: Number(row.selling_price).toFixed(2),
        stock_value: stockVal.toFixed(2),
        status
      });
    });

    formatHeaderRow(sheet);
  } else if (type === 'purchases') {
    const sheet = workbook.addWorksheet('Purchases Report');
    sheet.columns = [
      { header: 'Purchase #', key: 'purchase_number', width: 16 },
      { header: 'Date', key: 'purchase_date', width: 14 },
      { header: 'Brand', key: 'brand_name', width: 18 },
      { header: 'Supplier', key: 'supplier_name', width: 22 },
      { header: 'Phone', key: 'supplier_phone', width: 15 },
      { header: 'Total (INR)', key: 'total_amount', width: 16 },
      { header: 'Extra Expenses', key: 'additional_expenses', width: 15 },
      { header: 'Notes', key: 'notes', width: 30 }
    ];

    const purchases = await query(
      `SELECT pu.*, s.name as supplier_name, s.phone as supplier_phone, b.name as brand_name
       FROM purchases pu
       JOIN suppliers s ON pu.supplier_id = s.id
       JOIN brands b ON pu.brand_id = b.id
       ORDER BY pu.purchase_date DESC`
    );

    purchases.forEach((p) => {
      sheet.addRow({
        purchase_number: p.purchase_number,
        purchase_date: p.purchase_date,
        brand_name: p.brand_name,
        supplier_name: p.supplier_name,
        supplier_phone: p.supplier_phone,
        total_amount: Number(p.total_amount).toFixed(2),
        additional_expenses: Number(p.additional_expenses).toFixed(2),
        notes: p.notes || ''
      });
    });

    formatHeaderRow(sheet);
  } else if (type === 'profit-loss') {
    const sheet = workbook.addWorksheet('Profit & Loss Summary');
    sheet.columns = [
      { header: 'Metric', key: 'metric', width: 35 },
      { header: 'Nanova Tees (INR)', key: 'tees', width: 22 },
      { header: 'Surprise Nanova (INR)', key: 'gifts', width: 22 },
      { header: 'Total Combined (INR)', key: 'total', width: 25 }
    ];

    // Compute exact financial metrics
    // 1. Sales Revenue (Confirmed/Delivered orders)
    const salesTees = await getOne(
      `SELECT COALESCE(SUM(final_amount), 0) as val FROM orders WHERE brand_id = 1 AND order_status != 'CANCELLED'`
    );
    const salesGifts = await getOne(
      `SELECT COALESCE(SUM(final_amount), 0) as val FROM orders WHERE brand_id = 2 AND order_status != 'CANCELLED'`
    );

    // 2. Cost of Goods Sold (ONLY FOR ACTUALLY SOLD PRODUCTS!)
    const cogsTees = await getOne(
      `SELECT COALESCE(SUM(oi.quantity * oi.unit_cost), 0) as val 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.brand_id = 1 AND o.order_status != 'CANCELLED'`
    );
    const cogsGifts = await getOne(
      `SELECT COALESCE(SUM(oi.quantity * oi.unit_cost), 0) as val 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.brand_id = 2 AND o.order_status != 'CANCELLED'`
    );

    // 3. Operating Expenses
    const expTees = await getOne(
      `SELECT COALESCE(SUM(amount), 0) as val FROM expenses WHERE brand_id = 1`
    );
    const expGifts = await getOne(
      `SELECT COALESCE(SUM(amount), 0) as val FROM expenses WHERE brand_id = 2`
    );
    const expCommon = await getOne(
      `SELECT COALESCE(SUM(amount), 0) as val FROM expenses WHERE brand_id IS NULL`
    );

    // 4. Remaining Unsold Stock Value (Asset, NOT deducted from profit)
    const stockTees = await getOne(
      `SELECT COALESCE(SUM(pv.stock_quantity * p.purchase_cost), 0) as val
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE p.brand_id = 1`
    );
    const stockGifts = await getOne(
      `SELECT COALESCE(SUM(pv.stock_quantity * p.purchase_cost), 0) as val
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE p.brand_id = 2`
    );

    const sT = Number(salesTees.val);
    const sG = Number(salesGifts.val);
    const sTotal = sT + sG;

    const cT = Number(cogsTees.val);
    const cG = Number(cogsGifts.val);
    const cTotal = cT + cG;

    const gpT = sT - cT;
    const gpG = sG - cG;
    const gpTotal = sTotal - cTotal;

    const eT = Number(expTees.val);
    const eG = Number(expGifts.val);
    const eComm = Number(expCommon.val);
    const eTotal = eT + eG + eComm;

    const npT = gpT - eT;
    const npG = gpG - eG;
    const npTotal = gpTotal - eTotal;

    const uT = Number(stockTees.val);
    const uG = Number(stockGifts.val);
    const uTotal = uT + uG;

    sheet.addRow({ metric: '1. Total Sales Revenue', tees: sT.toFixed(2), gifts: sG.toFixed(2), total: sTotal.toFixed(2) });
    sheet.addRow({ metric: '2. Cost of Goods Sold (Sold Items Only)', tees: cT.toFixed(2), gifts: cG.toFixed(2), total: cTotal.toFixed(2) });
    sheet.addRow({ metric: '3. Gross Profit (Revenue - COGS)', tees: gpT.toFixed(2), gifts: gpG.toFixed(2), total: gpTotal.toFixed(2) });
    sheet.addRow({ metric: '4. Operating Expenses', tees: eT.toFixed(2), gifts: eG.toFixed(2), total: eTotal.toFixed(2) });
    sheet.addRow({ metric: '5. Net Profit (Gross Profit - Expenses)', tees: npT.toFixed(2), gifts: npG.toFixed(2), total: npTotal.toFixed(2) });
    sheet.addRow({ metric: '---', tees: '---', gifts: '---', total: '---' });
    sheet.addRow({ metric: '6. Unsold Inventory Asset Value (Current Stock)', tees: uT.toFixed(2), gifts: uG.toFixed(2), total: uTotal.toFixed(2) });

    formatHeaderRow(sheet);
  } else {
    // Default fallback sheet
    const sheet = workbook.addWorksheet('Report');
    sheet.columns = [
      { header: 'Info', key: 'info', width: 30 },
      { header: 'Value', key: 'value', width: 30 }
    ];
    sheet.addRow({ info: 'Generated At', value: new Date().toISOString() });
    formatHeaderRow(sheet);
  }

  return workbook;
}

function formatHeaderRow(sheet) {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' }
  };
  headerRow.height = 24;
  headerRow.alignment = { vertical: 'middle' };
}
