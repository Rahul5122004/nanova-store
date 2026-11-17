import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, ShieldCheck, Sparkles, Shirt } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer({ isOpen, onClose }) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    coupon,
    applyCoupon,
    removeCoupon,
    deliveryFee,
    finalTotal,
    freeThreshold
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode) return;
    const res = applyCoupon(couponCode);
    setCouponMessage(res);
  };

  const handleProceedCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const remainingForFreeShipping = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0c0c11] border-l border-zinc-800 text-white flex flex-col shadow-2xl animate-slideLeft transition-colors">
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-zinc-300" />
              <h2 className="text-lg font-bold font-syne tracking-wide text-white">Shopping Bag</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="px-5 py-3 bg-[#14141c] border-b border-zinc-800">
            <div className="flex justify-between items-center text-xs font-medium mb-1.5">
              <span className="text-zinc-300">
                {remainingForFreeShipping > 0 ? (
                  <>Add <strong className="text-white">₹{remainingForFreeShipping.toFixed(0)}</strong> more for <strong>FREE Delivery</strong></>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    🎉 You unlocked FREE Delivery!
                  </span>
                )}
              </span>
              <span className="text-zinc-400 font-bold">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <ShoppingBag className="w-16 h-16 text-zinc-700 stroke-1 mb-4" />
                <h3 className="text-base font-bold text-white mb-1">Your bag is empty</h3>
                <p className="text-xs text-zinc-400 mb-6 max-w-xs">
                  Explore high-density streetwear drops from NANOVA TEES or luxury keepsake hampers from SURPRISE NANOVA.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button
                    onClick={() => { onClose(); navigate('/tees'); }}
                    className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition shadow-sm"
                  >
                    Shop NANOVA TEES
                  </button>
                  <button
                    onClick={() => { onClose(); navigate('/gifts'); }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition shadow-sm"
                  >
                    Shop SURPRISE NANOVA
                  </button>
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product_id}-${item.variant_id}`}
                  className="bg-[#14141c] p-3.5 rounded-xl flex gap-3 relative group border border-zinc-800/80 shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-[#1c1c28] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-zinc-700/80 shadow-sm">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Brand Tag */}
                      <div className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase mb-1">
                        {item.brand_code === 'nanova_tees' ? (
                          <span className="text-zinc-400 flex items-center gap-1">
                            <Shirt className="w-3 h-3" /> NANOVA TEES
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> SURPRISE NANOVA
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Size: <strong className="text-zinc-200">{item.size}</strong> • Colour: <strong className="text-zinc-200">{item.color}</strong>
                      </p>
                      {item.custom_note && (
                        <p className="text-[11px] text-amber-300/90 italic truncate mt-0.5">
                          Note: "{item.custom_note}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-zinc-700 rounded-lg bg-[#181822] shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.variant_id, -1)}
                          className="p-1 hover:text-white text-zinc-400 transition"
                          title="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, 1)}
                          disabled={item.quantity >= item.max_stock}
                          className="p-1 hover:text-white text-zinc-400 disabled:opacity-40 transition"
                          title="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Price */}
                      <div className="text-right">
                        <span className="text-sm font-bold text-white">
                          ₹{(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.variant_id)}
                    className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-red-400 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-zinc-800 bg-[#0f0f15] space-y-4">
              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="text-white font-medium">
                    {deliveryFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
                  <span>Final Total</span>
                  <span className="text-base font-extrabold font-outfit">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={handleProceedCheckout}
                className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>UPI QR Payment • Cash on Delivery • Verified Dispatch</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
