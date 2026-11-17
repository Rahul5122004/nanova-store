import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Search, Eye, ExternalLink, Heart, Sparkles } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminBilling() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    let url = '/api/orders?status=ALL';
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.orders || []);
      })
      .finally(() => setLoading(false));
  }, [search, token]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">Billing &amp; Tax Invoices</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Official printable and downloadable PDF invoices with brand logos and GST details.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by Order ID or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input pl-9 pr-3 py-2 text-xs rounded-xl"
            />
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="bg-zinc-100/90 dark:bg-zinc-900/90 text-[11px] uppercase font-bold text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Invoice / Order #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Billed To</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Invoice Total</th>
                  <th className="py-3 px-4 text-right">PDF Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-medium">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                        INV-{o.order_number.replace('NAN-', '')}
                        <span className="block text-[10px] text-zinc-500">Order #{o.order_number}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                        {new Date(o.created_at).toLocaleDateString('en-IN')}
                      </td>

                      <td className="py-3 px-4 font-semibold text-zinc-800 dark:text-zinc-200">{o.brand_name}</td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-zinc-900 dark:text-white block">{o.customer_name}</span>
                        <span className="text-[10px] text-zinc-500">{o.customer_phone}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {o.payment_status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white text-sm">
                        ₹{Number(o.final_amount).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <a
                          href={`/api/orders/${o.id}/invoice`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs transition shadow-sm"
                          title="Print or download complete colorful Tax Invoice with attached Thank You Card"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Bill + Card</span>
                        </a>

                        <a
                          href={`/api/orders/${o.id}/thank-you-card`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-xs transition shadow-sm"
                          title="Print or download standalone Luxury Thank You Keepsake Card"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>Thank You Card</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
