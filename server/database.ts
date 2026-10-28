import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'data', 'safety_platform.db');

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

// Enable Foreign Keys and WAL Mode for performance
db.exec(`PRAGMA foreign_keys = ON;`);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'safety_manager',
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS policies (
      id TEXT PRIMARY KEY,
      version TEXT NOT NULL,
      industry_type TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      policy_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      processed_path TEXT,
      mime_type TEXT NOT NULL,
      media_type TEXT NOT NULL, -- 'image' or 'video'
      file_size INTEGER NOT NULL,
      site_name TEXT NOT NULL,
      industry TEXT NOT NULL,
      location_code TEXT,
      department TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      media_id TEXT NOT NULL,
      status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
      progress INTEGER NOT NULL DEFAULT 100,
      safety_score REAL NOT NULL,
      risk_score REAL NOT NULL,
      risk_level TEXT NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
      total_persons INTEGER NOT NULL DEFAULT 0,
      confirmed_violations INTEGER NOT NULL DEFAULT 0,
      unverified_checks INTEGER NOT NULL DEFAULT 0,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      model_name TEXT NOT NULL,
      policy_version TEXT NOT NULL,
      metadata_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS person_detections (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      track_id TEXT,
      frame_number INTEGER NOT NULL DEFAULT 1,
      timestamp_sec REAL NOT NULL DEFAULT 0.0,
      bbox_json TEXT NOT NULL,
      compliance_status TEXT NOT NULL, -- 'Compliant', 'Violation detected', 'Unable to verify', 'Not supported'
      ppe_checks_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      media_id TEXT NOT NULL,
      site_name TEXT NOT NULL,
      track_id TEXT,
      ppe_item TEXT NOT NULL,
      severity TEXT NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
      message TEXT NOT NULL,
      evidence_img TEXT,
      status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Acknowledged', 'Resolved'
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      resolved_by TEXT,
      notes TEXT,
      FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  // Check if admin user exists
  const userCheck = db.prepare(`SELECT count(*) as count FROM users`).get() as { count: number };
  if (userCheck.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, name, role, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Standard secure test accounts (admin, safety_manager, inspector)
    insertUser.run('usr-admin-01', 'admin@safeguard.industrial', 'Chief Safety Officer (Admin)', 'admin', 'admin123', new Date().toISOString());
    insertUser.run('usr-mgr-02', 'manager@safeguard.industrial', 'Marcus Vance (Safety Manager)', 'safety_manager', 'manager123', new Date().toISOString());
    insertUser.run('usr-insp-03', 'inspector@safeguard.industrial', 'Elena Rostova (Site Inspector)', 'inspector', 'inspector123', new Date().toISOString());
  }

  // Check if default policy exists
  const policyCheck = db.prepare(`SELECT count(*) as count FROM policies`).get() as { count: number };
  if (policyCheck.count === 0) {
    const defaultPolicy = {
      version: 'v2.4-Standard-OSHA',
      industryType: 'General Industrial & Construction',
      requiredPPE: ['helmet', 'vest', 'gloves', 'safety_shoes', 'goggles'],
      weights: {
        helmet: 30,
        vest: 25,
        gloves: 15,
        safety_shoes: 20,
        goggles: 10,
      },
      riskThresholds: {
        low: 25,
        medium: 50,
        high: 75,
        critical: 100,
      },
      confidenceThreshold: 0.50,
      frameSamplingRate: 1.0,
      maxUploadSizeMb: 150,
      modelPath: 'models/yolov8_ppe_trained.pt',
      effectiveDate: '2026-01-15'
    };

    db.prepare(`
      INSERT INTO policies (id, version, industry_type, is_active, policy_json, updated_at)
      VALUES (?, ?, ?, 1, ?, ?)
    `).run('pol-default-01', 'v2.4-Standard-OSHA', 'General Industrial & Construction', JSON.stringify(defaultPolicy), new Date().toISOString());
  }

  // Check if initial sample media & analysis exists
  const mediaCheck = db.prepare(`SELECT count(*) as count FROM media`).get() as { count: number };
  if (mediaCheck.count === 0) {
    seedSampleIndustrialAnalyses();
  }
}

function seedSampleIndustrialAnalyses() {
  const insertMedia = db.prepare(`
    INSERT INTO media (id, filename, original_name, file_path, processed_path, mime_type, media_type, file_size, site_name, industry, location_code, department, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAnalysis = db.prepare(`
    INSERT INTO analyses (id, media_id, status, progress, safety_score, risk_score, risk_level, total_persons, confirmed_violations, unverified_checks, duration_ms, model_name, policy_version, metadata_json, created_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPerson = db.prepare(`
    INSERT INTO person_detections (id, analysis_id, track_id, frame_number, timestamp_sec, bbox_json, compliance_status, ppe_checks_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAlert = db.prepare(`
    INSERT INTO alerts (id, analysis_id, media_id, site_name, track_id, ppe_item, severity, message, evidence_img, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const d1 = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
  const d2 = new Date(now.getTime() - 14 * 3600 * 1000).toISOString();
  const d3 = new Date(now.getTime() - 28 * 3600 * 1000).toISOString();
  const d4 = new Date(now.getTime() - 52 * 3600 * 1000).toISOString();

  // 1. Media 1: Construction Site Heavy Equipment Zone
  const m1Id = 'med-cst-001';
  const a1Id = 'ana-cst-001';
  insertMedia.run(
    m1Id,
    'construction_zone_crane_01.jpg',
    'Tower Crane Erection Sector 4.jpg',
    '/uploads/sample_construction.jpg',
    '/processed/sample_construction_annotated.jpg',
    'image/jpeg',
    'image',
    2457600,
    'Apex Construction Site B',
    'Construction Sites',
    'ZONE-4B-CRANE',
    'Structural Rigging',
    'Routine pre-shift crane perimeter audit',
    'completed',
    d1
  );

  // Analysis 1: 3 workers, 1 missing helmet, 1 missing vest -> 2 violations out of 15 checks
  // Safety score: 100 * (1 - (30 + 25) / (100 * 3 / 100 * 100)) = 81.6% -> 82%
  insertAnalysis.run(
    a1Id,
    m1Id,
    'completed',
    100,
    81.7,
    38.5,
    'Medium',
    3,
    2,
    1,
    840,
    'YOLOv8x-PPE-Industrial-v3',
    'v2.4-Standard-OSHA',
    JSON.stringify({ resolution: '1920x1080', inferenceFps: 38.2, weather: 'Clear Daylight' }),
    d1,
    d1
  );

  // Persons for Analysis 1
  insertPerson.run(
    'det-001-1',
    a1Id,
    'Track 01',
    1,
    0.0,
    JSON.stringify({ x: 120, y: 180, width: 210, height: 490 }),
    'Violation detected',
    JSON.stringify({
      helmet: { detected: false, status: 'violation', confidence: 0.92, label: 'Missing Helmet' },
      vest: { detected: true, status: 'compliant', confidence: 0.95, label: 'High-Vis Vest' },
      gloves: { detected: true, status: 'compliant', confidence: 0.88, label: 'Safety Gloves' },
      safety_shoes: { detected: true, status: 'compliant', confidence: 0.91, label: 'Steel Toe Boots' },
      goggles: { detected: false, status: 'unverified', confidence: 0.42, label: 'Occluded/Unverified' }
    }),
    d1
  );

  insertPerson.run(
    'det-001-2',
    a1Id,
    'Track 02',
    1,
    0.0,
    JSON.stringify({ x: 420, y: 150, width: 220, height: 510 }),
    'Violation detected',
    JSON.stringify({
      helmet: { detected: true, status: 'compliant', confidence: 0.96, label: 'Hardhat' },
      vest: { detected: false, status: 'violation', confidence: 0.89, label: 'Missing Safety Vest' },
      gloves: { detected: true, status: 'compliant', confidence: 0.85, label: 'Safety Gloves' },
      safety_shoes: { detected: true, status: 'compliant', confidence: 0.93, label: 'Steel Toe Boots' },
      goggles: { detected: true, status: 'compliant', confidence: 0.88, label: 'Safety Glasses' }
    }),
    d1
  );

  insertPerson.run(
    'det-001-3',
    a1Id,
    'Track 03',
    1,
    0.0,
    JSON.stringify({ x: 780, y: 160, width: 200, height: 480 }),
    'Compliant',
    JSON.stringify({
      helmet: { detected: true, status: 'compliant', confidence: 0.98, label: 'Hardhat' },
      vest: { detected: true, status: 'compliant', confidence: 0.97, label: 'High-Vis Vest' },
      gloves: { detected: true, status: 'compliant', confidence: 0.90, label: 'Safety Gloves' },
      safety_shoes: { detected: true, status: 'compliant', confidence: 0.94, label: 'Steel Toe Boots' },
      goggles: { detected: true, status: 'compliant', confidence: 0.89, label: 'Safety Glasses' }
    }),
    d1
  );

  // Alerts for Analysis 1
  insertAlert.run(
    'alt-cst-001',
    a1Id,
    m1Id,
    'Apex Construction Site B',
    'Track 01',
    'helmet',
    'Critical',
    'Missing safety helmet detected on worker in active crane swing sector',
    '/processed/sample_construction_annotated.jpg',
    'Active',
    d1
  );

  insertAlert.run(
    'alt-cst-002',
    a1Id,
    m1Id,
    'Apex Construction Site B',
    'Track 02',
    'vest',
    'High',
    'Missing high-visibility safety vest detected in heavy vehicle pathway',
    '/processed/sample_construction_annotated.jpg',
    'Active',
    d1
  );

  // 2. Media 2: Automobile Assembly Line Robot Cell (Video)
  const m2Id = 'med-auto-002';
  const a2Id = 'ana-auto-002';
  insertMedia.run(
    m2Id,
    'auto_assembly_robotic_welding.mp4',
    'Chassis Welding Line Robotic Cell A.mp4',
    '/uploads/sample_auto_assembly.mp4',
    '/processed/sample_auto_assembly_annotated.mp4',
    'video/mp4',
    'video',
    18450000,
    'Detroit Auto Works Plant 3',
    'Automobile Assembly Lines',
    'CELL-WELD-08',
    'Robotic Body Fabrication',
    'Video surveillance stream batch sample (60 sec)',
    'completed',
    d2
  );

  insertAnalysis.run(
    a2Id,
    m2Id,
    'completed',
    100,
    94.5,
    18.0,
    'Low',
    4,
    1,
    0,
    4200,
    'YOLOv8x-PPE-Industrial-v3',
    'v2.4-Standard-OSHA',
    JSON.stringify({ frameCount: 60, sampledFrames: 30, fps: 30, videoDurationSec: 60 }),
    d2,
    d2
  );

  insertAlert.run(
    'alt-auto-003',
    a2Id,
    m2Id,
    'Detroit Auto Works Plant 3',
    'Track 04',
    'gloves',
    'Medium',
    'Operator handling stamped sheet metal without Kevlar cut-resistant gloves',
    '/processed/sample_auto_annotated.jpg',
    'Acknowledged',
    d2
  );

  // 3. Media 3: Logistics Warehouse Forklift Lane
  const m3Id = 'med-log-003';
  const a3Id = 'ana-log-003';
  insertMedia.run(
    m3Id,
    'warehouse_rack_aisle_forklift.jpg',
    'High-Bay Racking Aisle 12.jpg',
    '/uploads/sample_warehouse.jpg',
    '/processed/sample_warehouse_annotated.jpg',
    'image/jpeg',
    'image',
    3120000,
    'Central Distribution Hub 1',
    'Warehouses and Logistics Centers',
    'AISLE-12-HIGHBAY',
    'Fulfillment & Staging',
    'Cross-dock pedestrian crossing check',
    'completed',
    d3
  );

  insertAnalysis.run(
    a3Id,
    m3Id,
    'completed',
    100,
    100.0,
    5.0,
    'Low',
    2,
    0,
    0,
    620,
    'YOLOv8x-PPE-Industrial-v3',
    'v2.4-Standard-OSHA',
    JSON.stringify({ resolution: '2560x1440', inferenceFps: 42.0 }),
    d3,
    d3
  );

  // 4. Media 4: Industrial Chemical Production Unit
  const m4Id = 'med-chem-004';
  const a4Id = 'ana-chem-004';
  insertMedia.run(
    m4Id,
    'chemical_reactor_manifold_03.jpg',
    'Catalytic Reaction Manifold Room C.jpg',
    '/uploads/sample_chemical.jpg',
    '/processed/sample_chemical_annotated.jpg',
    'image/jpeg',
    'image',
    2890000,
    'Nova Chemical Synthesis Complex',
    'Industrial Production Units',
    'UNIT-CAT-03',
    'Hazardous Materials',
    'Acid line maintenance shift review',
    'completed',
    d4
  );

  insertAnalysis.run(
    a4Id,
    m4Id,
    'completed',
    100,
    72.0,
    65.0,
    'High',
    3,
    3,
    2,
    790,
    'YOLOv8x-PPE-Industrial-v3',
    'v2.4-Standard-OSHA',
    JSON.stringify({ resolution: '1920x1080', hazardousZone: true }),
    d4,
    d4
  );

  insertAlert.run(
    'alt-chem-004',
    a4Id,
    m4Id,
    'Nova Chemical Synthesis Complex',
    'Track 01',
    'goggles',
    'Critical',
    'Missing splash goggles during active pressurized acid manifold inspection',
    '/processed/sample_chemical_annotated.jpg',
    'Active',
    d4
  );

  insertAlert.run(
    'alt-chem-005',
    a4Id,
    m4Id,
    'Nova Chemical Synthesis Complex',
    'Track 02',
    'gloves',
    'High',
    'Missing chemical barrier gloves inside containment zone perimeter',
    '/processed/sample_chemical_annotated.jpg',
    'Active',
    d4
  );
}
