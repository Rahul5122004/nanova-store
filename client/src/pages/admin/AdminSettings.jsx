import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, Mail, Bell } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function AdminSettings() {
  const { token } = useAuth();
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.settings || {});
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, val) => {
    setSettings({ ...settings, [key]: val });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to save settings');
      
      setToast('Website settings saved successfully!');
      setTimeout(() => setToast(''), 3000);
      if (refreshSettings) refreshSettings();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">Website &amp; Alert Settings</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Configure homepage banners, top announcements, and external SMTP email alerts.</p>
        </div>

        {toast && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" /> <span>{toast}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Homepage Headings &amp; Announcements</h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Main Hero Heading</label>
              <input
                type="text"
                value={settings.home_hero_title || 'ONE DESTINATION. TWO DIFFERENT EXPERIENCES.'}
                onChange={(e) => handleChange('home_hero_title', e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Hero Subtitle</label>
              <input
                type="text"
                value={settings.home_hero_subtitle || 'Discover your style. Celebrate your special moments.'}
                onChange={(e) => handleChange('home_hero_subtitle', e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nanova Tees Top Banner</label>
              <input
                type="text"
                value={settings.nanova_tees_announcement || ''}
                onChange={(e) => handleChange('nanova_tees_announcement', e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Surprise Nanova Top Banner</label>
              <input
                type="text"
                value={settings.surprise_nanova_announcement || ''}
                onChange={(e) => handleChange('surprise_nanova_announcement', e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Official Business Email</label>
              <input
                type="email"
                value={settings.contact_email || 'novaenterprises003@gmail.com'}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="novaenterprises003@gmail.com"
                className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl font-bold"
              />
            </div>
          </div>

          {/* Offline SMTP Configuration */}
          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Configurable Offline SMTP Notifications</h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              When the admin dashboard is offline, order alerts can be sent to your email. Enter credentials if desired (otherwise keep disabled).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">SMTP Host</label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  value={settings.email_smtp_host || ''}
                  onChange={(e) => handleChange('email_smtp_host', e.target.value)}
                  className="w-full glass-input px-3.5 py-2 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">SMTP Port</label>
                <input
                  type="text"
                  placeholder="587"
                  value={settings.email_smtp_port || '587'}
                  onChange={(e) => handleChange('email_smtp_port', e.target.value)}
                  className="w-full glass-input px-3.5 py-2 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">SMTP User / Owner Email</label>
                <input
                  type="text"
                  placeholder="owner@gmail.com"
                  value={settings.email_smtp_user || ''}
                  onChange={(e) => handleChange('email_smtp_user', e.target.value)}
                  className="w-full glass-input px-3.5 py-2 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">SMTP Password</label>
                <input
                  type="password"
                  placeholder="App Password"
                  value={settings.email_smtp_pass || ''}
                  onChange={(e) => handleChange('email_smtp_pass', e.target.value)}
                  className="w-full glass-input px-3.5 py-2 text-xs rounded-xl"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_smtp_enabled === '1'}
                onChange={(e) => handleChange('email_smtp_enabled', e.target.checked ? '1' : '0')}
                className="w-4 h-4 rounded text-black"
              />
              <span className="text-xs text-zinc-900 dark:text-white font-semibold">Enable SMTP Email Alerts for New Orders</span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="submit"
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-extrabold text-xs rounded-xl transition shadow-sm"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
