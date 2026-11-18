import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Box, RefreshCcw, Sparkles, Shirt, Award } from 'lucide-react';
import Hero3DScene from '../components/3d/Hero3DScene';
import ProductCard from '../components/storefront/ProductCard';
import InstagramGallery from '../components/storefront/InstagramGallery';
import ContactSection from '../components/storefront/ContactSection';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.products) {
          setFeaturedProducts(data.products);
        }
      })
      .catch((e) => console.warn('[Home load error]:', e))
      .finally(() => setLoading(false));
  }, []);

  const teesFeatured = featuredProducts.filter((p) => p.brand_code === 'nanova_tees' || p.brand_id === 1);
  const giftsFeatured = featuredProducts.filter((p) => p.brand_code === 'surprise_nanova' || p.brand_id === 2);

  return (
    <div className="min-h-screen transition-colors">
      {/* 3D Interactive Hero Scene */}
      <Hero3DScene />

      {/* Featured Streetwear Drop: NANOVA TEES */}
      <section className="py-12 sm:py-16 lg:py-20 border-t border-zinc-200/80 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-zinc-600 tracking-wider uppercase mb-1">
                <Shirt className="w-4 h-4 text-zinc-950 flex-shrink-0" />
                <span>NANOVA TEES • WEAR YOUR VIBE.</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-syne text-zinc-950 tracking-tight">
                FEATURED STREETWEAR DROPS
              </h2>
            </div>
            <Link
              to="/tees"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-950 hover:text-zinc-600 transition self-start sm:self-auto"
            >
              <span>View All T-Shirts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {teesFeatured.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 px-4">
              <Shirt className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-800">New Streetwear Drops Curating</p>
              <p className="text-[11px] text-zinc-500 mt-1">Catalog ready for your custom product entries via Admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {teesFeatured.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Gifting Collection: SURPRISE NANOVA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-transparent border-t border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-amber-700 tracking-wider uppercase mb-1">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>SURPRISE NANOVA • MAKE EVERY MOMENT SPECIAL.</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-outfit text-zinc-950 tracking-tight">
                CURATED CELEBRATION HAMPERS
              </h2>
            </div>
            <Link
              to="/gifts"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition self-start sm:self-auto"
            >
              <span>Explore All Gifts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {giftsFeatured.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 px-4">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-800">Handcrafted Gifts Curating</p>
              <p className="text-[11px] text-zinc-500 mt-1">Catalog ready for your custom gift items via Admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {giftsFeatured.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us & Brand Identity */}
      <section className="py-12 sm:py-16 lg:py-20 border-t border-zinc-200/80 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-2.5 sm:space-y-3">
            <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-[0.25em] text-zinc-500">
              BUILT FOR EXCELLENCE
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-syne text-zinc-950 tracking-tight">
              WHY SHOP WITH NANOVA?
            </h2>
            <p className="text-sm text-zinc-600">
              A single platform powering two dedicated storefronts with precision quality control, 3D previews, and verified manual UPI payments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#111116] p-6 rounded-2xl border border-zinc-800 space-y-3 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-cyan-400 shadow-sm">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">3D Garment Inspection</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Interact with products in 3D before buying. Inspect front puff prints and back typography graphics with 360° rotation.
              </p>
            </div>

            <div className="bg-[#111116] p-6 rounded-2xl border border-zinc-800 space-y-3 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Isolated Size Inventories</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every T-shirt size (S, M, L, XL, XXL) has dedicated real-time inventory tracking to prevent overselling.
              </p>
            </div>

            <div className="bg-[#111116] p-6 rounded-2xl border border-zinc-800 space-y-3 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Configurable UPI QR</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Scan and pay via any UPI app (GPay, PhonePe, Paytm). Direct manual verification protects every transaction.
              </p>
            </div>

            <div className="bg-[#111116] p-6 rounded-2xl border border-zinc-800 space-y-3 shadow-xl hover:border-zinc-700 transition text-white">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-purple-400 shadow-sm">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Direct Owner Support</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Instant WhatsApp and phone links directly to the business owner for custom printing and celebration orders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Instagram Gallery */}
      <InstagramGallery />

      {/* Direct Contact Section */}
      <ContactSection />
    </div>
  );
}
