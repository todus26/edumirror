# EduMirror API 명세서

## Base URL

- Development: `http://localhost:8000/api`

## 인증

모든 보호된 엔드포인트는 JWT 토큰이 필요합니다.

Authorization: Bearer <token>

## 주요 엔드포인트

### 인증

- `POST /auth/signup` - 회원가입
- `POST /auth/login` - 로그인

### 사용자

- `GET /my/profile` - 내 프로필 조회
- `GET /my/sessions` - 내 발표 기록

### 세션

- `POST /sessions/create` - 새 세션 생성
- `POST /sessions/{session_id}/start` - 발표 시작
- `GET /sessions/{session_id}/analysis` - 분석 결과

## WebSocket

- URL: `ws://localhost:8000/ws/session_{sessionId}`
- 실시간 피드백 및 데이터 전송
