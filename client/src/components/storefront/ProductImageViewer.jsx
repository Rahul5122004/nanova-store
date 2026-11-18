import React, { useState } from 'react';
import { ZoomIn, Eye, Sparkles, Shirt, FlipHorizontal, Check } from 'lucide-react';

/**
 * High-Definition Real Product Image Viewer
 * Provides smooth zoom, front/back view toggle, thumbnail gallery, and full-resolution inspection.
 */
export default function ProductImageViewer({
  frontImage,
  backImage,
  productName = 'Product',
  isTees = true
}) {
  const [activeImage, setActiveImage] = useState(frontImage);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const hasBackImage = Boolean(backImage && backImage !== frontImage);

  const imagesList = [
    { label: 'Front View', url: frontImage },
    ...(hasBackImage ? [{ label: 'Back View', url: backImage }] : [])
  ];

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="relative w-full bg-[#111116] rounded-3xl border border-zinc-800 p-4 sm:p-6 overflow-hidden shadow-2xl space-y-4">
      {/* Top Floating Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-black/80 backdrop-blur-md text-zinc-200 border border-zinc-700/80 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>HD Studio Photography</span>
          </span>
          {isTees ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-800/90 text-zinc-300 border border-zinc-700">
              <Shirt className="w-3.5 h-3.5" /> 100% Real Garment
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Handcrafted Gift
            </span>
          )}
        </div>

        {hasBackImage && (
          <button
            onClick={() => setActiveImage(activeImage === frontImage ? backImage : frontImage)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-zinc-200 text-black transition active:scale-95 shadow-md"
            title="Switch Front and Back views"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>{activeImage === frontImage ? 'View Back' : 'View Front'}</span>
          </button>
        )}
      </div>

      {/* Main Image Display Box with Interactive Zoom (Desktop hover only so mobile tap doesn't stick zoomed) */}
      <div
        className="relative aspect-square sm:aspect-[4/5] max-h-[420px] sm:max-h-[580px] w-full rounded-2xl overflow-hidden bg-[#181822] border border-zinc-800/80 flex items-center justify-center sm:cursor-crosshair group"
        onMouseEnter={() => {
          if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
            setIsZoomed(true);
          }
        }}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={activeImage}
          alt={productName}
          className={`w-full h-full object-contain p-2 sm:p-4 transition-transform duration-200 ease-out ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                }
              : undefined
          }
        />

        {/* Hover Hint Overlay (Desktop only) */}
        <div className="hidden sm:flex absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-700/80 text-[10px] font-semibold text-zinc-300 pointer-events-none items-center gap-1 opacity-80 group-hover:opacity-100 transition">
          <ZoomIn className="w-3 h-3 text-cyan-400" />
          <span>Hover to Zoom In</span>
        </div>
      </div>

      {/* Thumbnails Gallery Row */}
      {imagesList.length > 1 && (
        <div className="flex items-center gap-3 pt-2">
          {imagesList.map((item, idx) => {
            const isSelected = activeImage === item.url;
            return (
              <button
                key={idx}
                onClick={() => setActiveImage(item.url)}
                className={`relative w-20 h-24 rounded-xl overflow-hidden bg-[#181822] border transition transform active:scale-95 p-1 ${
                  isSelected
                    ? 'border-white ring-2 ring-white/60 shadow-lg scale-105'
                    : 'border-zinc-800 hover:border-zinc-600 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={item.url} alt={item.label} className="w-full h-full object-contain" />
                <span className="absolute bottom-1 inset-x-1 bg-black/80 text-[9px] font-bold text-center py-0.5 rounded text-zinc-200">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
