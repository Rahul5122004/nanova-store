import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Layers,
  FileSpreadsheet,
  ArrowUpRight,
  BarChart2,
  ShieldCheck,
  Shirt,
  Sparkles,
  Building2,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfitLoss() {
  const { token } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('combined'); // 'combined' | 'tees' | 'gifts' | 'compare'

  useEffect(() => {
    fetch('/api/reports/profit-loss', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setReportData(d.report);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading || !reportData) {
    return (
      <AdminLayout>
        <div className="text-center py-24 text-zinc-500 text-sm">
          Calculating dual-brand financial reports...
        </div>
      </AdminLayout>
    );
  }

  const { nanovaTees: t, surpriseNanova: g, combined: c } = reportData;

  const renderFinancialCard = (brand, title, subtitle, icon, theme) => {
    const isProfitable = brand.netProfit >= 0;

    let borderStyle = 'border-zinc-200 dark:border-zinc-800';
    let headerBg = 'bg-zinc-50 dark:bg-zinc-900/60';
    let brandBadge = 'bg-zinc-800 text-white';

    if (theme === 'tees') {
      borderStyle = 'border-indigo-200 dark:border-indigo-900/40';
      headerBg = 'bg-indigo-50/50 dark:bg-[#12121e]';
      brandBadge = 'bg-indigo-950 text-indigo-300 border border-indigo-800';
    } else if (theme === 'gifts') {
      borderStyle = 'border-amber-200 dark:border-amber-900/40';
      headerBg = 'bg-amber-50/50 dark:bg-[#1a1216]';
      brandBadge = 'bg-amber-950 text-amber-300 border border-amber-800';
    } else if (theme === 'combined') {
      borderStyle = 'border-emerald-200 dark:border-emerald-900/40';
      headerBg = 'bg-emerald-50/50 dark:bg-[#0c1410]';
      brandBadge = 'bg-emerald-950 text-emerald-300 border border-emerald-800';
    }

    return (
      <div className={`rounded-3xl border ${borderStyle} bg-[#0c0c11] text-white shadow-xl overflow-hidden space-y-6 p-6 sm:p-8 flex flex-col justify-between`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block mb-1.5 ${brandBadge}`}>
                {title}
              </span>
              <h3 className="text-2xl font-black font-syne text-white tracking-tight">
                {subtitle}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          </div>

          {/* Big Profit Hero Pill */}
          <div className={`p-4 rounded-2xl border ${isProfitable ? 'bg-emerald-950/40 border-emerald-800/80' : 'bg-red-950/40 border-red-800/80'} space-y-1`}>
            <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 block">
              Net Profit (Bottom Line)
            </span>
            <div className="flex items-baseline justify-between">
              <span className={`text-3xl font-black font-outfit ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                ₹{brand.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-300">
                Gross Margin: {brand.grossProfitMargin}%
              </span>
            </div>
          </div>

          {/* Line-by-Line Financial Metrics */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-400 font-medium">1. Sales Revenue (Orders + Bills):</span>
              <span className="font-bold font-mono text-white text-sm">
                ₹{brand.salesRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-400 font-medium">2. Cost of Goods Sold (COGS):</span>
              <span className="font-bold font-mono text-orange-400 text-sm">
                -₹{brand.cogs.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold">
              <span className="text-zinc-200">Gross Profit (Sales - COGS):</span>
              <span className="font-mono text-emerald-400">
                ₹{brand.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-400 font-medium">3. Operating Expenses:</span>
              <span className="font-bold font-mono text-red-400 text-sm">
                -₹{brand.operatingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Unsold Assets */}
            <div className="pt-3 border-t border-zinc-800 space-y-2 text-[11px] text-zinc-400">
              <div className="flex justify-between">
                <span>Warehouse Unsold Stock Asset:</span>
                <span className="font-mono text-white font-bold">
                  ₹{brand.currentInventoryAsset.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Procurement Investment:</span>
                <span className="font-mono text-zinc-300">
                  ₹{brand.totalPurchaseInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Accounting Safe Note */}
        <div className="pt-4 border-t border-zinc-800/60 text-[10px] text-zinc-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Strict Accrual COGS Model • Unsold stock is not deducted as loss.</span>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <span>Profit &amp; Loss Financial Center</span>
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Dual-brand accounting: View Nanova Tees, Surprise Nanova, and Combined enterprise profitability separately or together.
            </p>
          </div>

          <a
            href="/api/reports/export/profit-loss"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition shadow-sm self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Financial Report (Excel)</span>
          </a>
        </div>

        {/* Tab Selection Switcher (Combined / Tees / Gifts / Side-by-Side) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-200 dark:bg-zinc-900 rounded-2xl border border-zinc-300 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('combined')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'combined'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>🏢 Combined Enterprise (Total)</span>
          </button>

          <button
            onClick={() => setActiveTab('tees')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'tees'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>👕 Nanova Tees (Streetwear)</span>
          </button>

          <button
            onClick={() => setActiveTab('gifts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'gifts'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>✨ Surprise Nanova (Gifts)</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'compare'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>📊 Compare All 3 Side-by-Side</span>
          </button>
        </div>

        {/* TAB 1: COMBINED ENTERPRISE VIEW */}
        {activeTab === 'combined' && (
          <div className="space-y-6">
            {renderFinancialCard(
              c,
              'Consolidated Enterprise Total',
              'COMBINED BUSINESS (TEES + GIFTS)',
              <Building2 className="w-6 h-6 text-emerald-400" />,
              'combined'
            )}

            {/* Quick Breakdown Summary of the Two Businesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#0c0c11] border border-zinc-800 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">👕 Nanova Tees Contribution</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Net: ₹{t.netProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Sales: ₹{t.salesRevenue.toFixed(2)}</span>
                  <span>COGS: -₹{t.cogs.toFixed(2)}</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full"
                    style={{
                      width: `${c.salesRevenue > 0 ? (t.salesRevenue / c.salesRevenue) * 100 : 50}%`
                    }}
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0c0c11] border border-amber-900/60 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">✨ Surprise Nanova Contribution</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Net: ₹{g.netProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Sales: ₹{g.salesRevenue.toFixed(2)}</span>
                  <span>COGS: -₹{g.cogs.toFixed(2)}</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full"
                    style={{
                      width: `${c.salesRevenue > 0 ? (g.salesRevenue / c.salesRevenue) * 100 : 50}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NANOVA TEES ONLY */}
        {activeTab === 'tees' && (
          <div className="space-y-6">
            {renderFinancialCard(
              t,
              'Business 1 • Streetwear Apparel',
              'NANOVA TEES P&L',
              <Shirt className="w-6 h-6 text-white" />,
              'tees'
            )}
          </div>
        )}

        {/* TAB 3: SURPRISE NANOVA ONLY */}
        {activeTab === 'gifts' && (
          <div className="space-y-6">
            {renderFinancialCard(
              g,
              'Business 2 • Curated Gifts & Keepsakes',
              'SURPRISE NANOVA P&L',
              <Sparkles className="w-6 h-6 text-amber-400" />,
              'gifts'
            )}
          </div>
        )}

        {/* TAB 4: COMPARE ALL 3 SIDE-BY-SIDE */}
        {activeTab === 'compare' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderFinancialCard(
              t,
              'Business 1',
              'NANOVA TEES',
              <Shirt className="w-5 h-5 text-white" />,
              'tees'
            )}
            {renderFinancialCard(
              g,
              'Business 2',
              'SURPRISE NANOVA',
              <Sparkles className="w-5 h-5 text-amber-400" />,
              'gifts'
            )}
            {renderFinancialCard(
              c,
              'Consolidated',
              'COMBINED ENTERPRISE',
              <Building2 className="w-5 h-5 text-emerald-400" />,
              'combined'
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
