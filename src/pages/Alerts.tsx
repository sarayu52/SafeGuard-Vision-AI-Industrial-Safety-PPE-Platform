import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Clock,
  Building2,
  ExternalLink,
  ShieldAlert,
  Check,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { SafetyAlert } from '../types';

interface AlertsProps {
  onNavigateToReport: (analysisId: string) => void;
  defaultSite?: string;
}

export const Alerts: React.FC<AlertsProps> = ({ onNavigateToReport, defaultSite }) => {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [ppeFilter, setPpeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolution Modal
  const [selectedAlert, setSelectedAlert] = useState<SafetyAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, [statusFilter, severityFilter, ppeFilter, defaultSite]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.getAlerts({
        status: statusFilter,
        severity: severityFilter,
        ppe: ppeFilter,
        site: defaultSite === 'All' ? undefined : defaultSite,
      });
      setAlerts(res.alerts);
      setActiveCount(res.activeCount);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (alertId: string, newStatus: 'Acknowledged' | 'Resolved') => {
    setIsUpdating(true);
    try {
      await api.updateAlert(alertId, {
        status: newStatus,
        notes: resolutionNotes || (newStatus === 'Acknowledged' ? 'Operator acknowledged event in queue' : 'Corrective safety action verified on floor'),
      });
      setSelectedAlert(null);
      setResolutionNotes('');
      await loadAlerts();
    } catch (err: any) {
      alert(`Failed to update alert: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.message.toLowerCase().includes(q) ||
      a.site_name.toLowerCase().includes(q) ||
      (a.track_id && a.track_id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            Safety Violation Alerts &amp; Critical Incident Queue
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Detection-time alerts generated from verified YOLOv8 workplace PPE non-compliance events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{activeCount} Active Violations Requiring Action</span>
          </div>
        </div>
      </div>

      {/* Slicers & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {['all', 'Active', 'Acknowledged', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical Severity</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
          </select>

          {/* PPE Gear Dropdown */}
          <select
            value={ppeFilter}
            onChange={(e) => setPpeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">All PPE Gear</option>
            <option value="helmet">Missing Helmet</option>
            <option value="vest">Missing Reflective Vest</option>
            <option value="gloves">Missing Gloves</option>
            <option value="safety_shoes">Missing Safety Shoes</option>
            <option value="goggles">Missing Goggles</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts, track ID, site..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Alerts Table / Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading active alerts...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-900">Zero Matching Alerts</h4>
            <p className="text-xs text-slate-500">All workplace safety conditions in this filter range are resolved.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map((alt) => {
              const isCritical = alt.severity === 'Critical';
              const isHigh = alt.severity === 'High';
              return (
                <div
                  key={alt.id}
                  className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    alt.status === 'Active' ? 'bg-red-50/20 hover:bg-red-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isCritical ? 'bg-red-100 text-red-700' : isHigh ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isCritical ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {alt.severity}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900">{alt.message}</h4>
                        {alt.track_id && (
                          <span className="text-[11px] font-mono text-slate-500">[{alt.track_id}]</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>{alt.site_name}</span>
                        <span>·</span>
                        <span>PPE: {alt.ppe_item.toUpperCase()}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alt.created_at).toLocaleString()}
                        </span>
                        {alt.resolved_at && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-700 font-medium">Resolved by {alt.resolved_by}</span>
                          </>
                        )}
                      </div>
                      {alt.notes && (
                        <p className="text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded mt-1.5 inline-block">
                          Action Notes: {alt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onNavigateToReport(alt.analysis_id)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Inspect frame evidence"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </button>

                    {alt.status === 'Active' && (
                      <button
                        onClick={() => handleUpdateStatus(alt.id, 'Acknowledged')}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}

                    {alt.status !== 'Resolved' && (
                      <button
                        onClick={() => setSelectedAlert(alt)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolution Notes Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Resolve Safety Alert · {selectedAlert.track_id}
            </h3>
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {selectedAlert.message} at {selectedAlert.site_name}
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Corrective Action / Resolution Notes
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Worker was immediately instructed to put on high-vis vest and inspected by floor supervisor..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(selectedAlert.id, 'Resolved')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
              >
                {isUpdating ? 'Saving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
