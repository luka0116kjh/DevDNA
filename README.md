# DevDNA 

**Visualizing your developer DNA based on GitHub contribution history.**

GitHub 사용자 이름을 기반으로 지난 1년간의 기여 데이터를 분석하여 개발 성향을 시각화해주는 웹 서비스입니다.

[![English](https://img.shields.io/badge/lang-English-blue?style=flat-square)](README.md)
[![Korean](https://img.shields.io/badge/lang-한국어-red?style=flat-square)](README.ko.md)

---

##  Overview

- **Frontend**: Component-based UI built with React + Vite.
- **Backend**: RESTful API powered by Flask.
- **Visuals**: Dynamic 3D visualization using Three.js and Framer Motion.
- **Automation**: One-click scripts (`.ps1`) for local development and CI/CD pipelines.

---

##  Tech Stack

- **Frontend**: React 19, Vite, Framer Motion, Three.js, Axios
- **Backend**: Flask, Flask-CORS, Requests, python-dotenv, Gunicorn

---

##  Project Structure

- `frontend/`: React source code and UI components.
- `backend/`: Flask server and GitHub API integration logic.
- `start-devdna.ps1`: Automated script to start both frontend and backend development servers.
- `stop-devdna.ps1`: Script to gracefully terminate development processes.
- `render.yaml`: Deployment metadata for Render (Backend).
- `.github/workflows/deploy-pages.yml`: CI/CD workflow for GitHub Pages (Frontend).

---

##  Requirements

- **Shell**: Windows PowerShell (for scripts)
- **Node.js**: 20+ (recommended)
- **Python**: 3.11+ (recommended)
- **Package Manager**: npm

---

##  Quick Start (Recommended)

1. **Environment Setup** (One-time):
   ```powershell
   cd d:\DevDNA
   Copy-Item .\backend\.env.example .\backend\.env
   Copy-Item .\frontend\.env.example .\frontend\.env
   ```

2. **Configure Token**:
   - Open `backend/.env` and set your `GITHUB_TOKEN`.

3. **Launch**:
   ```powershell
   .\start-devdna.ps1
   ```

4. **Access**:
   - Frontend: `http://localhost:5173`
   - Backend: `http://127.0.0.1:5000`

5. **Stop**:
   ```powershell
   .\stop-devdna.ps1
   ```

---

##  Manual Execution

### 1) Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

### 2) Frontend
```powershell
cd frontend
npm install
npm run dev
```

---

##  Environment Variables

### `backend/.env`
- `GITHUB_TOKEN`: Your GitHub personal access token (Required for API calls).
- `USE_MOCK_DATA`: Set to `true` to use mock data if a token is missing.
- `ALLOWED_ORIGINS`: Comma-separated list for CORS origins.
- `FLASK_DEBUG`: Flask debug mode toggle.

### `frontend/.env`
- `VITE_API_BASE_URL`: Full URL of the backend API (leave empty for local dev).
- `VITE_OWNER_GITHUB_URL`: Link for the developer's GitHub in the UI.
- `VITE_CONTACT_EMAIL`: Contact email address.

---

##  API Documentation

- **Endpoint**: `GET /api/analyze/:username`
- **Response Fields**:
  - `type`: Classified development tendency.
  - `scores`: Individual metric scores.
  - `totalContributions`: Total count for the last 365 days.
  - `days`: Individual day data points.
  - `dataSource`: Either `github` or `mock`.

---

##  Deployment

### Frontend (GitHub Pages)
- Continuous deployment via `.github/workflows/deploy-pages.yml`.
- Requires Secrets: `VITE_API_BASE_URL`, `VITE_OWNER_GITHUB_URL`, `VITE_CONTACT_EMAIL`.

### Backend (Render)
- Configured via `render.yaml`.
- Required Envs: `GITHUB_TOKEN`, `ALLOWED_ORIGINS`.

---

##  Troubleshooting

- **Port Conflict (5000 / 5173)**: Ensure no other processes are occupying these ports.
- **Invalid GITHUB_TOKEN**: Refresh and update your token in `backend/.env`.
- **CORS Errors**: Add your frontend URL to the `ALLOWED_ORIGINS` list.
- **No Data**: Verify the GitHub username format and existence.
