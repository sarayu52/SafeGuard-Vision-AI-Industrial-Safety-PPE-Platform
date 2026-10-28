import os
from app import create_app

app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"[*] Starting SafeGuard Vision Flask YOLOv8 API Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
