import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  ShoppingBag,
  CreditCard,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  ArrowUpRight,
  Filter,
  Calendar,
  AlertTriangle,
  Shirt,
  Sparkles,
  RefreshCw,
  Phone,
  Instagram,
  ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function AdminDashboard() {
  const { token } = useAuth();
  const { teesBrand, giftsBrand } = useSettings();
  const location = useLocation();

  // Detect route-based dedicated dashboards
  const isTeesRoute = location.pathname === '/admin/tees';
  const isGiftsRoute = location.pathname === '/admin/gifts';

  // Determine active brand
  let activeBrand = 'all';
  if (isTeesRoute) activeBrand = 'nanova_tees';
  else if (isGiftsRoute) activeBrand = 'surprise_nanova';

  const [brandFilter, setBrandFilter] = useState(activeBrand);
  const [timeframe, setTimeframe] = useState('all');
  const [data, setData] = useState(null);
  const [plData, setPlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Sync if route changes
  useEffect(() => {
    if (isTeesRoute) setBrandFilter('nanova_tees');
    else if (isGiftsRoute) setBrandFilter('surprise_nanova');
    else setBrandFilter('all');
  }, [location.pathname]);

  // Load Main Dashboard Metrics
  useEffect(() => {
    setLoading(true);
    let url = `/api/reports/dashboard?brand=${brandFilter}&timeframe=${timeframe}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [brandFilter, timeframe, token]);

  // Load Profit & Loss Brand Breakdown (for the top comparison cards on main dashboard)
  useEffect(() => {
    fetch('/api/reports/profit-loss', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.report) {
          setPlData(res.report);
        }
      })
      .catch(() => {});
  }, [token]);

  const metrics = data?.metrics || {};
  const statusCounts = data?.statusCounts || {};
  const salesTrend = data?.salesTrend || [];

  // Export Sales Handler (Authenticated Download)
  const handleExportSales = async () => {
    try {
      setExporting(true);
      const brandParam = brandFilter !== 'all' ? `?brand_id=${brandFilter === 'nanova_tees' ? 1 : 2}` : '';
      const url = `/api/reports/export/sales${brandParam}${brandParam ? '&' : '?'}token=${token}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to generate export file.');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `nanova-sales-report-${brandFilter}-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const teesPL = plData?.nanovaTees || {};
  const giftsPL = plData?.surpriseNanova || {};
  const totalRevCombined = (Number(teesPL.salesRevenue || 0) + Number(giftsPL.salesRevenue || 0)) || 1;
  const teesRevShare = Math.round((Number(teesPL.salesRevenue || 0) / totalRevCombined) * 100);
  const giftsRevShare = 100 - teesRevShare;

  return (
    <AdminLayout activeBrand={brandFilter} onSelectBrand={setBrandFilter}>
      <div className="space-y-8 transition-colors">
        {/* BRAND SPECIFIC HERO BANNERS */}
        {isTeesRoute && (
          <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-[#0c0c11] border border-zinc-800 text-white shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <Shirt className="w-4 h-4 text-white" />
                  <span>DEDICATED BRAND DASHBOARD</span>
                </div>
                <h1 className="text-3xl font-black font-syne text-white tracking-tight">
                  NANOVA TEES
                </h1>
                <p className="text-xs text-zinc-300 font-medium">
                  "{teesBrand.tagline}" • Heavyweight Oversized &amp; Regular Streetwear Apparel
                </p>
                <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-2 font-mono">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-zinc-300" /> {teesBrand.phone}</span>
                  <a href={teesBrand.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition"><Instagram className="w-3.5 h-3.5 text-zinc-300" /> {teesBrand.instagram_handle}</a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/admin/products"
                  className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl shadow-md transition"
                >
                  Manage Tees Products
                </Link>
                <Link
                  to="/admin/inventory"
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl border border-zinc-700 transition"
                >
                  S/M/L/XL/XXL Stock
                </Link>
              </div>
            </div>
          </div>
        )}

        {isGiftsRoute && (
          <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-[#1c121e] via-[#140b17] to-[#0c0c11] border border-amber-800/80 text-white shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>DEDICATED BRAND DASHBOARD</span>
                </div>
                <h1 className="text-3xl font-black font-syne text-amber-300 tracking-tight">
                  SURPRISE NANOVA
                </h1>
                <p className="text-xs text-zinc-300 font-medium">
                  "{giftsBrand.tagline}" • Curated Gift Hampers &amp; Bespoke Customized Treasures
                </p>
                <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-2 font-mono">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-amber-300" /> {giftsBrand.phone}</span>
                  <a href={giftsBrand.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-amber-200 transition"><Instagram className="w-3.5 h-3.5 text-amber-300" /> {giftsBrand.instagram_handle}</a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/admin/products"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black rounded-xl shadow-md transition"
                >
                  Manage Gift Catalog
                </Link>
                <Link
                  to="/admin/inventory"
                  className="px-4 py-2 bg-[#221626] hover:bg-[#2c1d31] text-amber-200 text-xs font-bold rounded-xl border border-amber-700/60 transition"
                >
                  Gift Stock Matrix
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TOP DUAL-BRAND DIFFERENCE & COMPARISON (ONLY ON MAIN DASHBOARD: /admin) */}
        {!isTeesRoute && !isGiftsRoute && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block">
                  BRAND PERFORMANCE COMPARISON
                </span>
                <h2 className="text-lg font-black font-syne text-zinc-900 tracking-tight">
                  Nanova Tees vs Surprise Nanova
                </h2>
              </div>
              <span className="text-xs font-bold text-zinc-500">Live Dual-Brand Breakdown</span>
            </div>

            {/* Side-by-Side Brand Difference Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* BRAND 1: NANOVA TEES */}
              <div className="bg-[#0c0c11] border border-zinc-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-white" />
                      <span>BUSINESS 1 • STREETWEAR</span>
                    </span>
                    <span className="text-xs font-mono text-zinc-400">📞 {teesBrand.phone}</span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black font-syne text-white tracking-tight">
                      {teesBrand.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">"{teesBrand.tagline}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-[#14141c] rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Tees Revenue</span>
                      <span className="text-lg font-black text-white font-outfit">
                        ₹{Number(teesPL.salesRevenue || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="p-3 bg-[#14141c] rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Tees Gross Profit</span>
                      <span className="text-lg font-black text-emerald-400 font-outfit">
                        ₹{Number(teesPL.grossProfit || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    Stock Asset: <strong>₹{Number(teesPL.currentInventoryAsset || 0).toFixed(0)}</strong>
                  </span>
                  <Link
                    to="/admin/tees"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition shadow"
                  >
                    <span>Open Tees Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* BRAND 2: SURPRISE NANOVA */}
              <div className="bg-gradient-to-br from-[#1c121e] via-[#120a14] to-[#0c0c11] border border-amber-800/80 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-950/80 text-amber-300 border border-amber-700/80 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>BUSINESS 2 • GIFTING STORE</span>
                    </span>
                    <span className="text-xs font-mono text-amber-300/80">📞 {giftsBrand.phone}</span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black font-syne text-amber-300 tracking-tight">
                      {giftsBrand.name}
                    </h3>
                    <p className="text-xs text-amber-200/70 font-medium">"{giftsBrand.tagline}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-[#1e1321] rounded-xl border border-amber-900/60">
                      <span className="text-[10px] text-amber-200/70 block font-semibold">Gifts Revenue</span>
                      <span className="text-lg font-black text-amber-300 font-outfit">
                        ₹{Number(giftsPL.salesRevenue || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="p-3 bg-[#1e1321] rounded-xl border border-amber-900/60">
                      <span className="text-[10px] text-amber-200/70 block font-semibold">Gifts Gross Profit</span>
                      <span className="text-lg font-black text-emerald-400 font-outfit">
                        ₹{Number(giftsPL.grossProfit || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-900/50 flex items-center justify-between">
                  <span className="text-xs text-amber-200/70">
                    Stock Asset: <strong>₹{Number(giftsPL.currentInventoryAsset || 0).toFixed(0)}</strong>
                  </span>
                  <Link
                    to="/admin/gifts"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 text-xs font-black transition shadow"
                  >
                    <span>Open Gifts Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Visual Revenue Share Bar */}
            <div className="p-4 bg-[#0c0c11] border border-zinc-800 rounded-2xl text-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Nanova Tees ({teesRevShare}%)</span>
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Surprise Nanova ({giftsRevShare}%)</span>
                </span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${teesRevShare}%` }} className="bg-zinc-200 h-full transition-all duration-500"></div>
                <div style={{ width: `${giftsRevShare}%` }} className="bg-gradient-to-r from-amber-500 to-amber-600 h-full transition-all duration-500"></div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM DASHBOARD: WHOLE INFO & METRICS */}
        <div className="space-y-6 pt-2">
          {/* Controls Bar: Timeframe & Export Sales Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black font-syne text-zinc-950 tracking-tight">
                {isTeesRoute 
                  ? 'Nanova Tees Full Analytics' 
                  : isGiftsRoute 
                  ? 'Surprise Nanova Full Analytics' 
                  : 'Whole Business Enterprise Dashboard'}
              </h2>
              <p className="text-xs text-zinc-600">
                {isTeesRoute
                  ? 'Detailed metrics, variant stock, and fulfillment for Nanova Tees.'
                  : isGiftsRoute
                  ? 'Detailed metrics, hampers inventory, and orders for Surprise Nanova.'
                  : 'Aggregated analytics, financial KPIs, and inventory health for all brands.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Timeframe Filter */}
              <div className="flex items-center gap-1 bg-[#111116] border border-zinc-800 p-1 rounded-xl text-xs font-semibold shadow-md text-white">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 ml-2" />
                <button
                  onClick={() => setTimeframe('today')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeframe === 'today' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeframe('week')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeframe === 'week' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTimeframe('month')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeframe === 'month' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setTimeframe('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeframe === 'all' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All Time
                </button>
              </div>

              {/* Working Export Sales Excel Button */}
              <button
                onClick={handleExportSales}
                disabled={exporting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111116] hover:bg-zinc-900 border border-zinc-800 text-xs font-bold text-emerald-400 transition shadow-md disabled:opacity-50 active:scale-95 cursor-pointer"
                title="Download verified Excel spreadsheet"
              >
                {exporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Exporting Excel...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Sales (Excel)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 11 KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Revenue */}
            <div className="bg-[#111116] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Total Revenue</span>
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold">₹</span>
              </div>
              <p className="text-2xl font-black font-outfit text-white">
                ₹{Number(metrics.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-zinc-500">Confirmed &amp; fulfilled orders</p>
            </div>

            {/* 2. Total Orders */}
            <div className="bg-[#111116] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-black font-outfit text-white">
                {metrics.totalOrders || 0}
              </p>
              <p className="text-[11px] text-zinc-500">Customer transactions recorded</p>
            </div>

            {/* 3. Cost of Goods Sold */}
            <div className="bg-[#111116] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Cost of Goods Sold (COGS)</span>
                <DollarSign className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-2xl font-black font-outfit text-white">
                ₹{Number(metrics.costOfGoodsSold || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-zinc-500">Only actually sold inventory units</p>
            </div>

            {/* 4. Gross Profit */}
            <div className="bg-[#111116] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Gross Profit</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black font-outfit text-emerald-400">
                ₹{Number(metrics.grossProfit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-zinc-500">Sales Revenue - COGS</p>
            </div>

            {/* 5. Business Expenses */}
            <div className="bg-[#111116] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Operating Expenses</span>
                <DollarSign className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-black font-outfit text-zinc-200">
                ₹{Number(metrics.operatingExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-zinc-500">Packaging, marketing &amp; delivery</p>
            </div>

            {/* 6. Net Profit */}
            <div className="bg-[#111116] border border-emerald-900/40 p-5 rounded-2xl space-y-2 shadow-xl hover:border-emerald-700 transition text-white">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Net Profit</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black font-outfit text-emerald-300">
                ₹{Number(metrics.netProfit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-zinc-500">Gross Profit - Operating Expenses</p>
            </div>

            {/* 7. Total Purchase Investment */}
            <div className="bg-[#111116] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Purchase Investment</span>
                <CreditCard className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-black font-outfit text-white">
                ₹{Number(metrics.totalPurchaseInvestment || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-zinc-500">Cumulative procurement cost</p>
            </div>

            {/* 8. Available Unsold Stock Asset */}
            <div className="bg-[#111116] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Stock Asset Value</span>
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black font-outfit text-white">
                ₹{Number(metrics.currentInventoryAssetValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-zinc-500">{metrics.totalAvailableStock || 0} units currently in warehouse</p>
            </div>

            {/* 9. Total Available Stock Units */}
            <div className="bg-[#111116] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Total Available Stock</span>
                <Package className="w-4 h-4 text-zinc-300" />
              </div>
              <p className="text-2xl font-black font-outfit text-white">
                {metrics.totalAvailableStock || 0} <span className="text-xs text-zinc-500 font-normal">Units</span>
              </p>
              <p className="text-[11px] text-zinc-500">Ready for instant fulfillment</p>
            </div>

            {/* 10. Pending Orders */}
            <div className="bg-[#111116] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Pending Orders</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black font-outfit text-amber-300">
                {statusCounts['NEW'] || 0}
              </p>
              <p className="text-[11px] text-zinc-500">Awaiting processing &amp; dispatch</p>
            </div>

            {/* 11. Pending Payments Verification */}
            <div className="bg-[#111116] border border-amber-900/50 p-5 rounded-2xl space-y-2 shadow-xl hover:border-amber-700 transition text-white">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Pending Payments</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black font-outfit text-amber-300">
                {metrics.pendingPaymentsCount || 0} <span className="text-xs text-zinc-500 font-normal">(₹{Number(metrics.pendingPaymentsAmount || 0).toFixed(0)})</span>
              </p>
              <Link
                to="/admin/payment-verification"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-bold pt-1"
              >
                Verify UPI Queue →
              </Link>
            </div>
          </div>

          {/* Charts & Status Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Revenue & Growth Trend Chart */}
            <div className="lg:col-span-8 bg-[#111116] border border-zinc-800 p-6 rounded-3xl shadow-xl space-y-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-syne">Sales Revenue Performance</h3>
                  <p className="text-xs text-zinc-400">Daily transaction trend over time</p>
                </div>
                <span className="text-xs text-zinc-400 font-mono">Live Sync</span>
              </div>

              <div className="h-72 w-full pt-4">
                {salesTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrend}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="order_date" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#181822', borderColor: '#27273a', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }}
                        formatter={(val) => [`₹${Number(val).toFixed(2)}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                    No sales trends recorded for this range
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="lg:col-span-4 bg-[#111116] border border-zinc-800 p-6 rounded-3xl shadow-xl space-y-4 text-white">
              <h3 className="text-base font-bold text-white font-syne">Fulfillment Pipeline</h3>
              <div className="space-y-3">
                {[
                  { label: 'New Orders', key: 'NEW', color: 'bg-blue-500' },
                  { label: 'Confirmed', key: 'CONFIRMED', color: 'bg-emerald-500' },
                  { label: 'Processing', key: 'PROCESSING', color: 'bg-purple-500' },
                  { label: 'Ready to Ship', key: 'READY_TO_SHIP', color: 'bg-amber-500' },
                  { label: 'Shipped', key: 'SHIPPED', color: 'bg-cyan-500' },
                  { label: 'Delivered', key: 'DELIVERED', color: 'bg-emerald-400' },
                  { label: 'Cancelled', key: 'CANCELLED', color: 'bg-red-500' },
                ].map((st) => (
                  <div key={st.key} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/80 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${st.color}`}></span>
                      <span className="text-zinc-300 font-medium">{st.label}</span>
                    </div>
                    <span className="font-bold text-white font-mono">{statusCounts[st.key] || 0}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/admin/orders"
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-center block text-white transition shadow-sm"
              >
                Manage All Orders →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
