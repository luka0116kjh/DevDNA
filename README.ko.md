# DevDNA 🧬

**GitHub 기여 데이터를 분석하여 개발 성향을 시각화해주는 서비스**

GitHub 사용자 이름을 입력하면 최근 1년 동안의 기여 데이터를 기반으로 개발 성향을 분석하고 시각화해주는 웹 서비스입니다.

[![한국어](https://img.shields.io/badge/lang-한국어-red?style=flat-square)](README.ko.md)
[![English](https://img.shields.io/badge/lang-English-blue?style=flat-square)](README.md)

---

## 🚀 개요

- **Frontend**: React + Vite 기반의 컴포넌트 중심 UI.
- **Backend**: Flask 기반의 RESTful API.
- **Visuals**: Three.js와 Framer Motion을 사용한 감각적인 3D/애니메이션 시각화.
- **Automation**: PowerShell 스크립트(`.ps1`)를 통한 원클릭 로컬 개발 환경 및 CI/CD 워크플로우 구성.

---

## 🛠 기술 스택

- **Frontend**: React 19, Vite, Framer Motion, Three.js, Axios
- **Backend**: Flask, Flask-CORS, Requests, python-dotenv, Gunicorn

---

## 📦 프로젝트 구조

- `frontend/`: React 소스 코드 및 UI 컴포넌트.
- `backend/`: Flask 서버 및 GitHub API 연동 로직.
- `start-devdna.ps1`: 백엔드와 프론트엔드 개발 서버를 동시에 실행하는 자동화 스크립트.
- `stop-devdna.ps1`: 실행 중인 개발 프로세스를 안전하게 종료하는 스크립트.
- `render.yaml`: Render 배포 설정 파일 (Backend).
- `.github/workflows/deploy-pages.yml`: GitHub Pages 자동 배포 워크플로우 (Frontend).

---

## ⚙️ 요구사항

- **Shell**: Windows PowerShell (스크립트 실행을 위해 필요)
- **Node.js**: 20+ 버전 권장
- **Python**: 3.11+ 버전 권장
- **Package Manager**: npm

---

## ⚡ 빠른 시작 (권장)

1. **초기 설정** (최초 1회):
   ```powershell
   cd d:\프로그래밍\DevDNA
   Copy-Item .\backend\.env.example .\backend\.env
   Copy-Item .\frontend\.env.example .\frontend\.env
   ```

2. **토큰 설정**:
   - `backend/.env` 파일을 열어 `GITHUB_TOKEN`을 입력합니다.

3. **실행**:
   ```powershell
   .\start-devdna.ps1
   ```

4. **접속**:
   - 프론트엔드: `http://localhost:5173`
   - 백엔드: `http://127.0.0.1:5000`

5. **종료**:
   - `.\stop-devdna.ps1`을 실행하여 종료합니다.

---

## 💡 수동 실행 방법

### 1) Backend (백엔드)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

### 2) Frontend (프론트엔드)
```powershell
cd frontend
npm install
npm run dev
```

---

## 🔐 환경변수

### `backend/.env`
- `GITHUB_TOKEN`: GitHub GraphQL API 호출용 액세스 토큰 (필수).
- `USE_MOCK_DATA`: 토큰이 없을 때 목(Mock) 데이터 사용 여부 (`true`/`false`).
- `ALLOWED_ORIGINS`: CORS를 허용할 오리진 목록 (쉼표 구분).
- `FLASK_DEBUG`: Flask 디버그 모드 활성화 여부.

### `frontend/.env`
- `VITE_API_BASE_URL`: 백엔드 API의 전체 URL (로컬 개발 시 비워두어도 됨).
- `VITE_OWNER_GITHUB_URL`: UI 내 개발자 GitHub 링크.
- `VITE_CONTACT_EMAIL`: 문의 메일 주소.

---

## 🔗 API 문서

- **엔드포인트**: `GET /api/analyze/:username`
- **주요 응답 필드**:
  - `type`: 분석된 개발 성향 유형.
  - `scores`: 세부 항목별 점수.
  - `totalContributions`: 최근 365일 기여 합계.
  - `days`: 날짜별 기여 데이터.
  - `dataSource`: 데이터 출처 (`github` 또는 `mock`).

---

## 🚢 배포

### 프론트엔드 (GitHub Pages)
- `.github/workflows/deploy-pages.yml`을 통해 자동 배포됩니다.
- GitHub Secrets 설정 필: `VITE_API_BASE_URL`, `VITE_OWNER_GITHUB_URL`, `VITE_CONTACT_EMAIL`.

### 백엔드 (Render)
- `render.yaml`을 통해 배포됩니다.
- 필수 환경변수: `GITHUB_TOKEN`, `ALLOWED_ORIGINS` (프론트엔드 도메인 포함).

---

## 🔍 트러블슈팅

- **포트 충돌 (`5000`, `5173`)**: 점유 중인 프로세스를 종료한 후 재시도하세요.
- **잘못된 GITHUB_TOKEN**: 토큰을 재발급한 후 `backend/.env`를 갱신하세요.
- **CORS 오류**: `ALLOWED_ORIGINS` 프론트엔드 URL이 포함되어 있는지 확인하세요.
- **데이터 로드 실패**: 사용자명 형식이 올바른지, 실제 GitHub 사용자 인지 확인하세요.
