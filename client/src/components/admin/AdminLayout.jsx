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
  Moon,
  ChevronDown,
  ChevronRight,
  MoreHorizontal
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

  // Simplified Core Menu (6 Clean, High-Level Items)
  const coreNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard & P&L',
      path: '/admin',
      icon: LayoutDashboard,
      badge: 'Dual-Brand',
      description: 'Revenue, Profit & Brand Breakdown'
    },
    {
      id: 'billing',
      label: 'Manual Bill & Invoices',
      path: '/admin/billing',
      icon: Receipt,
      badge: 'Create Bill',
      description: 'Manual Bill Generator & PDF Invoices'
    },
    {
      id: 'products',
      label: 'Products & Stock',
      path: '/admin/products',
      icon: Package,
      description: 'Catalog, pricing & stock adjustments'
    },
    {
      id: 'orders',
      label: 'Orders & Deliveries',
      path: '/admin/orders',
      icon: ShoppingCart,
      description: 'Online orders & delivery tracking'
    },
    {
      id: 'customers',
      label: 'Customers & CRM',
      path: '/admin/customers',
      icon: Users,
      description: 'Customer directory & WhatsApp'
    },
    {
      id: 'settings',
      label: 'Store & QR Settings',
      path: '/admin/settings',
      icon: Settings,
      description: 'UPI QR payment & contacts'
    }
  ];

  // Advanced Tools (Secondary & Reports)
  const advancedNavItems = [
    { id: 'adjust', label: 'Data Reset & Cleanups', path: '/admin/adjust', icon: SlidersHorizontal },
    { id: 'expenses', label: 'Expenses & Overhead', path: '/admin/expenses', icon: TrendingUp },
    { id: 'purchases', label: 'Supplier Purchases', path: '/admin/purchases', icon: ShoppingBagIcon },
    { id: 'inventory', label: 'Size+Color Matrix', path: '/admin/inventory', icon: Layers },
    { id: 'stock-history', label: 'Stock Audit History', path: '/admin/stock-history', icon: History },
    { id: 'payment-verification', label: 'Payment Approvals', path: '/admin/payment-verification', icon: CheckSquare },
    { id: 'gallery', label: 'Moments Gallery', path: '/admin/gallery', icon: Instagram },
    { id: 'analytics', label: 'Analytics & Trends', path: '/admin/analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications Stream', path: '/admin/notifications', icon: Bell },
    { id: 'profile', label: 'Admin Profile', path: '/admin/profile', icon: UserCheck }
  ];

  // Auto-expand advanced tools if currently visiting an advanced route
  const isVisitingAdvanced = advancedNavItems.some((it) => location.pathname === it.path);
  const [moreToolsOpen, setMoreToolsOpen] = useState(isVisitingAdvanced);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-canvas-pattern text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row transition-colors relative">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0c0c11] border-r border-zinc-800 text-white flex-shrink-0 z-30 transition-colors shadow-2xl">
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <Logo variant="unified" size="small" showTagline={false} />
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            ADMIN PANEL
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
                className={`py-1.5 rounded-lg transition ${
                  activeBrand === 'all' ? 'bg-white text-black shadow-sm font-extrabold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Combined
              </button>
              <button
                onClick={() => onSelectBrand('nanova_tees')}
                className={`py-1.5 rounded-lg transition ${
                  activeBrand === 'nanova_tees' ? 'bg-white text-black shadow-sm font-extrabold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tees
              </button>
              <button
                onClick={() => onSelectBrand('surprise_nanova')}
                className={`py-1.5 rounded-lg transition ${
                  activeBrand === 'surprise_nanova'
                    ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                    : 'text-amber-400/90 hover:text-amber-300'
                }`}
              >
                Gifts
              </button>
            </div>
          </div>
        )}

        {/* Short & Clean Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="px-3 py-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Main Operations
            </span>
          </div>

          {coreNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-zinc-800 to-zinc-900 text-white font-black shadow-lg border border-zinc-700'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block truncate font-bold text-xs">{item.label}</span>
                    <span className="block truncate text-[10px] text-zinc-500 font-normal">
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Collapsible More Tools Section */}
          <div className="pt-3 border-t border-zinc-800/80 mt-3">
            <button
              onClick={() => setMoreToolsOpen(!moreToolsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition"
            >
              <div className="flex items-center gap-2">
                <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                <span>More Tools &amp; Reports</span>
              </div>
              {moreToolsOpen ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {moreToolsOpen && (
              <div className="space-y-1 mt-1 pl-2">
                {advancedNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-medium transition ${
                        isActive
                          ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
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
        {/* Top Header */}
        <header className="h-16 bg-[#0c0c10] border-b border-zinc-800 px-4 sm:px-6 flex items-center justify-between z-20 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-800 border border-zinc-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-white hidden sm:block tracking-wide">
              Centralized Enterprise Business Management
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Bill Shortcut Button in Header */}
            <Link
              to="/admin/billing"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>+ New Bill</span>
            </Link>

            {/* Chime Sound Test */}
            <button
              onClick={playAlertChime}
              className="p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-800 border border-zinc-700 transition shadow-sm"
              title="Test Order Chime Sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-800 border border-zinc-700 transition shadow-sm"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
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
                    View All Notifications &rarr;
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

        {/* MOBILE SIDEBAR DRAWER */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div
              className="w-72 max-w-[85vw] bg-[#0c0c10] h-full p-4 flex flex-col justify-between border-r border-zinc-800 shadow-2xl text-white overflow-y-auto"
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
                      className={`py-1.5 rounded-lg transition ${activeBrand === 'all' ? 'bg-white text-black font-bold' : 'text-zinc-400'}`}
                    >
                      Combined
                    </button>
                    <button
                      onClick={() => { onSelectBrand('nanova_tees'); setMobileSidebarOpen(false); }}
                      className={`py-1.5 rounded-lg transition ${activeBrand === 'nanova_tees' ? 'bg-white text-black font-bold' : 'text-zinc-400'}`}
                    >
                      Tees
                    </button>
                    <button
                      onClick={() => { onSelectBrand('surprise_nanova'); setMobileSidebarOpen(false); }}
                      className={`py-1.5 rounded-lg transition ${activeBrand === 'surprise_nanova' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400/90'}`}
                    >
                      Gifts
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Main Nav */}
              <nav className="flex-1 py-3 space-y-1">
                <div className="px-2 py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Main Menu
                  </span>
                </div>
                {coreNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        isActive ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Mobile Advanced Links */}
                <div className="pt-2 border-t border-zinc-800 mt-2 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase px-2 block">
                    More Tools
                  </span>
                  {advancedNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden bg-transparent relative">
          {children}
        </main>
      </div>
    </div>
  );
}

// Icon helper
function ShoppingBagIcon(props) {
  return <ShoppingCart {...props} />;
}
