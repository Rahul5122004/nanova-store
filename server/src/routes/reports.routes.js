import express from 'express';
import { query, getOne, getActiveClient } from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { generateExcelReport } from '../services/reportService.js';

const router = express.Router();

/**
 * Admin: Complete Dashboard Overview & KPI Metrics
 * GET /api/reports/dashboard
 */
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const { brand, timeframe = 'all', startDate, endDate } = req.query;

    let brandCondition = '';
    let brandExpCondition = '';
    let brandProdCondition = '';
    const params = [];
    const expParams = [];
    const prodParams = [];

    if (brand && brand !== 'all') {
      if (isNaN(brand)) {
        brandCondition = ' AND b.code = ?';
        brandExpCondition = ' AND b.code = ?';
        brandProdCondition = ' AND b.code = ?';
        params.push(brand);
        expParams.push(brand);
        prodParams.push(brand);
      } else {
        brandCondition = ' AND o.brand_id = ?';
        brandExpCondition = ' AND e.brand_id = ?';
        brandProdCondition = ' AND p.brand_id = ?';
        params.push(brand);
        expParams.push(brand);
        prodParams.push(brand);
      }
    }

    let dateCondition = '';
    const isSqlite = getActiveClient() === 'sqlite';
    if (startDate && endDate) {
      dateCondition = ' AND DATE(o.created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (timeframe === 'today') {
      dateCondition = isSqlite ? " AND DATE(o.created_at) = DATE('now')" : " AND DATE(o.created_at) = CURRENT_DATE";
    } else if (timeframe === 'week') {
      dateCondition = isSqlite ? " AND DATE(o.created_at) >= DATE('now', '-7 days')" : " AND DATE(o.created_at) >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)";
    } else if (timeframe === 'month') {
      dateCondition = isSqlite ? " AND DATE(o.created_at) >= DATE('now', '-30 days')" : " AND DATE(o.created_at) >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)";
    }

    // 1. Total Sales Revenue (Excluding Cancelled)
    const revRow = await getOne(
      `SELECT COALESCE(SUM(o.final_amount), 0) as total_revenue,
              COUNT(o.id) as total_orders
       FROM orders o
       JOIN brands b ON o.brand_id = b.id
       WHERE o.order_status != 'CANCELLED' ${brandCondition} ${dateCondition}`,
      params
    );

    // 2. Cost of Goods Sold (ONLY FOR PRODUCTS ACTUALLY SOLD)
    const cogsRow = await getOne(
      `SELECT COALESCE(SUM(oi.quantity * oi.unit_cost), 0) as total_cogs
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN brands b ON o.brand_id = b.id
       WHERE o.order_status != 'CANCELLED' ${brandCondition} ${dateCondition}`,
      params
    );

    // 3. Operating Expenses
    const expRow = await getOne(
      `SELECT COALESCE(SUM(e.amount), 0) as total_expenses
       FROM expenses e
       LEFT JOIN brands b ON e.brand_id = b.id
       WHERE 1=1 ${brandExpCondition}`,
      expParams
    );

    // 4. Products & Stock Counts
    const prodRow = await getOne(
      `SELECT COUNT(DISTINCT p.id) as total_products,
              COALESCE(SUM(pv.stock_quantity), 0) as total_available_stock,
              COALESCE(SUM(pv.stock_quantity * p.purchase_cost), 0) as current_inventory_asset_value,
              COALESCE(SUM(pv.purchased_quantity * p.purchase_cost), 0) as total_purchase_investment
       FROM products p
       JOIN product_variants pv ON p.id = pv.product_id
       JOIN brands b ON p.brand_id = b.id
       WHERE p.is_active = 1 ${brandProdCondition}`,
      prodParams
    );

    // 5. Order Status Counts
    const statusCounts = await query(
      `SELECT o.order_status, COUNT(o.id) as count
       FROM orders o
       JOIN brands b ON o.brand_id = b.id
       WHERE 1=1 ${brandCondition}
       GROUP BY o.order_status`,
      brand && brand !== 'all' ? [params[0]] : []
    );

    // 6. Pending Payments Count
    const pendingPayRow = await getOne(
      `SELECT COUNT(p.id) as pending_payments, COALESCE(SUM(p.amount), 0) as pending_amount
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN brands b ON o.brand_id = b.id
       WHERE p.status = 'PENDING' ${brandCondition}`,
      brand && brand !== 'all' ? [params[0]] : []
    );

    // Strict P&L Calculations
    const totalRevenue = Number(revRow.total_revenue || 0);
    const totalCogs = Number(cogsRow.total_cogs || 0);
    const grossProfit = totalRevenue - totalCogs;
    const totalExpenses = Number(expRow.total_expenses || 0);
    const netProfit = grossProfit - totalExpenses;

    // 7. Recent 7 Days Sales Trend (for chart)
    const salesTrend = await query(
      `SELECT DATE(o.created_at) as order_date, 
              COALESCE(SUM(o.final_amount), 0) as revenue,
              COUNT(o.id) as order_count
       FROM orders o
       JOIN brands b ON o.brand_id = b.id
       WHERE o.order_status != 'CANCELLED' ${brandCondition}
       GROUP BY DATE(o.created_at)
       ORDER BY order_date DESC
       LIMIT 14`,
      brand && brand !== 'all' ? [params[0]] : []
    );

    res.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders: Number(revRow.total_orders || 0),
        totalProducts: Number(prodRow.total_products || 0),
        totalAvailableStock: Number(prodRow.total_available_stock || 0),
        totalPurchaseInvestment: Number(prodRow.total_purchase_investment || 0),
        currentInventoryAssetValue: Number(prodRow.current_inventory_asset_value || 0),
        costOfGoodsSold: totalCogs,
        operatingExpenses: totalExpenses,
        grossProfit,
        netProfit,
        pendingPaymentsCount: Number(pendingPayRow.pending_payments || 0),
        pendingPaymentsAmount: Number(pendingPayRow.pending_amount || 0)
      },
      statusCounts: statusCounts.reduce((acc, row) => {
        acc[row.order_status] = Number(row.count);
        return acc;
      }, {}),
      salesTrend: salesTrend.reverse()
    });
  } catch (err) {
    console.error('[Dashboard Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Strict Profit & Loss Detailed Report
 * Returns Nanova Tees, Surprise Nanova, and Combined breakdown.
 * GET /api/reports/profit-loss
 */
router.get('/profit-loss', authenticateAdmin, async (req, res) => {
  try {
    // Brand 1: Nanova Tees
    const teesRevenue = await getOne(`SELECT COALESCE(SUM(final_amount), 0) as val FROM orders WHERE brand_id = 1 AND order_status != 'CANCELLED'`);
    const teesCogs = await getOne(`SELECT COALESCE(SUM(oi.quantity * oi.unit_cost), 0) as val FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.brand_id = 1 AND o.order_status != 'CANCELLED'`);
    const teesExpenses = await getOne(`SELECT COALESCE(SUM(amount), 0) as val FROM expenses WHERE brand_id = 1`);
    const teesStockAsset = await getOne(`SELECT COALESCE(SUM(pv.stock_quantity * p.purchase_cost), 0) as val FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE p.brand_id = 1`);
    const teesPurchasedTotal = await getOne(`SELECT COALESCE(SUM(pv.purchased_quantity * p.purchase_cost), 0) as val FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE p.brand_id = 1`);

    // Brand 2: Surprise Nanova
    const giftsRevenue = await getOne(`SELECT COALESCE(SUM(final_amount), 0) as val FROM orders WHERE brand_id = 2 AND order_status != 'CANCELLED'`);
    const giftsCogs = await getOne(`SELECT COALESCE(SUM(oi.quantity * oi.unit_cost), 0) as val FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.brand_id = 2 AND o.order_status != 'CANCELLED'`);
    const giftsExpenses = await getOne(`SELECT COALESCE(SUM(amount), 0) as val FROM expenses WHERE brand_id = 2`);
    const giftsStockAsset = await getOne(`SELECT COALESCE(SUM(pv.stock_quantity * p.purchase_cost), 0) as val FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE p.brand_id = 2`);
    const giftsPurchasedTotal = await getOne(`SELECT COALESCE(SUM(pv.purchased_quantity * p.purchase_cost), 0) as val FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE p.brand_id = 2`);

    // Common expenses
    const commonExpenses = await getOne(`SELECT COALESCE(SUM(amount), 0) as val FROM expenses WHERE brand_id IS NULL`);

    const rT = Number(teesRevenue.val);
    const rG = Number(giftsRevenue.val);
    const rComb = rT + rG;

    const cT = Number(teesCogs.val);
    const cG = Number(giftsCogs.val);
    const cComb = cT + cG;

    const gpT = rT - cT;
    const gpG = rG - cG;
    const gpComb = rComb - cComb;

    const eT = Number(teesExpenses.val);
    const eG = Number(giftsExpenses.val);
    const eComm = Number(commonExpenses.val);
    const eComb = eT + eG + eComm;

    const npT = gpT - eT;
    const npG = gpG - eG;
    const npComb = gpComb - eComb;

    const astT = Number(teesStockAsset.val);
    const astG = Number(giftsStockAsset.val);
    const astComb = astT + astG;

    const invT = Number(teesPurchasedTotal.val);
    const invG = Number(giftsPurchasedTotal.val);
    const invComb = invT + invG;

    res.json({
      success: true,
      report: {
        nanovaTees: {
          brand: 'NANOVA TEES',
          salesRevenue: rT,
          cogs: cT,
          grossProfit: gpT,
          grossProfitMargin: rT > 0 ? ((gpT / rT) * 100).toFixed(1) : '0.0',
          operatingExpenses: eT,
          netProfit: npT,
          netProfitMargin: rT > 0 ? ((npT / rT) * 100).toFixed(1) : '0.0',
          currentInventoryAsset: astT,
          totalPurchaseInvestment: invT
        },
        surpriseNanova: {
          brand: 'SURPRISE NANOVA',
          salesRevenue: rG,
          cogs: cG,
          grossProfit: gpG,
          grossProfitMargin: rG > 0 ? ((gpG / rG) * 100).toFixed(1) : '0.0',
          operatingExpenses: eG,
          netProfit: npG,
          netProfitMargin: rG > 0 ? ((npG / rG) * 100).toFixed(1) : '0.0',
          currentInventoryAsset: astG,
          totalPurchaseInvestment: invG
        },
        combined: {
          brand: 'COMBINED ENTERPRISE',
          salesRevenue: rComb,
          cogs: cComb,
          grossProfit: gpComb,
          grossProfitMargin: rComb > 0 ? ((gpComb / rComb) * 100).toFixed(1) : '0.0',
          commonExpenses: eComm,
          totalOperatingExpenses: eComb,
          netProfit: npComb,
          netProfitMargin: rComb > 0 ? ((npComb / rComb) * 100).toFixed(1) : '0.0',
          currentInventoryAsset: astComb,
          totalPurchaseInvestment: invComb
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Export Reports as Excel (.xlsx)
 * GET /api/reports/export/:type (sales | inventory | purchases | profit-loss)
 */
router.get('/export/:type', authenticateAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { brand_id } = req.query;

    const workbook = await generateExcelReport(type, { brand_id });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=nanova-${type}-report-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('[Export Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
