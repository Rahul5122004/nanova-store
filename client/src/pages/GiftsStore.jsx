import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Gift, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/storefront/ProductCard';

export default function GiftsStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'ALL', name: 'All Gift Collections' },
    { id: 'birthday-gifts', name: 'Birthday Gifts' },
    { id: 'anniversary-gifts', name: 'Anniversary Gifts' },
    { id: 'couple-gifts', name: 'Couple Gifts' },
    { id: 'personalized-gifts', name: 'Personalized Gifts' },
    { id: 'gift-hampers', name: 'Gift Hampers' },
    { id: 'surprise-boxes', name: 'Surprise Boxes' },
    { id: 'customized-gifts', name: 'Customized Gifts' },
    { id: 'special-occasion-gifts', name: 'Special Occasion' }
  ];

  useEffect(() => {
    setLoading(true);
    let url = '/api/products?brand=surprise_nanova';
    if (activeCategory !== 'ALL') {
      url += `&category=${activeCategory}`;
    }
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen py-6 sm:py-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* Luxury Banner (Interior Component) */}
        <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 overflow-hidden bg-gradient-to-r from-[#211728] via-[#16101c] to-[#0f0b13] border border-amber-900/60 shadow-2xl text-white">
          <div className="max-w-2xl space-y-2.5 sm:space-y-3 relative z-10">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>SURPRISE NANOVA • LUXURY GIFTING STUDIO</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-outfit gold-gradient-text tracking-tight leading-tight">
              MAKE EVERY MOMENT SPECIAL.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              Handcrafted surprise hampers, bespoke exploding photo boxes, couple keepsakes, customized milestone gifts, and unforgettable emotional experiences.
            </p>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none w-full lg:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm flex-shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-md shadow-amber-500/20'
                    : 'bg-[#16111d] text-amber-200/90 hover:text-white border border-amber-900/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72 flex-shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-amber-400" />
            <input
              type="text"
              placeholder="Search hampers & surprises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input pl-9 pr-3 py-2 text-xs rounded-xl shadow-sm border-amber-900/40"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-[#16111d]/50 animate-pulse border border-amber-900/30" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-[#140e1b] rounded-3xl p-8 border border-amber-900/40 shadow-2xl text-white">
            <Gift className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-amber-200">No gifts found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Try selecting another category or check back for new custom hampers.
            </p>
            <button
              onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs rounded-full shadow-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
