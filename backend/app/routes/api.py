import os
import json
from flask import Blueprint, request, jsonify
from app import SessionLocal
from app.models.models import User, Media, Analysis, PersonDetection, Alert, Policy
from app.detection.yolo_service import YOLOPPEDetectionService

api_bp = Blueprint('api', __name__)
yolo_service = YOLOPPEDetectionService()

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    session = SessionLocal()
    user = session.query(User).filter_by(email=email).first()
    session.close()

    if not user or user.password_hash != password:
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'token': f'token-{user.id}',
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role
        }
    })

@api_bp.route('/dashboard/summary', methods=['GET'])
def get_summary():
    session = SessionLocal()
    total_images = session.query(Media).filter_by(media_type='image').count()
    total_videos = session.query(Media).filter_by(media_type='video').count()
    analyses = session.query(Analysis).all()
    
    total_persons = sum(a.total_persons for a in analyses)
    total_violations = sum(a.confirmed_violations for a in analyses)
    unverified = sum(a.unverified_checks for a in analyses)
    avg_safety = sum(a.safety_score for a in analyses) / len(analyses) if analyses else 100.0
    avg_risk = sum(a.risk_score for a in analyses) / len(analyses) if analyses else 0.0

    recent_alerts = session.query(Alert).order_by(Alert.created_at.desc()).limit(5).all()
    recent_alerts_data = [{
        'id': al.id,
        'message': al.message,
        'severity': al.severity,
        'site_name': al.site_name,
        'ppe_item': al.ppe_item,
        'created_at': al.created_at
    } for al in recent_alerts]

    session.close()

    return jsonify({
        'kpis': {
            'totalImagesAnalyzed': total_images,
            'totalVideosAnalyzed': total_videos,
            'totalWorkersDetected': total_persons,
            'totalPPEDetections': total_persons * 4,
            'confirmedViolations': total_violations,
            'unverifiedChecks': unverified,
            'overallSafetyScore': round(avg_safety, 1),
            'overallRiskScore': round(avg_risk, 1),
            'highRiskIncidents': len([a for a in analyses if a.risk_level in ['High', 'Critical']]),
            'analysesCompletedToday': len(analyses)
        },
        'recentAlerts': recent_alerts_data
    })

@api_bp.route('/detect', methods=['POST'])
def detect_ppe():
    data = request.get_json() or {}
    media_path = data.get('media_path')
    conf_threshold = float(data.get('conf_threshold', 0.50))
    required_ppe = data.get('required_ppe', ['helmet', 'vest', 'gloves', 'safety_shoes', 'goggles'])

    if not media_path or not os.path.exists(media_path):
        return jsonify({'error': 'Valid media_path is required'}), 400

    try:
        workers = yolo_service.run_inference_image(
            image_path=media_path,
            conf_threshold=conf_threshold,
            required_ppe=required_ppe
        )
        return jsonify({
            'success': True,
            'workers': workers,
            'model_loaded': yolo_service.model_loaded,
            'model_name': 'YOLOv8x-PPE' if yolo_service.model_loaded else 'YOLOv8-Fallback'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

