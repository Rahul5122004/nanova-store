import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Trash2, 
  Search, 
  Package, 
  Users, 
  RefreshCw, 
  AlertOctagon, 
  X, 
  Check, 
  SlidersHorizontal,
  Shirt,
  Sparkles,
  ShoppingBag,
  Edit
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminAdjust() {
  const { token } = useAuth();

  // Active sub-tab: 'products' | 'customers'
  const [activeTab, setActiveTab] = useState('products');

  // Products state
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productBrandFilter, setProductBrandFilter] = useState('all');
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Customers state
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Master Reset Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Load Products
  const loadProducts = () => {
    setLoadingProducts(true);
    let url = `/api/products?activeOnly=false&brand=${productBrandFilter}`;
    if (productSearch) url += `&search=${encodeURIComponent(productSearch)}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingProducts(false));
  };

  // Load Customers
  const loadCustomers = () => {
    setLoadingCustomers(true);
    let url = `/api/customers?limit=200`;
    if (customerSearch) url += `&search=${encodeURIComponent(customerSearch)}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCustomers(data.customers || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingCustomers(false));
  };

  useEffect(() => {
    loadProducts();
  }, [productBrandFilter, productSearch]);

  useEffect(() => {
    loadCustomers();
  }, [customerSearch]);

  // Delete Individual Product
  const handleDeleteProduct = async (prod) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete product "${prod.name}" (SKU: ${prod.sku || 'N/A'})?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete product.');
      }
      setActionMessage({ type: 'success', text: `Product "${prod.name}" deleted successfully.` });
      setTimeout(() => setActionMessage(null), 4000);
      loadProducts();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  // Delete Individual Customer
  const handleDeleteCustomer = async (cust) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete customer "${cust.full_name}" (${cust.phone}) and their purchase history?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/customers/${cust.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete customer.');
      }
      setActionMessage({ type: 'success', text: `Customer "${cust.full_name}" deleted successfully.` });
      setTimeout(() => setActionMessage(null), 4000);
      loadCustomers();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  // Master Reset: Wipe Everything to Blank Website
  const handleMasterReset = async () => {
    setResetting(true);
    try {
      let res = await fetch('/api/settings/reset-all', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });

      // Fallback alias if needed
      if (!res.ok && res.status === 404) {
        res = await fetch('/api/reset-all', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          }
        });
      }

      const rawText = await res.text();
      let data = {};
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        throw new Error('Server returned unexpected non-JSON response. Please restart the backend server so the latest updates take effect.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset website data.');
      }

      setShowResetModal(false);
      setActionMessage({ 
        type: 'success', 
        text: 'All website data wiped clean! The website is now 100% blank and fresh for your new products.' 
      });
      setTimeout(() => setActionMessage(null), 6000);
      loadProducts();
      loadCustomers();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setResetting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
              <SlidersHorizontal className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
              <span>DATA ADJUSTMENT &amp; MAINTENANCE</span>
            </div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">
              Adjust Products &amp; Customers
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
              Delete unwanted products, manage customer records, or perform a total blank website reset.
            </p>
          </div>
        </div>

        {/* Global Action Message Toast */}
        {actionMessage && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200' 
              : 'bg-red-950/80 border-red-700 text-red-200'
          }`}>
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MASTER RESET CARD (DANGER ZONE) */}
        <div className="bg-[#12080a] border-2 border-red-700/80 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <AlertOctagon className="w-64 h-64 text-red-500" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-red-400 text-xs font-extrabold uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>MASTER DANGER ZONE • 100% BLANK WEBSITE RESET</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-syne text-white tracking-tight">
                Reset All Website Data (Blank Website)
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Clicking this will permanently delete <strong>all products, variants, stock, orders, customer details, and invoices</strong> from the entire website. The website will immediately become 100% clean and blank so you can enter your new catalog fresh.
              </p>
            </div>

            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-950/60 transition active:scale-95 flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset All (Blank Website)</span>
            </button>
          </div>
        </div>

        {/* TABS SELECTOR (Products vs Customers) */}
        <div className="flex items-center gap-2 p-1.5 bg-[#0e0e14] border border-zinc-800 rounded-2xl w-fit shadow-md">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'products'
                ? 'bg-white text-black shadow-lg font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Adjust Products</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'products' ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'customers'
                ? 'bg-white text-black shadow-lg font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Adjust Customers</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'customers' ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {customers.length}
            </span>
          </button>
        </div>

        {/* TAB 1: ADJUST PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Brand Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-[#111116] border border-zinc-800 rounded-xl text-xs text-white">
                <button
                  onClick={() => setProductBrandFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    productBrandFilter === 'all' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All Stores
                </button>
                <button
                  onClick={() => setProductBrandFilter('nanova_tees')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    productBrandFilter === 'nanova_tees' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Nanova Tees
                </button>
                <button
                  onClick={() => setProductBrandFilter('surprise_nanova')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    productBrandFilter === 'surprise_nanova' ? 'bg-amber-600 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Surprise Nanova
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search products to adjust..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-[#111116] border border-zinc-700 text-white placeholder-zinc-500 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Products: Mobile Cards (< md) + Desktop Table (>= md) */}
            <div className="bg-[#0c0c10] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
              <div className="md:hidden divide-y divide-zinc-800">
                {loadingProducts ? (
                  <div className="py-12 px-4 text-center text-xs text-zinc-400">Loading products...</div>
                ) : products.length === 0 ? (
                  <div className="py-12 px-4 text-center text-xs text-zinc-400">
                    No products found in database. The website is currently blank.
                  </div>
                ) : (
                  products.map((p) => {
                    const isTees = p.brand_code === 'nanova_tees' || p.brand_id === 1;
                    return (
                      <div key={p.id} className="p-4 space-y-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 bg-zinc-900 rounded-lg p-1 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                            <img src={p.front_image} alt={p.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-sm text-white block truncate">{p.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono block">SKU: {p.sku || 'N/A'}</span>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              isTees ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                            }`}>
                              {isTees ? 'NANOVA TEES' : 'SURPRISE NANOVA'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-[#14141c] p-2.5 rounded-xl border border-zinc-800 text-center">
                          <div>
                            <span className="text-[10px] text-zinc-400 block">Price</span>
                            <span className="font-bold text-white">₹{Number(p.selling_price).toFixed(0)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block">Cost</span>
                            <span className="text-zinc-300">₹{Number(p.purchase_cost).toFixed(0)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block">Stock</span>
                            <span className={`font-bold ${p.total_stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {p.total_stock}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Product</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#14141c] text-[11px] uppercase font-bold text-zinc-300 border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Product Image &amp; Name</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (INR)</th>
                      <th className="py-3 px-4">Cost (INR)</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4 text-right">Delete Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {loadingProducts ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-400">
                          Loading products...
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-400">
                          No products found in database. The website is currently blank.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => {
                        const isTees = p.brand_code === 'nanova_tees' || p.brand_id === 1;
                        return (
                          <tr key={p.id} className="hover:bg-zinc-900/60 transition">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <div className="w-12 h-14 bg-zinc-900 rounded-lg p-1 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                                <img src={p.front_image} alt={p.name} className="w-full h-full object-contain" />
                              </div>
                              <div>
                                <span className="font-bold text-white block">{p.name}</span>
                                <span className="text-[10px] text-zinc-400 font-mono">SKU: {p.sku || 'N/A'}</span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isTees ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                              }`}>
                                {isTees ? 'NANOVA TEES' : 'SURPRISE NANOVA'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-zinc-300">{p.category_name}</td>

                            <td className="py-3 px-4 font-bold text-white">
                              ₹{Number(p.selling_price).toFixed(2)}
                            </td>

                            <td className="py-3 px-4 text-zinc-400">
                              ₹{Number(p.purchase_cost).toFixed(2)}
                            </td>

                            <td className="py-3 px-4">
                              <span className={`font-bold ${p.total_stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {p.total_stock} Units
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteProduct(p)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold transition active:scale-95"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
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
          </div>
        )}

        {/* TAB 2: ADJUST CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Total Registered Customers: <strong className="text-zinc-900 dark:text-white font-bold">{customers.length}</strong>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search customer by name, phone, city..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-[#111116] border border-zinc-700 text-white placeholder-zinc-500 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Customers: Mobile Cards (< md) + Desktop Table (>= md) */}
            <div className="bg-[#0c0c10] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
              <div className="md:hidden divide-y divide-zinc-800">
                {loadingCustomers ? (
                  <div className="py-12 px-4 text-center text-xs text-zinc-400">Loading customers...</div>
                ) : customers.length === 0 ? (
                  <div className="py-12 px-4 text-center text-xs text-zinc-400">No customer records found.</div>
                ) : (
                  customers.map((c) => (
                    <div key={c.id} className="p-4 space-y-2.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-white block truncate">{c.full_name}</span>
                          <span className="text-[11px] font-mono text-zinc-300 block">{c.phone}</span>
                          <span className="text-[10px] text-zinc-400 block truncate">{c.email || 'No email'}</span>
                        </div>
                        <span className="font-bold text-emerald-400 font-mono text-sm flex-shrink-0">
                          ₹{Number(c.total_spent || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-[#14141c] px-3 py-2 rounded-xl border border-zinc-800">
                        <span>{[c.city, c.state].filter(Boolean).join(', ') || 'N/A'}</span>
                        <span>Orders: <strong className="text-white">{c.total_orders || 0}</strong></span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to="/admin/customers"
                          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-bold transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteCustomer(c)}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#14141c] text-[11px] uppercase font-bold text-zinc-300 border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">City / State</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Total Spent</th>
                      <th className="py-3 px-4 text-right">Delete Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {loadingCustomers ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-400">
                          Loading customers...
                        </td>
                      </tr>
                    ) : customers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-400">
                          No customer records found.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c.id} className="hover:bg-zinc-900/60 transition">
                          <td className="py-3 px-4 font-bold text-white">
                            {c.full_name}
                          </td>

                          <td className="py-3 px-4 text-zinc-300 font-mono">
                            {c.phone}
                          </td>

                          <td className="py-3 px-4 text-zinc-400">
                            {c.email || 'N/A'}
                          </td>

                          <td className="py-3 px-4 text-zinc-300">
                            {[c.city, c.state].filter(Boolean).join(', ') || 'N/A'}
                          </td>

                          <td className="py-3 px-4 font-bold text-white">
                            {c.total_orders || 0}
                          </td>

                          <td className="py-3 px-4 font-bold text-emerald-400">
                            ₹{Number(c.total_spent || 0).toFixed(2)}
                          </td>

                          <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                            <Link
                              to="/admin/customers"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-bold transition active:scale-95 shadow-sm"
                              title="Edit Customer in CRM"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </Link>

                            <button
                              onClick={() => handleDeleteCustomer(c)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold transition active:scale-95"
                              title="Delete Customer Detail"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MASTER RESET CONFIRMATION MODAL WITH STRONG WARNING */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#12080a] border-2 border-red-600 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-red-900/60 pb-4">
                <div className="flex items-center gap-2.5 text-red-400">
                  <AlertOctagon className="w-6 h-6 text-red-500 animate-pulse" />
                  <h3 className="font-syne font-black text-lg text-white">
                    CRITICAL WARNING: Wipe All Data?
                  </h3>
                </div>
                <button
                  onClick={() => setShowResetModal(false)}
                  disabled={resetting}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-950/80 border border-red-700/80 rounded-2xl text-xs space-y-2 text-red-200">
                  <p className="font-bold text-white text-sm">
                    ⚠️ THIS ACTION CANNOT BE UNDONE!
                  </p>
                  <p>
                    You are about to permanently delete:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    <li>All products and images</li>
                    <li>All size and colour inventory matrices</li>
                    <li>All customer profiles and address details</li>
                    <li>All orders, payments, invoices, and audit logs</li>
                  </ul>
                  <p className="font-bold text-amber-300 pt-1">
                    Result: The website will immediately show 0 products and be 100% blank and fresh.
                  </p>
                </div>

                <p className="text-xs text-zinc-400 text-center">
                  Are you absolutely sure you want to proceed with this complete reset?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={resetting}
                  onClick={() => setShowResetModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
                >
                  Cancel (Keep My Data)
                </button>

                <button
                  type="button"
                  disabled={resetting}
                  onClick={handleMasterReset}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-950 transition active:scale-95 disabled:opacity-50"
                >
                  {resetting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Wiping Everything...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Yes, Reset All to Blank</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
