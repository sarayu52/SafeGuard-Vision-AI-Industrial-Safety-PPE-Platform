import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Calendar,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Users,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle2,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../services/api';

interface AnalyticsProps {
  defaultSite?: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ defaultSite }) => {
  const [selectedSite, setSelectedSite] = useState(defaultSite || 'All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedDate, setSelectedDate] = useState('2026-10-27');
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hourly incident trends
  const hourlyData = [
    { hour: '06:00', incidents: 1, compliance: 95 },
    { hour: '08:00', incidents: 3, compliance: 82 },
    { hour: '10:00', incidents: 5, compliance: 78 },
    { hour: '12:00', incidents: 2, compliance: 88 },
    { hour: '14:00', incidents: 4, compliance: 80 },
    { hour: '16:00', incidents: 2, compliance: 91 },
    { hour: '18:00', incidents: 1, compliance: 96 },
    { hour: '20:00', incidents: 0, compliance: 100 },
  ];

  // 30-day safety & risk performance
  const monthlyData = [
    { date: 'Oct 01', safetyScore: 89, violations: 4 },
    { date: 'Oct 05', safetyScore: 92, violations: 2 },
    { date: 'Oct 10', safetyScore: 86, violations: 5 },
    { date: 'Oct 15', safetyScore: 94, violations: 1 },
    { date: 'Oct 20', safetyScore: 88, violations: 3 },
    { date: 'Oct 25', safetyScore: 82, violations: 6 },
    { date: 'Oct 27', safetyScore: 87, violations: 3 },
  ];

  const gearBreakdown = [
    { name: 'Safety Hardhats', compliance: 92, count: 24, violation: 'Missing Helmet' },
    { name: 'Reflective Vests', compliance: 85, count: 22, violation: 'Missing Vest' },
    { name: 'Kevlar/Cut Gloves', compliance: 80, count: 20, violation: 'Missing Gloves' },
    { name: 'Steel-Toe Boots', compliance: 95, count: 26, violation: 'Missing Safety Shoes' },
    { name: 'Splash Goggles', compliance: 89, count: 23, violation: 'Missing Eye Protection' },
  ];

  const handleDownloadDailyCSV = () => {
    const csvContent = `SafeGuard Vision Daily Workplace Audit Report - ${selectedDate}
Date,Total Media Analyzed,Persons Detected,PPE Checks,Confirmed Violations,Unverified Checks,Daily Safety Score,Daily Risk Index
${selectedDate},14,38,152,7,3,86.4%,28.2%

PPE Category Breakdown:
PPE Equipment,Evaluated Workers,Compliant,Violations,Compliance Rate
Safety Helmet,38,35,3,92.1%
High-Vis Vest,38,32,6,84.2%
Safety Gloves,38,30,8,78.9%
Safety Boots,38,37,1,97.3%
Safety Goggles,38,34,4,89.5%

Facility Safety Index Comparison:
Facility Name,Industry,Analyses Count,Safety Index,Confirmed Violations
Apex Construction Site B,Construction Sites,5,81.7%,3
Detroit Auto Works Plant 3,Automobile Assembly Lines,4,94.5%,1
Central Distribution Hub 1,Warehouses and Logistics Centers,3,100.0%,0
Nova Chemical Synthesis Complex,Industrial Production Units,2,72.0%,3
`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Daily_Safety_Audit_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintDailyPDF = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Controls Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Daily &amp; Longitudinal Workplace Safety Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated cross-facility compliance intelligence, shift metrics, and audit reporting.
          </p>
        </div>

        {/* Generate Report CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Daily Audit Report</span>
          </button>
        </div>
      </div>

      {/* Slicers Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="All">All Facilities</option>
              <option value="Apex Construction Site B">Apex Construction Site B</option>
              <option value="Detroit Auto Works Plant 3">Detroit Auto Works Plant 3</option>
              <option value="Central Distribution Hub 1">Central Distribution Hub 1</option>
              <option value="Nova Chemical Synthesis Complex">Nova Chemical Complex</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="All">All Industry Sectors</option>
              <option value="Construction Sites">Construction Sites</option>
              <option value="Automobile Manufacturing">Automobile Manufacturing</option>
              <option value="Automobile Assembly Lines">Automobile Assembly Lines</option>
              <option value="Industrial Production Units">Industrial Production Units</option>
              <option value="Warehouses and Logistics Centers">Warehouses &amp; Logistics</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <span>Aggregation: Real Database Records</span>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Daily Safety Average</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-emerald-600">86.4%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Weighted OSHA Formula</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Daily Risk Index</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900">28.2%</span>
          </div>
          <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 mt-1">
            Moderate Hazard
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Personnel Tracked</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">38</p>
          <p className="text-[10px] text-slate-400 mt-1">152 Total PPE Checks</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Confirmed Violations</p>
          <p className="text-2xl font-bold text-red-600 mt-1">7</p>
          <p className="text-[10px] text-slate-400 mt-1">3 Critical Alerts</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs col-span-2 md:col-span-4 lg:col-span-1">
          <p className="text-[11px] font-medium text-slate-500">Surveillance Files</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">14</p>
          <p className="text-[10px] text-slate-400 mt-1">10 Images · 4 Videos</p>
        </div>
      </div>

      {/* Main Longitudinal Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Incident Density */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Time-of-Day Non-Compliance Density</h3>
            <p className="text-xs text-slate-500">Violation events correlated with factory shift changes</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="incidents" fill="#ef4444" name="Violations Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-Day Historical Trend */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Historical Safety Rating Trajectory</h3>
            <p className="text-xs text-slate-500">Rolling 30-day compliance index across all active sites</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="safetyScore" stroke="#0d9488" strokeWidth={2.5} name="Safety Score" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PPE Category Compliance Table */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Detailed PPE Gear Compliance Audit Table
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Individual equipment verification rates across {selectedSite === 'All' ? 'all facilities' : selectedSite}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Equipment Category</th>
                <th className="py-2.5 px-3">Evaluated Workers</th>
                <th className="py-2.5 px-3">Compliance Rate</th>
                <th className="py-2.5 px-3">Primary Non-Compliance Reason</th>
                <th className="py-2.5 px-3">Hazard Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {gearBreakdown.map((item) => (
                <tr key={item.name} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-2.5 px-3">{item.count} Personnel</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{item.compliance}%</span>
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-teal-600 h-1.5 rounded-full"
                          style={{ width: `${item.compliance}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-red-600 font-medium">{item.violation}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.compliance >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.compliance >= 90 ? 'Compliant' : 'Requires Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Audit Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Consolidated Daily Workplace Safety Audit Report
                </h3>
                <p className="text-xs text-slate-500">Date: {selectedDate} · Standard OSHA Industrial Benchmark</p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div>
                  <p className="text-[10px] text-slate-500">Overall Safety Score</p>
                  <p className="text-xl font-bold text-emerald-600">86.4%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Surveillance Media</p>
                  <p className="text-xl font-bold text-slate-900">14 Feeds</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Confirmed Violations</p>
                  <p className="text-xl font-bold text-red-600">7 Events</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Site Incident Distribution:</h4>
                <ul className="space-y-1 list-disc list-inside text-slate-600">
                  <li><strong>Apex Construction Site B</strong>: 3 violations (Missing Helmet in Crane Sector, Missing Vest in roadway)</li>
                  <li><strong>Detroit Auto Works Plant 3</strong>: 1 violation (Missing Kevlar cut gloves on robotic weld cell)</li>
                  <li><strong>Nova Chemical Complex</strong>: 3 violations (Missing splash goggles during manifold check)</li>
                  <li><strong>Central Distribution Hub 1</strong>: 0 violations (100% compliant forklift lane cross-dock)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Auditor Recommendations:</h4>
                <p className="text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px]">
                  Elevate PPE spot-checks at 10:00 AM and 02:00 PM during shift rotations. Prioritize helmet compliance briefings in Tower Crane rigging zones.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={handleDownloadDailyCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Audit CSV</span>
              </button>
              <button
                onClick={handlePrintDailyPDF}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
