import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nanova_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);
  const [deliverySettings, setDeliverySettings] = useState({
    flatCharge: 60,
    freeThreshold: 999
  });

  useEffect(() => {
    localStorage.setItem('nanova_cart', JSON.stringify(cart));
  }, [cart]);

  // Load payment/delivery settings from server
  useEffect(() => {
    fetch('/api/payments/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          setDeliverySettings({
            flatCharge: Number(d.settings.delivery_charge_flat || 60),
            freeThreshold: Number(d.settings.free_delivery_threshold || 999)
          });
        }
      })
      .catch(() => {});
  }, []);

  /**
   * Add Item to Cart with Size + Colour Variant Stock Guard
   */
  const addToCart = (product, variant, quantity = 1, customNote = '') => {
    if (!variant) return false;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product_id === product.id && item.variant_id === variant.id
      );

      const maxAvailable = Number(variant.stock_quantity);

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = Math.min(maxAvailable, currentQty + quantity);
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          custom_note: customNote || updated[existingIndex].custom_note
        };
        return updated;
      } else {
        const initQty = Math.min(maxAvailable, quantity);
        if (initQty <= 0) return prev;

        return [
          ...prev,
          {
            product_id: product.id,
            variant_id: variant.id,
            name: product.name,
            size: variant.size,
            color: variant.color,
            color_hex: variant.color_hex,
            sku: variant.sku,
            unit_price: Number(product.selling_price),
            unit_cost: Number(product.purchase_cost),
            image: product.front_image,
            brand_code: product.brand_code || (product.brand_id === 1 ? 'nanova_tees' : 'surprise_nanova'),
            max_stock: maxAvailable,
            quantity: initQty,
            custom_note: customNote
          }
        ];
      }
    });

    return true;
  };

  const updateQuantity = (variantId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variant_id === variantId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.max_stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (variantId) => {
    setCart((prev) => prev.filter((item) => item.variant_id !== variantId));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const availableCoupons = [
    { code: 'NANOVA10', label: '10% OFF', desc: '10% discount on order' },
    { code: 'FIRST100', label: '₹100 OFF', desc: 'Flat ₹100 instant discount' },
    { code: 'SPECIAL20', label: '20% OFF', desc: '20% festive special discount' },
    { code: 'FLAT50', label: '₹50 OFF', desc: 'Flat ₹50 quick savings' }
  ];

  const applyCoupon = (code) => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Please enter a discount code.' };
    }
    const clean = code.trim().toUpperCase();

    if (clean === 'NANOVA10' || clean === 'WELCOME10') {
      setCoupon({ code: clean, percent: 10 });
      return { success: true, message: '10% discount applied successfully!' };
    } else if (clean === 'SPECIAL20' || clean === 'NANOVA20') {
      setCoupon({ code: clean, percent: 20 });
      return { success: true, message: '20% discount applied successfully!' };
    } else if (clean === 'NANOVA50' || clean === 'HALF50') {
      setCoupon({ code: clean, percent: 50 });
      return { success: true, message: '50% discount applied successfully!' };
    } else if (clean === 'FIRST100') {
      setCoupon({ code: clean, flat: 100 });
      return { success: true, message: '₹100 flat discount applied!' };
    } else if (clean === 'FLAT50' || clean === 'SAVE50') {
      setCoupon({ code: clean, flat: 50 });
      return { success: true, message: '₹50 flat discount applied!' };
    } else if (clean === 'FLAT200' || clean === 'SAVE200') {
      setCoupon({ code: clean, flat: 200 });
      return { success: true, message: '₹200 flat discount applied!' };
    } else if (clean.startsWith('DISCOUNT') && !isNaN(clean.replace('DISCOUNT', ''))) {
      const p = Math.min(90, Math.max(1, Number(clean.replace('DISCOUNT', ''))));
      setCoupon({ code: clean, percent: p });
      return { success: true, message: `${p}% custom discount applied!` };
    } else if (clean.startsWith('FLAT') && !isNaN(clean.replace('FLAT', ''))) {
      const f = Math.max(1, Number(clean.replace('FLAT', '')));
      setCoupon({ code: clean, flat: f });
      return { success: true, message: `₹${f} custom flat discount applied!` };
    }

    return { success: false, message: 'Invalid discount code. Try NANOVA10, FIRST100, or SPECIAL20.' };
  };

  const removeCoupon = () => setCoupon(null);

  // Cart Calculations
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.percent) {
      discount = (subtotal * coupon.percent) / 100;
    } else if (coupon.flat) {
      discount = Math.min(subtotal, coupon.flat);
    }
  }

  const deliveryFee = subtotal >= deliverySettings.freeThreshold || subtotal === 0 ? 0 : deliverySettings.flatCharge;
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        discount,
        coupon,
        applyCoupon,
        removeCoupon,
        availableCoupons,
        deliveryFee,
        finalTotal,
        freeThreshold: deliverySettings.freeThreshold
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
