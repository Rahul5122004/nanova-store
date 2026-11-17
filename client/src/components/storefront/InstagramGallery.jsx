import React, { useState, useEffect } from 'react';
import { Instagram, ArrowUpRight, Heart, Shirt, Sparkles } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function InstagramGallery() {
  const { teesBrand, giftsBrand } = useSettings();
  const [moments, setMoments] = useState([]);

  const defaultPosts = [
    { id: 1, title: 'Cyber Nova Heavyweight Streetwear Drop', likes_count: '1.2k', brand_name: teesBrand.name, image_url: '/images/products/tee-cyber-front.png', instagram_url: teesBrand.instagram_url },
    { id: 2, title: 'Golden Birthday Keepsake Luxury Hamper', likes_count: '2.4k', brand_name: giftsBrand.name, image_url: '/images/products/gift-box-gold.png', instagram_url: giftsBrand.instagram_url },
    { id: 3, title: 'Wear Your Vibe Monochrome Heavy Drop', likes_count: '980', brand_name: teesBrand.name, image_url: '/images/products/tee-vibe-front.png', instagram_url: teesBrand.instagram_url },
    { id: 4, title: 'Eternal Love Velvet Couple Memory Box', likes_count: '3.1k', brand_name: giftsBrand.name, image_url: '/images/products/gift-box-couple.png', instagram_url: giftsBrand.instagram_url },
    { id: 5, title: 'Custom Signature Initial Drop', likes_count: '840', brand_name: teesBrand.name, image_url: '/images/products/tee-custom-front.png', instagram_url: teesBrand.instagram_url },
    { id: 6, title: '4-Tier Exploding Photo Surprise Box', likes_count: '1.9k', brand_name: giftsBrand.name, image_url: '/images/products/gift-box-explode.png', instagram_url: giftsBrand.instagram_url }
  ];

  useEffect(() => {
    fetch('/api/gallery?activeOnly=true')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.moments && data.moments.length > 0) {
          setMoments(data.moments);
        } else {
          setMoments(defaultPosts);
        }
      })
      .catch(() => setMoments(defaultPosts));
  }, []);

  const displayList = moments.length > 0 ? moments : defaultPosts;

  return (
    <section className="py-20 relative overflow-hidden bg-transparent border-t border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-pink-600 tracking-wider uppercase mb-2">
              <Instagram className="w-4 h-4" />
              <span>OFFICIAL SOCIAL COMMUNITY</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-950 font-syne tracking-tight">
              COMMUNITY &amp; MOMENTS GALLERY
            </h2>
          </div>

          {/* Follow Both Official Instagram Handles */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={teesBrand.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-bold transition shadow-md group"
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>{teesBrand.instagram_handle}</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href={giftsBrand.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black transition shadow-md group"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{giftsBrand.instagram_handle}</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayList.slice(0, 6).map((post) => {
            const isTees = post.brand_id === 1 || post.brand_name?.toLowerCase().includes('tees');
            const targetUrl = post.instagram_url || (isTees 
              ? 'https://www.instagram.com/nanova_tees?utm_source=qr&psln=MXd1OXo3Z21rZmh1bQ==' 
              : 'https://www.instagram.com/surprise_nanova?utm_source=qr&srtk=aWowazJlY3lzeGx1');

            return (
              <a
                key={post.id}
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden bg-[#111116] border border-zinc-800 shadow-md block"
              >
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isTees ? 'text-zinc-300' : 'text-amber-300'}`}>
                    {isTees ? 'NANOVA TEES' : 'SURPRISE NANOVA'}
                  </span>
                  <p className="text-xs font-bold line-clamp-1">{post.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-300 mt-1">
                    <span className="flex items-center gap-1 font-bold">
                      <Heart className="w-3 h-3 text-red-400 fill-red-400" /> {post.likes_count || '1.2k'}
                    </span>
                    <span className="flex items-center gap-1 text-pink-400 font-semibold">
                      <Instagram className="w-3 h-3" /> Visit
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
