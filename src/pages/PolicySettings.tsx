import React, { useState, useEffect } from 'react';
import {
  Sliders,
  ShieldCheck,
  Save,
  CheckCircle2,
  HardHat,
  Cpu,
  Layers,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import { SafetyPolicyConfig } from '../types';

export const PolicySettings: React.FC = () => {
  const [version, setVersion] = useState('v2.4-Standard-OSHA');
  const [industryType, setIndustryType] = useState('General Industrial & Construction');
  const [modelPath, setModelPath] = useState('models/yolov8_ppe_trained.pt');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.50);
  const [samplingRate, setSamplingRate] = useState(1.0);
  const [maxUploadSizeMb, setMaxUploadSizeMb] = useState(150);

  // Violation penalty weights
  const [weights, setWeights] = useState<Record<string, number>>({
    helmet: 30,
    vest: 25,
    gloves: 15,
    safety_shoes: 20,
    goggles: 10,
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      const res = await api.getSafetyPolicy();
      setVersion(res.version);
      setIndustryType(res.industryType);
      setModelPath(res.config.modelPath || 'models/yolov8_ppe_trained.pt');
      setConfidenceThreshold(res.config.confidenceThreshold || 0.5);
      setSamplingRate(res.config.frameSamplingRate || 1.0);
      setMaxUploadSizeMb(res.config.maxUploadSizeMb || 150);
      if (res.config.weights) setWeights(res.config.weights);
    } catch (err) {
      console.error('Failed to load policy:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const config: SafetyPolicyConfig = {
        version,
        industryType,
        requiredPPE: ['helmet', 'vest', 'gloves', 'safety_shoes', 'goggles'],
        weights,
        riskThresholds: { low: 25, medium: 50, high: 75, critical: 100 },
        confidenceThreshold,
        frameSamplingRate: samplingRate,
        maxUploadSizeMb,
        modelPath,
        effectiveDate: new Date().toISOString().split('T')[0],
      };

      await api.updateSafetyPolicy({
        version,
        industryType,
        config,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Policy update failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-600" />
            Safety Policy &amp; Violation Scoring Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure transparent scoring penalty weights, YOLOv8 model paths, and compliance parameters.
          </p>
        </div>
        {saveSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            Saved &amp; Active
          </span>
        )}
      </div>

      <form onSubmit={handleSavePolicy} className="space-y-6">
        {/* Policy Metadata */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Policy Identification &amp; Industry Scope</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Policy Version Tag</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Industry Sector</label>
              <input
                type="text"
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Scoring Weights */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Transparent Violation Penalty Weights</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Defines the deduction points applied to the denominator formula: Safety Score = 100 × (1 − Σ(violation × weight) / Σ(check × weight))
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Missing Hardhat / Helmet Weight</label>
              <input
                type="number"
                min="5"
                max="50"
                value={weights.helmet || 30}
                onChange={(e) => setWeights({ ...weights, helmet: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Missing Reflective Vest Weight</label>
              <input
                type="number"
                min="5"
                max="50"
                value={weights.vest || 25}
                onChange={(e) => setWeights({ ...weights, vest: parseInt(e.target.value) || 25 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Missing Safety Gloves Weight</label>
              <input
                type="number"
                min="5"
                max="50"
                value={weights.gloves || 15}
                onChange={(e) => setWeights({ ...weights, gloves: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Missing Steel-Toe Boots Weight</label>
              <input
                type="number"
                min="5"
                max="50"
                value={weights.safety_shoes || 20}
                onChange={(e) => setWeights({ ...weights, safety_shoes: parseInt(e.target.value) || 20 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Model & Computer Vision Settings */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">YOLOv8 Weights &amp; Processing Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">YOLOv8 Trained Weights File Path</label>
              <input
                type="text"
                value={modelPath}
                onChange={(e) => setModelPath(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Max Upload File Size (MB)</label>
              <input
                type="number"
                value={maxUploadSizeMb}
                onChange={(e) => setMaxUploadSizeMb(parseInt(e.target.value) || 150)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save & Deploy Safety Policy'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
