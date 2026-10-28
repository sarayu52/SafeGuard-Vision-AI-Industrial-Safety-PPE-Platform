import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  UploadCloud,
  FileBarChart,
  Bell,
  Film,
  TrendingUp,
  UserCheck,
  Sliders,
  Users,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HardHat,
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertCount: number;
  userName: string;
  userRole: UserRole;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeAlertCount,
  userName,
  userRole,
  onLogout,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload & Analyze Media', icon: UploadCloud },
    { id: 'report', label: 'Individual Report', icon: FileBarChart },
    { id: 'alerts', label: 'Alerts & Violations', icon: Bell, badge: activeAlertCount },
    { id: 'gallery', label: 'Media Gallery & DB', icon: Film },
    { id: 'analytics', label: 'Daily & Historical Analytics', icon: TrendingUp },
    { id: 'tracks', label: 'Worker / Track Analysis', icon: UserCheck },
    { id: 'policy', label: 'Safety Policy Settings', icon: Sliders },
    { id: 'users', label: 'User & Admin Management', icon: Users, roleRestriction: 'admin' },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 shrink-0">
              <HardHat className="w-5 h-5 text-teal-400" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="text-sm font-semibold tracking-wide text-white flex items-center gap-1.5">
                  SafeGuard <span className="text-teal-400 font-mono text-xs font-normal">VISION</span>
                </h1>
                <p className="text-[11px] text-slate-400 tracking-tight truncate">
                  AI PPE &amp; Risk Platform
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar collapse"
            className="hidden md:flex p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            if (item.roleRestriction === 'admin' && userRole !== 'admin') {
              return null;
            }
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <div className="w-8 h-8 rounded-md bg-slate-700 flex items-center justify-center text-teal-300 text-xs font-bold shrink-0">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{userName || 'Safety Officer'}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="capitalize">{userRole.replace('_', ' ')}</span>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
