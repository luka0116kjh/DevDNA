# DevDNA Frontend

GitHub username를 입력하면 최근 1년 기여 데이터를 기반으로 3D 잔디와 개발 성향 결과를 보여주는 프론트엔드입니다.

## Tech Stack

- React 19
- Vite
- Three.js (`@react-three/fiber`)
- Framer Motion
- Axios

## Prerequisites

- Node.js 18+
- npm
- 백엔드 서버 실행 중 (`http://127.0.0.1:5000`)

## Setup

```bash
npm install
```

필요 시 환경변수 파일 생성:

```powershell
Copy-Item .env.example .env
```

`.env` (선택):

```env
# 프론트/백엔드가 다른 도메인일 때만 사용
VITE_API_BASE_URL=
```

- 비워두면 로컬 개발에서 Vite proxy가 `/api`를 `http://127.0.0.1:5000`으로 전달합니다.

## Run

```bash
npm run dev
```

기본 접속 주소:

- `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## 주요 기능

- GitHub username 입력 및 분석 요청
- 3D contribution grass 렌더링
- 성향 점수/타입 카드 표시
- 이미지 저장 / 트위터 공유 / 링크 복사
- URL 공유 (`/user/:user`)

## API Contract (요약)

프론트는 아래 API를 호출합니다.

- `GET /api/analyze/:username`

예상 응답 필드:

- `type`
- `scores`
- `totalContributions`
- `days`
- `dataSource`

## Troubleshooting

1. `Internal server error`가 뜰 때
- 백엔드가 정상 실행 중인지 확인
- `backend/.env`의 `GITHUB_TOKEN` 유효성 확인
- 5000 포트를 다른 프로세스가 점유 중인지 확인

2. 아이디를 넣어도 결과가 없을 때
- GitHub username 오타 확인
- 존재하지 않는 계정이면 API가 에러를 반환합니다

3. 화면에서 3D가 잘 안 보일 때
- 브라우저 강력 새로고침 (`Ctrl + F5`)
- GPU 가속 비활성 환경인지 확인

## Scripts

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run preview`: 빌드 결과 로컬 미리보기
- `npm run lint`: ESLint 실행
