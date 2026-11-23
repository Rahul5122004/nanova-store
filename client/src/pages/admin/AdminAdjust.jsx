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

  // Danger Action Modal State
  const [dangerModal, setDangerModal] = useState({
    open: false,
    type: '',
    title: '',
    description: '',
    warningList: [],
    endpoint: '',
    buttonText: '',
    isDangerous: true
  });
  const [processingDanger, setProcessingDanger] = useState(false);
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

  // Open Danger Confirmation Modal
  const handleOpenDanger = (actionType) => {
    switch (actionType) {
      case 'products':
        setDangerModal({
          open: true,
          type: 'products',
          title: 'Delete All Products & Stock Only',
          description: 'This will permanently remove all catalog products, images, size & color variants, and stock transactions from your store.',
          warningList: [
            'All products will be removed from Nanova Tees and Surprise Nanova storefronts',
            'Customer profiles and past orders will NOT be deleted',
            'Cannot be undone (use Restore Sample Products if you ever want to repopulate)'
          ],
          endpoint: '/api/settings/delete-all-products',
          buttonText: 'Yes, Delete All Products',
          isDangerous: true
        });
        break;
      case 'customers':
        setDangerModal({
          open: true,
          type: 'customers',
          title: 'Delete All Customers Only',
          description: 'This will permanently delete all customer profiles, phone numbers, and address directories from your CRM.',
          warningList: [
            'All customer records will be wiped permanently',
            'Catalog products, variants, and stock will NOT be affected'
          ],
          endpoint: '/api/settings/delete-all-customers',
          buttonText: 'Yes, Delete All Customers',
          isDangerous: true
        });
        break;
      case 'orders':
        setDangerModal({
          open: true,
          type: 'orders',
          title: 'Delete All Orders & Bills Only',
          description: 'This will permanently clear all customer orders, manual generated bills, tax invoices, and payment verifications.',
          warningList: [
            'All sales transactions, invoices, and receipts will be deleted',
            'Products, stock, and customers will NOT be deleted'
          ],
          endpoint: '/api/settings/delete-all-orders',
          buttonText: 'Yes, Delete All Orders & Bills',
          isDangerous: true
        });
        break;
      case 'purchases':
        setDangerModal({
          open: true,
          type: 'purchases',
          title: 'Delete All Supplier Purchases Only',
          description: 'This will permanently remove all supplier purchase batches and procurement intake logs.',
          warningList: [
            'All supplier purchase orders will be deleted',
            'Products and customer orders will NOT be deleted'
          ],
          endpoint: '/api/settings/delete-all-purchases',
          buttonText: 'Yes, Delete All Purchases',
          isDangerous: true
        });
        break;
      case 'expenses':
        setDangerModal({
          open: true,
          type: 'expenses',
          title: 'Delete All Expenses Only',
          description: 'This will permanently delete all recorded business overhead expenses from the profit & loss logs.',
          warningList: [
            'All overhead expense entries will be deleted',
            'Products and orders will NOT be deleted'
          ],
          endpoint: '/api/settings/delete-all-expenses',
          buttonText: 'Yes, Delete All Expenses',
          isDangerous: true
        });
        break;
      case 'seed':
        setDangerModal({
          open: true,
          type: 'seed',
          title: 'Populate Sample Catalog Products & Stock',
          description: 'This will populate the database with all 13 official catalog products across Nanova Tees & Surprise Nanova, complete with 3D models, sizes, colors, and initial supplier purchase batches.',
          warningList: [
            'Safe operation: Populates fresh catalog items and stock',
            'Your existing customers and orders will NOT be removed'
          ],
          endpoint: '/api/settings/seed-catalog',
          buttonText: 'Yes, Populate Sample Catalog',
          isDangerous: false
        });
        break;
      case 'reset-all':
        setDangerModal({
          open: true,
          type: 'reset-all',
          title: 'CRITICAL DANGER: Master Wipe (Blank Website)',
          description: 'This will permanently wipe EVERYTHING: all products, variants, stock, customers, orders, bills, invoices, purchases, and expenses.',
          warningList: [
            'The entire website database will be reset to 100% blank',
            'Storefront will immediately show 0 products and 0 orders',
            'THIS ACTION CANNOT BE UNDONE!'
          ],
          endpoint: '/api/settings/reset-all',
          buttonText: 'Yes, Wipe Everything to Blank',
          isDangerous: true
        });
        break;
      default:
        break;
    }
  };

  // Execute Confirmed Danger Action
  const handleExecuteDangerAction = async () => {
    setProcessingDanger(true);
    try {
      let res = await fetch(dangerModal.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Operation failed.');
      }

      setDangerModal({ ...dangerModal, open: false });
      setActionMessage({ type: 'success', text: data.message });
      setTimeout(() => setActionMessage(null), 5000);
      loadProducts();
      loadCustomers();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
      setTimeout(() => setActionMessage(null), 5000);
    } finally {
      setProcessingDanger(false);
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

        {/* DANGER ZONE: GRANULAR DATA CLEANUPS & MANAGEMENT */}
        <div className="bg-[#12080a] border-2 border-red-800/80 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-900/50 pb-5">
            <div>
              <div className="flex items-center gap-2 text-red-400 text-xs font-extrabold uppercase tracking-widest mb-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>DATA CLEANUP &amp; RESET MANAGEMENT</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-syne text-white tracking-tight">
                Granular Data Control (Delete Separately)
              </h2>
              <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
                Delete specific records individually with safety warnings, or restore default sample catalog items. Each action protects your other store data.
              </p>
            </div>

            {/* Quick Seed Button */}
            <button
              onClick={() => handleOpenDanger('seed')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/60 transition active:scale-95 flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restore Default Catalog &amp; Stock</span>
            </button>
          </div>

          {/* Grid of 5 Separate Danger Deletions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Delete All Products */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-red-900/40 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <Package className="w-4 h-4" />
                  <span>Delete All Products Only</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Wipes all catalog items, size &amp; color variants, and stock. Customers and orders remain untouched.
                </p>
              </div>
              <button
                onClick={() => handleOpenDanger('products')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-extrabold transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Products Only</span>
              </button>
            </div>

            {/* 2. Delete All Customers */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-red-900/40 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <Users className="w-4 h-4" />
                  <span>Delete All Customers Only</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Permanently clears customer profiles, phones, and addresses. Catalog products and stock remain untouched.
                </p>
              </div>
              <button
                onClick={() => handleOpenDanger('customers')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-extrabold transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Customers Only</span>
              </button>
            </div>

            {/* 3. Delete All Orders & Bills */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-red-900/40 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Delete All Orders &amp; Bills Only</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Clears all customer orders, manual generated bills, tax invoices, and payment verifications.
                </p>
              </div>
              <button
                onClick={() => handleOpenDanger('orders')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-extrabold transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Orders &amp; Bills</span>
              </button>
            </div>

            {/* 4. Delete All Supplier Purchases */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-red-900/40 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <Package className="w-4 h-4" />
                  <span>Delete All Purchases Only</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Removes all supplier purchase orders and procurement batch intake records.
                </p>
              </div>
              <button
                onClick={() => handleOpenDanger('purchases')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-extrabold transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Purchases Only</span>
              </button>
            </div>

            {/* 5. Delete All Expenses */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-red-900/40 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Delete All Expenses Only</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Clears all recorded business overhead expenses from the profit and loss ledger.
                </p>
              </div>
              <button
                onClick={() => handleOpenDanger('expenses')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-extrabold transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Expenses Only</span>
              </button>
            </div>

            {/* 6. Total Reset All (Blank Website) */}
            <div className="p-4 rounded-2xl bg-red-950/50 border border-red-600 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-rose-300 font-black text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Master Wipe (Blank Store)</span>
                </div>
                <p className="text-[11px] text-zinc-300 mt-1">
                  Wipes EVERYTHING across the entire site to make it 100% clean and blank.
                </p>
              </div>
              <button
                onClick={() => handleOpenDanger('reset-all')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Master Wipe Everything</span>
              </button>
            </div>
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

        {/* DANGER ACTION CONFIRMATION MODAL WITH STRONG WARNING */}
        {dangerModal.open && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className={`bg-[#12080a] border-2 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200 ${
              dangerModal.isDangerous ? 'border-red-600' : 'border-emerald-600'
            }`}>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2.5">
                  {dangerModal.isDangerous ? (
                    <AlertOctagon className="w-6 h-6 text-red-500 animate-pulse" />
                  ) : (
                    <RefreshCw className="w-6 h-6 text-emerald-400" />
                  )}
                  <h3 className="font-syne font-black text-lg text-white">
                    {dangerModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setDangerModal({ ...dangerModal, open: false })}
                  disabled={processingDanger}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {dangerModal.description}
                </p>

                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  dangerModal.isDangerous 
                    ? 'bg-red-950/80 border-red-700/80 text-red-200' 
                    : 'bg-emerald-950/80 border-emerald-700/80 text-emerald-200'
                }`}>
                  <p className="font-bold text-white text-sm">
                    {dangerModal.isDangerous ? '⚠️ DANGER / CAUTION NOTICE:' : 'ℹ️ CONFIRMATION DETAILS:'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {dangerModal.warningList.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>

                <p className="text-xs text-zinc-400 text-center font-medium">
                  Are you sure you want to execute this operation?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={processingDanger}
                  onClick={() => setDangerModal({ ...dangerModal, open: false })}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
                >
                  Cancel (Abort)
                </button>

                <button
                  type="button"
                  disabled={processingDanger}
                  onClick={handleExecuteDangerAction}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition active:scale-95 disabled:opacity-50 ${
                    dangerModal.isDangerous
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                  }`}
                >
                  {processingDanger ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {dangerModal.isDangerous ? <Trash2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      <span>{dangerModal.buttonText}</span>
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
