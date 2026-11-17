import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Layers, FileSpreadsheet, ArrowUpRight, BarChart2, ShieldCheck } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfitLoss() {
  const { token } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/profit-loss', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setReportData(d.report);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading || !reportData) {
    return <AdminLayout><div className="text-center py-20 text-zinc-500">Calculating financial reports...</div></AdminLayout>;
  }

  const { nanovaTees: t, surpriseNanova: g, combined: c } = reportData;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">
              Profit &amp; Loss Statement (COGS Model)
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Strict accounting calculation: Gross Profit = Sales - COGS (sold items only). Unsold inventory is preserved as an Asset.
            </p>
          </div>

          <a
            href="/api/reports/export/profit-loss"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export P&amp;L (Excel)</span>
          </a>
        </div>

        {/* 3 Brand Columns Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: NANOVA TEES */}
          <div className="glass-panel p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Brand 1</span>
              <h3 className="text-xl font-bold font-syne text-zinc-900 dark:text-white mt-0.5">NANOVA TEES</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Streetwear Apparel Store</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">Sales Revenue:</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono">₹{t.salesRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">Cost of Goods Sold:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">-₹{t.cogs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm font-bold bg-emerald-50 dark:bg-zinc-950/60 px-2 rounded-lg">
                <span className="text-emerald-700 dark:text-emerald-400">Gross Profit:</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">₹{t.grossProfit.toFixed(2)} ({t.grossProfitMargin}%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">Operating Expenses:</span>
                <span className="font-bold text-red-600 dark:text-red-400 font-mono">-₹{t.operatingExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2.5 text-base font-extrabold bg-emerald-100/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 px-3 rounded-xl">
                <span className="text-emerald-800 dark:text-emerald-300">Net Profit:</span>
                <span className="font-mono text-emerald-800 dark:text-emerald-300">₹{t.netProfit.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Unsold Stock Asset:</span>
                  <span className="font-mono text-zinc-900 dark:text-white font-bold">₹{t.currentInventoryAsset.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Procurement:</span>
                  <span className="font-mono">₹{t.totalPurchaseInvestment.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: SURPRISE NANOVA */}
          <div className="glass-panel p-6 rounded-3xl border border-amber-200 dark:border-amber-900/40 space-y-6 bg-gradient-to-b from-amber-50/50 dark:from-[#18131e]/50 to-transparent shadow-sm">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">Brand 2</span>
              <h3 className="text-xl font-bold font-outfit text-amber-800 dark:text-amber-200 mt-0.5">SURPRISE NANOVA</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Curated Keepsakes &amp; Gifts</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">Sales Revenue:</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono">₹{g.salesRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">Cost of Goods Sold:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">-₹{g.cogs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm font-bold bg-amber-50 dark:bg-zinc-950/60 px-2 rounded-lg">
                <span className="text-amber-700 dark:text-amber-300">Gross Profit:</span>
                <span className="font-mono text-amber-700 dark:text-amber-300">₹{g.grossProfit.toFixed(2)} ({g.grossProfitMargin}%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">Operating Expenses:</span>
                <span className="font-bold text-red-600 dark:text-red-400 font-mono">-₹{g.operatingExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2.5 text-base font-extrabold bg-amber-100/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 px-3 rounded-xl">
                <span className="text-amber-800 dark:text-amber-200">Net Profit:</span>
                <span className="font-mono text-amber-800 dark:text-amber-200">₹{g.netProfit.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Unsold Stock Asset:</span>
                  <span className="font-mono text-zinc-900 dark:text-white font-bold">₹{g.currentInventoryAsset.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Procurement:</span>
                  <span className="font-mono">₹{g.totalPurchaseInvestment.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: COMBINED ENTERPRISE */}
          <div className="glass-panel p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 space-y-6 bg-gradient-to-br from-zinc-50 dark:from-zinc-900 to-white dark:to-black shadow-sm">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest block">Consolidated</span>
              <h3 className="text-xl font-bold font-syne text-zinc-900 dark:text-white mt-0.5">COMBINED BUSINESS</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Enterprise Operations</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">Total Sales:</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono text-sm">₹{c.salesRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">Total COGS:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">-₹{c.cogs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm font-bold bg-zinc-100 dark:bg-zinc-950 px-2 rounded-lg">
                <span className="text-zinc-900 dark:text-white">Gross Profit:</span>
                <span className="font-mono text-zinc-900 dark:text-white font-extrabold">₹{c.grossProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">All Expenses:</span>
                <span className="font-bold text-red-600 dark:text-red-400 font-mono">-₹{c.totalOperatingExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-black bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/40 px-3.5 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-400">Net Profit:</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">₹{c.netProfit.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Current Asset Value:</span>
                  <span className="font-mono text-zinc-900 dark:text-white font-bold">₹{c.currentInventoryAsset.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Capital Invested:</span>
                  <span className="font-mono">₹{c.totalPurchaseInvestment.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accounting Rule Compliance Box */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Compliance with Real Business Formulas</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Formula Applied: <code className="text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-900 px-1 py-0.5 rounded">Gross Profit = Sales Revenue - Cost of Goods Sold</code> and <code className="text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-900 px-1 py-0.5 rounded">Net Profit = Gross Profit - Operating Expenses</code>. Unsold items remain categorized as current assets under available stock valuation and are not deducted from ongoing operational profitability.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
