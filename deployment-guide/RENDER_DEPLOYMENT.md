# Render 배포 완벽 가이드 (EduMirror)

## 📋 배포 체크리스트

### ✅ STEP 0: 사전 준비
- [ ] GitHub에 코드 푸시 완료
- [ ] PostgreSQL 설정 확인 (완료됨)
- [ ] .gitignore에 .env 포함 확인

---

## 🗄️ STEP 1: PostgreSQL 데이터베이스 생성

### 1-1. Render 가입
1. https://render.com 접속
2. "Get Started for Free" 클릭
3. GitHub 계정으로 로그인

### 1-2. PostgreSQL 데이터베이스 생성
1. Dashboard → "New +" → "PostgreSQL" 선택
2. 설정:
   ```
   Name: edumirror-db
   Database: edumirror_production
   User: edumirror
   Region: Singapore (또는 가장 가까운 곳)
   Plan: Free
   ```
3. "Create Database" 클릭
4. **DATABASE_URL 복사해두기** (나중에 사용)
   - 예: `postgresql://user:password@host/database`

---

## 🔧 STEP 2: 백엔드 배포

### 2-1. Web Service 생성
1. Dashboard → "New +" → "Web Service"
2. "Connect a repository" → GitHub 연동
3. 저장소 선택: `edumirror` (또는 your-repo-name)
4. "Connect" 클릭

### 2-2. 배포 설정
```
Name: edumirror-backend
Region: Singapore
Branch: main
Root Directory: edumirror-backend
Runtime: Node
Build Command: npm install && npx prisma generate && npx prisma migrate deploy
Start Command: npm start
Plan: Free
```

### 2-3. 환경 변수 추가 (중요!)
"Environment" 탭에서 추가:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://... (STEP 1에서 복사한 URL)
JWT_SECRET=your_super_secret_jwt_key_please_change_this_to_random_string_123456789
GEMINI_API_KEY=AIzaSyA1_88gnmLiUnBmWUnO3BjBUtGFPXbyHFY
OPENAI_API_KEY=sk-proj-1IHFPExydFWCOoSayCD6H-NdvCkBwM3W9ry4CDfwt6jdUUBkQPUQfM_b1FQEttokk j3-c3yvO-T3BlbkFJBDj2LGC3fapesVkCy14dS-33pXHDChhGLVcA5gRWQeNeH-1BECTgJcS61kGusKabMgoUU0qooA
```

⚠️ **주의**: JWT_SECRET은 꼭 새로운 랜덤 문자열로 변경하세요!

### 2-4. 배포 시작
1. "Create Web Service" 클릭
2. 자동으로 빌드 & 배포 시작
3. 5-10분 정도 기다림

### 2-5. 배포 URL 확인 및 복사
- 예: `https://edumirror-backend.onrender.com`
- 이 URL을 복사해두세요 (프론트엔드에서 사용)

---

## 🎨 STEP 3: 프론트엔드 배포 (Vercel)

### 3-1. Vercel 가입
1. https://vercel.com 접속
2. "Sign Up" → GitHub로 로그인

### 3-2. 프로젝트 임포트
1. "Add New..." → "Project"
2. GitHub 저장소 선택
3. "Import" 클릭

### 3-3. 프로젝트 설정
```
Project Name: edumirror
Framework Preset: Vite
Root Directory: edumirror_frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3-4. 환경 변수 설정
"Environment Variables" 섹션에서 추가:

```
VITE_API_BASE_URL=https://edumirror-backend.onrender.com/api
VITE_WS_BASE_URL=wss://edumirror-backend.onrender.com/ws
```

⚠️ `https://edumirror-backend.onrender.com`을 **실제 백엔드 URL**로 변경!

### 3-5. 배포
1. "Deploy" 클릭
2. 2-3분 기다림
3. 배포 완료!

---

## 🔄 STEP 4: CORS 설정 수정 (필수!)

### 4-1. 백엔드 코드 수정
로컬에서 `edumirror-backend/src/app.js` 수정:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://edumirror.vercel.app",  // Vercel URL로 변경
      "https://your-custom-domain.com" // 커스텀 도메인 있으면
    ],
    credentials: true,
  })
);
```

### 4-2. GitHub에 푸시
```bash
cd edumirror-backend
git add .
git commit -m "Update CORS for production"
git push
```

### 4-3. 자동 재배포 확인
- Render가 자동으로 감지하고 재배포합니다
- Dashboard에서 진행 상황 확인

---

## 🧪 STEP 5: 테스트

### 5-1. 백엔드 테스트
브라우저에서:
```
https://your-backend-url.onrender.com/
```
→ API 서버 응답 확인

### 5-2. 프론트엔드 접속
```
https://edumirror.vercel.app
```

### 5-3. 기능 테스트
- [ ] 회원가입 동작
- [ ] 로그인 동작
- [ ] 발표 세션 생성
- [ ] WebSocket 연결 (개발자 도구 콘솔 확인)

---

## ⚠️ 중요 주의사항

### 1. Render 슬립 모드
- 15분 동안 요청이 없으면 슬립
- 첫 요청 시 30초 정도 소요
- **해결책**: 포트폴리오 시연 전 미리 접속해두기

### 2. 환경 변수 보안
- `.env` 파일이 GitHub에 올라가지 않도록 확인
- `.gitignore`에 `.env` 포함 확인:
  ```
  # .gitignore
  .env
  .env.local
  .env.production
  node_modules/
  ```

### 3. API 키 관리
- GEMINI_API_KEY, OPENAI_API_KEY는 Render 환경 변수에만 설정
- 절대 코드에 하드코딩 금지

### 4. 데이터베이스 백업
- Render 무료 플랜은 자동 백업 없음
- 중요 데이터는 정기적으로 백업

---

## 🔧 문제 해결

### 배포 실패 시
1. Render Dashboard → Logs 확인
2. 빌드 에러 메시지 확인
3. 환경 변수 제대로 설정되었는지 확인

### CORS 에러 시
1. 백엔드 CORS 설정에 프론트 URL 추가 확인
2. `https://` 포함 여부 확인
3. 슬래시(/) 끝에 있는지 확인

### 데이터베이스 연결 실패
1. DATABASE_URL이 정확한지 확인
2. Prisma 마이그레이션 성공했는지 확인
3. Render Logs에서 에러 확인

### WebSocket 연결 안 됨
1. 프론트엔드 환경 변수에 `wss://` (https아님) 확인
2. 백엔드에서 WebSocket 서버 정상 실행 확인

---

## 📊 배포 완료 체크리스트

- [ ] 백엔드 배포 성공
- [ ] 프론트엔드 배포 성공
- [ ] 데이터베이스 연결 확인
- [ ] CORS 설정 완료
- [ ] 회원가입/로그인 테스트
- [ ] API 요청 정상 동작
- [ ] WebSocket 연결 확인
- [ ] 환경 변수 모두 설정
- [ ] .env 파일 GitHub에 없음 확인

---

## 🎓 포트폴리오 README 추가

배포 완료 후 README.md에 추가:

```markdown
## 🌐 Live Demo
- **Frontend**: https://edumirror.vercel.app
- **Backend API**: https://edumirror-backend.onrender.com
- **API Docs**: https://edumirror-backend.onrender.com/

⚠️ **Note**: 백엔드가 슬립 모드일 경우 첫 요청 시 30초 정도 소요됩니다.

## 🛠 Tech Stack
**Frontend**
- React + TypeScript
- Vite
- TailwindCSS
- WebSocket

**Backend**
- Node.js + Express
- PostgreSQL (Prisma ORM)
- JWT Authentication
- Google Gemini AI
- OpenAI Whisper

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL
```

---

## 🚀 다음 단계 (선택사항)

1. **커스텀 도메인 연결**
   - Vercel에서 무료로 도메인 연결 가능
   - 예: `edumirror.com`

2. **모니터링 추가**
   - Sentry (무료 에러 추적)
   - Google Analytics

3. **성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - Lazy Loading

---

**배포 과정에서 막히는 부분 있으면 바로 물어보세요!** 🎯
