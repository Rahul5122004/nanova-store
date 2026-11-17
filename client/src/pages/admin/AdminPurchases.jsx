import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, Building2, Calendar, FileSpreadsheet, X, Check } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminPurchases() {
  const { token } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Purchase Form
  const [supplierId, setSupplierId] = useState('');
  const [brandId, setBrandId] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [additionalExpenses, setAdditionalExpenses] = useState(0);
  const [notes, setNotes] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([]);

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/purchases', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/suppliers', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/products?activeOnly=false').then((r) => r.json())
    ])
      .then(([purRes, supRes, prodRes]) => {
        if (purRes.success) setPurchases(purRes.purchases || []);
        if (supRes.success) {
          setSuppliers(supRes.suppliers || []);
          if (supRes.suppliers?.length > 0) setSupplierId(supRes.suppliers[0].id);
        }
        if (prodRes.success) setProducts(prodRes.products || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleAddItem = () => {
    const firstProd = products[0];
    const firstVar = firstProd?.variants?.[0];
    setPurchaseItems([
      ...purchaseItems,
      {
        product_id: firstProd?.id || 1,
        variant_id: firstVar?.id || 1,
        size: firstVar?.size || 'L',
        color: firstVar?.color || 'Black',
        quantity: 20,
        unit_cost: firstProd?.purchase_cost || 250
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...purchaseItems];
    updated[index][field] = value;

    if (field === 'product_id') {
      const prod = products.find((p) => p.id === Number(value));
      if (prod && prod.variants?.length > 0) {
        updated[index].variant_id = prod.variants[0].id;
        updated[index].size = prod.variants[0].size;
        updated[index].color = prod.variants[0].color;
        updated[index].unit_cost = prod.purchase_cost;
      }
    } else if (field === 'variant_id') {
      const prod = products.find((p) => p.id === Number(updated[index].product_id));
      const v = prod?.variants?.find((varItem) => varItem.id === Number(value));
      if (v) {
        updated[index].size = v.size;
        updated[index].color = v.color;
      }
    }

    setPurchaseItems(updated);
  };

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      setModalError('Please add at least one purchase item.');
      return;
    }

    setSaving(true);
    setModalError('');

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          supplier_id: supplierId,
          brand_id: brandId,
          purchase_date: purchaseDate,
          additional_expenses: Number(additionalExpenses),
          notes,
          items: purchaseItems
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to record purchase.');
      }

      setShowAddModal(false);
      setPurchaseItems([]);
      loadData();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">
              Supplier Purchase Orders
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Record new procurement batches. Automatically updates variant purchased and stock quantities.
            </p>
          </div>

          <button
            onClick={() => {
              setShowAddModal(true);
              if (purchaseItems.length === 0) handleAddItem();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs transition active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Purchase Batch</span>
          </button>
        </div>

        {/* Purchases List */}
        <div className="bg-[#0c0c10] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#14141c] text-[11px] uppercase font-bold text-zinc-300 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Purchase ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Extra Cost</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-medium">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-white">{p.purchase_number}</td>
                      <td className="py-3 px-4 font-mono text-zinc-400">{p.purchase_date}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{p.supplier_name}</span>
                        <span className="text-[10px] text-zinc-400">{p.supplier_phone}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                          {p.brand_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-200">
                        {p.items?.map((it, idx) => (
                          <div key={idx} className="text-[11px] text-zinc-200">
                            {it.product_name} ({it.size}, {it.color}) • {it.quantity} pcs @ ₹{Number(it.unit_cost).toFixed(0)}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-bold text-white font-mono text-sm">
                        ₹{Number(p.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono">
                        ₹{Number(p.additional_expenses).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">{p.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECORD PURCHASE MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#0f0f14] border border-zinc-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-syne font-bold text-base text-white">Record Procurement Batch</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleCreatePurchase} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Supplier *</label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full bg-[#181822] border border-zinc-700 text-white px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.company_name || s.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Brand *</label>
                    <select
                      value={brandId}
                      onChange={(e) => setBrandId(Number(e.target.value))}
                      className="w-full bg-[#181822] border border-zinc-700 text-white px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                    >
                      <option value={1}>NANOVA TEES</option>
                      <option value={2}>SURPRISE NANOVA</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Purchase Date *</label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full bg-[#181822] border border-zinc-700 text-white px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                {/* Items to Restock */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Purchase Items &amp; Cost</h4>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Product
                    </button>
                  </div>

                  <div className="space-y-2">
                    {purchaseItems.map((item, idx) => {
                      const curProd = products.find((p) => p.id === Number(item.product_id));
                      return (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#14141c] p-3 rounded-xl border border-zinc-800 text-xs text-white">
                          <div className="col-span-4">
                            <select
                              value={item.product_id}
                              onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                              className="w-full bg-[#181822] border border-zinc-700 text-white px-2 py-1.5 text-xs rounded-lg focus:outline-none"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-3">
                            <select
                              value={item.variant_id}
                              onChange={(e) => handleItemChange(idx, 'variant_id', e.target.value)}
                              className="w-full bg-[#181822] border border-zinc-700 text-white px-2 py-1.5 text-xs rounded-lg focus:outline-none"
                            >
                              {curProd?.variants?.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.size} - {v.color}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                              className="w-full bg-[#181822] border border-zinc-700 text-white px-2 py-1.5 text-xs rounded-lg font-mono focus:outline-none"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Unit Cost"
                              value={item.unit_cost}
                              onChange={(e) => handleItemChange(idx, 'unit_cost', Number(e.target.value))}
                              className="w-full bg-[#181822] border border-zinc-700 text-white px-2 py-1.5 text-xs rounded-lg font-mono focus:outline-none"
                            />
                          </div>

                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-zinc-400 hover:text-red-400 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Additional Expenses (Freight/Loading)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={additionalExpenses}
                      onChange={(e) => setAdditionalExpenses(e.target.value)}
                      className="w-full bg-[#181822] border border-zinc-700 text-white px-3 py-2 text-xs rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Notes / Invoice Number</label>
                    <input
                      type="text"
                      placeholder="e.g. Supplier invoice #TI-8941"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#181822] border border-zinc-700 text-white placeholder-zinc-500 px-3 py-2 text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition active:scale-95 disabled:opacity-50"
                  >
                    {saving ? 'Processing...' : 'Confirm & Update Stock'}
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
