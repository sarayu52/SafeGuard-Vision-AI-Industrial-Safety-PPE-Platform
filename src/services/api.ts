import {
  User,
  MediaItem,
  AnalysisReport,
  SafetyAlert,
  SafetyPolicyConfig,
  DashboardKPIs,
  WorkerTrack,
} from '../types';

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch('/api/auth/me');
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Dashboard
  async getDashboardSummary(params?: { site?: string; industry?: string }): Promise<{
    kpis: DashboardKPIs;
    recentAlerts: SafetyAlert[];
    recentAnalyses: any[];
  }> {
    const q = new URLSearchParams();
    if (params?.site) q.set('site', params.site);
    if (params?.industry) q.set('industry', params.industry);
    const res = await fetch(`/api/dashboard/summary?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to load dashboard summary');
    return res.json();
  },

  async getDashboardTrends(params?: { site?: string; industry?: string }): Promise<{
    violationDistribution: Array<{ name: string; count: number; fill: string }>;
    trends: Array<{ day: string; safetyScore: number; riskScore: number; uploads: number; violations: number }>;
    gearCompliance: Array<{ category: string; compliant: number; violations: number }>;
    siteComparisons: Array<{ site: string; avgSafety: number; violations: number; analysesCount: number }>;
  }> {
    const q = new URLSearchParams();
    if (params?.site) q.set('site', params.site);
    if (params?.industry) q.set('industry', params.industry);
    const res = await fetch(`/api/dashboard/trends?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to load dashboard trends');
    return res.json();
  },

  // Media
  async uploadMedia(formData: FormData): Promise<{ mediaId: string; analysisId: string; analysisResult: any }> {
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload media');
    }
    return res.json();
  },

  async getMediaList(params?: { search?: string; type?: string; site?: string; industry?: string; sort?: string }): Promise<MediaItem[]> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.type) q.set('type', params.type);
    if (params?.site) q.set('site', params.site);
    if (params?.industry) q.set('industry', params.industry);
    if (params?.sort) q.set('sort', params.sort);
    const res = await fetch(`/api/media?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch media list');
    return res.json();
  },

  async getMediaItem(id: string): Promise<{ media: MediaItem; analysis?: any }> {
    const res = await fetch(`/api/media/${id}`);
    if (!res.ok) throw new Error('Failed to fetch media details');
    return res.json();
  },

  async deleteMedia(id: string): Promise<void> {
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete media');
  },

  // Analyses
  async getAnalysisReport(id: string): Promise<AnalysisReport> {
    const res = await fetch(`/api/analyses/${id}/report`);
    if (!res.ok) throw new Error('Failed to fetch analysis report');
    return res.json();
  },

  async reanalyzeMedia(mediaId: string, options?: { confidenceThreshold?: number; requiredPPE?: string[]; samplingRate?: number }): Promise<any> {
    const res = await fetch(`/api/analyses/${mediaId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {}),
    });
    if (!res.ok) throw new Error('Failed to trigger re-analysis');
    return res.json();
  },

  // Alerts
  async getAlerts(params?: { status?: string; severity?: string; ppe?: string; site?: string }): Promise<{ alerts: SafetyAlert[]; activeCount: number }> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.severity) q.set('severity', params.severity);
    if (params?.ppe) q.set('ppe', params.ppe);
    if (params?.site) q.set('site', params.site);
    const res = await fetch(`/api/alerts?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async updateAlert(id: string, updates: { status: string; notes?: string }): Promise<void> {
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update alert');
  },

  // Worker tracks
  async getWorkerTracks(): Promise<WorkerTrack[]> {
    const res = await fetch('/api/tracks');
    if (!res.ok) throw new Error('Failed to fetch worker tracks');
    return res.json();
  },

  // Safety Policy
  async getSafetyPolicy(): Promise<{ id: string; version: string; industryType: string; config: SafetyPolicyConfig; updatedAt: string }> {
    const res = await fetch('/api/settings/ppe-policy');
    if (!res.ok) throw new Error('Failed to fetch safety policy');
    return res.json();
  },

  async updateSafetyPolicy(data: { version: string; industryType: string; config: SafetyPolicyConfig }): Promise<void> {
    const res = await fetch('/api/settings/ppe-policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update policy');
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async createUser(data: { email: string; name: string; role: string; password: string }): Promise<void> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
  },
};
