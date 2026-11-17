import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Download, Printer, Truck, ArrowRight, ShieldCheck, Phone, MessageCircle } from 'lucide-react';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [orderData, setOrderData] = useState(location.state?.order || null);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    if (!orderData) {
      fetch(`/api/orders/track/${orderNumber}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrderData(data.order);
          }
        })
        .catch(() => {});
    }
  }, [orderNumber]);

  return (
    <div className="min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4 glass-panel p-8 sm:p-12 rounded-3xl border border-zinc-800 text-center space-y-8 shadow-2xl animate-scaleUp">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            Order Placed Successfully
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-syne text-white tracking-tight">
            THANK YOU FOR YOUR ORDER!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Your order has been recorded in our centralized enterprise automation system. We are reviewing your payment verification.
          </p>
        </div>

        {/* Order ID Badge Box */}
        <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Your Unique Order ID
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-widest">
            {orderNumber}
          </span>
          <p className="text-[11px] text-zinc-400">
            Payment Status:{' '}
            <strong className="text-amber-400 font-bold uppercase">
              {orderData?.payment_status || 'PENDING VERIFICATION'}
            </strong>
          </p>
        </div>

        {/* Action Buttons: Invoice Download / Print */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {orderData?.id && (
            <>
              <a
                href={`/api/orders/${orderData.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download Bill &amp; Thank You Card (PDF)</span>
              </a>

              <a
                href={`/api/orders/${orderData.id}/thank-you-card`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-lg"
              >
                <span>View Thank You Card (PDF)</span>
              </a>
            </>
          )}

          <Link
            to={`/track-order?orderNumber=${orderNumber}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Progress</span>
          </Link>
        </div>

        {/* Owner Contact info for this order */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Invoice Generated</span>
          </span>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white font-bold hover:underline">
              Return to Store →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
