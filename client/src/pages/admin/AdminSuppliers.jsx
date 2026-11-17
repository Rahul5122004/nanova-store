import React, { useState, useEffect } from 'react';
import { Building2, Plus, Phone, Mail, MapPin, Trash2, Edit } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminSuppliers() {
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const loadSuppliers = () => {
    setLoading(true);
    fetch('/api/suppliers', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSuppliers(d.suppliers || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSuppliers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      setFormData({ name: '', company_name: '', phone: '', email: '', address: '', notes: '' });
      loadSuppliers();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">Suppliers Directory</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Manage wholesale fabric manufacturers and luxury packaging box vendors.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((s) => (
            <div key={s.id} className="glass-panel p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{s.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.company_name || 'Independent Supplier'}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" /> {s.phone}
                </p>
                {s.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" /> {s.email}
                  </p>
                )}
                {s.address && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {s.address}
                  </p>
                )}
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between text-xs mt-3">
                <span>Total Purchases: <strong className="text-zinc-900 dark:text-white">{s.total_purchases || 0}</strong></span>
                <span>Total Spent: <strong className="text-emerald-600 dark:text-emerald-400">₹{Number(s.total_spent || 0).toFixed(0)}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0f0f14] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-zinc-900 dark:text-zinc-100">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Add New Supplier</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Contact Person Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full glass-input px-3 py-2 text-xs rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Company / Mill Name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full glass-input px-3 py-2 text-xs rounded-xl"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full glass-input px-3 py-2 text-xs rounded-xl"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full glass-input px-3 py-2 text-xs rounded-xl"
                />
                <textarea
                  rows={2}
                  placeholder="Address (City, State)"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full glass-input px-3 py-2 text-xs rounded-xl"
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
