import React from 'react';
import {
  Bell,
  Upload,
  Cpu,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  selectedSite: string;
  onSelectSite: (site: string) => void;
  activeAlertCount: number;
  onQuickUpload: () => void;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  selectedSite,
  onSelectSite,
  activeAlertCount,
  onQuickUpload,
  onOpenAlerts,
}) => {
  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Industrial Safety & PPE Intelligence Dashboard',
      subtitle: 'Real-time database-derived workplace compliance and risk telemetry',
    },
    upload: {
      title: 'Workplace Media Ingestion & YOLOv8 Analysis',
      subtitle: 'Upload images or video streams for automated PPE violation detection',
    },
    report: {
      title: 'Individual Incident & Media Analysis Report',
      subtitle: 'Per-worker spatial bounding boxes, confidence tags, and compliance audit',
    },
    alerts: {
      title: 'Safety Violation Alerts & Active Incidents',
      subtitle: 'Detection-time violation event queue and resolution tracking',
    },
    gallery: {
      title: 'Workplace Media Gallery & Evidence Database',
      subtitle: 'Persistent storage of raw surveillance media and annotated inspection outputs',
    },
    analytics: {
      title: 'Daily & Historical Safety Analytics',
      subtitle: 'Longitudinal trend modeling, PPE gear benchmarks, and shift reports',
    },
    tracks: {
      title: 'Worker & Visual Track Longitudinal Analysis',
      subtitle: 'Cross-frame anonymous tracking IDs and recurring non-compliance zones',
    },
    policy: {
      title: 'Safety Policy, Violation Weights & Model Settings',
      subtitle: 'OSHA / ISO-compliant weighted scoring algorithms and model thresholds',
    },
    users: {
      title: 'User & Access Role Administration',
      subtitle: 'Manage administrators, site safety managers, and field inspectors',
    },
    profile: {
      title: 'Safety Officer Profile & System Diagnostics',
      subtitle: 'Session configuration, YOLOv8 model registry, and environment status',
    },
  };

  const currentMeta = pageTitles[currentTab] || {
    title: 'SafeGuard Vision Platform',
    subtitle: 'Industrial PPE & Risk Telemetry',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20">
      {/* Title & Subtitle */}
      <div className="flex flex-col">
        <h2 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          {currentMeta.title}
        </h2>
        <p className="text-xs text-slate-500 hidden sm:block">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* Right Controls: Site Selector, AI Model Pill, Alert Bell, Upload Button */}
      <div className="flex items-center gap-3">
        {/* Site Filter Slicer */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedSite}
            onChange={(e) => onSelectSite(e.target.value)}
            className="bg-transparent border-none text-slate-700 text-xs font-medium focus:outline-none cursor-pointer"
          >
            <option value="All">All Industrial Sites</option>
            <option value="Apex Construction Site B">Apex Construction Site B</option>
            <option value="Detroit Auto Works Plant 3">Detroit Auto Works Plant 3</option>
            <option value="Central Distribution Hub 1">Central Distribution Hub 1</option>
            <option value="Nova Chemical Synthesis Complex">Nova Chemical Complex</option>
          </select>
        </div>

        {/* Model Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-[11px]">YOLOv8x PPE Engine · Ready</span>
        </div>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="View active safety alerts"
          aria-label="View active safety alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold ring-2 ring-white">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* Quick Upload CTA */}
        <button
          onClick={onQuickUpload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload &amp; Analyze</span>
        </button>
      </div>
    </header>
  );
};
