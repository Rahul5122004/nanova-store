import React, { useState, useEffect } from 'react';
import { Bell, Check, Volume2, Clock, AlertTriangle, ShoppingBag, ShieldCheck } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function AdminNotifications() {
  const { token } = useAuth();
  const { playAlertChime } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = () => {
    setLoading(true);
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setNotifications(d.notifications || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifs();
  }, [token]);

  const handleMarkAll = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadNotifs();
  };

  const handleMarkOne = async (id) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadNotifs();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">Notification Center</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Real-time alert dispatch log for orders, payment verifications, and low stock warnings.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={playAlertChime}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition shadow-sm"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Chime</span>
            </button>
            <button
              onClick={handleMarkAll}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs transition shadow-sm"
            >
              Mark All as Read
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="glass-panel p-12 text-center text-zinc-500 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              No notifications recorded yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`glass-panel p-4 rounded-2xl border transition flex items-start justify-between gap-4 shadow-sm ${
                  !n.is_read ? 'border-amber-400/80 dark:border-amber-700/50 bg-amber-50/60 dark:bg-amber-950/10' : 'border-zinc-200 dark:border-zinc-800/80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl border mt-0.5 ${
                    n.type === 'NEW_ORDER'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                      : n.type === 'LOW_STOCK'
                      ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                      : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white'
                  }`}>
                    {n.type === 'NEW_ORDER' ? <ShoppingBag className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">{n.message}</p>
                    <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                      {new Date(n.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkOne(n.id)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
