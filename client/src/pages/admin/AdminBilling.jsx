import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Search,
  Eye,
  ExternalLink,
  Heart,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Shirt,
  DollarSign,
  TrendingUp,
  Receipt,
  Check,
  X,
  CreditCard,
  User,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminBilling() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'PAID' | 'PENDING'
  const [filterBrand, setFilterBrand] = useState('all');

  // Manual Bill Form State
  const [billBrand, setBillBrand] = useState('nanova_tees');
  const [customer, setCustomer] = useState({
    full_name: '',
    phone: '',
    address: 'Direct Store Sale / Counter',
    city: 'Coimbatore',
    pin_code: '641001'
  });
  const [items, setItems] = useState([
    {
      product_name: '',
      size: 'Standard',
      color: 'Default',
      quantity: 1,
      unit_price: '',
      unit_cost: ''
    }
  ]);
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');

  // Creation Status
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successBill, setSuccessBill] = useState(null);

  // Fetch Orders
  const loadOrders = () => {
    setLoading(true);
    let url = '/api/orders?status=ALL';
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.orders || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [search, token]);

  // Dynamic Item Handlers
  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        product_name: '',
        size: billBrand === 'nanova_tees' ? 'L' : 'Standard',
        color: billBrand === 'nanova_tees' ? 'Black' : 'Default',
        quantity: 1,
        unit_price: '',
        unit_cost: ''
      }
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Real-time Calculations
  const calculatedSubtotal = items.reduce((acc, it) => {
    const price = parseFloat(it.unit_price) || 0;
    const qty = parseInt(it.quantity, 10) || 0;
    return acc + price * qty;
  }, 0);

  const calculatedTotalCogs = items.reduce((acc, it) => {
    const cost = parseFloat(it.unit_cost) || 0;
    const qty = parseInt(it.quantity, 10) || 0;
    return acc + cost * qty;
  }, 0);

  const finalBillAmount = Math.max(
    0,
    calculatedSubtotal + (parseFloat(deliveryCharges) || 0) - (parseFloat(discountAmount) || 0)
  );
  const estimatedGrossProfit = finalBillAmount - calculatedTotalCogs;
  const estimatedMargin = finalBillAmount > 0 ? ((estimatedGrossProfit / finalBillAmount) * 100).toFixed(1) : 0;

  // Submit Manual Bill
  const handleCreateBill = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!customer.full_name.trim() || !customer.phone.trim()) {
      setSubmitError('Customer Name and Mobile Phone Number are required.');
      return;
    }

    const validItems = items.filter((it) => it.product_name.trim() && parseFloat(it.unit_price) >= 0);
    if (validItems.length === 0) {
      setSubmitError('Please enter at least one product with name and selling price.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders/manual-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          brand_code: billBrand,
          customer,
          items: validItems,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          delivery_charges: parseFloat(deliveryCharges) || 0,
          discount_amount: parseFloat(discountAmount) || 0,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create manual bill.');
      }

      setSuccessBill(data);
      loadOrders();

      // Reset form
      setCustomer({
        full_name: '',
        phone: '',
        address: 'Direct Store Sale / Counter',
        city: 'Coimbatore',
        pin_code: '641001'
      });
      setItems([
        {
          product_name: '',
          size: billBrand === 'nanova_tees' ? 'L' : 'Standard',
          color: billBrand === 'nanova_tees' ? 'Black' : 'Default',
          quantity: 1,
          unit_price: '',
          unit_cost: ''
        }
      ]);
      setDeliveryCharges(0);
      setDiscountAmount(0);
      setNotes('');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'PAID' && o.payment_status !== 'PAID') return false;
    if (filterStatus === 'PENDING' && o.payment_status === 'PAID') return false;
    if (filterBrand !== 'all') {
      if (filterBrand === 'nanova_tees' && o.brand_id !== 1) return false;
      if (filterBrand === 'surprise_nanova' && o.brand_id !== 2) return false;
    }
    return true;
  });

  return (
    <AdminLayout activeBrand={filterBrand} onSelectBrand={setFilterBrand}>
      <div className="space-y-6">
        {/* Header with Navigation Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Receipt className="w-6 h-6 text-emerald-500" />
              <span>Billing &amp; Tax Invoices</span>
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Create manual bills for offline customers (automatically adds to Profit &amp; Loss) or download official luxury PDF invoices.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-2 p-1 bg-zinc-200 dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => {
                setActiveTab('list');
                setSuccessBill(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>All Bills ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Manual Bill</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: CREATE MANUAL BILL */}
        {/* ======================================================== */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Success Popup Card */}
            {successBill && (
              <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-600/80 text-white shadow-xl space-y-4 animate-in fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-emerald-300">
                        Manual Bill #{successBill.order.orderNumber} Created Successfully!
                      </h3>
                      <p className="text-xs text-zinc-300 mt-0.5">
                        Amount: <strong>₹{Number(successBill.order.finalAmount).toFixed(2)}</strong> • Added to{' '}
                        <strong className="text-emerald-300">Profit &amp; Loss (COGS &amp; Revenue)</strong>.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSuccessBill(null)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-emerald-800/80">
                  <a
                    href={successBill.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Tax Invoice PDF</span>
                  </a>
                  <a
                    href={successBill.cardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs transition shadow"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Download Luxury Thank You Card</span>
                  </a>
                  <button
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition border border-zinc-700 ml-auto"
                  >
                    View in All Invoices &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Main Manual Bill Form Card */}
            <form onSubmit={handleCreateBill} className="bg-[#0c0c11] rounded-3xl border border-zinc-800 p-6 sm:p-8 text-white shadow-2xl space-y-6">
              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs">
                  {submitError}
                </div>
              )}

              {/* Step 1: Brand & Category Selection */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  1. SELECT BUSINESS STORE
                </span>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setBillBrand('nanova_tees')}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                      billBrand === 'nanova_tees'
                        ? 'bg-zinc-800 border-white text-white shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-black border border-zinc-700 flex items-center justify-center">
                      <Shirt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Nanova Tees</div>
                      <div className="text-[10px] text-zinc-400">Streetwear &amp; Apparel</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillBrand('surprise_nanova')}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                      billBrand === 'surprise_nanova'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-black border border-amber-900/80 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-amber-300">Surprise Nanova</div>
                      <div className="text-[10px] text-zinc-400">Gifts &amp; Keepsakes</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Customer Information */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  2. CUSTOMER DETAILS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Customer Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={customer.full_name}
                        onChange={(e) => setCustomer({ ...customer, full_name: e.target.value })}
                        className="w-full bg-zinc-900/80 border border-zinc-700 pl-9 pr-3 py-2 text-xs rounded-xl text-white placeholder-zinc-500 focus:border-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full bg-zinc-900/80 border border-zinc-700 pl-9 pr-3 py-2 text-xs rounded-xl text-white placeholder-zinc-500 focus:border-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      City / Area
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Coimbatore"
                        value={customer.city}
                        onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                        className="w-full bg-zinc-900/80 border border-zinc-700 pl-9 pr-3 py-2 text-xs rounded-xl text-white placeholder-zinc-500 focus:border-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Address / Counter
                    </label>
                    <input
                      type="text"
                      placeholder="Store Pickup / Direct Sale"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full bg-zinc-900/80 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white placeholder-zinc-500 focus:border-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Product Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                    3. BILL ITEMS (PRODUCT NAME, PRICE &amp; COST)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition border border-zinc-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Row</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((it, idx) => {
                    const rowPrice = parseFloat(it.unit_price) || 0;
                    const rowCost = parseFloat(it.unit_cost) || 0;
                    const rowQty = parseInt(it.quantity, 10) || 1;
                    const rowTotal = rowPrice * rowQty;
                    const rowProfit = (rowPrice - rowCost) * rowQty;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center gap-3"
                      >
                        {/* Item Index Pill */}
                        <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>

                        {/* Product Name */}
                        <div className="flex-1 w-full">
                          <label className="text-[10px] text-zinc-400 block mb-0.5">Product Name</label>
                          <input
                            type="text"
                            required
                            placeholder={billBrand === 'nanova_tees' ? 'e.g. Vintage Heavyweight Oversized Tee' : 'e.g. Personalized Photo Magic Frame'}
                            value={it.product_name}
                            onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs rounded-lg text-white placeholder-zinc-500 focus:border-white focus:outline-none"
                          />
                        </div>

                        {/* Size / Variant */}
                        <div className="w-full md:w-28">
                          <label className="text-[10px] text-zinc-400 block mb-0.5">Size / Type</label>
                          <input
                            type="text"
                            placeholder="M, L, XL, Standard"
                            value={it.size}
                            onChange={(e) => handleItemChange(idx, 'size', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs rounded-lg text-white focus:border-white focus:outline-none"
                          />
                        </div>

                        {/* Quantity */}
                        <div className="w-full md:w-20">
                          <label className="text-[10px] text-zinc-400 block mb-0.5">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs rounded-lg text-white text-center focus:border-white focus:outline-none font-bold font-mono"
                          />
                        </div>

                        {/* Selling Price */}
                        <div className="w-full md:w-28">
                          <label className="text-[10px] text-zinc-400 block mb-0.5">Selling Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            placeholder="599"
                            value={it.unit_price}
                            onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs rounded-lg text-white font-mono font-bold focus:border-white focus:outline-none text-right"
                          />
                        </div>

                        {/* Purchase Cost (COGS) */}
                        <div className="w-full md:w-28">
                          <label className="text-[10px] text-zinc-400 block mb-0.5" title="Purchase/production cost per unit for accurate Profit & Loss calculation">
                            Cost Price (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="250"
                            value={it.unit_cost}
                            onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs rounded-lg text-orange-300 font-mono focus:border-white focus:outline-none text-right"
                          />
                        </div>

                        {/* Line Total & Profit Display */}
                        <div className="w-full md:w-32 text-right flex-shrink-0">
                          <label className="text-[10px] text-zinc-400 block mb-0.5">Line Total</label>
                          <span className="font-mono font-bold text-xs text-white block">
                            ₹{rowTotal.toFixed(2)}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400 block">
                            Profit: ₹{rowProfit.toFixed(2)}
                          </span>
                        </div>

                        {/* Delete Row Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          disabled={items.length <= 1}
                          className="p-2 rounded-lg text-zinc-500 hover:text-red-400 disabled:opacity-30 transition self-center"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Payment Details & Status */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  4. PAYMENT STATUS &amp; METHOD
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  {/* Payment Status (PAID / PENDING) */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                      Bill Status <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentStatus('PAID')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          paymentStatus === 'PAID'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>PAID</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentStatus('PENDING')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          paymentStatus === 'PENDING'
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>PENDING</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white focus:outline-none"
                    >
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Cash">Cash on Counter</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    </select>
                  </div>

                  {/* Delivery Charges */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                      Delivery Charge (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={deliveryCharges}
                      onChange={(e) => setDeliveryCharges(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white font-mono"
                    />
                  </div>

                  {/* Discount Amount */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Bill Note / Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hand delivered to customer, customized design approved on WhatsApp"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-700 px-3 py-2 text-xs rounded-xl text-white placeholder-zinc-500"
                />
              </div>

              {/* Step 5: Live P&L Impact & Grand Total Summary Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Subtotal ({items.length} item types):</span>
                  <span className="font-mono text-white">₹{calculatedSubtotal.toFixed(2)}</span>
                </div>

                {parseFloat(deliveryCharges) > 0 && (
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Delivery Charges:</span>
                    <span className="font-mono text-white">+₹{parseFloat(deliveryCharges).toFixed(2)}</span>
                  </div>
                )}

                {parseFloat(discountAmount) > 0 && (
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Discount:</span>
                    <span className="font-mono text-emerald-400">-₹{parseFloat(discountAmount).toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Bill Amount</span>
                    <span className="text-2xl font-black font-outfit text-white">
                      ₹{finalBillAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-800/80 px-4 py-2 rounded-xl text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      Added to Profit &amp; Loss
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-300">
                      Estimated Profit: +₹{estimatedGrossProfit.toFixed(2)} ({estimatedMargin}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{submitting ? 'Generating Bill & PDF...' : 'Save Bill & Generate Invoice PDF'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ALL BILLS & INVOICES LIST */}
        {/* ======================================================== */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    filterStatus === 'ALL'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow'
                      : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setFilterStatus('PAID')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    filterStatus === 'PAID'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-zinc-200 dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  Paid Only
                </button>
                <button
                  onClick={() => setFilterStatus('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    filterStatus === 'PENDING'
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-zinc-200 dark:bg-zinc-900 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  Pending Bills
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search invoice, customer or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-9 pr-3 py-2 text-xs rounded-xl text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Invoices: Mobile Cards (< md) + Desktop Table (>= md) */}
            <div className="bg-[#0c0c10] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-zinc-800">
                {filteredOrders.length === 0 ? (
                  <div className="py-12 px-4 text-center text-xs text-zinc-400">
                    No invoices or bills match your filter.
                  </div>
                ) : (
                  filteredOrders.map((o) => {
                    const isManual = o.order_number?.startsWith('MAN-') || o.notes?.includes('[MANUAL');
                    return (
                      <div key={o.id} className="p-4 space-y-3 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-sm text-white">
                                INV-{o.order_number.replace('NAN-', '')}
                              </span>
                              {isManual && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                                  MANUAL BILL
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                              Order #{o.order_number} • {new Date(o.created_at).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          <span className="font-mono font-black text-sm text-emerald-400">
                            ₹{Number(o.final_amount).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-white block">{o.customer_name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">{o.customer_phone}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.payment_status === 'PAID'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {o.payment_status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`/api/orders/${o.id}/invoice`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Bill + Card</span>
                          </a>
                          <a
                            href={`/api/orders/${o.id}/thank-you-card`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs transition"
                          >
                            <Heart className="w-3.5 h-3.5 fill-current" />
                            <span>Thank You</span>
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
                      <th className="py-3 px-4">Invoice / Order #</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Store Brand</th>
                      <th className="py-3 px-4">Billed To</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4 text-right">Invoice Total</th>
                      <th className="py-3 px-4 text-right">PDF Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 font-medium">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-400">
                          No invoices found matching your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const isManual = o.order_number?.startsWith('MAN-') || o.notes?.includes('[MANUAL');
                        return (
                          <tr key={o.id} className="hover:bg-zinc-900/60 transition">
                            <td className="py-3 px-4 font-mono font-bold text-white">
                              <div className="flex items-center gap-1.5">
                                <span>INV-{o.order_number.replace('NAN-', '')}</span>
                                {isManual && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                                    MANUAL
                                  </span>
                                )}
                              </div>
                              <span className="block text-[10px] text-zinc-400 font-mono">#{o.order_number}</span>
                            </td>

                            <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                              {new Date(o.created_at).toLocaleDateString('en-IN')}
                            </td>

                            <td className="py-3 px-4 font-semibold text-zinc-200">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  o.brand_id === 1
                                    ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                                    : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                                }`}
                              >
                                {o.brand_id === 1 ? 'NANOVA TEES' : 'SURPRISE NANOVA'}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-white block">{o.customer_name}</span>
                              <span className="text-[10px] text-zinc-400">{o.customer_phone}</span>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  o.payment_status === 'PAID'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}
                              >
                                {o.payment_status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                              ₹{Number(o.final_amount).toFixed(2)}
                            </td>

                            <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                              <a
                                href={`/api/orders/${o.id}/invoice`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-xs transition shadow-sm"
                                title="Print or download complete Tax Invoice"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Bill + Card</span>
                              </a>

                              <a
                                href={`/api/orders/${o.id}/thank-you-card`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-xs transition shadow-sm"
                                title="Print or download Luxury Keepsake Card"
                              >
                                <Heart className="w-3.5 h-3.5 fill-current" />
                                <span>Thank You</span>
                              </a>
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
      </div>
    </AdminLayout>
  );
}
