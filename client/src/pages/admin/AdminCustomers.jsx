import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, ShoppingBag, Eye, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminCustomers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const loadCustomers = () => {
    setLoading(true);
    let url = '/api/customers';
    if (search) url += `?search=${encodeURIComponent(search)}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCustomers(d.customers || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, [search, token]);

  const handleViewCustomer = async (id) => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedCustomer(data.customer);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">Customer CRM</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">View lifetime customer orders, total expenditure, and contact history.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, phone or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111116] border border-zinc-700 text-white placeholder-zinc-500 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        <div className="bg-[#0c0c10] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#14141c] text-[11px] uppercase font-bold text-zinc-300 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Total Orders</th>
                  <th className="py-3 px-4 text-right">Lifetime Spent</th>
                  <th className="py-3 px-4">Last Order</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-medium">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      No customer records found.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-900/60 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{c.full_name}</span>
                        {c.email && <span className="text-[10px] text-zinc-400">{c.email}</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-200">{c.phone}</td>
                      <td className="py-3 px-4 text-zinc-300">{c.city}, {c.state}</td>
                      <td className="py-3 px-4 text-center font-bold text-white">{c.total_orders}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        ₹{Number(c.total_spent).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                        {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleViewCustomer(c.id)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition shadow-sm"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer History Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0f0f14] border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-syne font-bold text-base text-white">{selectedCustomer.full_name}</h3>
                  <p className="text-xs text-zinc-400">Phone: {selectedCustomer.phone} • {selectedCustomer.city}, {selectedCustomer.state}</p>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#14141c] rounded-xl border border-zinc-800">
                  <span className="text-zinc-400 block">Total Orders</span>
                  <span className="text-xl font-bold text-white">{selectedCustomer.total_orders}</span>
                </div>
                <div className="p-3 bg-[#14141c] rounded-xl border border-zinc-800">
                  <span className="text-zinc-400 block">Lifetime Expenditure</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">₹{Number(selectedCustomer.total_spent).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Previous Orders</h4>
                <div className="divide-y divide-zinc-800 max-h-56 overflow-y-auto border border-zinc-800 rounded-xl bg-[#14141c] p-2">
                  {selectedCustomer.orders?.length === 0 ? (
                    <p className="py-4 text-center text-xs text-zinc-400">No previous orders recorded.</p>
                  ) : (
                    selectedCustomer.orders?.map((ord) => (
                      <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs px-2">
                        <div>
                          <span className="font-mono font-bold text-white">#{ord.order_number}</span>
                          <span className="text-zinc-400 ml-2">({ord.brand_name})</span>
                          <p className="text-[10px] text-zinc-400">{new Date(ord.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-white font-mono">₹{Number(ord.final_amount).toFixed(2)}</span>
                          <span className="block text-[10px] text-amber-400 font-bold">{ord.order_status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-right pt-2 border-t border-zinc-800">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-5 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl transition shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
