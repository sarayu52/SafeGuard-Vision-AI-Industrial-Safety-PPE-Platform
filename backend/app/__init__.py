import os
from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()
engine = None
SessionLocal = None

def create_app(config_name='development'):
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'safeguard-secret-key-2026')
    db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', '..', 'data', 'safety_platform.db')
    app.config['DATABASE_URL'] = os.getenv('DATABASE_URL', f'sqlite:///{db_path}')
    app.config['PPE_MODEL_PATH'] = os.getenv('PPE_MODEL_PATH', 'models/best.pt')

    global engine, SessionLocal
    engine = create_engine(app.config['DATABASE_URL'], connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    from app.routes.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
