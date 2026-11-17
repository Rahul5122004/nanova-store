import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const socketContext = useSocket();
  const socket = socketContext?.socket;
  const [brands, setBrands] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.brands)) setBrands(data.brands);
        if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
      }
    } catch (err) {
      console.warn('[SettingsContext] Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Listen to realtime settings update if socket is connected
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      console.log('[SettingsContext] Realtime settings update received');
      fetchSettings();
    };
    socket.on('settings:updated', handleUpdate);
    return () => {
      socket.off('settings:updated', handleUpdate);
    };
  }, [socket, fetchSettings]);

  // Computed brand profiles with robust fallbacks
  const rawTees = brands.find((b) => b.code === 'nanova_tees' || b.id === 1) || {};
  const rawGifts = brands.find((b) => b.code === 'surprise_nanova' || b.id === 2) || {};

  const teesBrand = {
    id: rawTees.id || 1,
    name: rawTees.name || 'NANOVA TEES',
    code: 'nanova_tees',
    tagline: rawTees.tagline || 'WEAR YOUR VIBE.',
    phone: rawTees.phone || '6382092001',
    whatsapp: rawTees.whatsapp || rawTees.phone || '6382092001',
    instagram_handle: rawTees.instagram_handle || '@nanova_tees',
    instagram_url: rawTees.instagram_url || 'https://www.instagram.com/nanova_tees?utm_source=qr&psln=MXd1OXo3Z21rZmh1bQ=='
  };

  const giftsBrand = {
    id: rawGifts.id || 2,
    name: rawGifts.name || 'SURPRISE NANOVA',
    code: 'surprise_nanova',
    tagline: rawGifts.tagline || 'MAKE EVERY MOMENT SPECIAL.',
    phone: rawGifts.phone || '8903541632',
    whatsapp: rawGifts.whatsapp || rawGifts.phone || '8903541632',
    instagram_handle: rawGifts.instagram_handle || '@surprise_nanova',
    instagram_url: rawGifts.instagram_url || 'https://www.instagram.com/surprise_nanova?utm_source=qr&srtk=aWowazJlY3lzeGx1'
  };

  const contactEmail = settings.contact_email || 'novaenterprises003@gmail.com';
  const homeHeroTitle = settings.home_hero_title || 'ONE DESTINATION. TWO DIFFERENT EXPERIENCES.';
  const homeHeroSubtitle = settings.home_hero_subtitle || 'Discover your style. Celebrate your special moments.';
  const teesAnnouncement = settings.nanova_tees_announcement || '';
  const giftsAnnouncement = settings.surprise_nanova_announcement || '';

  const getBrand = (codeOrId) => {
    if (codeOrId === 2 || codeOrId === 'surprise_nanova' || String(codeOrId).toLowerCase().includes('gift')) {
      return giftsBrand;
    }
    return teesBrand;
  };

  return (
    <SettingsContext.Provider
      value={{
        brands,
        settings,
        teesBrand,
        giftsBrand,
        contactEmail,
        homeHeroTitle,
        homeHeroSubtitle,
        teesAnnouncement,
        giftsAnnouncement,
        getBrand,
        loading,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
