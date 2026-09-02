import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';
import {
  LayoutDashboard, Building2, Car, Gift, FileBarChart,
  Bell, LogOut, ChevronLeft, ChevronRight, Zap,
  User, Briefcase, ClipboardList, Trophy, Shield
} from 'lucide-react';
import { useState } from 'react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/companies', icon: Building2, label: 'Companies' },
  { to: '/admin/drives', icon: Briefcase, label: 'Drives' },
  { to: '/admin/offers', icon: Gift, label: 'Offers' },
  { to: '/admin/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
];

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/student/profile', icon: User, label: 'Profile' },
  { to: '/student/drives', icon: Briefcase, label: 'Drives' },
  { to: '/student/applications', icon: ClipboardList, label: 'Applications' },
  { to: '/student/offers', icon: Trophy, label: 'Offers' },
  { to: '/student/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar({ role }) {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={clsx(
        'fixed top-0 left-0 h-screen flex flex-col z-40 transition-all duration-300',
        'bg-surface-800/90 backdrop-blur-xl border-r border-surface-600/50',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-600/50">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 overflow-hidden">
          <img src="/logo.jpg" alt="PlacementIQ Logo" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <h1 className="text-lg font-bold text-white tracking-tight">PlacementIQ</h1>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
              isActive
                ? 'bg-primary-600/15 text-primary-400 border border-primary-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700/50',
            )}
          >
            <link.icon size={20} className="shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Collapse */}
      <div className="px-3 py-3 border-t border-surface-600/50 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-gray-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-700 transition-all"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}
