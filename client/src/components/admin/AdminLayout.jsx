import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  Package,
  Layers,
  History,
  ShoppingCart,
  Users,
  FileText,
  QrCode,
  CheckSquare,
  Receipt,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
  PhoneCall,
  UserCheck,
  LogOut,
  Menu,
  X,
  SlidersHorizontal,
  Volume2,
  Download,
  Building2,
  ExternalLink,
  Instagram,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../common/Logo';

export default function AdminLayout({ children, activeBrand, onSelectBrand }) {
  const { admin, logout } = useAuth();
  const { unreadCount, liveNotifications, markAllRead, playAlertChime } = useSocket();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: '1. Dashboard', path: '/admin', icon: LayoutDashboard },
    { id: 'tees', label: '2. Nanova Tees', path: '/admin/tees', icon: Shirt, badge: 'Brand' },
    { id: 'gifts', label: '3. Surprise Nanova', path: '/admin/gifts', icon: Sparkles, badge: 'Brand' },
    { id: 'products', label: '4. Products', path: '/admin/products', icon: Package },
    { id: 'adjust', label: '5. Adjust (Products & Customers)', path: '/admin/adjust', icon: SlidersHorizontal, badge: 'Manage' },
    { id: 'gallery', label: '6. Community & Moments Gallery', path: '/admin/gallery', icon: Instagram, badge: 'Social' },
    { id: 'inventory', label: '7. Inventory (Size+Color)', path: '/admin/inventory', icon: Layers },
    { id: 'stock-history', label: '8. Stock History (Audit)', path: '/admin/stock-history', icon: History },
    { id: 'purchases', label: '9. Purchases', path: '/admin/purchases', icon: ShoppingCart },
    { id: 'orders', label: '10. Orders', path: '/admin/orders', icon: Package },
    { id: 'customers', label: '11. Customers', path: '/admin/customers', icon: Users },
    { id: 'billing', label: '12. Billing & Invoices', path: '/admin/billing', icon: FileText },
    { id: 'qr-settings', label: '13. QR Payment Settings', path: '/admin/qr-settings', icon: QrCode },
    { id: 'payment-verification', label: '14. Payment Verification', path: '/admin/payment-verification', icon: CheckSquare },
    { id: 'expenses', label: '15. Expenses', path: '/admin/expenses', icon: Receipt },
    { id: 'profit-loss', label: '16. Profit & Loss', path: '/admin/profit-loss', icon: TrendingUp },
    { id: 'analytics', label: '17. Analytics', path: '/admin/analytics', icon: BarChart3 },
    { id: 'notifications', label: '18. Notifications', path: '/admin/notifications', icon: Bell },
    { id: 'settings', label: '19. Website Settings', path: '/admin/settings', icon: Settings },
    { id: 'business-contacts', label: '20. Business Contacts', path: '/admin/business-contacts', icon: PhoneCall },
    { id: 'profile', label: '21. Admin Profile', path: '/admin/profile', icon: UserCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-canvas-pattern text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row transition-colors relative">
      {/* SIDEBAR (Desktop - Interior Dark Component) */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 xl:w-72 bg-[#0c0c10] border-r border-zinc-800 text-white flex-shrink-0 z-30 transition-colors shadow-2xl">
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <Logo variant="unified" size="small" showTagline={false} />
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
            ADMIN SAAS
          </span>
        </div>

        {/* Brand Filter Switcher Inside Sidebar */}
        {onSelectBrand && (
          <div className="p-3 border-b border-zinc-800 bg-[#121218]">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5 px-1">
              Active Store Filter
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-bold text-center shadow-inner">
              <button
                onClick={() => onSelectBrand('all')}
                className={`py-1.5 rounded-lg transition ${activeBrand === 'all' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => onSelectBrand('nanova_tees')}
                className={`py-1.5 rounded-lg transition ${activeBrand === 'nanova_tees' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}
              >
                Tees
              </button>
              <button
                onClick={() => onSelectBrand('surprise_nanova')}
                className={`py-1.5 rounded-lg transition ${activeBrand === 'surprise_nanova' ? 'bg-amber-500 text-black shadow-sm' : 'text-amber-400/90 hover:text-amber-300'}`}
              >
                Gifts
              </button>
            </div>
          </div>
        )}

        {/* 21 Nav Items List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-zinc-800 text-white font-extrabold shadow-md border border-zinc-700'
                    : 'text-zinc-300 hover:bg-zinc-850 hover:text-white hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Item 21: Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition mt-4"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>20. Logout</span>
          </button>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-zinc-800 bg-[#08080c] flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{admin?.full_name || 'Business Owner'}</p>
            <p className="text-[10px] text-zinc-400 truncate">{admin?.email || 'admin@nanova.com'}</p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="p-1.5 text-zinc-300 hover:text-white bg-zinc-800 rounded-lg border border-zinc-700 shadow-sm"
            title="View Live Storefront"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* MAIN ADMIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Top Header (Interior Dark Component) */}
        <header className="h-16 bg-[#0c0c10] border-b border-zinc-800 px-4 sm:px-6 flex items-center justify-between z-20 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white bg-zinc-800 border border-zinc-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-white hidden sm:block tracking-wide">
              Centralized Enterprise Business Management
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Chime Test Button */}
            <button
              onClick={playAlertChime}
              className="p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-800 border border-zinc-700 transition shadow-sm"
              title="Test Order Chime Sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-800 border border-zinc-700 transition shadow-sm"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl text-zinc-200 hover:text-white bg-zinc-800 border border-zinc-700 transition shadow-sm"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-96 bg-[#121218] border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 animate-scaleUp text-white">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-400" /> Notifications Stream
                    </span>
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-zinc-400 hover:text-white"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60 my-2">
                    {liveNotifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-zinc-400">No new notifications</p>
                    ) : (
                      liveNotifications.slice(0, 8).map((notif, i) => (
                        <div key={i} className="py-2.5 space-y-1">
                          <p className="text-xs font-bold text-white">{notif.title}</p>
                          <p className="text-[11px] text-zinc-300 line-clamp-2">{notif.message}</p>
                          <span className="text-[9px] text-zinc-400">{new Date(notif.created_at).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <Link
                    to="/admin/notifications"
                    onClick={() => setNotifDropdownOpen(false)}
                    className="block text-center pt-2 border-t border-zinc-800 text-xs font-bold text-amber-400 hover:text-amber-300"
                  >
                    View All Notifications →
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Link to Store */}
            <Link
              to="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition shadow-sm"
            >
              <span>View Store</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </Link>
          </div>
        </header>

        {/* MOBILE SIDEBAR MODAL */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div
              className="w-72 max-w-[85vw] bg-[#0c0c10] h-full p-4 flex flex-col justify-between border-r border-zinc-800 shadow-2xl text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <Logo variant="unified" size="small" showTagline={false} />
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {onSelectBrand && (
                <div className="py-3 border-b border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5 px-1">
                    Active Store Filter
                  </span>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-bold text-center">
                    <button
                      onClick={() => { onSelectBrand('all'); setMobileSidebarOpen(false); }}
                      className={`py-1.5 rounded-lg transition ${activeBrand === 'all' ? 'bg-white text-black' : 'text-zinc-400'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => { onSelectBrand('nanova_tees'); setMobileSidebarOpen(false); }}
                      className={`py-1.5 rounded-lg transition ${activeBrand === 'nanova_tees' ? 'bg-white text-black' : 'text-zinc-400'}`}
                    >
                      Tees
                    </button>
                    <button
                      onClick={() => { onSelectBrand('surprise_nanova'); setMobileSidebarOpen(false); }}
                      className={`py-1.5 rounded-lg transition ${activeBrand === 'surprise_nanova' ? 'bg-amber-500 text-black' : 'text-amber-400/90'}`}
                    >
                      Gifts
                    </button>
                  </div>
                </div>
              )}

              <nav className="flex-1 overflow-y-auto py-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span>20. Logout</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Content Body (Designer Canvas Pattern with Blueprint Micro-Grid) */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden bg-transparent relative">
          {children}
        </main>
      </div>
    </div>
  );
}
