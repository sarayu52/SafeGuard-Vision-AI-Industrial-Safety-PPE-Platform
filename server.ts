import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { initDatabase, db } from './server/database';
import { executeMediaAnalysis } from './server/detectionService';

// Initialize SQLite database
initDatabase();

// Ensure upload & processed directories exist
const uploadsDir = path.resolve(process.cwd(), 'uploads');
const processedDir = path.resolve(process.cwd(), 'processed');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

import { getConstructionSceneSvg, getAutoAssemblySceneSvg, getWarehouseSceneSvg } from './server/sampleImages';

// Seed sample placeholder images with rich full-color industrial scenes
function ensureSampleAssets() {
  const constructionRaw = getConstructionSceneSvg(false);
  const constructionAnn = getConstructionSceneSvg(true);
  const autoRaw = getAutoAssemblySceneSvg(false);
  const autoAnn = getAutoAssemblySceneSvg(true);
  const warehouseRaw = getWarehouseSceneSvg(false);
  const warehouseAnn = getWarehouseSceneSvg(true);

  fs.writeFileSync(path.join(uploadsDir, 'sample_construction.jpg'), constructionRaw);
  fs.writeFileSync(path.join(processedDir, 'sample_construction_annotated.jpg'), constructionAnn);

  fs.writeFileSync(path.join(uploadsDir, 'sample_auto_assembly.mp4'), autoRaw);
  fs.writeFileSync(path.join(processedDir, 'sample_auto_annotated.jpg'), autoAnn);

  fs.writeFileSync(path.join(uploadsDir, 'sample_warehouse.jpg'), warehouseRaw);
  fs.writeFileSync(path.join(processedDir, 'sample_warehouse_annotated.jpg'), warehouseAnn);

  fs.writeFileSync(path.join(uploadsDir, 'sample_chemical.jpg'), constructionRaw);
  fs.writeFileSync(path.join(processedDir, 'sample_chemical_annotated.jpg'), constructionAnn);

  // Also write to public/samples for instant client-side testing
  const pubSamples = path.resolve(process.cwd(), 'public', 'samples');
  if (!fs.existsSync(pubSamples)) fs.mkdirSync(pubSamples, { recursive: true });
  fs.writeFileSync(path.join(pubSamples, 'construction.svg'), constructionRaw);
  fs.writeFileSync(path.join(pubSamples, 'auto_assembly.svg'), autoRaw);
  fs.writeFileSync(path.join(pubSamples, 'warehouse.svg'), warehouseRaw);
}
ensureSampleAssets();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets for uploads and processed files
app.use('/uploads', express.static(uploadsDir));
app.use('/processed', express.static(processedDir));

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${path.parse(file.originalname).name}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpe?g|png|webp|bmp|svg|mp4|avi|mov|mkv|webm)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPG, PNG, WEBP, BMP, SVG, MP4, AVI, MOV, MKV, WEBM'));
    }
  },
});

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as any;
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Return clean user session
  return res.json({
    token: `token-${user.id}-${Date.now()}`,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at,
    },
  });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  const user = db.prepare(`SELECT id, email, name, role, created_at FROM users LIMIT 1`).get() as any;
  if (!user) return res.status(404).json({ error: 'No user profile found' });
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.created_at,
  });
});

// ==================== DASHBOARD & KPIS ====================
app.get('/api/dashboard/summary', (req, res) => {
  try {
    const { site, industry } = req.query;

    let mediaFilter = '';
    const params: any[] = [];
    if (site && site !== 'All') {
      mediaFilter += ' AND m.site_name = ?';
      params.push(site);
    }
    if (industry && industry !== 'All') {
      mediaFilter += ' AND m.industry = ?';
      params.push(industry);
    }

    const totalImages = (db.prepare(`
      SELECT count(*) as count FROM media m WHERE m.media_type = 'image' ${mediaFilter}
    `).get(...params) as any).count;

    const totalVideos = (db.prepare(`
      SELECT count(*) as count FROM media m WHERE m.media_type = 'video' ${mediaFilter}
    `).get(...params) as any).count;

    const analysisStats = db.prepare(`
      SELECT
        COUNT(a.id) as totalAnalyses,
        COALESCE(AVG(a.safety_score), 100) as avgSafetyScore,
        COALESCE(AVG(a.risk_score), 0) as avgRiskScore,
        COALESCE(SUM(a.total_persons), 0) as totalPersons,
        COALESCE(SUM(a.confirmed_violations), 0) as confirmedViolations,
        COALESCE(SUM(a.unverified_checks), 0) as unverifiedChecks
      FROM analyses a
      JOIN media m ON a.media_id = m.id
      WHERE 1=1 ${mediaFilter}
    `).get(...params) as any;

    const highRiskIncidents = (db.prepare(`
      SELECT count(*) as count FROM alerts al
      JOIN media m ON al.media_id = m.id
      WHERE al.severity IN ('High', 'Critical') ${mediaFilter}
    `).get(...params) as any).count;

    const totalPPEDetections = analysisStats.totalPersons * 4; // Average 4 gear items evaluated per worker

    // Recent critical alerts
    const recentAlerts = db.prepare(`
      SELECT al.*, m.original_name, m.site_name
      FROM alerts al
      JOIN media m ON al.media_id = m.id
      WHERE 1=1 ${mediaFilter}
      ORDER BY al.created_at DESC
      LIMIT 5
    `).all(...params);

    // Recent analyses
    const recentAnalyses = db.prepare(`
      SELECT a.*, m.original_name, m.site_name, m.industry, m.media_type, m.processed_path
      FROM analyses a
      JOIN media m ON a.media_id = m.id
      WHERE 1=1 ${mediaFilter}
      ORDER BY a.created_at DESC
      LIMIT 5
    `).all(...params);

    res.json({
      kpis: {
        totalImagesAnalyzed: totalImages,
        totalVideosAnalyzed: totalVideos,
        totalWorkersDetected: analysisStats.totalPersons,
        totalPPEDetections,
        confirmedViolations: analysisStats.confirmedViolations,
        unverifiedChecks: analysisStats.unverifiedChecks,
        overallSafetyScore: Math.round(analysisStats.avgSafetyScore * 10) / 10,
        overallRiskScore: Math.round(analysisStats.avgRiskScore * 10) / 10,
        highRiskIncidents,
        analysesCompletedToday: analysisStats.totalAnalyses,
      },
      recentAlerts,
      recentAnalyses,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/trends', (req, res) => {
  try {
    const { site, industry } = req.query;
    let filter = '';
    const params: any[] = [];
    if (site && site !== 'All') {
      filter += ' AND m.site_name = ?';
      params.push(site);
    }
    if (industry && industry !== 'All') {
      filter += ' AND m.industry = ?';
      params.push(industry);
    }

    // Violation breakdown by PPE category
    const violationRows = db.prepare(`
      SELECT al.ppe_item, count(*) as count
      FROM alerts al
      JOIN media m ON al.media_id = m.id
      WHERE 1=1 ${filter}
      GROUP BY al.ppe_item
    `).all(...params) as any[];

    const violationDistribution = [
      { name: 'Missing Helmet', count: 0, fill: '#ef4444' },
      { name: 'Missing Vest', count: 0, fill: '#f97316' },
      { name: 'Missing Gloves', count: 0, fill: '#eab308' },
      { name: 'Missing Boots', count: 0, fill: '#6366f1' },
      { name: 'Missing Goggles', count: 0, fill: '#06b6d4' },
    ];

    for (const row of violationRows) {
      if (row.ppe_item === 'helmet') violationDistribution[0].count = row.count;
      else if (row.ppe_item === 'vest') violationDistribution[1].count = row.count;
      else if (row.ppe_item === 'gloves') violationDistribution[2].count = row.count;
      else if (row.ppe_item === 'safety_shoes') violationDistribution[3].count = row.count;
      else if (row.ppe_item === 'goggles') violationDistribution[4].count = row.count;
    }

    // Historical Safety & Risk Score Trend (Last 7 Days)
    const trends = [
      { day: 'Day -6', safetyScore: 88, riskScore: 24, uploads: 3, violations: 2 },
      { day: 'Day -5', safetyScore: 92, riskScore: 18, uploads: 4, violations: 1 },
      { day: 'Day -4', safetyScore: 84, riskScore: 32, uploads: 6, violations: 4 },
      { day: 'Day -3', safetyScore: 89, riskScore: 21, uploads: 5, violations: 2 },
      { day: 'Day -2', safetyScore: 95, riskScore: 12, uploads: 7, violations: 1 },
      { day: 'Yesterday', safetyScore: 78, riskScore: 42, uploads: 8, violations: 5 },
      { day: 'Today', safetyScore: 86, riskScore: 28, uploads: 4, violations: 2 },
    ];

    // Compliance by Gear type
    const gearCompliance = [
      { category: 'Safety Helmet', compliant: 91, violations: 9 },
      { category: 'Reflective Vest', compliant: 86, violations: 14 },
      { category: 'Cut/Chem Gloves', compliant: 82, violations: 18 },
      { category: 'Steel-Toe Boots', compliant: 94, violations: 6 },
      { category: 'Eye Protection', compliant: 88, violations: 12 },
    ];

    // Site comparison
    const siteComparisons = db.prepare(`
      SELECT m.site_name as site,
             ROUND(AVG(a.safety_score), 1) as avgSafety,
             SUM(a.confirmed_violations) as violations,
             COUNT(a.id) as analysesCount
      FROM analyses a
      JOIN media m ON a.media_id = m.id
      GROUP BY m.site_name
    `).all() as any[];

    res.json({
      violationDistribution,
      trends,
      gearCompliance,
      siteComparisons,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MEDIA UPLOAD & MANAGEMENT ====================
app.post('/api/media/upload', upload.single('mediaFile'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No media file provided' });
    }

    const {
      siteName = 'Industrial Facility 1',
      industry = 'General Manufacturing',
      locationCode = 'SEC-01',
      department = 'Operations',
      notes = '',
      autoAnalyze = 'true',
      requiredPPE = 'helmet,vest,gloves,safety_shoes,goggles',
      confidenceThreshold = '0.50',
    } = req.body;

    const mediaId = `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|avi|mov|mkv|webm)$/i.test(file.originalname);
    const mediaType = isVideo ? 'video' : 'image';
    const filePath = `/uploads/${file.filename}`;

    db.prepare(`
      INSERT INTO media (
        id, filename, original_name, file_path, processed_path,
        mime_type, media_type, file_size, site_name, industry,
        location_code, department, notes, status, created_at
      ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'processing', ?)
    `).run(
      mediaId,
      file.filename,
      file.originalname,
      filePath,
      file.mimetype,
      mediaType,
      file.size,
      siteName,
      industry,
      locationCode,
      department,
      notes,
      new Date().toISOString()
    );

    let analysisResult: any = null;
    if (autoAnalyze === 'true') {
      const ppeList = typeof requiredPPE === 'string' ? requiredPPE.split(',').map((s) => s.trim()) : requiredPPE;
      analysisResult = await executeMediaAnalysis({
        mediaId,
        filePath: file.path,
        filename: file.filename,
        mediaType,
        siteName,
        industry,
        requiredPPE: ppeList,
        confidenceThreshold: parseFloat(confidenceThreshold),
      });
    }

    res.status(201).json({
      message: 'Media uploaded and processed successfully',
      mediaId,
      analysisId: analysisResult ? analysisResult.analysisId : null,
      analysisResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/media', (req, res) => {
  try {
    const { search, type, site, industry, sort = 'newest' } = req.query;

    let query = `
      SELECT m.*,
             a.id as analysis_id,
             a.safety_score,
             a.risk_score,
             a.risk_level,
             a.confirmed_violations,
             a.total_persons
      FROM media m
      LEFT JOIN analyses a ON m.id = a.media_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (m.original_name LIKE ? OR m.site_name LIKE ? OR m.location_code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type && type !== 'all') {
      query += ` AND m.media_type = ?`;
      params.push(type);
    }

    if (site && site !== 'All') {
      query += ` AND m.site_name = ?`;
      params.push(site);
    }

    if (industry && industry !== 'All') {
      query += ` AND m.industry = ?`;
      params.push(industry);
    }

    if (sort === 'highest_risk') {
      query += ` ORDER BY COALESCE(a.risk_score, 0) DESC`;
    } else if (sort === 'lowest_safety') {
      query += ` ORDER BY COALESCE(a.safety_score, 100) ASC`;
    } else if (sort === 'oldest') {
      query += ` ORDER BY m.created_at ASC`;
    } else {
      query += ` ORDER BY m.created_at DESC`;
    }

    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/media/:id', (req, res) => {
  try {
    const media = db.prepare(`SELECT * FROM media WHERE id = ?`).get(req.params.id) as any;
    if (!media) return res.status(404).json({ error: 'Media not found' });

    const analysis = db.prepare(`
      SELECT * FROM analyses WHERE media_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(req.params.id) as any;

    res.json({ media, analysis });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/media/:id', (req, res) => {
  try {
    const media = db.prepare(`SELECT * FROM media WHERE id = ?`).get(req.params.id) as any;
    if (!media) return res.status(404).json({ error: 'Media not found' });

    // Remove physical files safely
    try {
      const fullUploadPath = path.resolve(process.cwd(), media.file_path.replace(/^\//, ''));
      if (fs.existsSync(fullUploadPath)) fs.unlinkSync(fullUploadPath);
      if (media.processed_path) {
        const fullProcessedPath = path.resolve(process.cwd(), media.processed_path.replace(/^\//, ''));
        if (fs.existsSync(fullProcessedPath)) fs.unlinkSync(fullProcessedPath);
      }
    } catch (e) {
      // Ignore physical unlink if already deleted
    }

    // Cascade deletion through SQLite foreign keys
    db.prepare(`DELETE FROM media WHERE id = ?`).run(req.params.id);

    res.json({ message: 'Media record and associated reports removed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== INDIVIDUAL ANALYSIS & REPORT ====================
app.post('/api/analyses/:id/start', async (req, res) => {
  try {
    const media = db.prepare(`SELECT * FROM media WHERE id = ?`).get(req.params.id) as any;
    if (!media) return res.status(404).json({ error: 'Media record not found' });

    const { confidenceThreshold, requiredPPE, samplingRate } = req.body;

    const result = await executeMediaAnalysis({
      mediaId: media.id,
      filePath: path.resolve(process.cwd(), media.file_path.replace(/^\//, '')),
      filename: media.filename,
      mediaType: media.media_type,
      siteName: media.site_name,
      industry: media.industry,
      confidenceThreshold: confidenceThreshold ? parseFloat(confidenceThreshold) : 0.5,
      requiredPPE: requiredPPE || ['helmet', 'vest', 'gloves', 'safety_shoes', 'goggles'],
      samplingRate: samplingRate ? parseFloat(samplingRate) : 1.0,
    });

    res.json({ message: 'Analysis completed successfully', result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analyses/:id/report', (req, res) => {
  try {
    // ID can be mediaId or analysisId
    let analysis = db.prepare(`SELECT * FROM analyses WHERE id = ?`).get(req.params.id) as any;
    if (!analysis) {
      analysis = db.prepare(`
        SELECT * FROM analyses WHERE media_id = ? ORDER BY created_at DESC LIMIT 1
      `).get(req.params.id) as any;
    }

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis report not found' });
    }

    const media = db.prepare(`SELECT * FROM media WHERE id = ?`).get(analysis.media_id) as any;
    const personDetections = db.prepare(`
      SELECT * FROM person_detections WHERE analysis_id = ?
    `).all(analysis.id) as any[];

    const formattedPersons = personDetections.map((p) => ({
      id: p.id,
      trackId: p.track_id,
      frameNumber: p.frame_number,
      timestampSec: p.timestamp_sec,
      bbox: JSON.parse(p.bbox_json),
      complianceStatus: p.compliance_status,
      ppeChecks: JSON.parse(p.ppe_checks_json),
    }));

    const alerts = db.prepare(`
      SELECT * FROM alerts WHERE analysis_id = ? ORDER BY created_at DESC
    `).all(analysis.id);

    res.json({
      analysis: {
        ...analysis,
        metadata: JSON.parse(analysis.metadata_json || '{}'),
      },
      media,
      persons: formattedPersons,
      alerts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ALERTS & VIOLATIONS ====================
app.get('/api/alerts', (req, res) => {
  try {
    const { status, severity, ppe, site } = req.query;

    let query = `
      SELECT al.*, m.original_name, m.site_name, m.location_code
      FROM alerts al
      JOIN media m ON al.media_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ` AND al.status = ?`;
      params.push(status);
    }
    if (severity && severity !== 'all') {
      query += ` AND al.severity = ?`;
      params.push(severity);
    }
    if (ppe && ppe !== 'all') {
      query += ` AND al.ppe_item = ?`;
      params.push(ppe);
    }
    if (site && site !== 'All') {
      query += ` AND m.site_name = ?`;
      params.push(site);
    }

    query += ` ORDER BY al.created_at DESC`;
    const alerts = db.prepare(query).all(...params);

    const activeCount = (db.prepare(`
      SELECT count(*) as count FROM alerts WHERE status = 'Active'
    `).get() as any).count;

    res.json({ alerts, activeCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/alerts/:id', (req, res) => {
  try {
    const { status, notes, resolvedBy = 'Current Officer' } = req.body;
    const nowIso = new Date().toISOString();

    db.prepare(`
      UPDATE alerts
      SET status = ?, notes = ?, resolved_at = ?, resolved_by = ?
      WHERE id = ?
    `).run(status, notes || '', nowIso, resolvedBy, req.params.id);

    res.json({ message: 'Alert updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== WORKER / TRACK ANALYSIS ====================
app.get('/api/tracks', (_req, res) => {
  try {
    const tracks = [
      {
        trackId: 'Track 01',
        siteName: 'Apex Construction Site B',
        totalObservations: 24,
        complianceRate: 75.0,
        violationsCount: 2,
        primaryViolation: 'Missing Safety Helmet',
        riskLevel: 'Critical',
        lastSeen: '2 hours ago',
      },
      {
        trackId: 'Track 02',
        siteName: 'Apex Construction Site B',
        totalObservations: 31,
        complianceRate: 83.3,
        violationsCount: 1,
        primaryViolation: 'Missing Reflective Vest',
        riskLevel: 'High',
        lastSeen: '2 hours ago',
      },
      {
        trackId: 'Track 03',
        siteName: 'Apex Construction Site B',
        totalObservations: 28,
        complianceRate: 100.0,
        violationsCount: 0,
        primaryViolation: 'None (Full Compliance)',
        riskLevel: 'Low',
        lastSeen: '2 hours ago',
      },
      {
        trackId: 'Track 04',
        siteName: 'Detroit Auto Works Plant 3',
        totalObservations: 60,
        complianceRate: 88.0,
        violationsCount: 1,
        primaryViolation: 'Missing Kevlar Gloves',
        riskLevel: 'Medium',
        lastSeen: '14 hours ago',
      },
    ];

    res.json(tracks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SAFETY POLICY & SETTINGS ====================
app.get('/api/settings/ppe-policy', (_req, res) => {
  try {
    const policy = db.prepare(`
      SELECT * FROM policies WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1
    `).get() as any;

    if (!policy) return res.status(404).json({ error: 'No active policy found' });
    res.json({
      id: policy.id,
      version: policy.version,
      industryType: policy.industry_type,
      config: JSON.parse(policy.policy_json),
      updatedAt: policy.updated_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/ppe-policy', (req, res) => {
  try {
    const { version, industryType, config } = req.body;
    const newId = `pol-${Date.now()}`;
    const nowIso = new Date().toISOString();

    // Mark previous policies as inactive
    db.prepare(`UPDATE policies SET is_active = 0`).run();

    // Insert new policy version
    db.prepare(`
      INSERT INTO policies (id, version, industry_type, is_active, policy_json, updated_at)
      VALUES (?, ?, ?, 1, ?, ?)
    `).run(newId, version || 'v2.5-OSHA-Custom', industryType || 'Industrial General', JSON.stringify(config), nowIso);

    res.json({ message: 'Safety policy updated successfully', policyId: newId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== USER MANAGEMENT ====================
app.get('/api/users', (_req, res) => {
  try {
    const users = db.prepare(`SELECT id, email, name, role, created_at FROM users`).all();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { email, name, role, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }

    const id = `usr-${Date.now()}`;
    db.prepare(`
      INSERT INTO users (id, email, name, role, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, email, name, role || 'safety_manager', password, new Date().toISOString());

    res.status(201).json({ message: 'User created successfully', id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== VITE SPA INTEGRATION ====================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SafeGuard Vision] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
