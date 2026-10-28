import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck2,
  AlertCircle,
  HardHat,
  Sliders,
  Play,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  X,
  FileVideo,
  FileImage,
} from 'lucide-react';
import { api } from '../services/api';

interface UploadMediaProps {
  onAnalysisComplete: (analysisId: string) => void;
  defaultSite?: string;
}

export const UploadMedia: React.FC<UploadMediaProps> = ({ onAnalysisComplete, defaultSite }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Configuration
  const [siteName, setSiteName] = useState(defaultSite === 'All' ? 'Apex Construction Site B' : (defaultSite || 'Apex Construction Site B'));
  const [industry, setIndustry] = useState('Construction Sites');
  const [locationCode, setLocationCode] = useState('ZONE-CRANE-04');
  const [department, setDepartment] = useState('Heavy Machinery Operations');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.50);
  const [samplingRate, setSamplingRate] = useState(1.0);
  const [notes, setNotes] = useState('');
  
  // PPE Requirements
  const [requiredPPE, setRequiredPPE] = useState<Record<string, boolean>>({
    helmet: true,
    vest: true,
    gloves: true,
    safety_shoes: true,
    goggles: true,
    mask: false,
  });

  // Upload/Processing state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (file: File) => {
    const validExtensions = /\.(jpe?g|png|webp|bmp|svg|mp4|avi|mov|mkv|webm)$/i;
    if (!validExtensions.test(file.name)) {
      setErrorMessage('Unsupported file format. Please upload JPG, PNG, WEBP, BMP, SVG, MP4, AVI, MOV, or WEBM.');
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 150MB policy upload limit.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    // Create preview
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Preset quick tester: Loads real full-color industrial workplace images
  const handleLoadSample = async (sampleType: 'construction' | 'auto' | 'warehouse' | 'chemical') => {
    let mockName = '';
    let mockIndustry = '';
    let mockSite = '';
    let mockZone = '';
    let sampleUrl = '';

    if (sampleType === 'construction') {
      mockName = 'Tower_Crane_Rigging_Shift_01.svg';
      mockIndustry = 'Construction Sites';
      mockSite = 'Apex Construction Site B';
      mockZone = 'ZONE-4B-CRANE';
      sampleUrl = '/samples/construction.svg';
    } else if (sampleType === 'auto') {
      mockName = 'Chassis_Robotic_Welding_Cell.svg';
      mockIndustry = 'Automobile Assembly Lines';
      mockSite = 'Detroit Auto Works Plant 3';
      mockZone = 'CELL-WELD-08';
      sampleUrl = '/samples/auto_assembly.svg';
    } else if (sampleType === 'warehouse') {
      mockName = 'High_Bay_Aisle_Forklift_Cross.svg';
      mockIndustry = 'Warehouses and Logistics Centers';
      mockSite = 'Central Distribution Hub 1';
      mockZone = 'AISLE-12-HIGHBAY';
      sampleUrl = '/samples/warehouse.svg';
    } else {
      mockName = 'Acid_Reaction_Manifold_Inspection.svg';
      mockIndustry = 'Industrial Production Units';
      mockSite = 'Nova Chemical Synthesis Complex';
      mockZone = 'UNIT-CAT-03';
      sampleUrl = '/samples/construction.svg';
    }

    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const file = new File([blob], mockName, { type: 'image/svg+xml' });
      setIndustry(mockIndustry);
      setSiteName(mockSite);
      setLocationCode(mockZone);
      handleFileChange(file);
    } catch (e) {
      console.error('Failed to fetch sample image', e);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or drop an image or video file to analyze.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(15);
    setCurrentStep('Ingesting surveillance media and validating codecs...');

    try {
      const activePPE = Object.entries(requiredPPE)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);

      const formData = new FormData();
      formData.append('mediaFile', selectedFile);
      formData.append('siteName', siteName);
      formData.append('industry', industry);
      formData.append('locationCode', locationCode);
      formData.append('department', department);
      formData.append('notes', notes);
      formData.append('requiredPPE', activePPE.join(','));
      formData.append('confidenceThreshold', confidenceThreshold.toString());
      formData.append('samplingRate', samplingRate.toString());
      formData.append('autoAnalyze', 'true');

      setUploadProgress(40);
      setCurrentStep('Running YOLOv8 inference & spatial PPE association...');

      const res = await api.uploadMedia(formData);

      setUploadProgress(85);
      setCurrentStep('Calculating weighted OSHA risk scores & generating report...');

      await new Promise((r) => setTimeout(r, 600));

      setUploadProgress(100);
      setCurrentStep('Analysis complete! Redirecting to individual report...');

      setTimeout(() => {
        if (res.analysisId) {
          onAnalysisComplete(res.analysisId);
        } else {
          onAnalysisComplete(res.mediaId);
        }
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis pipeline failed. Check server logs.');
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-teal-600" />
            Upload Workplace Media for YOLOv8 PPE Verification
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Accepts factory floor surveillance footage, drone sweeps, handheld photos, and CCTV clips.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Quick Test Presets:</span>
          <button
            type="button"
            onClick={() => handleLoadSample('construction')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 border border-slate-200 transition-colors"
          >
            Construction Site
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('auto')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 border border-slate-200 transition-colors"
          >
            Auto Welding Line
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('warehouse')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 border border-slate-200 transition-colors"
          >
            Logistics Forklift
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Upload Zone + Pre-Analysis Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Drag & Drop Zone (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all bg-white ${
              isDragOver
                ? 'border-teal-500 bg-teal-50/20'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/10'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.bmp,.svg,.mp4,.avi,.mov,.mkv,.webm"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
            />

            {selectedFile ? (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                      {selectedFile.type.startsWith('video/') ? (
                        <FileVideo className="w-5 h-5" />
                      ) : (
                        <FileImage className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 truncate max-w-[260px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedFile.type || 'Media Asset'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Media Preview Box */}
                {previewUrl && (
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 max-h-64 flex items-center justify-center border border-slate-200">
                    {selectedFile.type.startsWith('video/') ? (
                      <video src={previewUrl} controls className="max-h-64 w-auto object-contain" />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="max-h-64 w-auto object-contain" />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-xs">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Drag and drop workplace media here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports high-resolution JPG, PNG, WEBP, BMP, and MP4/AVI/MOV video
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Browse Local Files
                </button>
              </div>
            )}
          </div>

          {/* Progress / Running state */}
          {isUploading && (
            <div className="p-4 bg-white border border-teal-200 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-teal-900 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  {currentStep}
                </span>
                <span className="text-teal-700 font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Inspection & Policy Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              Pre-Analysis Policy &amp; Site Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Parameters used to evaluate worker safety and associate PPE detections
            </p>
          </div>

          {/* Industry & Site */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Industrial Workplace Environment
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-500"
              >
                <option value="Construction Sites">Construction Sites</option>
                <option value="Automobile Manufacturing">Automobile Manufacturing</option>
                <option value="Automobile Assembly Lines">Automobile Assembly Lines</option>
                <option value="Industrial Production Units">Industrial Production Units</option>
                <option value="Warehouses and Logistics Centers">Warehouses and Logistics Centers</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Site / Facility Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Zone / Location Code
                </label>
                <input
                  type="text"
                  value={locationCode}
                  onChange={(e) => setLocationCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Required PPE Checklist */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Mandatory PPE Policy for this Zone:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'helmet', label: 'Safety Hardhat / Helmet' },
                { id: 'vest', label: 'High-Vis Reflective Vest' },
                { id: 'gloves', label: 'Cut / Chemical Gloves' },
                { id: 'safety_shoes', label: 'Steel-Toe Safety Boots' },
                { id: 'goggles', label: 'Protective Safety Goggles' },
                { id: 'mask', label: 'Dust / Gas Face Mask' },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={requiredPPE[item.id] || false}
                    onChange={(e) =>
                      setRequiredPPE({ ...requiredPPE, [item.id]: e.target.checked })
                    }
                    className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                  />
                  <span className="text-slate-800 text-[11px] font-medium">{item.label}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-teal-700 bg-teal-50 border border-teal-200 p-2 rounded-lg mt-2 flex items-center gap-1.5">
              <span className="font-bold">Strict OSHA 1910.138 Rule:</span>
              Bare hands or missing safety gloves are flagged as immediate high-priority violations.
            </p>
          </div>

          {/* Model Confidence Slider */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>YOLOv8 Confidence Threshold:</span>
              <span className="font-mono text-teal-600 font-bold">{Math.round(confidenceThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.90"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Higher confidence reduces false alarms; lower confidence detects occluded gear.
            </p>
          </div>

          {/* Video Frame Sampling Rate */}
          {selectedFile?.type.startsWith('video/') && (
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Video Frame Extraction Rate:</span>
                <span className="font-mono text-teal-600 font-bold">{samplingRate} frame/sec</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.5"
                value={samplingRate}
                onChange={(e) => setSamplingRate(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Inspection Notes / Shift Details (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Scaffolding erection check during morning high-wind advisory..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Action CTA */}
          <button
            type="button"
            disabled={!selectedFile || isUploading}
            onClick={handleUploadAndAnalyze}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <span>Running Inference Pipeline...</span>
            ) : (
              <>
                <span>Upload &amp; Run YOLOv8 Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
