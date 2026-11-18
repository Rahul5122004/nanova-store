import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shirt, Sparkles, CheckCircle2, Eye, Flame, Heart } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function Hero3DScene() {
  const { homeHeroTitle, homeHeroSubtitle, teesBrand, giftsBrand } = useSettings();
  // Tees showcase active selection
  const [activeTeeIdx, setActiveTeeIdx] = useState(0);
  const teeItems = [
    {
      title: 'Captain America Iconic Style',
      subtitle: 'Wear Your Fandom • Vibranium Shield & Back Portrait',
      price: '₹799',
      image: '/images/products/tee-captain-america.jpg',
      badge: 'Bestseller Streetwear'
    },
    {
      title: 'Spider-Man Wear The Legend',
      subtitle: 'More Than A Hero • Chest Emblem & Upside-Down Back Art',
      price: '₹799',
      image: '/images/products/tee-spiderman.jpg',
      badge: 'Marvel Drop'
    }
  ];

  // Gifts showcase active selection
  const [activeGiftIdx, setActiveGiftIdx] = useState(0);
  const giftItems = [
    {
      title: 'Customised Coffee Cup',
      subtitle: 'Name or Photo Print • Make Every Sip Feel Special',
      price: '₹349',
      image: '/images/products/gift-custom-mug.jpg',
      badge: 'Top Customer Pick'
    },
    {
      title: 'Temperature Water Bottle',
      subtitle: 'Touch LED Temp Display • Insulated Hot & Cold',
      price: '₹399',
      image: '/images/products/gift-temp-bottle.jpg',
      badge: 'Smart Gifting'
    },
    {
      title: 'Spotify Photo Keychain',
      subtitle: 'Scannable Song Barcode • High-Grade Acrylic',
      price: '₹99',
      image: '/images/products/gift-spotify-keychain.jpg',
      badge: 'Only ₹99'
    },
    {
      title: 'Panda Doll with Name',
      subtitle: 'Warm Soft Glow Night Light • Engraved Name',
      price: '₹140',
      image: '/images/products/gift-panda-lamp.jpg',
      badge: 'Cute Keepsake'
    },
    {
      title: 'Customized Leather Wallet',
      subtitle: 'Photo Engraved • Brass Metal Nameplate',
      price: '₹449',
      image: '/images/products/gift-custom-wallet.jpg',
      badge: 'Luxury Box'
    }
  ];

  const currentTee = teeItems[activeTeeIdx];
  const currentGift = giftItems[activeGiftIdx];

  return (
    <div className="relative w-full pt-6 pb-12 sm:pt-10 sm:pb-20 overflow-hidden transition-colors">
      {/* Background Ambience Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] sm:text-xs font-semibold text-zinc-800 shadow-sm max-w-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
            <span className="truncate">Original N Brand Identity • Two Specialized Stores</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black font-syne text-zinc-950 tracking-tight leading-[1.12] uppercase break-words">
            {homeHeroTitle}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-zinc-600 max-w-xl mx-auto font-medium px-2">
            {homeHeroSubtitle}
          </p>
        </div>

        {/* Dual Interactive Showcase Split (Interior Dark Cards on Pure White Page) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* SECTION 1: NANOVA TEES */}
          <div className="bg-[#0c0c11] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col justify-between border border-zinc-800 relative group hover:border-zinc-700 transition-all duration-300 shadow-2xl text-white">
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-zinc-800 border border-zinc-700 text-white shadow-md flex-shrink-0">
                    <Shirt className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-syne font-black text-lg sm:text-2xl text-white tracking-wide truncate">
                      {teesBrand.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs uppercase font-extrabold tracking-[0.16em] text-zinc-400 truncate">
                      {teesBrand.tagline}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700 flex-shrink-0">
                  <Flame className="w-3 h-3 text-red-400" />
                  <span>STREETWEAR DROP</span>
                </span>
              </div>

              {/* Product Photo Showcase */}
              <div className="relative rounded-2xl overflow-hidden bg-[#161622] border border-zinc-800/80 aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center p-3 my-3">
                <img
                  src={currentTee.image}
                  alt={currentTee.title}
                  className="w-full h-full object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-105"
                />

                {/* Badges on Image */}
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-white border border-zinc-700 shadow-md">
                  {currentTee.badge}
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-white text-black px-2.5 sm:px-3 py-1 rounded-full text-xs font-black shadow-lg">
                  {currentTee.price}
                </div>
              </div>

              {/* Quick Switcher Between Tees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                {teeItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTeeIdx(idx)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 border min-w-0 ${
                      activeTeeIdx === idx
                        ? 'bg-white text-black border-white shadow-md'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                    <span className="text-[10px] font-mono opacity-80 flex-shrink-0">{item.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 sm:mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-200 flex-shrink-0" /> Exact Front &amp; Back Prints
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-200 flex-shrink-0" /> S to XXL Sizes In Stock
                </span>
              </div>

              <Link
                to="/tees"
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-xl"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* SECTION 2: SURPRISE NANOVA */}
          <div className="bg-gradient-to-b from-[#18111e] to-[#0d0912] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col justify-between border border-amber-900/50 relative group hover:border-amber-700/60 transition-all duration-300 shadow-2xl text-white">
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-amber-500 text-black shadow-md flex-shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-outfit font-black text-lg sm:text-2xl gold-gradient-text tracking-wide truncate">
                      {giftsBrand.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs uppercase font-extrabold tracking-[0.14em] text-amber-400 truncate">
                      {giftsBrand.tagline}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 flex-shrink-0">
                  <Heart className="w-3 h-3 text-amber-400" />
                  <span>CURATED GIFTS</span>
                </span>
              </div>

              {/* Product Photo Showcase */}
              <div className="relative rounded-2xl overflow-hidden bg-[#18121f] border border-amber-900/40 aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center p-3 my-3">
                <img
                  src={currentGift.image}
                  alt={currentGift.title}
                  className="w-full h-full object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-105"
                />

                {/* Badges on Image */}
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-amber-300 border border-amber-800/60 shadow-md">
                  {currentGift.badge}
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black px-2.5 sm:px-3 py-1 rounded-full text-xs font-black shadow-lg">
                  {currentGift.price}
                </div>
              </div>

              {/* Quick Thumbnails Carousel */}
              <div className="grid grid-cols-5 gap-1.5 mt-3">
                {giftItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveGiftIdx(idx)}
                    className={`relative rounded-xl overflow-hidden aspect-square border transition p-1 bg-[#140e1a] ${
                      activeGiftIdx === idx
                        ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-md scale-105'
                        : 'border-zinc-800 hover:border-amber-800/60 opacity-70 hover:opacity-100'
                    }`}
                    title={`${item.title} (${item.price})`}
                  >
                    <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 sm:mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-200/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> Bespoke Personalization
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> Direct WhatsApp Ordering
                </span>
              </div>

              <Link
                to="/gifts"
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-xl shadow-amber-500/25"
              >
                <span>EXPLORE GIFTS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
