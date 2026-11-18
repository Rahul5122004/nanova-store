import React from 'react';
import { Phone, MessageCircle, Instagram, Clock, ShieldCheck, Shirt, Sparkles } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function ContactSection() {
  const { teesBrand, giftsBrand, contactEmail } = useSettings();

  const cleanPhone = (p) => (p || '').replace(/\D/g, '');

  const teesPhoneDigits = cleanPhone(teesBrand.phone);
  const teesWaDigits = cleanPhone(teesBrand.whatsapp) || teesPhoneDigits;

  const giftsPhoneDigits = cleanPhone(giftsBrand.phone);
  const giftsWaDigits = cleanPhone(giftsBrand.whatsapp) || giftsPhoneDigits;

  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-[0.25em] text-zinc-500">
            DIRECT CUSTOMER SUPPORT
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-syne text-zinc-950 tracking-tight mt-2 mb-3 sm:mb-4">
            WE ARE HERE FOR YOU
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600">
            Reach out directly for order assistance, sizing guidance, custom t-shirt prints, or bespoke surprise gift hampers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Card 1: Nanova Tees (Interior Dark Component) */}
          <div className="bg-[#111116] border border-zinc-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 relative overflow-hidden shadow-2xl text-white group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white flex-shrink-0">
                <Shirt className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-syne font-black text-lg sm:text-xl text-white truncate">{teesBrand.name}</h3>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 truncate">{teesBrand.tagline}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Streetwear apparel inquiries, bulk orders, size consultations, and custom print requests.
            </p>

            <div className="space-y-2.5 sm:space-y-3 pt-2">
              <a
                href={`tel:${teesPhoneDigits}`}
                className="w-full py-3 sm:py-3.5 px-3.5 sm:px-5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs flex items-center justify-between gap-2 transition shadow-lg active:scale-95"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Call {teesBrand.phone}</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider flex-shrink-0">Direct Call</span>
              </a>

              <a
                href={`https://wa.me/91${teesWaDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 sm:py-3.5 px-3.5 sm:px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 font-bold text-xs flex items-center justify-between gap-2 transition active:scale-95"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">WhatsApp {teesBrand.whatsapp}</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold flex-shrink-0">Chat Now →</span>
              </a>

              <a
                href={teesBrand.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3.5 sm:px-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 font-bold text-xs flex items-center justify-between gap-2 transition"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Instagram className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span className="truncate">Instagram: {teesBrand.instagram_handle}</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 flex-shrink-0">Follow ↗</span>
              </a>
            </div>
          </div>

          {/* Card 2: Surprise Nanova (Interior Dark Component) */}
          <div className="bg-gradient-to-b from-[#18111e] to-[#0d0912] border border-amber-900/50 p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 relative overflow-hidden shadow-2xl text-white group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-950/60 border border-amber-700/60 flex items-center justify-center text-amber-300 flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-outfit font-black text-lg sm:text-xl text-amber-200 truncate">{giftsBrand.name}</h3>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 truncate">{giftsBrand.tagline}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Curated surprise boxes, personalized photo keepsakes, anniversary hampers &amp; milestone celebrations.
            </p>

            <div className="space-y-2.5 sm:space-y-3 pt-2">
              <a
                href={`tel:${giftsPhoneDigits}`}
                className="w-full py-3 sm:py-3.5 px-3.5 sm:px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center justify-between gap-2 transition shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Call {giftsBrand.phone}</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider flex-shrink-0">Direct Call</span>
              </a>

              <a
                href={`https://wa.me/91${giftsWaDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 sm:py-3.5 px-3.5 sm:px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 font-bold text-xs flex items-center justify-between gap-2 transition active:scale-95"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">WhatsApp {giftsBrand.whatsapp}</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold flex-shrink-0">Chat Now →</span>
              </a>

              <a
                href={giftsBrand.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3.5 sm:px-5 rounded-2xl bg-[#1e1321] hover:bg-[#28182d] text-amber-200 hover:text-white border border-amber-900/60 font-bold text-xs flex items-center justify-between gap-2 transition"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Instagram className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span className="truncate">Instagram: {giftsBrand.instagram_handle}</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-amber-400 flex-shrink-0">Follow ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Support Note */}
        <div className="mt-12 text-center text-zinc-500 text-xs flex flex-wrap items-center justify-center gap-6">
          <span className="flex items-center gap-1.5 font-bold text-zinc-700">
            ✉ Email: <a href={`mailto:${contactEmail}`} className="text-zinc-900 hover:underline">{contactEmail}</a>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" /> Monday - Sunday: 9:00 AM - 10:00 PM IST
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> Fast Response via WhatsApp &amp; Phone
          </span>
        </div>
      </div>
    </section>
  );
}
