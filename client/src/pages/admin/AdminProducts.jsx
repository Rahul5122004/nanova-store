import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Box, Upload, X, Check, Shirt, Sparkles } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Product Form State
  const [formData, setFormData] = useState({
    brand_id: 1,
    category_id: 1,
    sku: '',
    name: '',
    description: '',
    selling_price: '',
    purchase_cost: '',
    model_3d_type: 'garment',
    customization_allowed: 0,
    customization_placeholder: '',
    is_featured: 1,
    is_new_arrival: 1,
    is_best_seller: 0
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Variants to add
  const [variantsList, setVariantsList] = useState([
    { size: 'S', color: 'Black', color_hex: '#111111', stock_quantity: 10, low_stock_threshold: 5 },
    { size: 'M', color: 'Black', color_hex: '#111111', stock_quantity: 15, low_stock_threshold: 5 },
    { size: 'L', color: 'Black', color_hex: '#111111', stock_quantity: 20, low_stock_threshold: 5 },
    { size: 'XL', color: 'Black', color_hex: '#111111', stock_quantity: 12, low_stock_threshold: 5 },
    { size: 'XXL', color: 'Black', color_hex: '#111111', stock_quantity: 8, low_stock_threshold: 5 }
  ]);

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleBrandChange = (newBrandId) => {
    const brandId = Number(newBrandId);
    setFormData({
      ...formData,
      brand_id: brandId,
      category_id: brandId === 1 ? 1 : 7
    });
    if (brandId === 2) {
      setVariantsList([
        { size: 'Standard', color: 'Default', color_hex: '#ffffff', stock_quantity: 25, low_stock_threshold: 5 }
      ]);
    } else {
      setVariantsList([
        { size: 'S', color: 'Black', color_hex: '#111111', stock_quantity: 10, low_stock_threshold: 5 },
        { size: 'M', color: 'Black', color_hex: '#111111', stock_quantity: 15, low_stock_threshold: 5 },
        { size: 'L', color: 'Black', color_hex: '#111111', stock_quantity: 20, low_stock_threshold: 5 },
        { size: 'XL', color: 'Black', color_hex: '#111111', stock_quantity: 12, low_stock_threshold: 5 },
        { size: 'XXL', color: 'Black', color_hex: '#111111', stock_quantity: 8, low_stock_threshold: 5 }
      ]);
    }
  };

  const loadProducts = () => {
    setLoading(true);
    let url = `/api/products?activeOnly=false&brand=${brandFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [brandFilter, search]);

  const handleAddVariantRow = () => {
    setVariantsList([
      ...variantsList,
      { size: 'M', color: 'White', color_hex: '#ffffff', stock_quantity: 10, low_stock_threshold: 5 }
    ]);
  };

  const handleRemoveVariantRow = (index) => {
    setVariantsList(variantsList.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variantsList];
    updated[index][field] = value;
    setVariantsList(updated);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (imageFile) {
        data.append('image', imageFile);
        data.append('front_image', imageFile);
      }
      data.append('variantsJson', JSON.stringify(variantsList));

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to create product.');
      }

      setShowAddModal(false);
      setImageFile(null);
      setImagePreview(null);
      setFormData({
        brand_id: 1,
        category_id: 1,
        sku: '',
        name: '',
        description: '',
        selling_price: '',
        purchase_cost: '',
        model_3d_type: 'garment',
        customization_allowed: 0,
        customization_placeholder: '',
        is_featured: 1,
        is_new_arrival: 1,
        is_best_seller: 0
      });
      loadProducts();
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout activeBrand={brandFilter} onSelectBrand={setBrandFilter}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">
              Products Management
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Add new streetwear garments or surprise hampers with front/back 3D models and size variants.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs transition active:scale-95 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, SKU or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111116] border border-zinc-700 text-white placeholder-zinc-500 pl-9 pr-3 py-2 text-xs rounded-xl shadow-sm focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Products: Mobile Cards (< md) + Desktop Table (>= md) */}
        <div className="bg-[#0c0c10] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
          <div className="md:hidden divide-y divide-zinc-800">
            {products.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-zinc-400">
                No products found.
              </div>
            ) : (
              products.map((p) => {
                const isTees = p.brand_code === 'nanova_tees' || p.brand_id === 1;
                return (
                  <div key={p.id} className="p-4 space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-zinc-900 rounded-lg p-1 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                        <img src={p.front_image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm text-white block truncate">{p.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono block">SKU: {p.sku}</span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isTees ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                          }`}>
                            {isTees ? 'NANOVA TEES' : 'SURPRISE NANOVA'}
                          </span>
                          <span className="text-[10px] text-zinc-400">{p.category_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-[#14141c] p-2.5 rounded-xl border border-zinc-800 text-center">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Selling</span>
                        <span className="font-bold text-white">₹{Number(p.selling_price).toFixed(0)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Cost</span>
                        <span className="text-zinc-300">₹{Number(p.purchase_cost).toFixed(0)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Stock</span>
                        <span className={`font-bold ${p.total_stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {p.total_stock} Units
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Product</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#14141c] text-[11px] uppercase font-bold text-zinc-300 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Cost Price</th>
                  <th className="py-3 px-4">Total Stock</th>
                  <th className="py-3 px-4">3D Viewer</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isTees = p.brand_code === 'nanova_tees' || p.brand_id === 1;
                    return (
                      <tr key={p.id} className="hover:bg-zinc-900/60 transition">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-12 h-14 bg-zinc-900 rounded-lg p-1 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                            <img src={p.front_image} alt={p.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">{p.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">SKU: {p.sku}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isTees ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                          }`}>
                            {isTees ? 'NANOVA TEES' : 'SURPRISE NANOVA'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-zinc-300">{p.category_name}</td>

                        <td className="py-3 px-4 font-bold text-white">
                          ₹{Number(p.selling_price).toFixed(2)}
                        </td>

                        <td className="py-3 px-4 text-zinc-400">
                          ₹{Number(p.purchase_cost).toFixed(2)}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`font-bold ${p.total_stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {p.total_stock} Units
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-bold">
                            <Box className="w-3.5 h-3.5" /> Ready
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD PRODUCT MODAL (Interior Dark Component) */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#0e0e14] border border-zinc-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="font-syne font-bold text-lg text-white">Create New Product</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {statusMsg && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl">
                  {statusMsg}
                </div>
              )}

              <form onSubmit={handleCreateProduct} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Assign Brand *</label>
                    <select
                      value={formData.brand_id}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="w-full bg-[#181822] border border-zinc-700 text-white px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                    >
                      <option value={1}>NANOVA TEES</option>
                      <option value={2}>SURPRISE NANOVA</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Category *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                      className="w-full bg-[#181822] border border-zinc-700 text-white px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                    >
                      {formData.brand_id === 1 ? (
                        <>
                          <option value={1}>Oversized T-Shirts</option>
                          <option value={2}>Regular Fit T-Shirts</option>
                          <option value={3}>Printed T-Shirts</option>
                          <option value={4}>Custom T-Shirts</option>
                          <option value={5}>New Arrivals</option>
                          <option value={6}>Best Sellers</option>
                        </>
                      ) : (
                        <>
                          <option value={7}>Birthday Gifts</option>
                          <option value={8}>Anniversary Gifts</option>
                          <option value={9}>Couple Gifts</option>
                          <option value={10}>Personalized Gifts</option>
                          <option value={11}>Gift Hampers</option>
                          <option value={12}>Surprise Boxes</option>
                          <option value={13}>Customized Gifts</option>
                          <option value={14}>Special Occasion Gifts</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acid Wash Heavyweight Tee"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#181822] border border-zinc-700 text-white placeholder-zinc-500 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Selling Price (INR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="799.00"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                      className="w-full bg-[#181822] border border-zinc-700 text-white placeholder-zinc-500 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Purchase Unit Cost (INR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="320.00"
                      value={formData.purchase_cost}
                      onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
                      className="w-full bg-[#181822] border border-zinc-700 text-white placeholder-zinc-500 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#181822] border border-zinc-700 text-white placeholder-zinc-500 px-3.5 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                  />
                </div>

                {/* Single Image Upload */}
                <div className="p-4 rounded-2xl bg-[#14141c] border border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>Product Image *</span>
                      </label>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Upload a single product photo (JPEG, PNG or WEBP)
                      </p>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      required={!imageFile}
                      onChange={handleImageChange}
                      className="text-xs text-zinc-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer"
                    />
                  </div>

                  {imagePreview && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-[#1c1c28] rounded-xl border border-zinc-700/60 max-w-sm">
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 object-contain rounded-lg bg-zinc-950 p-1 border border-zinc-800" />
                      <div className="text-xs text-zinc-300">
                        <span className="font-bold text-emerald-400 block">✓ Image Selected</span>
                        <span className="text-[10px] text-zinc-400 truncate block max-w-[200px]">{imageFile?.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Size & Colour Variant Matrix Generator */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Initial Size &amp; Colour Inventory Matrix
                      </h4>
                      <p className="text-[10px] text-zinc-400">Isolated stock tracked per Size + Colour</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariantRow}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Variant
                    </button>
                  </div>

                  <div className="space-y-2">
                    {variantsList.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#14141c] p-2.5 rounded-xl border border-zinc-800 text-xs">
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Size (e.g. L)"
                            value={row.size}
                            onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                            className="w-full bg-[#1c1c28] border border-zinc-700 text-white px-2 py-1.5 text-xs rounded-lg"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Color (e.g. Black)"
                            value={row.color}
                            onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                            className="w-full bg-[#1c1c28] border border-zinc-700 text-white px-2 py-1.5 text-xs rounded-lg"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            placeholder="Initial Stock"
                            value={row.stock_quantity}
                            onChange={(e) => handleVariantChange(idx, 'stock_quantity', Number(e.target.value))}
                            className="w-full bg-[#1c1c28] border border-zinc-700 text-white px-2 py-1.5 text-xs rounded-lg"
                          />
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-[10px] text-zinc-400">Threshold: 5</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantRow(idx)}
                            className="text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition active:scale-95 disabled:opacity-50 shadow-lg"
                  >
                    {saving ? 'Creating Product...' : 'Save Product'}
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
