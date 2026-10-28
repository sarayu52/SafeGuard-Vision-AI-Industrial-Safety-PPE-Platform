export type UserRole = 'admin' | 'safety_manager' | 'inspector';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  processed_path: string | null;
  mime_type: string;
  media_type: 'image' | 'video';
  file_size: number;
  site_name: string;
  industry: string;
  location_code?: string;
  department?: string;
  notes?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  analysis_id?: string;
  safety_score?: number;
  risk_score?: number;
  risk_level?: 'Low' | 'Medium' | 'High' | 'Critical';
  confirmed_violations?: number;
  total_persons?: number;
}

export interface PPECheck {
  detected: boolean;
  status: 'compliant' | 'violation' | 'unverified' | 'unsupported';
  confidence: number;
  label: string;
}

export interface PersonDetection {
  id: string;
  trackId: string;
  frameNumber: number;
  timestampSec: number;
  bbox: { x: number; y: number; width: number; height: number };
  complianceStatus: 'Compliant' | 'Violation detected' | 'Unable to verify' | 'Not supported';
  ppeChecks: Record<string, PPECheck>;
}

export interface AnalysisReport {
  analysis: {
    id: string;
    media_id: string;
    status: string;
    progress: number;
    safety_score: number;
    risk_score: number;
    risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
    total_persons: number;
    confirmed_violations: number;
    unverified_checks: number;
    duration_ms: number;
    model_name: string;
    policy_version: string;
    metadata: {
      resolution?: string;
      samplingRate?: number;
      confidenceThreshold?: number;
      inferenceFps?: number;
      detectedWorkers?: number;
      mediaType?: string;
      [key: string]: any;
    };
    created_at: string;
    completed_at?: string;
  };
  media: MediaItem;
  persons: PersonDetection[];
  alerts: SafetyAlert[];
}

export interface SafetyAlert {
  id: string;
  analysis_id: string;
  media_id: string;
  site_name: string;
  track_id?: string;
  ppe_item: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  evidence_img?: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  notes?: string;
  original_name?: string;
  location_code?: string;
}

export interface SafetyPolicyConfig {
  version: string;
  industryType: string;
  requiredPPE: string[];
  weights: Record<string, number>;
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  confidenceThreshold: number;
  frameSamplingRate: number;
  maxUploadSizeMb: number;
  modelPath: string;
  effectiveDate: string;
}

export interface DashboardKPIs {
  totalImagesAnalyzed: number;
  totalVideosAnalyzed: number;
  totalWorkersDetected: number;
  totalPPEDetections: number;
  confirmedViolations: number;
  unverifiedChecks: number;
  overallSafetyScore: number;
  overallRiskScore: number;
  highRiskIncidents: number;
  analysesCompletedToday: number;
}

export interface WorkerTrack {
  trackId: string;
  siteName: string;
  totalObservations: number;
  complianceRate: number;
  violationsCount: number;
  primaryViolation: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  lastSeen: string;
}
