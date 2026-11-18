import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ variant = 'unified', size = 'default', showTagline = true }) {
  const isTees = variant === 'tees';
  const isSurprise = variant === 'surprise';

  const symbolClass = size === 'large' ? 'w-10 h-10 sm:w-12 sm:h-12' : size === 'small' ? 'w-7 h-7' : 'w-8 h-8 sm:w-10 sm:h-10';
  const textClass = size === 'large' ? 'text-xl sm:text-2xl' : size === 'small' ? 'text-base sm:text-lg' : 'text-base sm:text-xl';

  return (
    <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group select-none min-w-0 flex-shrink-0">
      {/* Official Uploaded N-Shaped Logo Symbol */}
      <div className={`relative ${symbolClass} flex-shrink-0 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center`}>
        <img
          src="/images/nanova-symbol.png"
          alt="NANOVA Logo"
          className="w-full h-full object-contain rounded-lg filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)]"
        />
      </div>

      <div className="flex flex-col min-w-0">
        {isTees && (
          <>
            <span className={`font-syne font-black tracking-wider text-white leading-tight truncate ${textClass}`}>
              NANOVA <span className="text-zinc-400 font-bold">TEES</span>
            </span>
            {showTagline && (
              <span className="hidden sm:block text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.18em] text-zinc-400 truncate">
                WEAR YOUR VIBE.
              </span>
            )}
          </>
        )}

        {isSurprise && (
          <>
            <span className={`font-outfit font-black tracking-wider gold-gradient-text leading-tight truncate ${textClass}`}>
              SURPRISE <span className="text-amber-200">NANOVA</span>
            </span>
            {showTagline && (
              <span className="hidden sm:block text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.15em] text-amber-300/80 truncate">
                MAKE EVERY MOMENT SPECIAL.
              </span>
            )}
          </>
        )}

        {variant === 'unified' && (
          <>
            <span className={`font-syne font-black tracking-widest text-white leading-tight truncate ${textClass}`}>
              NANOVA
            </span>
            {showTagline && (
              <span className="hidden sm:block text-[9px] uppercase font-bold tracking-[0.22em] text-zinc-400 truncate">
                DUAL BRAND PLATFORM
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  );
}
