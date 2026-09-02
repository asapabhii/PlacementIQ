import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Building2, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CompanyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-surface-900 text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-surface-900 border-r border-white/5 relative z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 text-primary-400 font-bold text-xl tracking-tight">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 overflow-hidden">
              <img src="/logo.jpg" alt="PlacementIQ Logo" className="w-full h-full object-cover" />
            </div>
            PlacementIQ
          </div>
          <div className="mt-1 text-xs text-gray-500 uppercase tracking-widest">Recruiter Portal</div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/company"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive ? 'bg-primary-500/10 text-primary-400 font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`
            }
          >
            <Briefcase size={18} /> My Drives
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-400 hover:bg-danger-500/10 hover:text-danger-400 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px] pointer-events-none" />
        <Outlet />
      </main>
    </div>
  );
}
