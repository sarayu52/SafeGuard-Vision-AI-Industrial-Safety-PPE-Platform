import React from 'react';
import {
  User,
  Shield,
  Cpu,
  Database,
  Lock,
  LogOut,
  CheckCircle2,
  HardHat,
  Server,
  Layers,
} from 'lucide-react';
import { UserRole } from '../types';

interface ProfileSettingsProps {
  userName: string;
  userRole: UserRole;
  userEmail: string;
  onLogout: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userName,
  userRole,
  userEmail,
  onLogout,
}) => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            Safety Officer Profile &amp; Diagnostics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Current session permissions, workstation configuration, and computer-vision runtime status.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium border border-red-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* User Information Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-600 flex items-center justify-center text-xl font-bold">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{userName}</h3>
            <p className="text-xs text-slate-500">{userEmail}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 capitalize">
                {userRole.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active Session
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System & AI Architecture Details */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Industrial Safety Platform Runtime Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              Computer Vision Model
            </span>
            <p className="font-semibold text-slate-900">Ultralytics YOLOv8x PPE Engine</p>
            <p className="text-[10px] text-slate-400">Spatial Bounding Box Association · Person &amp; Gear</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Database Engine
            </span>
            <p className="font-semibold text-slate-900">SQLite (Node.js 22 Native DatabaseSync)</p>
            <p className="text-[10px] text-slate-400">PostgreSQL Migration Compatible Schema</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-purple-600" />
              REST API Server
            </span>
            <p className="font-semibold text-slate-900">Full-Stack Express + Flask YOLOv8 Bridge</p>
            <p className="text-[10px] text-slate-400">Port 3000 (Vite SPA + API Endpoints)</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              Business Intelligence Integration
            </span>
            <p className="font-semibold text-slate-900">Interactive Power BI Style Analytics</p>
            <p className="text-[10px] text-slate-400">CSV &amp; PDF Audit Export Pipeline</p>
          </div>
        </div>
      </div>
    </div>
  );
};
