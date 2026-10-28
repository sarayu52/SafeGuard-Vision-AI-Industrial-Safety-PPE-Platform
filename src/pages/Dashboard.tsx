import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  AlertTriangle,
  HardHat,
  Eye,
  TrendingDown,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Upload,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { DashboardKPIs, SafetyAlert } from '../types';

interface DashboardProps {
  selectedSite: string;
  onNavigateToReport: (analysisId: string) => void;
  onNavigateToUpload: () => void;
  onNavigateToAlerts: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  selectedSite,
  onNavigateToReport,
  onNavigateToUpload,
  onNavigateToAlerts,
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<SafetyAlert[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [trendsData, setTrendsData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, [selectedSite, selectedIndustry, selectedDateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, trendsRes] = await Promise.all([
        api.getDashboardSummary({
          site: selectedSite === 'All' ? undefined : selectedSite,
          industry: selectedIndustry === 'All' ? undefined : selectedIndustry,
        }),
        api.getDashboardTrends({
          site: selectedSite === 'All' ? undefined : selectedSite,
          industry: selectedIndustry === 'All' ? undefined : selectedIndustry,
        }),
      ]);

      setKpis(summaryRes.kpis);
      setRecentAlerts(summaryRes.recentAlerts);
      setRecentAnalyses(summaryRes.recentAnalyses);
      setTrendsData(trendsRes);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !kpis) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Loading Power BI Telemetry &amp; Database Records...</p>
      </div>
    );
  }

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#6366f1', '#06b6d4'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Power BI-Style Slicers & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Power BI Slicers:</span>
          </div>

          {/* Industry Slicer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="text-slate-500 font-medium">Industry:</span>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
            >
              <option value="All">All Sectors</option>
              <option value="Construction Sites">Construction Sites</option>
              <option value="Automobile Manufacturing">Automobile Manufacturing</option>
              <option value="Automobile Assembly Lines">Automobile Assembly Lines</option>
              <option value="Industrial Production Units">Industrial Production Units</option>
              <option value="Warehouses and Logistics Centers">Warehouses &amp; Logistics</option>
            </select>
          </div>

          {/* Date Range Slicer */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setSelectedDateRange('today')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedDateRange === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDateRange('7d')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedDateRange === '7d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setSelectedDateRange('30d')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedDateRange === '30d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New Media</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Overall Safety Score */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Safety Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{kpis?.overallSafetyScore}%</span>
            <span className="text-[11px] font-medium text-emerald-600">OSHA Weighted</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${kpis?.overallSafetyScore || 0}%` }}
            />
          </div>
        </div>

        {/* Overall Risk Score */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Risk Score</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{kpis?.overallRiskScore}%</span>
            <span className="text-[11px] font-medium text-slate-500">Aggregate</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${kpis?.overallRiskScore || 0}%` }}
            />
          </div>
        </div>

        {/* Confirmed Violations */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Confirmed Violations</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">{kpis?.confirmedViolations}</span>
            <span className="text-[11px] text-slate-500">Incidents</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-3">
            <span>High Risk: {kpis?.highRiskIncidents}</span>
            <span>·</span>
            <span>Unverified: {kpis?.unverifiedChecks}</span>
          </div>
        </div>

        {/* Workers Detected */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Worker Detections</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{kpis?.totalWorkersDetected}</span>
            <span className="text-[11px] text-slate-500">Persons</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-3">
            <span>Evaluated PPE: {kpis?.totalPPEDetections}</span>
          </div>
        </div>

        {/* Total Media Analyzed */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs col-span-2 md:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Surveillance Media</span>
            <Layers className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {(kpis?.totalImagesAnalyzed || 0) + (kpis?.totalVideosAnalyzed || 0)}
            </span>
            <span className="text-[11px] text-slate-500">Total</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-3">
            <span>{kpis?.totalImagesAnalyzed} Images</span>
            <span>·</span>
            <span>{kpis?.totalVideosAnalyzed} Videos</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Longitudinal Trends & PPE Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Safety &amp; Risk Score Trajectory</h3>
              <p className="text-xs text-slate-500">Longitudinal weighted performance across surveillance cycles</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-teal-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Safety Score (%)
              </span>
              <span className="flex items-center gap-1.5 text-red-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Risk Score (%)
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData?.trends || []}>
                <defs>
                  <linearGradient id="colorSafety" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="safetyScore" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorSafety)" name="Safety Score" />
                <Area type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" name="Risk Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PPE Violation Distribution Pie */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">PPE Violation Distribution</h3>
            <p className="text-xs text-slate-500">Distribution by required protective equipment</p>
          </div>
          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trendsData?.violationDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(trendsData?.violationDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {(trendsData?.violationDistribution || []).map((item: any, i: number) => (
              <div key={item.name} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {item.name}
                </span>
                <span className="font-semibold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Gear Compliance Bar Chart & Site Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance by Equipment Category */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">PPE Item Compliance vs Violations</h3>
              <p className="text-xs text-slate-500">Breakdown of verified gear against OSHA safety baseline</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendsData?.gearCompliance || []} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="compliant" fill="#10b981" name="Compliant (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="violations" fill="#ef4444" name="Violations (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industrial Site Benchmarking */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Facility &amp; Plant Benchmarking</h3>
              <p className="text-xs text-slate-500">Cross-site comparative safety rating and incident density</p>
            </div>
          </div>
          <div className="space-y-3">
            {(trendsData?.siteComparisons || []).map((site: any) => (
              <div key={site.site} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{site.site}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{site.analysesCount} Surveillance Analyses</span>
                    <span>·</span>
                    <span className="text-red-500 font-medium">{site.violations} Violations Flagged</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">{site.avgSafety}%</span>
                  <p className="text-[10px] text-slate-500">Safety Index</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Critical Alerts & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Critical Alerts */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Recent Safety Violations &amp; Alerts
              </h3>
              <p className="text-xs text-slate-500">High-priority non-compliance events requiring action</p>
            </div>
            <button
              onClick={onNavigateToAlerts}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
            >
              View All Alerts
            </button>
          </div>
          <div className="space-y-2.5">
            {recentAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active violation alerts.</p>
            ) : (
              recentAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        alt.severity === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : alt.severity === 'High'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {alt.severity}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{alt.site_name}</span>
                      {alt.track_id && (
                        <span className="text-[11px] font-mono text-slate-500">[{alt.track_id}]</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{alt.message}</p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span className="capitalize">{alt.status}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateToReport(alt.analysis_id)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 rounded hover:bg-slate-50 shrink-0"
                    title="View Inspection Report"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Analyses with Thumbnails */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                Recent Surveillance Ingestions
              </h3>
              <p className="text-xs text-slate-500">Processed workplace feeds with YOLOv8 inference</p>
            </div>
            <button
              onClick={onNavigateToUpload}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
            >
              + Ingest Media
            </button>
          </div>
          <div className="space-y-2.5">
            {recentAnalyses.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No surveillance media recorded yet.</p>
            ) : (
              recentAnalyses.map((ana) => (
                <div
                  key={ana.id}
                  onClick={() => onNavigateToReport(ana.id)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-teal-400 bg-white transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {ana.media_type === 'video' ? 'VID' : 'IMG'}
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-900 truncate max-w-[220px]">
                        {ana.original_name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {ana.site_name} · {ana.total_persons} Workers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className={`text-xs font-bold ${
                        ana.safety_score >= 90
                          ? 'text-emerald-600'
                          : ana.safety_score >= 75
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}>
                        {ana.safety_score}%
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {ana.confirmed_violations} Violations
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
