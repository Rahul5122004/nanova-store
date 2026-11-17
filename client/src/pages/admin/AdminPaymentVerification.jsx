import React, { useState, useEffect } from 'react';
import { CheckSquare, Check, X, Eye, ExternalLink, AlertCircle, Clock } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminPaymentVerification() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingScreenshot, setViewingScreenshot] = useState(null);

  const loadPendingPayments = () => {
    setLoading(true);
    fetch('/api/payments/pending', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPayments(d.payments || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPendingPayments();
  }, [token]);

  const handleVerify = async (paymentId, action) => {
    let rejectionReason = '';
    if (action === 'REJECT') {
      rejectionReason = window.prompt('Enter rejection reason for customer:') || 'Payment proof verification failed.';
    }

    try {
      const res = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, rejection_reason: rejectionReason })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      loadPendingPayments();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">
            Manual Payment Verification Queue
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Review customer UPI reference / UTR numbers and payment screenshots before approving order confirmation.
          </p>
        </div>

        <div className="glass-panel rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="bg-zinc-100/90 dark:bg-zinc-900/90 text-[11px] uppercase font-bold text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Amount to Verify</th>
                  <th className="py-3 px-4">UPI UTR / Reference ID</th>
                  <th className="py-3 px-4">Screenshot Proof</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-medium">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-zinc-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-400 dark:text-zinc-600" />
                      <span>All UPI payments have been verified! No pending transactions.</span>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-white">#{p.order_number}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-zinc-900 dark:text-white block">{p.customer_name}</span>
                        <span className="text-[10px] text-zinc-500">{p.customer_phone}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">{p.brand_name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-white text-sm">
                        ₹{Number(p.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-300 font-bold">
                        {p.upi_ref_id || <span className="text-zinc-400 italic">Not entered</span>}
                      </td>
                      <td className="py-3 px-4">
                        {p.screenshot_url ? (
                          <button
                            onClick={() => setViewingScreenshot(p.screenshot_url)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-semibold transition shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span>View Image</span>
                          </button>
                        ) : (
                          <span className="text-zinc-400 text-[11px] italic">No image file</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleVerify(p.id, 'APPROVE')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition active:scale-95 shadow-sm"
                        >
                          Approve Payment
                        </button>
                        <button
                          onClick={() => handleVerify(p.id, 'REJECT')}
                          className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 dark:bg-zinc-800 dark:hover:bg-red-950 dark:text-red-400 font-bold text-xs transition active:scale-95"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Screenshot Viewer Modal */}
        {viewingScreenshot && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0f0f14] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-zinc-900 dark:text-zinc-100">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">Customer UPI Payment Screenshot</span>
                <button onClick={() => setViewingScreenshot(null)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-96 overflow-auto rounded-xl bg-zinc-50 dark:bg-zinc-950 p-2 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                <img src={viewingScreenshot} alt="Payment Screenshot" className="max-w-full max-h-88 object-contain" />
              </div>
              <div className="text-right">
                <button
                  onClick={() => setViewingScreenshot(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs rounded-xl transition"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
