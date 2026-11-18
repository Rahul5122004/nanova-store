import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Download,
  AlertTriangle,
  CheckCircle,
  Truck,
  X,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Tag,
  Percent
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [adminDiscount, setAdminDiscount] = useState('');
  const [updatingDiscount, setUpdatingDiscount] = useState(false);

  useEffect(() => {
    if (selectedOrder) {
      setAdminDiscount(Number(selectedOrder.discount_amount || 0));
    }
  }, [selectedOrder?.id]);

  const handleUpdateDiscount = async (orderId, amount) => {
    const numAmount = Math.max(0, parseFloat(amount || 0));
    setUpdatingDiscount(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/discount`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ discount_amount: numAmount })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update discount.');
      }
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          discount_amount: json.order.discount_amount,
          final_amount: json.order.final_amount
        });
      }
      loadOrders();
      alert(`Discount of ₹${numAmount.toFixed(2)} applied successfully to order #${selectedOrder?.order_number || orderId}!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingDiscount(false);
    }
  };

  const loadOrders = () => {
    setLoading(true);
    let url = `/api/orders?brand=${brandFilter}&status=${statusFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [brandFilter, statusFilter, search, token]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === 'CANCELLED') {
      const reason = window.prompt('Enter cancellation reason (stock will be restored automatically exactly once):');
      if (!reason) return;
      setCancelReason(reason);
    }

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          order_status: newStatus,
          cancellation_reason: cancelReason || undefined
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update order status.');
      }

      // Refresh order view
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      }
      loadOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout activeBrand={brandFilter} onSelectBrand={setBrandFilter}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">
              Order Fulfillment Management
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Live lifecycle status, customer contact deep links, payment confirmations, and PDF invoice generation.
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full md:w-auto">
            {['ALL', 'NEW', 'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                    : 'bg-white text-zinc-600 hover:text-black border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white dark:border-zinc-800'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search Order ID, customer, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input pl-9 pr-3 py-2 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Orders: Mobile Cards (< md) + Desktop Table (>= md) */}
        <div className="bg-[#0c0c10] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-zinc-800">
            {orders.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-zinc-400">
                No orders match the selected filters.
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="p-4 space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-black text-sm text-white block">#{o.order_number}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {new Date(o.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-white block">₹{Number(o.final_amount).toFixed(2)}</span>
                      {Number(o.discount_amount) > 0 && (
                        <span className="text-[10px] text-emerald-400 font-bold">
                          -₹{Number(o.discount_amount).toFixed(2)} disc.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-white block">{o.customer_name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{o.customer_phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.brand_code === 'nanova_tees' ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                      }`}>
                        {o.brand_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.payment_status === 'VERIFIED'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      }`}>
                        {o.payment_status}
                      </span>
                    </div>
                  </div>

                  {o.items?.length > 0 && (
                    <div className="bg-[#14141c] p-2.5 rounded-xl border border-zinc-800 space-y-1">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="truncate text-[11px] text-zinc-200">
                          {it.quantity}x {it.product_name} ({it.size}, {it.color})
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <select
                      value={o.order_status}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                      className="flex-1 bg-[#181822] border border-zinc-700 text-xs rounded-xl px-2.5 py-2 font-semibold text-white cursor-pointer focus:outline-none"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="READY_TO_SHIP">READY TO SHIP</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <button
                      onClick={() => handleViewOrder(o.id)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-extrabold transition flex-shrink-0"
                    >
                      View &amp; Discount
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#14141c] text-[11px] uppercase font-bold text-zinc-300 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-medium">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      No orders match the selected filters.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-900/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        #{o.order_number}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                        {new Date(o.created_at).toLocaleDateString('en-IN')}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{o.customer_name}</span>
                        <span className="text-[10px] text-zinc-400">{o.customer_phone}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.brand_code === 'nanova_tees' ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                        }`}>
                          {o.brand_name}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        {o.items?.map((it, idx) => (
                          <div key={idx} className="truncate text-[11px] text-zinc-200">
                            {it.quantity}x {it.product_name} ({it.size}, {it.color})
                          </div>
                        ))}
                      </td>

                      <td className="py-3 px-4 font-bold text-white font-mono text-sm">
                        ₹{Number(o.final_amount).toFixed(2)}
                        {Number(o.discount_amount) > 0 && (
                          <span className="block text-[10px] text-emerald-400 font-sans font-bold">
                            -₹{Number(o.discount_amount).toFixed(2)} discount
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.payment_status === 'VERIFIED'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        }`}>
                          {o.payment_status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={o.order_status}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          className="bg-[#181822] border border-zinc-700 text-xs rounded-lg px-2.5 py-1.5 font-semibold text-white cursor-pointer focus:outline-none"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="READY_TO_SHIP">READY TO SHIP</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewOrder(o.id)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#0f0f14] border border-zinc-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-white">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Order Details • {selectedOrder.brand_name}
                  </span>
                  <h3 className="font-mono font-black text-xl text-white">
                    #{selectedOrder.order_number}
                  </h3>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Direct Contact Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={selectedOrder.callUrl}
                  className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 shadow-sm transition active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Customer ({selectedOrder.customer_phone})</span>
                </a>

                <a
                  href={selectedOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp Chat</span>
                </a>
              </div>

              {/* Order Items Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Purchased Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl bg-[#14141c] p-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <h5 className="font-bold text-white text-sm">{item.product_name}</h5>
                        <p className="text-zinc-400 text-xs mt-0.5">
                          Size: <strong className="text-zinc-200">{item.size}</strong> • Colour: <strong className="text-zinc-200">{item.color}</strong> • Quantity: <strong className="text-zinc-200">{item.quantity}</strong>
                        </p>
                        {item.custom_note && (
                          <p className="text-[11px] text-amber-300 italic mt-0.5">Personalization: "{item.custom_note}"</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white text-sm">₹{Number(item.subtotal).toFixed(2)}</span>
                        <p className="text-[10px] text-zinc-400">Unit: ₹{Number(item.unit_price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address & Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#14141c] border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Delivery Address:</span>
                  <p className="font-bold text-white text-sm">{selectedOrder.customer_name}</p>
                  <p className="text-zinc-300">{selectedOrder.address}</p>
                  <p className="text-zinc-300">{selectedOrder.city}, {selectedOrder.district}, {selectedOrder.state} - {selectedOrder.pin_code}</p>
                  <p className="text-zinc-400 font-mono">Mobile: {selectedOrder.customer_phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#14141c] border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Payment Breakdown:</span>
                  <div className="flex justify-between text-zinc-300">
                    <span>Subtotal:</span>
                    <span className="text-white font-mono">₹{Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Delivery Charges:</span>
                    <span className="text-white font-mono">₹{Number(selectedOrder.delivery_charges).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Discount:</span>
                    <span className="font-bold text-amber-400 font-mono">-₹{Number(selectedOrder.discount_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-zinc-800">
                    <span>Final Amount:</span>
                    <span className="text-sm font-mono text-emerald-400">₹{Number(selectedOrder.final_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Admin Discount Control Panel */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span>Admin Discount Controller (Order #{selectedOrder.order_number})</span>
                  </span>
                  {Number(selectedOrder.discount_amount) > 0 ? (
                    <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700">
                      Active Discount: ₹{Number(selectedOrder.discount_amount).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-400">No discount applied yet</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={adminDiscount}
                      onChange={(e) => setAdminDiscount(e.target.value)}
                      placeholder="Enter discount in rupees"
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-xl bg-[#181822] border border-zinc-700 font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={updatingDiscount}
                    onClick={() => handleUpdateDiscount(selectedOrder.id, adminDiscount)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>{updatingDiscount ? 'Saving...' : 'Set Discount'}</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-400 font-semibold">1-Click Presets:</span>
                  {[50, 100, 150, 200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAdminDiscount(amt);
                        handleUpdateDiscount(selectedOrder.id, amt);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-amber-900/50 border border-zinc-700 text-[10px] font-mono font-bold text-zinc-200 hover:text-amber-300 transition"
                    >
                      ₹{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const tenPct = Math.round(Number(selectedOrder.subtotal) * 0.1);
                      setAdminDiscount(tenPct);
                      handleUpdateDiscount(selectedOrder.id, tenPct);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-amber-900/50 border border-zinc-700 text-[10px] font-mono font-bold text-zinc-200 hover:text-amber-300 transition"
                  >
                    10% (₹{Math.round(Number(selectedOrder.subtotal) * 0.1)})
                  </button>
                  {Number(selectedOrder.discount_amount) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAdminDiscount(0);
                        handleUpdateDiscount(selectedOrder.id, 0);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-800 text-[10px] font-bold transition ml-auto"
                    >
                      Remove Discount
                    </button>
                  )}
                </div>
              </div>

              {/* Invoice Download Action */}
              <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                <a
                  href={`/api/orders/${selectedOrder.id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold flex items-center gap-2 transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Invoice (PDF)</span>
                </a>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs"
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
