import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ArrowLeft, QrCode, Banknote, Upload, AlertCircle, Sparkles, Shirt, Check, Tag, Percent, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, subtotal, discount, coupon, applyCoupon, removeCoupon, availableCoupons, deliveryFee, finalTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pin_code: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI_QR');
  const [upiRefId, setUpiRefId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);

  const handleApplyDiscount = () => {
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMsg({ success: res.success, text: res.message });
  };

  // Payment settings from server
  const [paySettings, setPaySettings] = useState(null);

  useEffect(() => {
    fetch('/api/payments/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPaySettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-zinc-400">Please select products before checking out.</p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-white text-black text-xs font-bold rounded-full">
          Return to Store
        </Link>
      </div>
    );
  }

  // Determine brand attribution: if all items belong to one brand, tag that brand; otherwise default to primary brand
  const isAllTees = cart.every((i) => i.brand_code === 'nanova_tees');
  const brandCode = isAllTees ? 'nanova_tees' : 'surprise_nanova';

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customer.full_name || !customer.phone || !customer.address || !customer.city || !customer.pin_code) {
      setErrorMsg('Please complete all required address fields (Name, Phone, Address, City, PIN).');
      return;
    }

    if (customer.phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (paymentMethod === 'UPI_QR' && !upiRefId && !screenshotFile) {
      setErrorMsg('Please enter your 12-digit UPI Reference / UTR ID or upload payment screenshot.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Submit Order to Backend
      const orderPayload = {
        customer,
        items: cart.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          product_name: i.name,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          unit_price: i.unit_price,
          unit_cost: i.unit_cost,
          custom_note: i.custom_note || null
        })),
        brand_code: brandCode,
        payment_method: paymentMethod,
        discount_amount: discount,
        upi_ref_id: upiRefId || null,
        notes
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order.');
      }

      const createdOrder = data.order;

      // 2. If customer uploaded payment screenshot, submit file
      if (screenshotFile && createdOrder.orderId) {
        const formData = new FormData();
        formData.append('screenshot', screenshotFile);
        if (upiRefId) formData.append('upi_ref_id', upiRefId);

        await fetch(`/api/payments/${createdOrder.orderId}/submit-proof`, {
          method: 'POST',
          body: formData
        }).catch((e) => console.warn('[Screenshot upload error]:', e));
      }

      clearCart();
      navigate(`/order-confirmation/${createdOrder.orderNumber}`, {
        state: { order: createdOrder, customer }
      });
    } catch (err) {
      setErrorMsg(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 bg-transparent text-zinc-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-4 sm:pb-5">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 hover:text-black transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
            <span>SSL Encrypted Checkout</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Delivery Details & Payment (Takes 7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Delivery Address (Interior Dark Component) */}
            <div className="bg-[#111116] border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 text-white transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-syne font-bold text-lg text-white">Delivery Address</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter customer full name"
                    value={customer.full_name}
                    onChange={(e) => setCustomer({ ...customer, full_name: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Complete Street Address / Door No *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House/Flat No., Building, Street Name, Area/Locality"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">City / Town *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coimbatore, Chennai"
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit postal code"
                    value={customer.pin_code}
                    onChange={(e) => setCustomer({ ...customer, pin_code: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">District</label>
                  <input
                    type="text"
                    placeholder="District name"
                    value={customer.district}
                    onChange={(e) => setCustomer({ ...customer, district: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">State</label>
                  <input
                    type="text"
                    value={customer.state}
                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method (Interior Dark Component) */}
            <div className="bg-[#111116] border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 text-white transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-syne font-bold text-lg text-white">Payment Method</h3>
              </div>

              {/* Payment Type Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI_QR')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition shadow-sm ${
                    paymentMethod === 'UPI_QR'
                      ? 'bg-[#181824] border-white text-white'
                      : 'bg-[#14141c] border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <QrCode className="w-6 h-6 text-amber-400" />
                    {paymentMethod === 'UPI_QR' && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-xs text-white">UPI QR Payment</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">GPay, PhonePe, Paytm</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition shadow-sm ${
                    paymentMethod === 'COD'
                      ? 'bg-[#181824] border-white text-white'
                      : 'bg-[#14141c] border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Banknote className="w-6 h-6 text-emerald-400" />
                    {paymentMethod === 'COD' && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-xs text-white">Cash on Delivery</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Pay upon package arrival</p>
                  </div>
                </button>
              </div>

              {/* QR Code Presentation & Verification Inputs */}
              {paymentMethod === 'UPI_QR' && (
                <div className="p-5 rounded-2xl bg-[#161622] border border-zinc-800 space-y-5 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* The Configurable QR Code */}
                    <div className="w-48 h-48 bg-white rounded-2xl p-2.5 shadow-2xl flex-shrink-0 flex items-center justify-center">
                      <img
                        src={paySettings?.qr_image_url || '/default-qr.png'}
                        alt="NANOVA Official Payment QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-2 text-center sm:text-left">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                        Scan with any UPI App
                      </span>
                      <h4 className="text-base font-bold text-white">
                        Amount to Pay: <span className="font-outfit text-xl font-extrabold text-amber-300">₹{finalTotal.toFixed(2)}</span>
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {paySettings?.instructions ||
                          'Scan QR code using GPay, PhonePe, or Paytm. Enter the 12-digit UTR/Reference ID below with optional screenshot.'}
                      </p>
                      {paySettings?.account_name && (
                        <p className="text-xs font-semibold text-zinc-300">
                          Account: {paySettings.account_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* UPI Reference ID & Screenshot Upload */}
                  <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300 flex flex-wrap items-center justify-between gap-1">
                        <span>12-Digit UPI Reference / UTR Number</span>
                        <span className="text-[10px] text-zinc-400 font-normal">Found in UPI app transaction details</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 432198765432"
                        value={upiRefId}
                        onChange={(e) => setUpiRefId(e.target.value)}
                        className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl font-mono tracking-wider"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Upload Payment Screenshot (Optional)</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setScreenshotFile(e.target.files[0] || null)}
                        className="w-full text-xs text-zinc-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Special Delivery Note */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Special Instructions / Delivery Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Please call before arriving or deliver at security gate"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (Interior Dark Component) */}
          <div className="lg:col-span-5 bg-[#111116] border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 text-white transition-colors">
            <h3 className="font-syne font-bold text-lg text-white">Order Summary</h3>

            {/* Items Mini List */}
            <div className="divide-y divide-zinc-800/80 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.product_id}-${item.variant_id}`} className="py-3 flex items-center gap-3">
                  <div className="w-14 h-16 bg-[#181822] rounded-lg p-1 flex-shrink-0 border border-zinc-800 flex items-center justify-center shadow-sm">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                    <p className="text-[11px] text-zinc-400">
                      {item.size} • {item.color} • Qty: {item.quantity}
                    </p>
                    {item.custom_note && (
                      <p className="text-[10px] text-amber-300/80 italic truncate">"{item.custom_note}"</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white">
                    ₹{(item.unit_price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-zinc-400 border-t border-zinc-800/80 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Discount ({coupon?.code})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-white font-medium">
                  {deliveryFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-3 border-t border-zinc-800 flex justify-between text-base font-bold text-white">
                <span>Total Amount to Pay</span>
                <span className="font-outfit text-xl font-extrabold text-white">
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-xl disabled:opacity-50"
            >
              <span>{submitting ? 'Creating Order...' : `Place Order (₹${finalTotal.toFixed(2)})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
              By placing your order, you agree to NANOVA verified dispatch policies. Your unique Order ID will be generated with a downloadable tax invoice.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
