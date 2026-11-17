import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Sparkles, Shirt, Check, PhoneCall, Image as ImageIcon } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { getBrand } = useSettings();
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [addedNotice, setAddedNotice] = useState(false);

  const isTees = product.brand_code === 'nanova_tees' || product.brand_id === 1;
  const isSurprise = product.brand_code === 'surprise_nanova' || product.brand_id === 2;

  const currentStock = selectedVariant ? Number(selectedVariant.stock_quantity) : Number(product.total_stock || 0);
  const isOutOfStock = currentStock <= 0;

  const brand = getBrand(product.brand_code || product.brand_id);
  const rawPhone = brand.whatsapp || brand.phone || (isTees ? '6382092001' : '8903541632');
  const brandPhone = rawPhone.replace(/\D/g, '');

  const whatsappMsg = `Hello ${isTees ? 'Nanova Tees' : 'Surprise Nova'}, I want to order "${product.name}" ${selectedVariant ? `(Size: ${selectedVariant.size})` : ''} for ₹${Number(product.selling_price).toFixed(0)}.`;
  const whatsappUrl = `https://wa.me/91${brandPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || !selectedVariant) return;

    addToCart(product, selectedVariant, 1);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1800);
  };

  return (
    <div className="group relative bg-[#111116] rounded-2xl overflow-hidden border border-zinc-800/90 shadow-md hover:shadow-2xl hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-white">
      <Link to={`/products/${product.slug || product.id}`} className="block relative aspect-[4/5] bg-[#181822] overflow-hidden">
        {/* Product Image */}
        <img
          src={product.front_image}
          alt={product.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_new_arrival === 1 && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white text-black shadow-md">
              New Drop
            </span>
          )}
          {product.is_best_seller === 1 && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md ${
              isSurprise ? 'bg-amber-500 text-black font-extrabold' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
            }`}>
              Best Seller
            </span>
          )}
        </div>

        {/* Real Product Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/80 backdrop-blur-md text-zinc-200 border border-zinc-700/80 shadow-md">
            <ImageIcon className="w-3 h-3 text-emerald-400" />
            <span>HD Photo</span>
          </span>
        </div>

        {/* Hover Quick Action */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <span className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 shadow-2xl scale-95 group-hover:scale-100 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            <span>View Details &amp; Photos</span>
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand Tag */}
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase mb-1.5">
            <span className={isTees ? 'text-zinc-400 flex items-center gap-1 font-semibold' : 'text-amber-400 flex items-center gap-1 font-semibold'}>
              {isTees ? <Shirt className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
              {product.brand_name || (isTees ? 'NANOVA TEES' : 'SURPRISE NANOVA')}
            </span>
            <span className="text-zinc-500">{product.category_name}</span>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.slug || product.id}`}>
            <h3 className="font-bold text-sm text-white hover:text-zinc-300 transition line-clamp-1 mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          {product.description && (
            <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2.5">
              {product.description}
            </p>
          )}

          {/* Available Sizes Matrix Pills */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mb-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                const isVariantOut = Number(v.stock_quantity) <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedVariant(v);
                    }}
                    disabled={isVariantOut}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition border ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-sm'
                        : isVariantOut
                        ? 'bg-zinc-950/70 text-zinc-600 border-zinc-900 line-through'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                    }`}
                    title={`${v.size} (${v.color}) - ${v.stock_quantity} left`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="flex items-baseline justify-between mb-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-white font-outfit">
                ₹{Number(product.selling_price).toFixed(0)}
              </span>
              {product.purchase_cost && (
                <span className="text-[11px] text-zinc-500 line-through">
                  ₹{(Number(product.selling_price) * 1.3).toFixed(0)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400">
              {isOutOfStock ? (
                <span className="text-red-400 font-semibold">Out of Stock</span>
              ) : (
                <span>
                  {currentStock <= 5 ? (
                    <span className="text-amber-400 font-semibold">Only {currentStock} left!</span>
                  ) : (
                    <span>In Stock ({currentStock})</span>
                  )}
                </span>
              )}
            </p>
          </div>

          {/* Action Row: Big "Add to Cart" Button & Quick WhatsApp Icon Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md ${
                addedNotice
                  ? 'bg-emerald-500 text-white'
                  : isOutOfStock
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : isSurprise
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black'
                  : 'bg-white hover:bg-zinc-200 text-black font-black'
              }`}
              title="Add to Shopping Bag"
            >
              {addedNotice ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              <span>{addedNotice ? 'Added to Cart!' : isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center transition active:scale-95 shadow-md flex-shrink-0"
              title="Quick Order on WhatsApp"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
