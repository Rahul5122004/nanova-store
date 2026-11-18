import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, Trash2, Upload, X, Filter } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminExpenses() {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    brand_id: '1',
    category: 'PACKAGING',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [receiptFile, setReceiptFile] = useState(null);

  const loadExpenses = () => {
    setLoading(true);
    let url = `/api/expenses?brand=${brandFilter}&category=${categoryFilter}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setExpenses(d.expenses || []);
          setCategoryTotals(d.categoryTotals || {});
          setTotalExpenses(d.totalExpenses || 0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExpenses();
  }, [brandFilter, categoryFilter, token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (receiptFile) fd.append('receipt', receiptFile);

      await fetch('/api/expenses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      setShowModal(false);
      setFormData({
        brand_id: '1',
        category: 'PACKAGING',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        description: ''
      });
      loadExpenses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadExpenses();
  };

  const categories = ['ALL', 'PACKAGING', 'PRINTING', 'DELIVERY', 'TRANSPORTATION', 'MARKETING', 'OTHER'];

  return (
    <AdminLayout activeBrand={brandFilter} onSelectBrand={setBrandFilter}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">Operating Expenses</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Track overhead expenses categorized for accurate net profit calculations.</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Expense</span>
          </button>
        </div>

        {/* Category Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {['PACKAGING', 'PRINTING', 'DELIVERY', 'TRANSPORTATION', 'MARKETING', 'OTHER'].map((cat) => (
            <div key={cat} className="glass-panel p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">{cat}</span>
              <p className="text-base font-bold text-zinc-900 dark:text-white font-mono mt-1">
                ₹{Number(categoryTotals[cat] || 0).toFixed(0)}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                categoryFilter === c
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-white text-zinc-600 hover:text-black border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white dark:border-zinc-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Expenses: Mobile Cards (< md) + Desktop Table (>= md) */}
        <div className="bg-[#0c0c10] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-zinc-800">
            {expenses.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-zinc-400">
                No expense records found.
              </div>
            ) : (
              expenses.map((e) => (
                <div key={e.id} className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-white block">{e.category}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{e.expense_date}</span>
                    </div>
                    <span className="font-mono font-black text-sm text-white">
                      ₹{Number(e.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                      {e.brand_name || 'Enterprise Shared'}
                    </span>
                    <div className="flex items-center gap-3">
                      {e.receipt_url && (
                        <a href={e.receipt_url} target="_blank" rel="noreferrer" className="text-cyan-400 font-bold hover:underline">
                          View Receipt
                        </a>
                      )}
                      <button onClick={() => handleDelete(e.id)} className="text-zinc-400 hover:text-red-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {e.description && (
                    <p className="text-[11px] text-zinc-300 bg-[#14141c] p-2 rounded-lg border border-zinc-800">
                      {e.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#14141c] text-[11px] uppercase font-bold text-zinc-300 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-medium">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">No expense records found.</td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-900/60 transition">
                      <td className="py-3 px-4 font-mono text-zinc-400">{e.expense_date}</td>
                      <td className="py-3 px-4 font-bold text-white">{e.category}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                          {e.brand_name || 'Enterprise Shared'}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-zinc-300">{e.description}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                        ₹{Number(e.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {e.receipt_url ? (
                          <a href={e.receipt_url} target="_blank" rel="noreferrer" className="text-cyan-400 font-bold hover:underline">
                            View Receipt
                          </a>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleDelete(e.id)} className="p-1 text-zinc-400 hover:text-red-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0f0f14] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-zinc-900 dark:text-zinc-100">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Record Operating Expense</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  className="w-full glass-input px-3 py-2 text-xs rounded-xl"
                >
                  <option value="1">NANOVA TEES</option>
                  <option value="2">SURPRISE NANOVA</option>
                  <option value="common">Common / Enterprise Wide</option>
                </select>

                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full glass-input px-3 py-2 text-xs rounded-xl"
                >
                  <option value="PACKAGING">Packaging Expenses</option>
                  <option value="PRINTING">Printing Expenses</option>
                  <option value="DELIVERY">Delivery Expenses</option>
                  <option value="TRANSPORTATION">Transportation Expenses</option>
                  <option value="MARKETING">Marketing Expenses</option>
                  <option value="OTHER">Other Expenses</option>
                </select>

                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Amount (INR) *"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full glass-input px-3 py-2 text-xs rounded-xl font-mono"
                />

                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full glass-input px-3 py-2 text-xs rounded-xl"
                />

                <textarea
                  rows={2}
                  required
                  placeholder="Expense description / vendor details *"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full glass-input px-3 py-2 text-xs rounded-xl"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files[0] || null)}
                  className="w-full text-xs text-zinc-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-zinc-200 dark:file:bg-zinc-800 file:text-zinc-800 dark:file:text-zinc-200"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs rounded-xl transition shadow-sm">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
