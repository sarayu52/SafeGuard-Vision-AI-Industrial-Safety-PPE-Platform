from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default='safety_manager')
    password_hash = Column(String, nullable=False)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

class Media(Base):
    __tablename__ = 'media'
    id = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    processed_path = Column(String, nullable=True)
    mime_type = Column(String, nullable=False)
    media_type = Column(String, nullable=False) # 'image' or 'video'
    file_size = Column(Integer, nullable=False)
    site_name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    location_code = Column(String, nullable=True)
    department = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, default='completed')
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    analyses = relationship("Analysis", back_populates="media", cascade="all, delete-orphan")

class Analysis(Base):
    __tablename__ = 'analyses'
    id = Column(String, primary_key=True)
    media_id = Column(String, ForeignKey('media.id', ondelete='CASCADE'), nullable=False)
    status = Column(String, default='completed')
    progress = Column(Integer, default=100)
    safety_score = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False) # 'Low', 'Medium', 'High', 'Critical'
    total_persons = Column(Integer, default=0)
    confirmed_violations = Column(Integer, default=0)
    unverified_checks = Column(Integer, default=0)
    duration_ms = Column(Integer, default=0)
    model_name = Column(String, default='YOLOv8x-PPE')
    policy_version = Column(String, default='v2.4-Standard-OSHA')
    metadata_json = Column(Text, default='{}')
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    completed_at = Column(String, nullable=True)

    media = relationship("Media", back_populates="analyses")
    detections = relationship("PersonDetection", back_populates="analysis", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="analysis", cascade="all, delete-orphan")

class PersonDetection(Base):
    __tablename__ = 'person_detections'
    id = Column(String, primary_key=True)
    analysis_id = Column(String, ForeignKey('analyses.id', ondelete='CASCADE'), nullable=False)
    track_id = Column(String, nullable=True)
    frame_number = Column(Integer, default=1)
    timestamp_sec = Column(Float, default=0.0)
    bbox_json = Column(Text, nullable=False)
    compliance_status = Column(String, nullable=False)
    ppe_checks_json = Column(Text, nullable=False)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    analysis = relationship("Analysis", back_populates="detections")

class Alert(Base):
    __tablename__ = 'alerts'
    id = Column(String, primary_key=True)
    analysis_id = Column(String, ForeignKey('analyses.id', ondelete='CASCADE'), nullable=False)
    media_id = Column(String, ForeignKey('media.id', ondelete='CASCADE'), nullable=False)
    site_name = Column(String, nullable=False)
    track_id = Column(String, nullable=True)
    ppe_item = Column(String, nullable=False)
    severity = Column(String, default='High')
    message = Column(Text, nullable=False)
    evidence_img = Column(String, nullable=True)
    status = Column(String, default='Active') # 'Active', 'Acknowledged', 'Resolved'
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    resolved_at = Column(String, nullable=True)
    resolved_by = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    analysis = relationship("Analysis", back_populates="alerts")

class Policy(Base):
    __tablename__ = 'policies'
    id = Column(String, primary_key=True)
    version = Column(String, nullable=False)
    industry_type = Column(String, nullable=False)
    is_active = Column(Integer, default=1)
    policy_json = Column(Text, nullable=False)
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())
