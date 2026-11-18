import React, { useState, useEffect } from 'react';
import { History, Search, Filter } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminStockHistory() {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    let url = '/api/inventory/history?limit=150';
    if (typeFilter !== 'ALL') url += `&type=${typeFilter}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setHistory(data.history || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [typeFilter, token]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">
              Stock Modification Audit Trail
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Every single inventory change is permanently logged with timestamp, user, quantity delta, and audit reason.
            </p>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'SALE', 'PURCHASE', 'ADJUSTMENT', 'DAMAGE', 'RETURN', 'CANCEL_RESTORE'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-white text-black font-extrabold shadow-md'
                    : 'bg-[#111116] hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}
              >
                {t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* History: Mobile Cards (< md) + Desktop Table (>= md) */}
        <div className="bg-[#0c0c10] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-zinc-800">
            {history.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-zinc-400">
                No stock history records found.
              </div>
            ) : (
              history.map((h) => {
                const isPositive = Number(h.quantity_change) > 0;
                return (
                  <div key={h.id} className="p-4 space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-white block truncate">{h.product_name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(h.created_at).toLocaleString('en-IN')} • Ref: {h.reference_id || 'N/A'}
                        </span>
                      </div>
                      <span className={`font-mono font-black text-base flex-shrink-0 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? `+${h.quantity_change}` : h.quantity_change}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {h.transaction_type}
                      </span>
                      <span className="text-zinc-300 font-semibold">
                        {h.size} <span className="text-zinc-400 font-normal">({h.color})</span>
                      </span>
                      <span className="ml-auto font-mono text-[11px] text-zinc-400">
                        {h.previous_stock} → <strong className="text-white">{h.new_stock}</strong>
                      </span>
                    </div>

                    {h.reason && (
                      <p className="text-[11px] text-zinc-300 bg-[#14141c] p-2 rounded-lg border border-zinc-800">
                        {h.reason}
                      </p>
                    )}

                    <div className="text-[10px] text-zinc-400 font-mono">
                      Recorded by: {h.created_by}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#14141c] text-[11px] uppercase font-bold text-zinc-300 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Size / Color</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Delta</th>
                  <th className="py-3 px-4 text-center">Prev Stock</th>
                  <th className="py-3 px-4 text-center">New Stock</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-medium">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      No stock history records found.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => {
                    const isPositive = Number(h.quantity_change) > 0;
                    return (
                      <tr key={h.id} className="hover:bg-zinc-900/60 transition">
                        <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                          {new Date(h.created_at).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{h.product_name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">Ref: {h.reference_id || 'N/A'}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-zinc-200">{h.size}</span>
                          <span className="text-zinc-400 ml-1">({h.color})</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                            {h.transaction_type}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                          <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                            {isPositive ? `+${h.quantity_change}` : h.quantity_change}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-zinc-400">{h.previous_stock}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-white">{h.new_stock}</td>

                        <td className="py-3 px-4 max-w-xs truncate text-zinc-300">
                          {h.reason}
                        </td>

                        <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                          {h.created_by}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
