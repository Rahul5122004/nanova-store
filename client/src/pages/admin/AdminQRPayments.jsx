import React, { useState, useEffect } from 'react';
import { QrCode, Upload, Check, AlertCircle, Save } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminQRPayments() {
  const { token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrFile, setQrFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetch('/api/payments/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSettings(d.settings);
          setPreviewUrl(d.settings?.qr_image_url || '/default-qr.png');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToastMsg('');

    try {
      const fd = new FormData();
      if (qrFile) fd.append('qr_image', qrFile);
      fd.append('upi_id', settings.upi_id || '');
      fd.append('account_name', settings.account_name || '');
      fd.append('instructions', settings.instructions || '');
      fd.append('qr_enabled', settings.qr_enabled ? 1 : 0);
      fd.append('cod_enabled', settings.cod_enabled ? 1 : 0);
      fd.append('delivery_charge_flat', settings.delivery_charge_flat);
      fd.append('free_delivery_threshold', settings.free_delivery_threshold);

      const res = await fetch('/api/payments/settings', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      setToastMsg('QR Payment configuration updated successfully!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <AdminLayout><div className="text-center py-20 text-zinc-500">Loading settings...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">QR Payment &amp; Checkout Settings</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Upload your official UPI QR code, configure payment account name, instructions, and toggle Cash on Delivery.
          </p>
        </div>

        {toastMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: QR Image Preview & Upload (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase block">Active Payment QR Code</span>
              <div className="w-56 h-56 bg-white p-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 shadow-md mx-auto flex items-center justify-center">
                <img src={previewUrl} alt="Payment QR" className="w-full h-full object-contain" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Replace / Upload New QR Code Image</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-zinc-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-200 dark:file:bg-zinc-800 file:text-zinc-800 dark:file:text-zinc-200"
                />
              </div>
            </div>

            {/* Right: Payment Instructions & Details (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Account Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. NANOVA ENTERPRISES"
                  value={settings.account_name || ''}
                  onChange={(e) => setSettings({ ...settings, account_name: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">UPI ID / VPA (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. nanova@oksbi (leave blank if strictly using QR image)"
                  value={settings.upi_id || ''}
                  onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 text-xs rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Payment Instructions for Customers</label>
                <textarea
                  rows={3}
                  value={settings.instructions || ''}
                  onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                  className="w-full glass-input px-3.5 py-2 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Flat Delivery Fee (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.delivery_charge_flat}
                    onChange={(e) => setSettings({ ...settings, delivery_charge_flat: Number(e.target.value) })}
                    className="w-full glass-input px-3.5 py-2 text-xs rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Free Delivery Threshold (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.free_delivery_threshold}
                    onChange={(e) => setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })}
                    className="w-full glass-input px-3.5 py-2 text-xs rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!settings.qr_enabled}
                    onChange={(e) => setSettings({ ...settings, qr_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-black focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white">Enable UPI QR Payments at Checkout</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!settings.cod_enabled}
                    onChange={(e) => setSettings({ ...settings, cod_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-black focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white">Enable Cash on Delivery (COD)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-extrabold text-xs transition active:scale-95 disabled:opacity-50 shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Payment Configuration'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
