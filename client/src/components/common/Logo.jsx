import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ variant = 'unified', size = 'default', showTagline = true }) {
  const isTees = variant === 'tees';
  const isSurprise = variant === 'surprise';

  const symbolClass = size === 'large' ? 'w-12 h-12' : size === 'small' ? 'w-7 h-7' : 'w-10 h-10';
  const textClass = size === 'large' ? 'text-2xl' : size === 'small' ? 'text-lg' : 'text-xl';

  return (
    <Link to="/" className="flex items-center gap-2.5 group select-none">
      {/* Official Uploaded N-Shaped Logo Symbol */}
      <div className={`relative ${symbolClass} flex-shrink-0 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center`}>
        <img
          src="/images/nanova-symbol.png"
          alt="NANOVA Logo"
          className="w-full h-full object-contain rounded-lg filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)]"
        />
      </div>

      <div className="flex flex-col">
        {isTees && (
          <>
            <span className={`font-syne font-black tracking-wider text-white ${textClass}`}>
              NANOVA <span className="text-zinc-400 font-bold">TEES</span>
            </span>
            {showTagline && (
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400">
                WEAR YOUR VIBE.
              </span>
            )}
          </>
        )}

        {isSurprise && (
          <>
            <span className={`font-outfit font-black tracking-wider gold-gradient-text ${textClass}`}>
              SURPRISE <span className="text-amber-200">NANOVA</span>
            </span>
            {showTagline && (
              <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-amber-300/80">
                MAKE EVERY MOMENT SPECIAL.
              </span>
            )}
          </>
        )}

        {variant === 'unified' && (
          <>
            <span className={`font-syne font-black tracking-widest text-white ${textClass}`}>
              NANOVA
            </span>
            {showTagline && (
              <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-zinc-400">
                DUAL BRAND PLATFORM
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  );
}
