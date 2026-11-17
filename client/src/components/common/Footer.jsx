import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Instagram, Shield, ArrowUpRight, Shirt, Sparkles } from 'lucide-react';
import Logo from './Logo';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
  const { teesBrand, giftsBrand, contactEmail } = useSettings();

  const cleanPhone = (p) => (p || '').replace(/\D/g, '');
  const teesPhoneDigits = cleanPhone(teesBrand.phone);
  const teesWaDigits = cleanPhone(teesBrand.whatsapp) || teesPhoneDigits;
  const giftsPhoneDigits = cleanPhone(giftsBrand.phone);
  const giftsWaDigits = cleanPhone(giftsBrand.whatsapp) || giftsPhoneDigits;

  return (
    <footer className="bg-[#08080c] border-t border-zinc-800 text-zinc-400 text-xs mt-24 transition-colors">
      {/* Brand Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand Master Identity */}
          <div className="lg:col-span-1 space-y-4">
            <Logo variant="unified" size="large" />
            <p className="text-zinc-400 leading-relaxed text-xs">
              One destination. Two distinct experiences. Premium streetwear fashion and handcrafted surprise gifting united by one visionary standard.
            </p>
            <div className="pt-2 flex items-center gap-2 text-zinc-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All systems fully operational</span>
            </div>
          </div>

          {/* Col 2: Business 1: NANOVA TEES (Interior Dark Component) */}
          <div className="bg-[#101017] p-5 rounded-2xl border border-zinc-800 space-y-3.5 shadow-xl text-white">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white shadow-sm">
                <Shirt className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-syne font-bold text-white text-sm">{teesBrand.name}</h4>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{teesBrand.tagline}</p>
              </div>
            </div>
            <p className="text-[11px] text-zinc-300">
              Heavyweight 240+ GSM dropped shoulder streetwear, custom graphics &amp; high-density puff prints.
            </p>
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <a
                href={`tel:${teesPhoneDigits}`}
                className="flex items-center justify-between text-zinc-300 hover:text-white transition group"
              >
                <span className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-semibold text-white">{teesBrand.phone}</span>
                </span>
                <span className="text-[10px] text-zinc-400 group-hover:text-white">Call Now</span>
              </a>
              <a
                href={`https://wa.me/91${teesWaDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-emerald-400 hover:text-emerald-300 transition font-medium"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 3: Business 2: SURPRISE NANOVA (Interior Dark Component) */}
          <div className="bg-gradient-to-b from-[#18111e] to-[#0f0b14] p-5 rounded-2xl border border-amber-900/50 space-y-3.5 shadow-xl text-white">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-700/60 text-amber-300 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-outfit font-bold text-amber-200 text-sm">{giftsBrand.name}</h4>
                <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">{giftsBrand.tagline}</p>
              </div>
            </div>
            <p className="text-[11px] text-zinc-300">
              Personalized celebration hampers, couple keepsake boxes, exploding albums &amp; bespoke gifts.
            </p>
            <div className="pt-2 border-t border-amber-900/40 space-y-2">
              <a
                href={`tel:${giftsPhoneDigits}`}
                className="flex items-center justify-between text-zinc-300 hover:text-white transition group"
              >
                <span className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-white">{giftsBrand.phone}</span>
                </span>
                <span className="text-[10px] text-zinc-400 group-hover:text-white">Call Now</span>
              </a>
              <a
                href={`https://wa.me/91${giftsWaDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-emerald-400 hover:text-emerald-300 transition font-medium"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 4: Official Social & Quick Links */}
          <div className="space-y-3.5">
            <h4 className="font-bold text-white text-sm">Official Social Hub</h4>
            
            {/* Nanova Tees Instagram */}
            <a
              href={teesBrand.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#101017] border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white transition group shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-zinc-800 text-white shadow-sm">
                <Instagram className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs truncate text-white">{teesBrand.instagram_handle}</span>
                <span className="text-[10px] text-zinc-400">T-Shirts Official Instagram</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white ml-auto" />
            </a>

            {/* Surprise Nanova Instagram */}
            <a
              href={giftsBrand.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#18111e] border border-amber-900/60 hover:border-amber-600 text-zinc-300 hover:text-white transition group shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white shadow-sm">
                <Instagram className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs truncate text-amber-300">{giftsBrand.instagram_handle}</span>
                <span className="text-[10px] text-zinc-400">Gifts Official Instagram</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 group-hover:text-white ml-auto" />
            </a>

            <div className="pt-1 text-[11px] text-zinc-400">
              <span className="block text-zinc-400">Official Business Email:</span>
              <a href={`mailto:${contactEmail}`} className="font-bold text-white hover:text-amber-300 transition">
                {contactEmail}
              </a>
            </div>

            <div className="space-y-1.5 text-xs pt-1 text-zinc-400 border-t border-zinc-800/80">
              <Link to="/track-order" className="block hover:text-white transition">
                • Track Customer Order
              </Link>
              <Link to="/tees" className="block hover:text-white transition">
                • Nanova Tees Storefront
              </Link>
              <Link to="/gifts" className="block hover:text-white transition">
                • Surprise Nanova Storefront
              </Link>
              <Link to="/admin" className="block text-indigo-400 hover:text-indigo-300 font-semibold transition flex items-center gap-1 pt-1">
                <Shield className="w-3 h-3" /> Centralized Admin Panel
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} NANOVA. All rights reserved. Managed by one centralized enterprise.</p>
          <div className="flex items-center gap-6">
            <span>Preserving the Original N Logo Identity</span>
            <span>Live Centralized Business Contacts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
