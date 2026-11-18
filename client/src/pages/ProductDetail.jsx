import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, ShieldCheck, Truck, RefreshCw, Sparkles, Shirt, AlertTriangle, PhoneCall } from 'lucide-react';
import ProductImageViewer from '../components/storefront/ProductImageViewer';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function ProductDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getBrand } = useSettings();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${idOrSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.product) {
          setProduct(data.product);
          // Default to first variant with stock, or first variant
          const inStockVar = data.product.variants?.find((v) => Number(v.stock_quantity) > 0);
          setSelectedVariant(inStockVar || data.product.variants?.[0] || null);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Loading 3D Product Studio...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Product Not Found</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">The requested product could not be located in our catalog.</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-bold rounded-full">
          Back to Store
        </Link>
      </div>
    );
  }

  const isTees = product.brand_code === 'nanova_tees' || product.brand_id === 1;
  const isSurprise = product.brand_code === 'surprise_nanova' || product.brand_id === 2;

  // Exact stock isolation for selected variant
  const availableStock = selectedVariant ? Number(selectedVariant.stock_quantity) : 0;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock || !selectedVariant) return;
    addToCart(product, selectedVariant, quantity, customNote);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock || !selectedVariant) return;
    addToCart(product, selectedVariant, quantity, customNote);
    navigate('/checkout');
  };

  // WhatsApp Quick Order URL with Live Business Contact
  const brand = getBrand(product.brand_code || product.brand_id);
  const rawPhone = brand.whatsapp || brand.phone || (isTees ? '6382092001' : '8903541632');
  const brandPhone = rawPhone.replace(/\D/g, '');
  const whatsappMsg = `Hello ${isTees ? 'Nanova Tees' : 'Surprise Nova'}, I want to order "${product.name}" ${selectedVariant ? `(Size: ${selectedVariant.size})` : ''} for ₹${Number(product.selling_price).toFixed(0)}.`;
  const whatsappUrl = `https://wa.me/91${brandPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  // Unique sizes and colors list from variants
  const uniqueSizes = Array.from(new Set(product.variants?.map((v) => v.size) || []));
  const uniqueColors = Array.from(new Set(product.variants?.map((v) => v.color) || []));

  return (
    <div className="min-h-screen py-10 bg-transparent text-zinc-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Back */}
        <Link
          to={isTees ? '/tees' : '/gifts'}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {isTees ? 'NANOVA TEES' : 'SURPRISE NANOVA'}</span>
        </Link>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column: Real High-Definition Product Photo Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <ProductImageViewer
              frontImage={product.front_image}
              backImage={product.back_image}
              productName={product.name}
              isTees={isTees}
            />

            {/* Hint Under Viewer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-zinc-500 px-2">
              <span className="flex items-center gap-1.5 font-medium">
                100% Real Studio Photography • Exact Front &amp; Back Garment Views
              </span>
              <span className="font-bold text-zinc-800">Verified Quality</span>
            </div>
          </div>

          {/* Right Column: Product Info & Variant Selectors (Interior Dark Component) */}
          <div className="lg:col-span-5 bg-[#111116] border border-zinc-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl space-y-5 sm:space-y-6 text-white transition-colors">
            <div>
              {/* Brand Indicator */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                {isTees ? (
                  <span className="text-zinc-300 flex items-center gap-1">
                    <Shirt className="w-3.5 h-3.5" /> NANOVA TEES • WEAR YOUR VIBE.
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> SURPRISE NANOVA • MAKE EVERY MOMENT SPECIAL.
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black font-syne text-white tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Price & SKU */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-white font-outfit">
                  ₹{Number(product.selling_price).toFixed(0)}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  SKU: {selectedVariant?.sku || product.sku}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/80 pt-4">
              {product.description}
            </p>

            {/* SIZE SELECTION MATRIX - EXACT STOCK ISOLATION */}
            {uniqueSizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-300 uppercase tracking-wider">
                    Select Size: <strong className="text-white">{selectedVariant?.size}</strong>
                  </span>
                  <span className="text-zinc-400 font-medium text-[11px]">
                    Size-wise Inventory Isolation
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {uniqueSizes.map((s) => {
                    const v = product.variants?.find((item) =>
                      item.size === s && (!selectedVariant || item.color === selectedVariant.color)
                    ) || product.variants?.find((item) => item.size === s);

                    const stockQty = v ? Number(v.stock_quantity) : 0;
                    const isSelected = selectedVariant?.size === s;
                    const isOut = stockQty <= 0;

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => v && setSelectedVariant(v)}
                        disabled={isOut}
                        className={`py-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition border ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-md'
                            : isOut
                            ? 'bg-zinc-950/80 text-zinc-600 border-zinc-800/40 line-through cursor-not-allowed'
                            : 'bg-zinc-900/90 text-zinc-300 border-zinc-700/80 hover:border-zinc-500 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{s}</span>
                        <span className="text-[9px] font-semibold opacity-75">
                          {isOut ? 'Out' : `${stockQty} left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COLOUR SELECTION */}
            {uniqueColors.length > 1 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Select Colour: <strong className="text-white">{selectedVariant?.color}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((c) => {
                    const match = product.variants?.find((item) => item.color === c);
                    const isSelected = selectedVariant?.color === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => match && setSelectedVariant(match)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition ${
                          isSelected
                            ? 'bg-zinc-800 text-white border-zinc-400 shadow-sm'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: match?.color_hex || '#000000' }}
                        />
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STOCK STATUS BOX */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Available Inventory for selected variant:</span>
              {isOutOfStock ? (
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
                </span>
              ) : availableStock <= 5 ? (
                <span className="text-amber-400 font-bold">
                  Low Stock: Only {availableStock} remaining!
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {availableStock} in stock (Ready to dispatch)
                </span>
              )}
            </div>

            {/* Customization Details Input (for personalized tees / gift hampers) */}
            {(product.customization_allowed === 1 || product.customization_placeholder) && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personalization Note (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder={product.customization_placeholder || 'Enter recipient name, anniversary date, or custom quote...'}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full glass-input p-3 text-xs rounded-xl shadow-sm text-white"
                />
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-zinc-700 rounded-xl bg-zinc-900 px-2 py-1 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2 py-1 text-zinc-400 hover:text-white font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={quantity >= availableStock}
                    className="px-2 py-1 text-zinc-400 hover:text-white font-bold disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md ${
                    addedToast
                      ? 'bg-emerald-500 text-white'
                      : isOutOfStock
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'bg-white hover:bg-zinc-200 text-black font-extrabold'
                  }`}
                >
                  {addedToast ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>{addedToast ? 'Added to Bag!' : isOutOfStock ? 'Currently Unavailable' : 'Add to Shopping Bag'}</span>
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-lg ${
                  isOutOfStock
                    ? 'hidden'
                    : isSurprise
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700'
                }`}
              >
                Instant Buy with UPI QR / COD
              </button>

              {/* Direct Order on WhatsApp Button (Like in customer's screenshot) */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white transition active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Guarantee Pills */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-zinc-300" /> Express Dispatch Across India
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" /> 100% Quality Inspected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
