import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  ShoppingBag,
  Eye,
  X,
  Edit,
  Plus,
  Trash2,
  Save,
  MapPin,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminCustomers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // View Customer History Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Edit / Add Customer Modal State
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pin_code: ''
  });
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const loadCustomers = () => {
    setLoading(true);
    let url = '/api/customers';
    if (search) url += `?search=${encodeURIComponent(search)}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCustomers(d.customers || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, [search, token]);

  // Open View History Modal
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

  // Open Edit Modal
  const handleOpenEdit = (c) => {
    setIsCreatingNew(false);
    setEditingCustomer(c);
    setFormError('');
    setEditFormData({
      full_name: c.full_name || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      city: c.city || 'Coimbatore',
      district: c.district || c.city || 'Coimbatore',
      state: c.state || 'Tamil Nadu',
      pin_code: c.pin_code || '641001'
    });
  };

  // Open Create New Customer Modal
  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setEditingCustomer({});
    setFormError('');
    setEditFormData({
      full_name: '',
      phone: '',
      email: '',
      address: 'Direct Store Sale / Counter',
      city: 'Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pin_code: '641001'
    });
  };

  // Save Edit / Create Customer
  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setSavingCustomer(true);
    setFormError('');

    if (!editFormData.full_name.trim() || !editFormData.phone.trim()) {
      setFormError('Customer Full Name and Mobile Phone are required.');
      setSavingCustomer(false);
      return;
    }

    try {
      const isNew = isCreatingNew;
      const url = isNew ? '/api/customers' : `/api/customers/${editingCustomer.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save customer details.');
      }

      setSuccessToast(isNew ? 'Customer created successfully!' : 'Customer details updated successfully!');
      setTimeout(() => setSuccessToast(''), 4000);

      // If updating customer currently open in view history modal, update it too
      if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
        setSelectedCustomer({ ...selectedCustomer, ...editFormData });
      }

      setEditingCustomer(null);
      setIsCreatingNew(false);
      loadCustomers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSavingCustomer(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}" and their order records?`)) return;

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete customer.');
      }
      setSuccessToast(`Customer "${name}" deleted.`);
      setTimeout(() => setSuccessToast(''), 3000);
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
      loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toast Feedback */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast('')} className="p-1 text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-indigo-500" />
              <span>Customer CRM &amp; Phone Directory</span>
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Manage client records, edit contact details, view lifetime orders, or start direct WhatsApp chats.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition active:scale-95 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Customer</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, phone, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none"
            />
          </div>

          <span className="text-xs text-zinc-500 font-semibold">
            Total Tracked Customers: <strong className="text-zinc-900 dark:text-white">{customers.length}</strong>
          </span>
        </div>

        {/* Customers List: Mobile Cards (< md) + Desktop Table (>= md) */}
        <div className="bg-[#0c0c10] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-zinc-800">
            {customers.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-zinc-400">
                No customer records found.
              </div>
            ) : (
              customers.map((c) => {
                const cleanPhone = (c.phone || '').replace(/\D/g, '');
                return (
                  <div key={c.id} className="p-4 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-white block truncate">{c.full_name}</span>
                        <span className="text-[11px] font-mono text-zinc-300 block">{c.phone}</span>
                        {c.email && <span className="text-[10px] text-zinc-400 block truncate">{c.email}</span>}
                      </div>
                      <span className="font-mono font-black text-sm text-emerald-400 flex-shrink-0">
                        ₹{Number(c.total_spent || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 bg-[#14141c] px-3 py-2 rounded-xl border border-zinc-800">
                      <span>{[c.city, c.state].filter(Boolean).join(', ') || 'Tamil Nadu'}</span>
                      <span>Orders: <strong className="text-white">{c.total_orders}</strong></span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleViewCustomer(c.id)}
                        className="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-zinc-400" />
                        <span>History</span>
                      </button>

                      <a
                        href={`https://wa.me/91${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#14141c] text-[11px] uppercase font-bold text-zinc-300 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Address &amp; Location</th>
                  <th className="py-3 px-4 text-center">Total Orders</th>
                  <th className="py-3 px-4 text-right">Lifetime Spent</th>
                  <th className="py-3 px-4">Last Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                  customers.map((c) => {
                    const cleanPhone = (c.phone || '').replace(/\D/g, '');
                    return (
                      <tr key={c.id} className="hover:bg-zinc-900/60 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{c.full_name}</span>
                          {c.email && <span className="text-[10px] text-zinc-400">{c.email}</span>}
                        </td>

                        <td className="py-3 px-4 font-mono text-zinc-200">
                          {c.phone}
                        </td>

                        <td className="py-3 px-4 text-zinc-300">
                          <span className="block truncate max-w-xs">{c.address || 'Direct Customer'}</span>
                          <span className="text-[10px] text-zinc-500 block">
                            {[c.city, c.state, c.pin_code].filter(Boolean).join(', ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-white">
                          {c.total_orders}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          ₹{Number(c.total_spent).toFixed(2)}
                        </td>

                        <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                          {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('en-IN') : '-'}
                        </td>

                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          {/* EDIT CUSTOMER BUTTON */}
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 text-xs font-bold transition shadow-sm"
                            title="Edit customer name, phone, address"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* VIEW HISTORY BUTTON */}
                          <button
                            onClick={() => handleViewCustomer(c.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition shadow-sm"
                            title="View customer order history"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>History</span>
                          </button>

                          {/* WHATSAPP CHAT */}
                          <a
                            href={`https://wa.me/91${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-bold transition shadow-sm"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          {/* DELETE */}
                          <button
                            onClick={() => handleDeleteCustomer(c.id, c.full_name)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg transition"
                            title="Delete customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* ======================================================== */}
        {/* EDIT / CREATE CUSTOMER MODAL */}
        {/* ======================================================== */}
        {editingCustomer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#0c0c11] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block">
                    {isCreatingNew ? 'Customer Registration' : 'Update Details'}
                  </span>
                  <h3 className="font-syne font-bold text-lg text-white">
                    {isCreatingNew ? 'Add New Customer' : `Edit: ${editFormData.full_name || 'Customer'}`}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingCustomer(null)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-950 border border-red-800 text-red-200 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveCustomer} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. customer@gmail.com"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Street / Delivery Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. No. 12, Crosscut Road, Gandhipuram"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Coimbatore"
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      placeholder="Coimbatore"
                      value={editFormData.district}
                      onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="Tamil Nadu"
                      value={editFormData.state}
                      onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      placeholder="641001"
                      value={editFormData.pin_code}
                      onChange={(e) => setEditFormData({ ...editFormData, pin_code: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCustomer}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingCustomer ? 'Saving...' : 'Save Customer Details'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CUSTOMER HISTORY MODAL */}
        {/* ======================================================== */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0f0f14] border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-syne font-bold text-base text-white">{selectedCustomer.full_name}</h3>
                  <p className="text-xs text-zinc-400">Phone: {selectedCustomer.phone} • {selectedCustomer.city}, {selectedCustomer.state}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const cust = selectedCustomer;
                      handleOpenEdit(cust);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-bold transition flex items-center gap-1.5 hover:bg-indigo-900"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                  <button onClick={() => setSelectedCustomer(null)} className="p-1 text-zinc-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#14141c] rounded-xl border border-zinc-800">
                  <span className="text-zinc-400 block">Total Orders</span>
                  <span className="text-xl font-bold text-white">{selectedCustomer.total_orders}</span>
                </div>
                <div className="p-3 bg-[#14141c] rounded-xl border border-zinc-800">
                  <span className="text-zinc-400 block">Lifetime Expenditure</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    ₹{Number(selectedCustomer.total_spent || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#14141c] rounded-xl border border-zinc-800 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Address Record</span>
                <p className="text-white">{selectedCustomer.address || 'Direct Customer'}</p>
                <p className="text-zinc-400">
                  {[selectedCustomer.city, selectedCustomer.district, selectedCustomer.state, selectedCustomer.pin_code].filter(Boolean).join(', ')}
                </p>
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
