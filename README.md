# SafeGuard Vision — AI Industrial Workplace Safety & PPE Monitoring Platform

An enterprise-grade, full-stack, AI-powered industrial workplace safety monitoring and business intelligence platform. The system leverages **Ultralytics YOLOv8**, **OpenCV**, **Python Flask**, **Express**, **SQLite**, and **React 19 / TypeScript** with interactive **Power BI-style analytics dashboards** for automated Personal Protective Equipment (PPE) detection, spatial person-gear association, and OSHA-compliant risk scoring.

---

## 1. System Architecture Overview

```
safe-guard-vision/
├── backend/                  # Python 3.11 Flask & YOLOv8 Computer Vision API
│   ├── app/
│   │   ├── detection/        # YOLOv8 inference, OpenCV video extraction & tracking
│   │   │   └── yolo_service.py
│   │   ├── models/           # SQLAlchemy ORM models (User, Media, Analysis, Alert)
│   │   │   └── models.py
│   │   ├── routes/           # REST endpoints (/api/auth, /api/dashboard, /api/media)
│   │   │   └── api.py
│   │   └── __init__.py
│   ├── models/               # Directory for trained YOLOv8 weights (best.pt)
│   ├── requirements.txt      # Python dependencies (ultralytics, opencv, flask)
│   ├── run.py                # Flask server entry point (Port 5000)
│   └── .env.example
├── server/                   # Full-Stack Node.js & Express REST API Engine
│   ├── database.ts           # SQLite persistent schema & initial industrial seed data
│   └── detectionService.ts   # Spatial association, transparent scoring, SVG generator
├── src/                      # React 19 + TypeScript + Tailwind CSS Frontend
│   ├── components/           # Sidebar, Header, KPI Cards, Status Badges
│   ├── pages/                # 11 Working Pages (Dashboard, Upload, Report, Alerts...)
│   ├── services/api.ts       # Typed REST API Client
│   └── types/index.ts        # Comprehensive TypeScript definitions
├── uploads/                  # Persistent store for raw surveillance images & videos
├── processed/                # Annotated inspection outputs with bounding boxes
├── data/                     # SQLite database file (safety_platform.db)
├── server.ts                 # Full-stack server entry point (Port 3000)
└── package.json
```

---

## 2. Windows & VS Code Step-by-Step Local Setup

### Step 2.1: Prerequisites
- **Node.js** v20+ or v22+ ([Download Node.js](https://nodejs.org/))
- **Python** 3.10 or 3.11 ([Download Python](https://www.python.org/)) — *Ensure "Add Python to PATH" is checked during installation*
- **Visual Studio Code** ([Download VS Code](https://code.visualstudio.com/))
- **Git** ([Download Git](https://git-scm.com/))

### Step 2.2: Clone or Open Project in VS Code
1. Open VS Code.
2. Select **File > Open Folder...** and choose the `safe-guard-vision` directory.
3. Open a new Terminal in VS Code (**Terminal > New Terminal** or `` Ctrl+` ``).

---

## 3. Terminal Commands to Install Dependencies

### Terminal 1: Frontend & Full-Stack Engine (Node.js)
```bash
# 1. Install all Node.js dependencies
npm install

# 2. Start the development server (runs full-stack Express + Vite on port 3000)
npm run dev
```

The application will start immediately at:
👉 **http://localhost:3000**

---

### Terminal 2: Python Flask & YOLOv8 Inference Engine (Optional / Advanced)
If you wish to run the dedicated Python YOLOv8 microservice alongside the platform:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate the virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows Command Prompt:
.\venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. (Optional) Install PyTorch with CUDA for GPU acceleration:
# Visit https://pytorch.org/get-started/locally/ for your CUDA version
# e.g., pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# 6. Start the Flask YOLOv8 backend
python run.py
```

The Flask API will run at:
👉 **http://localhost:5000**

---

## 4. Default Admin & Operator Credentials

The SQLite database is pre-seeded on first run with three authenticated roles:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Chief Safety Officer (Admin)** | `admin@safeguard.industrial` | `admin123` | Full access, policy weights, user management, deletion |
| **Site Safety Manager** | `manager@safeguard.industrial` | `manager123` | Ingest media, run analyses, resolve alerts, daily reports |
| **Field Compliance Inspector** | `inspector@safeguard.industrial` | `inspector123` | View inspection reports, filter alerts, export CSV |

*You can also click the quick-login role buttons on the login screen for instant access.*

---

## 5. Configuring YOLOv8 Trained PPE Weights (`best.pt`)

### Where to Place the Model:
Place your trained YOLOv8 model weights file at:
```
backend/models/best.pt
```

### Supported Class Names:
A compatible industrial PPE model should be trained on the following target classes:
- `0: person`
- `1: helmet` or `hardhat`
- `2: vest` or `reflective_vest`
- `3: gloves`
- `4: safety_shoes` or `boots`
- `5: goggles` or `safety_glasses`
- `6: mask`

### Automatic Graceful Fallback Mode:
If `best.pt` is not present, the application **does not crash**. It runs in transparent computer vision fallback mode, generating deterministic bounding boxes, annotating the media, and clearly communicating the detection state in the UI.

---

## 6. Transparent Safety & Risk Score Formulas

### Transparent Safety Score (Clamped 0–100%)
$$\text{Safety Score} = 100 \times \left(1 - \frac{\sum (\text{Confirmed Violations} \times \text{Weight})}{\sum (\text{All Applicable Checks} \times \text{Weight})}\right)$$

- **Missing Helmet Weight**: 30 points
- **Missing Reflective Vest Weight**: 25 points
- **Missing Cut/Chem Gloves Weight**: 15 points
- **Missing Steel-Toe Boots Weight**: 20 points
- **Missing Safety Goggles Weight**: 10 points

*All weights are fully customizable by authorized administrators in the **Safety Policy Settings** page.*

---

## 7. Troubleshooting Guide

### 1. `Cannot find module 'node:sqlite'`
- Ensure you are running **Node.js v22.0.0 or higher**. Check with `node -v`.
- If on Node.js 20, enable with `node --experimental-sqlite server.ts`.

### 2. `cv2.error` or `libGL.so.1` missing (Linux/Docker)
- Install system graphics libraries: `apt-get install -y libgl1-mesa-glx libglib2.0-0`
- Or use `opencv-python-headless` instead of `opencv-python`.

### 3. Video Codec Not Supported
- Convert video to standard H.264 MP4:
  ```bash
  ffmpeg -i input.mov -vcodec h264 -acodec aac output.mp4
  ```

### 4. CORS Errors
- The Express server in `server.ts` handles both the client Vite assets and the `/api/*` endpoints on port 3000, eliminating CORS issues in standard development.

---

## 8. Verification & Acceptance Checklist

- [x] **Admin Authentication**: Login and logout with session persistence.
- [x] **Media Ingestion**: Upload JPG, PNG, WEBP, MP4, AVI, MOV with drag-and-drop.
- [x] **YOLOv8 PPE Detection**: Identifies visible workers and checks PPE gear individually.
- [x] **Person-Wise Analysis**: Workers evaluated with anonymous track identifiers (`Worker #1 [Track 01]`).
- [x] **In-App Safety Alerts**: Missing helmets and vests generate instant actionable alerts.
- [x] **Power BI Style Dashboards**: Slicers by industry, site, date range, and risk severity.
- [x] **Exports**: Working CSV download and printable PDF audit report generation.
- [x] **Database Persistence**: SQLite database stores raw uploads, analyses, and alerts across restarts.
