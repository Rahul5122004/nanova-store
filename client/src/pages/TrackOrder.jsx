import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle2, Clock, Truck, Download, AlertTriangle, ArrowRight } from 'lucide-react';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('id') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (orderNumber) {
      handleTrack(null, orderNumber, phone);
    }
  }, []);

  const handleTrack = async (e, directId, directPhone) => {
    if (e) e.preventDefault();
    const idToSearch = directId || orderNumber;
    const phoneToSearch = directPhone || phone;

    if (!idToSearch) return;

    setLoading(true);
    setErrorMsg(null);
    setOrder(null);

    try {
      let url = `/api/orders/track/${encodeURIComponent(idToSearch.trim())}`;
      if (phoneToSearch) {
        url += `?phone=${encodeURIComponent(phoneToSearch.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'No order found matching these details.');
      }

      setOrder(data.order);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = order ? statuses.indexOf(order.order_status) : -1;

  return (
    <div className="min-h-screen py-16 bg-transparent text-zinc-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-500">
            Real-Time Fulfillment Tracking
          </span>
          <h1 className="text-3xl font-black font-syne text-zinc-950 tracking-tight">
            TRACK YOUR ORDER
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Enter your unique Order Number (e.g. NAN-2026-0001) to check live status and invoice.
          </p>
        </div>

        {/* Search Card (Interior Dark Component) */}
        <form onSubmit={handleTrack} className="bg-[#111116] border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4 text-white transition-colors">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Order ID *</label>
              <input
                type="text"
                required
                placeholder="NAN-2026-0001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl font-mono uppercase shadow-sm"
              />
            </div>
            <div className="sm:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Mobile Number (Optional)</label>
              <input
                type="tel"
                placeholder="10-digit phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl shadow-sm"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching...' : 'Track'}</span>
              </button>
            </div>
          </div>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-200 text-xs text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Order Details Display (Interior Dark Component) */}
        {order && (
          <div className="bg-[#111116] border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-8 animate-fadeIn text-white transition-colors">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {order.brand_name}
                </span>
                <h2 className="text-2xl font-mono font-black text-white mt-0.5">
                  #{order.order_number}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Placed on {new Date(order.created_at).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.order_status === 'DELIVERED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : order.order_status === 'CANCELLED'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  Status: {order.order_status}
                </span>

                <a
                  href={`/api/orders/${order.id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Bill &amp; Thank You Card (PDF)</span>
                </a>

                <a
                  href={`/api/orders/${order.id}/thank-you-card`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <span>Thank You Card (PDF)</span>
                </a>
              </div>
            </div>

            {/* Stepper Timeline */}
            {order.order_status !== 'CANCELLED' ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Fulfillment Status Timeline
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {statuses.map((st, idx) => {
                    const isDone = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div
                        key={st}
                        className={`p-3 rounded-xl border text-center transition ${
                          isCurrent
                            ? 'bg-white text-black border-white shadow-md font-bold'
                            : isDone
                            ? 'bg-[#181824] border-zinc-700 text-zinc-200'
                            : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-600'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold uppercase block tracking-wider">
                          {st.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] mt-1 block">
                          {isCurrent ? 'Current' : isDone ? 'Done' : 'Upcoming'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                <strong>Order Cancelled:</strong> {order.cancellation_reason || 'This order was cancelled.'}
              </div>
            )}

            {/* Items in order */}
            <div className="space-y-3 pt-4 border-t border-zinc-800/80">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Order Items ({order.items?.length || 0})
              </h4>
              <div className="divide-y divide-zinc-800/60">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-white">{item.product_name}</h5>
                      <p className="text-zinc-400 text-[11px]">
                        Size: {item.size} • Colour: {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-white">₹{Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/80 text-xs">
              <div className="p-4 rounded-xl bg-[#181822] border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Delivery To:</span>
                <p className="font-bold text-white">{order.customer_name}</p>
                <p className="text-zinc-300">{order.address}</p>
                <p className="text-zinc-300">{order.city}, {order.state} - {order.pin_code}</p>
                <p className="text-zinc-300">Phone: {order.customer_phone}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#181822] border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payment Details:</span>
                <p className="font-bold text-white">Method: {order.payment_method}</p>
                <p className="text-amber-400 font-semibold">Payment Status: {order.payment_status}</p>
                {order.upi_ref_id && <p className="text-zinc-300 font-mono">UPI Ref: {order.upi_ref_id}</p>}
                <p className="font-bold text-white text-sm pt-1">Total: ₹{Number(order.final_amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
