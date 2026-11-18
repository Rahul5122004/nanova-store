import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Shield, Truck, Phone, Sparkles, Shirt, Sun, Moon } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import Logo from './Logo';

export default function Navbar({ onOpenCart }) {
  const { totalItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { teesAnnouncement, giftsAnnouncement } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isTeesStore = location.pathname.startsWith('/tees');
  const isGiftsStore = location.pathname.startsWith('/gifts');

  let activeBrandVariant = 'unified';
  if (isTeesStore) activeBrandVariant = 'tees';
  if (isGiftsStore) activeBrandVariant = 'surprise';

  // Dynamic Announcement based on current storefront
  let currentAnnouncement = '✨ Welcome to NANOVA • Premium Dual-Brand Platform';
  if (isTeesStore && teesAnnouncement) {
    currentAnnouncement = `👕 ${teesAnnouncement}`;
  } else if (isGiftsStore && giftsAnnouncement) {
    currentAnnouncement = `🎁 ${giftsAnnouncement}`;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0c11] border-b border-zinc-800 text-white shadow-xl transition-colors">
      {/* Top Announcement Bar */}
      <div className="bg-[#14141c] border-b border-zinc-800 text-[10px] sm:text-[11px] text-zinc-300 py-1.5 px-3 sm:px-4 text-center flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 transition-colors">
        <span className="truncate max-w-full">{currentAnnouncement}</span>
        <span className="hidden lg:inline text-zinc-600">•</span>
        <span className="hidden lg:inline">
          Free Express Delivery on orders above <strong className="text-white font-bold">₹999</strong>
        </span>
        <span className="hidden sm:inline text-zinc-600">•</span>
        <Link to="/track-order" className="underline font-semibold text-zinc-200 hover:text-white transition whitespace-nowrap">
          Track Your Order
        </Link>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo with Dynamic Theme */}
        <Logo variant={activeBrandVariant} />

        {/* Dual Brand Switcher & Nav Links (Laptop & Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-[#14141c] rounded-full border border-zinc-800 shadow-inner flex-shrink-0">
          <Link
            to="/"
            className={`px-3.5 xl:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
              location.pathname === '/'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            Home Gateway
          </Link>

          <Link
            to="/tees"
            className={`flex items-center gap-1.5 px-3.5 xl:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
              isTeesStore
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>NANOVA TEES</span>
          </Link>

          <Link
            to="/gifts"
            className={`flex items-center gap-1.5 px-3.5 xl:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
              isGiftsStore
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-md shadow-amber-500/20'
                : 'text-amber-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SURPRISE NANOVA</span>
          </Link>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Order Tracking */}
          <Link
            to="/track-order"
            className="hidden sm:flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white bg-[#181824] hover:bg-zinc-800 border border-zinc-700 transition whitespace-nowrap"
            title="Track Order"
          >
            <Truck className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden xl:inline">Track Order</span>
          </Link>

          {/* Contact Direct */}
          <Link
            to="/contact"
            className="hidden sm:flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white bg-[#181824] hover:bg-zinc-800 border border-zinc-700 transition whitespace-nowrap"
            title="Contact Us"
          >
            <Phone className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden xl:inline">Contact</span>
          </Link>

          {/* Shopping Cart Button with Item Counter */}
          <button
            onClick={onOpenCart}
            className="relative p-2 sm:p-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition shadow-md active:scale-95"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-black animate-scale-up">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile & Tablet Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-300 hover:text-white bg-[#181824] border border-zinc-700"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c0c11] border-b border-zinc-800 px-4 pt-3 pb-6 space-y-3 shadow-2xl text-white">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-zinc-800">
            <Link
              to="/tees"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-extrabold text-xs shadow-sm"
            >
              <Shirt className="w-4 h-4" />
              <span>NANOVA TEES</span>
            </Link>
            <Link
              to="/gifts"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-black font-extrabold text-xs shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>SURPRISE NANOVA</span>
            </Link>
          </div>

          <div className="flex flex-col gap-2 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Home Gateway
            </Link>
            <Link
              to="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-zinc-400" />
              <span>Track Your Order</span>
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-zinc-400" />
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
