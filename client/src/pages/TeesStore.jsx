import React, { useState, useEffect } from 'react';
import { Search, Filter, Shirt, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import ProductCard from '../components/storefront/ProductCard';

export default function TeesStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState('ALL');

  const categories = [
    { id: 'ALL', name: 'All Collections' },
    { id: 'oversized-tees', name: 'Oversized T-Shirts' },
    { id: 'regular-fit-tees', name: 'Regular Fit T-Shirts' },
    { id: 'printed-tees', name: 'Printed T-Shirts' },
    { id: 'custom-tees', name: 'Custom T-Shirts' },
    { id: 'new-arrivals-tees', name: 'New Arrivals' },
    { id: 'best-sellers-tees', name: 'Best Sellers' }
  ];

  const sizes = ['ALL', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    setLoading(true);
    let url = '/api/products?brand=nanova_tees';
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

  // Client-side size filter
  const filteredProducts = products.filter((p) => {
    if (selectedSize === 'ALL') return true;
    return p.variants?.some((v) => v.size === selectedSize && Number(v.stock_quantity) > 0);
  });

  return (
    <div className="min-h-screen py-6 sm:py-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 overflow-hidden bg-gradient-to-r from-zinc-950 via-[#121217] to-zinc-950 border border-zinc-800 shadow-2xl text-white">
          <div className="max-w-2xl space-y-2.5 sm:space-y-3 relative z-10">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-zinc-400">
              <Shirt className="w-4 h-4 text-white flex-shrink-0" />
              <span>NANOVA TEES • OFFICIAL STOREFRONT</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-syne text-white tracking-tight leading-tight">
              WEAR YOUR VIBE.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              Heavyweight 240+ GSM dropped shoulder silhouettes, bio-washed combed cotton, puff-print graphics, and bespoke custom tees with interactive 3D inspection.
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none w-full lg:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm flex-shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-zinc-950 text-white shadow-md'
                    : 'bg-[#14141c] text-zinc-300 hover:text-white border border-zinc-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input & Size Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto flex-shrink-0">
            <div className="relative flex-1 sm:w-56 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input pl-9 pr-3 py-2 text-xs rounded-xl shadow-sm"
              />
            </div>

            {/* Size Filter Strip */}
            <div className="flex items-center gap-1 bg-[#14141c] border border-zinc-800 p-1 rounded-xl shadow-sm overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-zinc-400 px-2 uppercase flex-shrink-0">Size:</span>
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition flex-shrink-0 ${
                    selectedSize === s
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-zinc-900/40 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-[#111116] rounded-3xl p-8 border border-zinc-800 shadow-xl text-white">
            <Shirt className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No T-shirts match your filter</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Try selecting another category or size, or reset search parameters.
            </p>
            <button
              onClick={() => { setActiveCategory('ALL'); setSelectedSize('ALL'); setSearchQuery(''); }}
              className="mt-4 px-5 py-2.5 bg-white text-black font-bold text-xs rounded-full shadow-lg hover:bg-zinc-200 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
