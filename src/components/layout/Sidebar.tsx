import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { uiStore } from '@/store/uiStore';
import { authStore, useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  DashboardCircleIcon,
  Car01Icon,
  CreditCardIcon,
  Settings01Icon,
  Menu02Icon,
  Logout01Icon
} from '@hugeicons/core-free-icons';
import vaahanLogo from '@/assets/logo.svg';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(uiStore.getIsSidebarCollapsed());
  const { phone } = useAuthStore();

  useEffect(() => {
    const unsubscribe = uiStore.subscribe(() => {
      setCollapsed(uiStore.getIsSidebarCollapsed());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: DashboardCircleIcon, end: true },
    { to: '/dashboard/vehicles', label: 'Vehicles', icon: Car01Icon },
    { to: '/dashboard/billing', label: 'Billing & Checkout', icon: CreditCardIcon },
    { to: '/dashboard/profile', label: 'Settings', icon: Settings01Icon },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col h-screen sticky top-0 left-0 bg-[#0c0c0f] border-r border-zinc-900 select-none overflow-hidden shrink-0 z-40 text-white font-sans"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-900 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <img src={vaahanLogo} alt="Logo" className="h-7 w-auto shrink-0" />
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-black tracking-widest font-display shrink-0"
            >
              VAAHAN<span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">SAFE</span>
            </motion.span>
          )}
        </Link>
        <button
          onClick={() => uiStore.setSidebarCollapsed(!collapsed)}
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={Menu02Icon} className="size-4" />
        </button>
      </div>

      {/* Menu links */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => 
              `flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all font-medium text-xs tracking-wide cursor-pointer ${
                isActive 
                  ? 'bg-brand text-white border border-brand/20 shadow-lg shadow-brand/10' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`
            }
          >
            <HugeiconsIcon icon={item.icon} className="size-4 shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Owner Profile / Logout info */}
      <div className="p-3 border-t border-zinc-900 shrink-0">
        <div className={`flex items-center justify-between p-2 rounded-lg bg-zinc-900/30 ${collapsed ? 'justify-center' : ''}`}>
          {!collapsed && (
            <div className="text-left font-mono">
              <span className="block text-[8px] text-zinc-500 font-bold uppercase">Authorized Phone</span>
              <span className="block text-xs text-white font-bold">{phone || 'Guest'}</span>
            </div>
          )}
          <button
            onClick={() => authStore.logout()}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
            title="Log Out"
          >
            <HugeiconsIcon icon={Logout01Icon} className="size-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
