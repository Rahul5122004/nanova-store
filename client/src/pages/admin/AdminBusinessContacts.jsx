import React, { useState, useEffect } from 'react';
import { PhoneCall, Save, Check, Shirt, Sparkles, Instagram, MessageCircle, Mail } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function AdminBusinessContacts() {
  const { token } = useAuth();
  const { refreshSettings } = useSettings();
  const [brands, setBrands] = useState([]);
  const [contactEmail, setContactEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const loadData = () => {
    setLoading(true);
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setBrands(d.brands || []);
          if (d.settings?.contact_email) {
            setContactEmail(d.settings.contact_email);
          } else {
            setContactEmail('novaenterprises003@gmail.com');
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/settings/brands/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update brand contacts');
      
      setToast('Business contacts updated successfully!');
      setTimeout(() => setToast(''), 3000);
      loadData();
      if (refreshSettings) refreshSettings();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSaveEmail = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: {
            contact_email: contactEmail
          }
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to save email');

      setToast('Official business email saved successfully!');
      setTimeout(() => setToast(''), 3000);
      loadData();
      if (refreshSettings) refreshSettings();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">Business Contact Settings</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Manage contact numbers, WhatsApp numbers, taglines, Instagram handles, and official email. Changes reflect across all website storefronts, product cards, footer, and contact sections.
          </p>
        </div>

        {toast && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" /> <span>{toast}</span>
          </div>
        )}

        {/* Global Business Email Card */}
        <div className="glass-panel p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900/40 dark:to-zinc-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Central Official Email</h3>
                <p className="text-xs text-zinc-500">Primary enterprise address for customer inquiries, footer mailto links, and official receipts.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="e.g. novaenterprises003@gmail.com"
              className="flex-1 glass-input px-3.5 py-2.5 text-xs rounded-xl font-bold"
            />
            <button
              type="button"
              onClick={handleSaveEmail}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs transition shadow-sm whitespace-nowrap"
            >
              Save Email
            </button>
          </div>
        </div>

        {/* Brand Specific Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {brands.map((b) => (
            <div key={b.id} className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white">
                  {b.code === 'nanova_tees' ? <Shirt className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">{b.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Code: {b.code}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Brand Tagline</label>
                  <input
                    type="text"
                    value={b.tagline || ''}
                    onChange={(e) => {
                      const updated = brands.map((x) => x.id === b.id ? { ...x, tagline: e.target.value } : x);
                      setBrands(updated);
                    }}
                    className="w-full glass-input px-3.5 py-2 text-xs rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Contact Number</label>
                  <input
                    type="text"
                    value={b.phone || ''}
                    onChange={(e) => {
                      const updated = brands.map((x) => x.id === b.id ? { ...x, phone: e.target.value } : x);
                      setBrands(updated);
                    }}
                    className="w-full glass-input px-3.5 py-2 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">WhatsApp Number</label>
                  <input
                    type="text"
                    value={b.whatsapp || ''}
                    onChange={(e) => {
                      const updated = brands.map((x) => x.id === b.id ? { ...x, whatsapp: e.target.value } : x);
                      setBrands(updated);
                    }}
                    className="w-full glass-input px-3.5 py-2 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Instagram Handle</label>
                  <input
                    type="text"
                    value={b.instagram_handle || ''}
                    onChange={(e) => {
                      const updated = brands.map((x) => x.id === b.id ? { ...x, instagram_handle: e.target.value } : x);
                      setBrands(updated);
                    }}
                    className="w-full glass-input px-3.5 py-2 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Instagram URL</label>
                  <input
                    type="text"
                    value={b.instagram_url || ''}
                    onChange={(e) => {
                      const updated = brands.map((x) => x.id === b.id ? { ...x, instagram_url: e.target.value } : x);
                      setBrands(updated);
                    }}
                    className="w-full glass-input px-3.5 py-2 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => handleUpdate(b.id, {
                    tagline: b.tagline,
                    phone: b.phone,
                    whatsapp: b.whatsapp,
                    instagram_handle: b.instagram_handle,
                    instagram_url: b.instagram_url
                  })}
                  className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs transition shadow-sm"
                >
                  Save {b.name} Contacts
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
