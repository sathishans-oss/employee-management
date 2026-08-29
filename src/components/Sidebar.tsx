import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCheck,
  LogOut,
  X,
  Database,
  Layers,
} from 'lucide-react';
import { AppRoute } from '../types';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: AppRoute) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const { logout, isAdmin } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      route: '/admin' as AppRoute,
      icon: LayoutDashboard,
    },
    {
      label: 'Employees',
      route: '/admin/employees' as AppRoute,
      icon: Users,
    },
    {
      label: 'Add Employee',
      route: '/admin/employees/add' as AppRoute,
      icon: UserPlus,
    },
    {
      label: 'My Profile',
      route: '/profile' as AppRoute,
      icon: UserCheck,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="admin-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between md:hidden">
          <span className="font-bold text-slate-900 text-sm">Navigation</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Admin Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentRoute === item.route ||
              (item.route === '/admin/employees' && currentRoute.startsWith('/admin/employees/edit'));

            return (
              <button
                key={item.route}
                id={`nav-link-${item.route.replace(/\//g, '-')}`}
                type="button"
                onClick={() => {
                  onNavigate(item.route);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Phase Info & System Badge */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-2xl border">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Phase 3 • Live Workflow</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Google Sheets + Google Apps Script backend active.
          </p>
        </div>

        {/* Logout at bottom of sidebar */}
        <div className="p-3 border-t border-slate-200">
          <button
            type="button"
            id="sidebar-logout-btn"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
