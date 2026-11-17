import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartDrawer from './components/common/CartDrawer';

// Storefront Pages
import Home from './pages/Home';
import TeesStore from './pages/TeesStore';
import GiftsStore from './pages/GiftsStore';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import TrackOrder from './pages/TrackOrder';
import ContactUs from './pages/ContactUs';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from './pages/admin/AdminInventory';
import AdminStockHistory from './pages/admin/AdminStockHistory';
import AdminPurchases from './pages/admin/AdminPurchases';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminBilling from './pages/admin/AdminBilling';
import AdminQRPayments from './pages/admin/AdminQRPayments';
import AdminPaymentVerification from './pages/admin/AdminPaymentVerification';
import AdminExpenses from './pages/admin/AdminExpenses';
import AdminProfitLoss from './pages/admin/AdminProfitLoss';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import AdminBusinessContacts from './pages/admin/AdminBusinessContacts';
import AdminProfile from './pages/admin/AdminProfile';
import AdminAdjust from './pages/admin/AdminAdjust';
import AdminGallery from './pages/admin/AdminGallery';

import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-zinc-500">Checking credentials...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-canvas-pattern text-zinc-900 relative selection:bg-black selection:text-white">
      {/* Subtle Ambient Dual-Brand Light Spheres (Fixed Background Design) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Nanova Tees Cool Indigo/Cyan Aura Glow */}
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-indigo-500/5 via-sky-500/4 to-transparent rounded-full blur-3xl transform -translate-x-1/2" />
        {/* Surprise Nanova Warm Amber/Rose Luxury Glow */}
        <div className="absolute top-20 right-10 w-[600px] h-[600px] bg-gradient-to-bl from-amber-500/5 via-pink-500/3 to-transparent rounded-full blur-3xl" />
        {/* Soft Ambient Lower Illuminator */}
        <div className="absolute top-2/3 left-10 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/4 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />

      <Routes>
        {/* PUBLIC STOREFRONT ROUTES (Wrapped with Navbar & Footer) */}
        <Route
          path="/*"
          element={
            <>
              <Navbar onOpenCart={() => setCartDrawerOpen(true)} />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tees" element={<TeesStore />} />
                  <Route path="/gifts" element={<GiftsStore />} />
                  <Route path="/products/:idOrSlug" element={<ProductDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />

        {/* ADMIN ROUTES */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/tees" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/gifts" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/adjust" element={<ProtectedRoute><AdminAdjust /></ProtectedRoute>} />
        <Route path="/admin/gallery" element={<ProtectedRoute><AdminGallery /></ProtectedRoute>} />
        <Route path="/admin/inventory" element={<ProtectedRoute><AdminInventory /></ProtectedRoute>} />
        <Route path="/admin/stock-history" element={<ProtectedRoute><AdminStockHistory /></ProtectedRoute>} />
        <Route path="/admin/purchases" element={<ProtectedRoute><AdminPurchases /></ProtectedRoute>} />
        <Route path="/admin/suppliers" element={<ProtectedRoute><AdminSuppliers /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/billing" element={<ProtectedRoute><AdminBilling /></ProtectedRoute>} />
        <Route path="/admin/qr-settings" element={<ProtectedRoute><AdminQRPayments /></ProtectedRoute>} />
        <Route path="/admin/payment-verification" element={<ProtectedRoute><AdminPaymentVerification /></ProtectedRoute>} />
        <Route path="/admin/expenses" element={<ProtectedRoute><AdminExpenses /></ProtectedRoute>} />
        <Route path="/admin/profit-loss" element={<ProtectedRoute><AdminProfitLoss /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/business-contacts" element={<ProtectedRoute><AdminBusinessContacts /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
      </Routes>
      </div>
    </div>
  );
}
