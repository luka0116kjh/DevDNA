# DevDNA

GitHub 사용자 이름을 입력하면 최근 1년 기여 데이터를 기반으로 개발 성향을 시각화해주는 웹 서비스입니다.

## 구성

- `frontend`: React + Vite 기반 UI
- `backend`: Flask API (`/api/analyze/:username`)
- `start-devdna.ps1`: 로컬 개발 서버(백엔드/프론트엔드) 동시 실행
- `stop-devdna.ps1`: 로컬 개발 서버 종료
- `render.yaml`: Render 배포 설정(백엔드)
- `.github/workflows/deploy-pages.yml`: GitHub Pages 배포 워크플로우(프론트엔드)

## 기술 스택

- Frontend: React 19, Vite, Framer Motion, Three.js, Axios
- Backend: Flask, Flask-CORS, Requests, python-dotenv, Gunicorn

## 요구사항

- Windows PowerShell (스크립트 실행 시)
- Node.js 20+ 권장
- Python 3.11+ 권장
- npm

## 빠른 시작 (권장)

1. 저장소 루트에서 아래 순서로 1회 설정:

```powershell
cd d:\프로그래밍\DevDNA
Copy-Item .\backend\.env.example .\backend\.env
Copy-Item .\frontend\.env.example .\frontend\.env
```

2. `backend/.env`에서 `GITHUB_TOKEN` 설정
3. 루트에서 실행:

```powershell
.\start-devdna.ps1
```

4. 접속
- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:5000`

종료:

```powershell
.\stop-devdna.ps1
```

## 수동 실행 방법

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

## 환경변수

### backend/.env

- `GITHUB_TOKEN`: GitHub GraphQL API 호출용 토큰 (필수)
- `USE_MOCK_DATA`: `true`면 토큰이 없을 때 목데이터 사용
- `ALLOWED_ORIGINS`: CORS 허용 origin 목록 (쉼표 구분)
- `FLASK_DEBUG`: Flask 디버그 모드

예시:

```env
GITHUB_TOKEN=your_github_token_here
USE_MOCK_DATA=false
ALLOWED_ORIGINS=http://localhost:5173
FLASK_DEBUG=false
```

### frontend/.env

- `VITE_API_BASE_URL`: 백엔드 절대 URL (로컬 개발에서는 비워두어도 됨)
- `VITE_OWNER_GITHUB_URL`: UI 내 GitHub 버튼 링크
- `VITE_CONTACT_EMAIL`: 문의 메일 주소

예시:

```env
VITE_API_BASE_URL=
VITE_OWNER_GITHUB_URL=https://github.com/luka0116kjh
VITE_CONTACT_EMAIL=you@example.com
```

## API

- `GET /api/analyze/:username`

성공 응답 주요 필드:

- `type`
- `scores`
- `totalContributions`
- `days`
- `dataSource` (`github` 또는 `mock`)

## 배포

### Frontend (GitHub Pages)

- 워크플로우: `.github/workflows/deploy-pages.yml`
- `main` 브랜치 push 시 자동 배포
- GitHub 저장소 Secrets 필요:
  - `VITE_API_BASE_URL`
  - `VITE_OWNER_GITHUB_URL`
  - `VITE_CONTACT_EMAIL`

### Backend (Render)

- `render.yaml` 사용
- 필수 환경변수:
  - `GITHUB_TOKEN`
  - `ALLOWED_ORIGINS` (GitHub Pages 도메인 포함)

## 트러블슈팅

- 포트 충돌(`5000`, `5173`): 점유 프로세스 종료 후 재시작
- `Invalid GITHUB_TOKEN`: 토큰 재발급 후 `backend/.env` 갱신
- CORS 오류: `ALLOWED_ORIGINS`에 프론트 URL 추가
- 결과가 비정상: 사용자명 형식/존재 여부 확인
