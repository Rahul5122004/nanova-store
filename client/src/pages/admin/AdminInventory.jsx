import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  AlertTriangle,
  Plus,
  Minus,
  RotateCcw,
  AlertCircle,
  FileSpreadsheet,
  Check,
  X,
  History
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminInventory() {
  const { token } = useAuth();
  const [brandFilter, setBrandFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adjustType, setAdjustType] = useState('ADJUSTMENT'); // ADD, REDUCE, DAMAGE, RETURN, ADJUSTMENT
  const [qtyChange, setQtyChange] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadInventory = () => {
    setLoading(true);
    let url = `/api/inventory?brand=${brandFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (lowStockOnly) url += `&lowStockOnly=true`;

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
  };

  useEffect(() => {
    loadInventory();
  }, [brandFilter, search, lowStockOnly]);

  const items = data?.items || [];
  const summary = data?.summary || {};

  const handleOpenAdjust = (variant) => {
    setSelectedVariant(variant);
    setAdjustType('ADJUSTMENT');
    setQtyChange('');
    setAdjustReason('');
    setModalError('');
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!qtyChange || !adjustReason) {
      setModalError('Quantity and mandatory reason are required.');
      return;
    }

    setAdjusting(true);
    setModalError('');

    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          variant_id: selectedVariant.id,
          type: adjustType,
          quantity_change: parseInt(qtyChange, 10),
          reason: adjustReason
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to adjust stock.');
      }

      setSelectedVariant(null);
      loadInventory();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <AdminLayout activeBrand={brandFilter} onSelectBrand={setBrandFilter}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">
              Advanced Inventory Management
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Exact Size + Colour matrix tracking. The owner knows exactly how many units were purchased, sold, and remain in warehouse.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/reports/export/inventory"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Inventory (Excel)</span>
            </a>
          </div>
        </div>

        {/* 4 Summary Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0c0c10] p-4 rounded-2xl border border-zinc-800 shadow-md">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Tracked Variants</span>
            <p className="text-2xl font-black font-outfit text-white mt-1">{summary.totalVariants || 0}</p>
          </div>

          <div className="bg-[#0c0c10] p-4 rounded-2xl border border-zinc-800 shadow-md">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Purchased Intake</span>
            <p className="text-2xl font-black font-outfit text-white mt-1">{summary.totalPurchasedQty || 0} <span className="text-xs text-zinc-400 font-normal">Units</span></p>
          </div>

          <div className="bg-[#0c0c10] p-4 rounded-2xl border border-zinc-800 shadow-md">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Sold to Customers</span>
            <p className="text-2xl font-black font-outfit text-white mt-1">{summary.totalSoldQty || 0} <span className="text-xs text-zinc-400 font-normal">Units</span></p>
          </div>

          <div className="bg-[#0c0c10] p-4 rounded-2xl border border-zinc-800 bg-gradient-to-br from-emerald-500/10 to-transparent shadow-md">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Remaining Stock Balance</span>
            <p className="text-2xl font-black font-outfit text-emerald-400 mt-1">{summary.totalStockQty || 0} <span className="text-xs text-zinc-400 font-normal">Units</span></p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search product, size, colour or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111116] border border-zinc-700 text-white placeholder-zinc-500 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                lowStockOnly
                  ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                  : 'bg-[#111116] hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Low Stock Alerts Only</span>
            </button>
          </div>
        </div>

        {/* Inventory Matrix: Mobile Cards (< md) + Desktop Table (>= md) */}
        <div className="bg-[#0c0c10] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
          {/* Mobile Card List View (Zero horizontal overflow or cut-off columns) */}
          <div className="md:hidden divide-y divide-zinc-800">
            {items.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-zinc-400">
                No inventory records match the current filter.
              </div>
            ) : (
              items.map((it) => {
                const isOut = Number(it.stock_quantity) <= 0;
                const isLow = Number(it.stock_quantity) <= Number(it.low_stock_threshold);
                return (
                  <div key={it.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-white block truncate">{it.product_name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">SKU: {it.sku}</span>
                      </div>
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-950/80 text-red-300 border border-red-800 flex-shrink-0">
                          OUT OF STOCK
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-950/80 text-amber-300 border border-amber-800 flex-shrink-0">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex-shrink-0">
                          IN STOCK
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        it.brand_code === 'nanova_tees' ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                      }`}>
                        {it.brand_name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-bold text-white text-[11px]">
                        Size: {it.size}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-300">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block"
                          style={{ backgroundColor: it.color_hex || '#000000' }}
                        />
                        {it.color}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-[#14141c] p-2.5 rounded-xl border border-zinc-800 text-center">
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">Purchased</span>
                        <span className="font-mono font-bold text-xs text-zinc-200">{it.purchased_quantity}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">Sold</span>
                        <span className="font-mono font-bold text-xs text-zinc-200">{it.sold_quantity}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">Remaining</span>
                        <span className={`font-mono font-black text-sm ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {it.stock_quantity}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAdjust(it)}
                      className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-bold transition active:scale-95"
                    >
                      Adjust Stock
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop / Laptop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#14141c] text-[11px] uppercase font-bold text-zinc-300 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Colour</th>
                  <th className="py-3 px-4 text-center">Purchased</th>
                  <th className="py-3 px-4 text-center">Sold</th>
                  <th className="py-3 px-4 text-center font-bold text-white">Remaining</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Stock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-medium">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      No inventory records match the current filter.
                    </td>
                  </tr>
                ) : (
                  items.map((it) => {
                    const isOut = Number(it.stock_quantity) <= 0;
                    const isLow = Number(it.stock_quantity) <= Number(it.low_stock_threshold);
                    return (
                      <tr key={it.id} className="hover:bg-zinc-900/60 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{it.product_name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">SKU: {it.sku}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            it.brand_code === 'nanova_tees' ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                          }`}>
                            {it.brand_name}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 font-bold text-white">
                            {it.size}
                          </span>
                        </td>

                        <td className="py-3 px-4 flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 inline-block flex-shrink-0"
                            style={{ backgroundColor: it.color_hex || '#000000' }}
                          />
                          <span className="text-zinc-200">{it.color}</span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-zinc-300">{it.purchased_quantity}</td>
                        <td className="py-3 px-4 text-center font-mono text-zinc-300">{it.sold_quantity}</td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                          <span className={isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}>
                            {it.stock_quantity}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {isOut ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-950/80 text-red-300 border border-red-800">
                              OUT OF STOCK
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-950/80 text-amber-300 border border-amber-800">
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                              IN STOCK
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenAdjust(it)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition active:scale-95"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADJUST STOCK MODAL WITH MANDATORY REASON */}
        {selectedVariant && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0f0f14] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-syne font-bold text-base text-white">Adjust Variant Inventory</h3>
                  <p className="text-xs text-zinc-400">
                    {selectedVariant.product_name} • Size: {selectedVariant.size} • Colour: {selectedVariant.color}
                  </p>
                </div>
                <button onClick={() => setSelectedVariant(null)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSaveAdjustment} className="space-y-4">
                <div className="p-3 bg-[#161622] rounded-xl border border-zinc-800 flex justify-between text-xs">
                  <span className="text-zinc-400">Current Stock in Warehouse:</span>
                  <span className="font-bold text-white font-mono text-sm">{selectedVariant.stock_quantity} Units</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Adjustment Type *</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full bg-[#181822] border border-zinc-700 text-white px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                  >
                    <option value="ADJUSTMENT">Manual Stock Count Adjustment</option>
                    <option value="DAMAGE">Damaged / Defective Stock Write-off</option>
                    <option value="RETURN">Customer Return Intake</option>
                    <option value="PURCHASE">Direct Purchase Stock Addition</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Quantity Delta (+ to Add, - to Deduct) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. +10 or -3"
                    value={qtyChange}
                    onChange={(e) => setQtyChange(e.target.value)}
                    className="w-full bg-[#181822] border border-zinc-700 text-white placeholder-zinc-500 px-3.5 py-2.5 text-xs rounded-xl font-mono text-sm focus:outline-none focus:border-zinc-500"
                  />
                  <p className="text-[10px] text-zinc-400">
                    Example: enter -2 to record 2 damaged units, or 15 to add 15 restocked units.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Mandatory Reason / Audit Note *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Monthly physical audit count adjustment or damaged in stitching inspection"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full bg-[#181822] border border-zinc-700 text-white placeholder-zinc-500 px-3.5 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adjusting}
                    className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition active:scale-95 disabled:opacity-50"
                  >
                    {adjusting ? 'Recording Audit...' : 'Confirm Stock Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
