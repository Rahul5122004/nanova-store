import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Play Harmonic Alert Chime using Browser Web Audio API (Zero external file dependencies)
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 triad
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.5);
      });
    } catch (e) {
      console.warn('[Audio Alert] Not allowed or supported:', e.message);
    }
  };

  useEffect(() => {
    const s = io(window.location.origin, {
      reconnectionAttempts: 5,
      timeout: 5000
    });

    s.on('connect', () => {
      console.log('[Socket] Connected to realtime notification stream');
    });

    s.on('notification:new', (notif) => {
      console.log('[Socket] Received notification:', notif);
      setLiveNotifications((prev) => [notif, ...prev.slice(0, 49)]);
      setUnreadCount((prev) => prev + 1);

      if (notif.soundAlert !== false) {
        playAlertChime();
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const markAllRead = () => {
    setUnreadCount(0);
    fetch('/api/notifications/read-all', { method: 'PUT' }).catch(() => {});
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        liveNotifications,
        unreadCount,
        markAllRead,
        playAlertChime
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
