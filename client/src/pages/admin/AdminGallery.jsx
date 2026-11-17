import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Plus, 
  Trash2, 
  Heart, 
  ExternalLink, 
  Upload, 
  X, 
  Check, 
  Sparkles, 
  Shirt, 
  Search, 
  Eye, 
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminGallery() {
  const { token } = useAuth();
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const [formData, setFormData] = useState({
    brand_id: 1,
    title: '',
    customer_name: '',
    likes_count: '1.2k',
    instagram_url: 'https://www.instagram.com/nanova_tees?utm_source=qr&psln=MXd1OXo3Z21rZmh1bQ=='
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const loadMoments = () => {
    setLoading(true);
    let url = `/api/gallery?activeOnly=false&brand=${brandFilter}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setMoments(data.moments || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMoments();
  }, [brandFilter]);

  const handleBrandChange = (newBrandId) => {
    const bId = Number(newBrandId);
    setFormData({
      ...formData,
      brand_id: bId,
      instagram_url: bId === 2 
        ? 'https://www.instagram.com/surprise_nanova?utm_source=qr&srtk=aWowazJlY3lzeGx1'
        : 'https://www.instagram.com/nanova_tees?utm_source=qr&psln=MXd1OXo3Z21rZmh1bQ=='
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleCreateMoment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to save gallery moment.');
      }

      setShowAddModal(false);
      setImageFile(null);
      setImagePreview(null);
      setFormData({
        brand_id: 1,
        title: '',
        customer_name: '',
        likes_count: '1.2k',
        instagram_url: 'https://www.instagram.com/nanova_tees?utm_source=qr&psln=MXd1OXo3Z21rZmh1bQ=='
      });
      loadMoments();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMoment = async (id, title) => {
    if (!window.confirm(`Delete community moment "${title}"?`)) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete moment.');
      }
      loadMoments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (moment) => {
    try {
      const newActive = moment.is_active ? 0 : 1;
      await fetch(`/api/gallery/${moment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: newActive })
      });
      loadMoments();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredMoments = moments.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (m.title && m.title.toLowerCase().includes(q)) || (m.customer_name && m.customer_name.toLowerCase().includes(q));
  });

  return (
    <AdminLayout activeBrand={brandFilter} onSelectBrand={setBrandFilter}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-pink-500 uppercase tracking-widest mb-1">
              <Instagram className="w-4 h-4 text-pink-500" />
              <span>INSTAGRAM &amp; SOCIAL PROOF</span>
            </div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">
              Community &amp; Moment Gallery
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
              Upload customer photos, showcase community moments, and link directly to your two official Instagram channels.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs transition active:scale-95 shadow-lg flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Moment</span>
          </button>
        </div>

        {/* Official Channels Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://www.instagram.com/nanova_tees?utm_source=qr&psln=MXd1OXo3Z21rZmh1bQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-[#0c0c11] border border-zinc-800 rounded-2xl text-white hover:border-zinc-700 transition shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-white">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">NANOVA TEES INSTAGRAM</span>
                <span className="text-sm font-black font-syne group-hover:text-amber-400 transition">@nanova_tees</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
          </a>

          <a
            href="https://www.instagram.com/surprise_nanova?utm_source=qr&srtk=aWowazJlY3lzeGx1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1c121e] to-[#0c0c11] border border-amber-800/80 rounded-2xl text-white hover:border-amber-600 transition shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-950/80 rounded-xl border border-amber-800/80 text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider block">SURPRISE NANOVA INSTAGRAM</span>
                <span className="text-sm font-black font-syne text-amber-300 group-hover:text-amber-200 transition">@surprise_nanova</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-amber-400 group-hover:text-white transition" />
          </a>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#111116] border border-zinc-800 rounded-xl text-xs text-white">
            <button
              onClick={() => setBrandFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                brandFilter === 'all' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Moments
            </button>
            <button
              onClick={() => setBrandFilter('nanova_tees')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                brandFilter === 'nanova_tees' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Nanova Tees
            </button>
            <button
              onClick={() => setBrandFilter('surprise_nanova')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                brandFilter === 'surprise_nanova' ? 'bg-amber-600 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Surprise Nanova
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search gallery moments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111116] border border-zinc-700 text-white placeholder-zinc-500 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        {/* Gallery Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-xs">Loading moments gallery...</div>
        ) : filteredMoments.length === 0 ? (
          <div className="p-12 text-center bg-[#0c0c11] rounded-2xl border border-dashed border-zinc-800 text-white shadow-sm">
            <ImageIcon className="w-10 h-10 text-zinc-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-white">No community moments added yet</p>
            <p className="text-[11px] text-zinc-400 mt-1">Click "Add New Moment" above to upload photos that will show on the homepage gallery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMoments.map((item) => {
              const isTees = item.brand_id === 1;
              return (
                <div
                  key={item.id}
                  className="bg-[#0c0c11] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl text-white flex flex-col justify-between group hover:border-zinc-700 transition"
                >
                  <div className="relative aspect-square bg-[#14141c] overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-500"
                    />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md ${
                      isTees ? 'bg-black/80 text-white border border-zinc-700' : 'bg-amber-950/90 text-amber-300 border border-amber-800'
                    }`}>
                      {isTees ? 'NANOVA TEES' : 'SURPRISE NANOVA'}
                    </span>

                    {!item.is_active && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/90 text-red-300 border border-red-800">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                    {item.customer_name && (
                      <p className="text-[10px] text-zinc-400">By: {item.customer_name}</p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <span className="flex items-center gap-1 font-bold text-red-400">
                        <Heart className="w-3.5 h-3.5 fill-red-400" /> {item.likes_count}
                      </span>

                      {item.instagram_url && (
                        <a
                          href={item.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-pink-400 hover:underline"
                        >
                          <Instagram className="w-3 h-3" /> View Post
                        </a>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                          item.is_active ? 'text-zinc-400 hover:text-white' : 'text-amber-400 hover:text-amber-300'
                        }`}
                      >
                        {item.is_active ? 'Hide from Web' : 'Show on Web'}
                      </button>

                      <button
                        onClick={() => handleDeleteMoment(item.id, item.title)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 transition"
                        title="Delete Moment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD MOMENT MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0e14] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <h3 className="font-syne font-bold text-base text-white">Add Community Moment</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {statusMsg && (
                <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl">
                  {statusMsg.text}
                </div>
              )}

              <form onSubmit={handleCreateMoment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Select Business Brand *</label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full bg-[#181822] border border-zinc-700 text-white px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                  >
                    <option value={1}>NANOVA TEES (@nanova_tees)</option>
                    <option value={2}>SURPRISE NANOVA (@surprise_nanova)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Moment Caption / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acid Wash Heavyweight Drop or Velvet Anniversary Keepsake"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#181822] border border-zinc-700 text-white placeholder-zinc-500 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Customer Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Naveen S."
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full bg-[#181822] border border-zinc-700 text-white placeholder-zinc-500 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Display Likes Count</label>
                    <input
                      type="text"
                      placeholder="e.g. 1.8k"
                      value={formData.likes_count}
                      onChange={(e) => setFormData({ ...formData, likes_count: e.target.value })}
                      className="w-full bg-[#181822] border border-zinc-700 text-white placeholder-zinc-500 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Instagram Post Link</label>
                  <input
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    className="w-full bg-[#181822] border border-zinc-700 text-white placeholder-zinc-500 px-3.5 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500 font-mono text-[11px]"
                  />
                </div>

                {/* Single Photo Upload */}
                <div className="p-3 bg-[#14141c] border border-zinc-800 rounded-xl space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-pink-400" />
                    <span>Upload Photo *</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required={!imageFile}
                    onChange={handleImageChange}
                    className="text-xs text-zinc-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white file:text-black cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-2 flex items-center gap-3 p-1.5 bg-[#1c1c28] rounded-xl border border-zinc-700">
                      <img src={imagePreview} alt="Preview" className="w-14 h-14 object-cover rounded-lg" />
                      <span className="text-xs text-emerald-400 font-bold">Photo Selected ✓</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-extrabold shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {saving ? 'Uploading...' : 'Publish to Gallery'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
