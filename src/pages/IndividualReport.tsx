import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  ShieldCheck,
  ShieldAlert,
  Users,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Clock,
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Sliders,
  ChevronRight,
  HardHat,
  Layers,
  Maximize2,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { api } from '../services/api';
import { AnalysisReport, PersonDetection, SafetyAlert } from '../types';

interface IndividualReportProps {
  analysisId: string | null;
  onBackToDashboard: () => void;
  onBackToGallery: () => void;
}

export const IndividualReport: React.FC<IndividualReportProps> = ({
  analysisId,
  onBackToDashboard,
  onBackToGallery,
}) => {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View controls
  const [viewMode, setViewMode] = useState<'overlay' | 'raw' | 'split'>('overlay');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.95);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [customConf, setCustomConf] = useState(0.50);

  useEffect(() => {
    loadReport();
  }, [analysisId]);

  const loadReport = async () => {
    if (!analysisId) {
      try {
        const mediaList = await api.getMediaList();
        if (mediaList.length > 0 && mediaList[0].analysis_id) {
          const rep = await api.getAnalysisReport(mediaList[0].analysis_id);
          setReport(rep);
          if (rep.persons.length > 0) setSelectedWorkerId(rep.persons[0].id);
        } else {
          setError('No inspection records available. Please upload a media file first.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rep = await api.getAnalysisReport(analysisId);
      setReport(rep);
      if (rep.persons.length > 0) setSelectedWorkerId(rep.persons[0].id);
    } catch (err: any) {
      setError(err.message || 'Report not found');
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!report) return;
    setIsReanalyzing(true);
    try {
      await api.reanalyzeMedia(report.media.id, {
        confidenceThreshold: customConf,
      });
      await loadReport();
    } catch (err: any) {
      alert(`Re-analysis failed: ${err.message}`);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;
    const headers = [
      'Analysis ID',
      'Media Name',
      'Site Name',
      'Industry',
      'Worker Track ID',
      'Compliance Status',
      'PPE Item',
      'PPE Status',
      'Model Confidence',
      'Overall Safety Score',
      'Timestamp',
    ];

    const rows: string[][] = [];
    report.persons.forEach((w) => {
      Object.entries(w.ppeChecks).forEach(([item, check]) => {
        rows.push([
          report.analysis.id,
          `"${report.media.original_name}"`,
          `"${report.media.site_name}"`,
          `"${report.media.industry}"`,
          w.trackId,
          w.complianceStatus,
          item,
          check.status,
          `${Math.round(check.confidence * 100)}%`,
          `${report.analysis.safety_score}%`,
          report.analysis.created_at,
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SafeGuard_Audit_${report.analysis.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Retrieving Full Analysis Report &amp; Detections...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Report Unavailable</h3>
        <p className="text-xs text-slate-500">{error || 'Could not locate analysis records.'}</p>
        <button
          onClick={onBackToGallery}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer"
        >
          Return to Media Gallery
        </button>
      </div>
    );
  }

  const { analysis, media, persons, alerts } = report;
  const selectedWorker = persons.find((p) => p.id === selectedWorkerId) || persons[0];

  // Dynamic calculation metrics
  const totalChecks = analysis.metadata?.totalApplicableChecks || (persons.length * 5);
  const totalWeightedChecks = analysis.metadata?.totalWeightedChecks || (totalChecks * 20);
  const totalWeightedViolations = analysis.metadata?.totalWeightedViolations || (analysis.confirmed_violations * 25);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 print:p-0">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {analysis.id}
              </span>
              <span className="text-xs font-semibold text-slate-800">{media.original_name}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>{media.site_name}</span>
              <span>·</span>
              <span>{media.industry}</span>
              <span>·</span>
              <span>{new Date(analysis.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Export CSV, PDF, Reanalyze */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
            <span>{isReanalyzing ? 'Re-running...' : 'Reanalyze'}</span>
          </button>
        </div>
      </div>

      {/* Score Summary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Safety Score */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Transparent Safety Score</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-bold ${
              analysis.safety_score >= 85
                ? 'text-emerald-600'
                : analysis.safety_score >= 70
                ? 'text-amber-600'
                : 'text-red-600'
            }`}>
              {analysis.safety_score}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Clamped 0-100% Formula</p>
        </div>

        {/* Risk Score */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Workplace Risk Index</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900">{analysis.risk_score}%</span>
          </div>
          <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 ${
            analysis.risk_level === 'Critical'
              ? 'bg-red-100 text-red-700'
              : analysis.risk_level === 'High'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {analysis.risk_level} Risk Level
          </span>
        </div>

        {/* Persons Detected */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Visible Personnel</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{analysis.total_persons}</p>
          <p className="text-[10px] text-slate-400 mt-1">Distinct Workers Evaluated</p>
        </div>

        {/* Confirmed Violations */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Confirmed Violations</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{analysis.confirmed_violations}</p>
          <p className="text-[10px] text-slate-400 mt-1">OSHA Policy Non-Compliance</p>
        </div>

        {/* Unverified Checks */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Uncertain / Occluded</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{analysis.unverified_checks}</p>
          <p className="text-[10px] text-slate-400 mt-1">Insufficient Line of Sight</p>
        </div>

        {/* Model & Latency */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Inference Engine</p>
          <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{analysis.model_name}</p>
          <p className="text-[10px] text-slate-400 mt-1">{analysis.duration_ms}ms Latency</p>
        </div>
      </div>

      {/* Transparent Calculation Breakdown Card */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold tracking-wide uppercase text-teal-300">
              Audit Transparency · Exact Mathematical Derivation for this Media
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Formula: Safety Score = 100 × (1 − Σ(Violations × Weight) ÷ Σ(Total Checks × Weight))
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 text-[11px]">Total Applicable Checks</span>
            <p className="text-base font-bold text-white mt-0.5">
              {persons.length} Workers × {Object.keys(persons[0]?.ppeChecks || {}).length || 5} PPE Items = {totalChecks} Checks
            </p>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 text-[11px]">Weighted Penalty Calculation</span>
            <p className="text-base font-bold text-amber-300 mt-0.5">
              100 × (1 − {totalWeightedViolations} ÷ {totalWeightedChecks}) = {analysis.safety_score}%
            </p>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 text-[11px]">Assigned Risk Classification</span>
            <p className="text-base font-bold text-teal-300 mt-0.5">
              {analysis.risk_score}% Risk Index → {analysis.risk_level} Hazard
            </p>
          </div>
        </div>
      </div>

      {/* Main Inspection Split Grid: Media Visualizer vs. Person-Wise Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Media Inspection Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-600" />
              Surveillance Feed &amp; YOLOv8 Detection Overlay
            </h3>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewMode('overlay')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  viewMode === 'overlay' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Annotated Overlay
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  viewMode === 'raw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Clean Raw Feed
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Side-by-Side
              </button>
            </div>
          </div>

          {/* Opacity slider for annotated overlay */}
          {viewMode === 'overlay' && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="text-slate-600 font-medium">YOLOv8 Bounding Box Intensity:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-28 accent-teal-600 cursor-pointer"
                />
                <span className="font-mono text-slate-700 font-bold">{Math.round(overlayOpacity * 100)}%</span>
              </div>
            </div>
          )}

          {/* Media Viewer: ALWAYS displays the real original image in full color, never blacked out! */}
          {viewMode === 'split' ? (
            <div className="grid grid-cols-2 gap-3">
              {/* Raw Image */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={media.file_path}
                  alt="Raw surveillance feed"
                  className="w-full h-auto object-contain"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white">
                  RAW FEED
                </span>
              </div>
              {/* Annotated Image */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={media.processed_path || media.file_path}
                  alt="YOLOv8 Annotated"
                  className="w-full h-auto object-contain"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-600 text-white">
                  YOLOv8 DETECTIONS
                </span>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-300 min-h-[380px] flex items-center justify-center">
              {/* 1. Underlying Real Original Image (Always visible in full color!) */}
              <img
                src={media.file_path}
                alt="Workplace Surveillance Feed"
                className="w-full h-auto max-h-[520px] object-contain"
              />

              {/* 2. Overlaid Interactive SVG Bounding Boxes (Drawn directly on top of the original image!) */}
              {viewMode === 'overlay' && (
                <svg
                  viewBox="0 0 1280 720"
                  className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200"
                  style={{ opacity: overlayOpacity }}
                >
                  {/* Top HUD Tag */}
                  <rect x="16" y="16" width="380" height="38" fill="rgba(15, 23, 42, 0.88)" rx="6" stroke="#334155" stroke-width="1" />
                  <circle cx="34" cy="35" r="5" fill="#10b981" />
                  <text x="48" y="32" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">
                    YOLOv8 PPE ANALYZER · REAL-TIME SPATIAL ASSOCIATION
                  </text>
                  <text x="48" y="45" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="9">
                    {media.site_name} · {persons.length} Visible Personnel
                  </text>

                  {/* Render Worker Bounding Boxes */}
                  {persons.map((w, idx) => {
                    const isSelected = selectedWorker?.id === w.id;
                    const { x, y, width: bw, height: bh } = w.bbox;
                    const isViolation = w.complianceStatus === 'Violation detected';
                    const isCompliant = w.complianceStatus === 'Compliant';
                    const borderColor = isSelected
                      ? '#38bdf8'
                      : isViolation
                      ? '#ef4444'
                      : isCompliant
                      ? '#10b981'
                      : '#f59e0b';
                    const bgHeader = isViolation
                      ? 'rgba(239, 68, 68, 0.92)'
                      : isCompliant
                      ? 'rgba(16, 185, 129, 0.92)'
                      : 'rgba(245, 158, 11, 0.92)';

                    // Sub-boxes
                    const helmetBox = { x: x + bw * 0.18, y: y - 2, w: bw * 0.64, h: bh * 0.22 };
                    const vestBox = { x: x + bw * 0.12, y: y + bh * 0.22, w: bw * 0.76, h: bh * 0.42 };

                    const helmet = w.ppeChecks['helmet'];
                    const vest = w.ppeChecks['vest'];

                    return (
                      <g key={w.id} className="transition-all">
                        {/* Main Bounding Box */}
                        <rect
                          x={x}
                          y={y}
                          width={bw}
                          height={bh}
                          fill={isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.05)'}
                          stroke={borderColor}
                          strokeWidth={isSelected ? 4 : 3}
                          rx="4"
                        />

                        {/* Top Header Pill */}
                        <rect
                          x={x}
                          y={Math.max(10, y - 28)}
                          width={Math.max(200, bw)}
                          height={26}
                          fill={bgHeader}
                          rx="4"
                        />
                        <text
                          x={x + 8}
                          y={Math.max(10, y - 28) + 17}
                          fill="#ffffff"
                          fontFamily="system-ui, sans-serif"
                          fontSize="11"
                          fontWeight="bold"
                        >
                          Worker #{idx + 1} [{w.trackId}] · {w.complianceStatus}
                        </text>

                        {/* Sub-box: Helmet */}
                        <rect
                          x={helmetBox.x}
                          y={helmetBox.y}
                          width={helmetBox.w}
                          height={helmetBox.h}
                          fill="none"
                          stroke={helmet?.status === 'violation' ? '#ef4444' : '#10b981'}
                          strokeWidth="2"
                          strokeDasharray="4,2"
                          rx="2"
                        />

                        {/* Sub-box: Vest */}
                        <rect
                          x={vestBox.x}
                          y={vestBox.y}
                          width={vestBox.w}
                          height={vestBox.h}
                          fill="none"
                          stroke={vest?.status === 'violation' ? '#ef4444' : '#10b981'}
                          strokeWidth="2"
                          strokeDasharray="4,2"
                          rx="2"
                        />
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-semibold text-slate-700">Detection Legend:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Compliant PPE (Verified)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-500" /> Confirmed Violation (Alert)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500" /> Unable to Verify (Occluded)
            </span>
          </div>
        </div>

        {/* Right: Worker-wise Detail Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              Person-by-Person PPE Audit
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click a worker track to highlight their bounding box and view equipment breakdown
            </p>
          </div>

          {/* Worker Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {persons.map((w, idx) => {
              const isSelected = selectedWorker?.id === w.id;
              const hasViolation = w.complianceStatus === 'Violation detected';
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorkerId(w.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : hasViolation
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hasViolation ? '#ef4444' : '#10b981' }} />
                  <span>Worker #{idx + 1} [{w.trackId}]</span>
                </button>
              );
            })}
          </div>

          {/* Detailed Selected Worker Card */}
          {selectedWorker && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Inspection Details · {selectedWorker.trackId}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Bounding Box: [{selectedWorker.bbox.x}, {selectedWorker.bbox.y}, {selectedWorker.bbox.width}x{selectedWorker.bbox.height}]
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  selectedWorker.complianceStatus === 'Violation detected'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {selectedWorker.complianceStatus}
                </span>
              </div>

              {/* Itemized PPE checklist */}
              <div className="space-y-2">
                {Object.entries(selectedWorker.ppeChecks).map(([ppeKey, check]) => {
                  return (
                    <div
                      key={ppeKey}
                      className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {check.status === 'compliant' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : check.status === 'violation' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <HelpCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-slate-800 capitalize">
                            {ppeKey.replace('_', ' ')}
                          </p>
                          <p className="text-[10px] text-slate-400">{check.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-slate-700">
                          {Math.round(check.confidence * 100)}%
                        </span>
                        <p className="text-[9px] text-slate-400">Confidence</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alerts Generated From This Analysis */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2">
              Generated In-Application Safety Alerts ({alerts.length})
            </h4>
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg text-center">
                No active safety violation alerts generated for this media.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-2.5 rounded-lg border border-red-200 bg-red-50/50 flex items-start gap-2 text-xs"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">{alt.message}</p>
                      <p className="text-[10px] text-red-700 mt-0.5">
                        Severity: {alt.severity} · Status: {alt.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
