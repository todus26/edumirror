# EduMirror 배포 가이드 (무료)

## 🎯 추천 배포 전략

### 옵션 1: Vercel + Render (가장 쉬움) ⭐

#### 1. 프론트엔드 - Vercel 배포

1. **Vercel 가입**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **프로젝트 연결**
   - "Add New" > "Project"
   - GitHub 저장소 선택
   - `edumirror_frontend` 디렉토리 선택

3. **환경 변수 설정**
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com/api
   VITE_WS_BASE_URL=wss://your-backend.onrender.com/ws
   ```

4. **배포 설정**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Deploy 클릭!**

#### 2. 백엔드 - Render 배포

1. **Render 가입**
   - https://render.com 접속
   - GitHub 계정으로 로그인

2. **새 Web Service 생성**
   - Dashboard > "New" > "Web Service"
   - GitHub 저장소 연결
   - `edumirror-backend` 디렉토리 선택

3. **배포 설정**
   ```
   Name: edumirror-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

4. **환경 변수 추가** (Environment Variables)
   ```
   NODE_ENV=production
   PORT=8000
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   DATABASE_URL=postgresql://... (Render가 자동 생성)
   ```

5. **PostgreSQL 데이터베이스 추가**
   - Dashboard > "New" > "PostgreSQL"
   - Free 플랜 선택
   - DATABASE_URL 복사해서 백엔드 환경 변수에 추가

6. **Create Web Service 클릭!**

---

### 옵션 2: Railway (풀스택 한 번에) ⭐⭐

1. **Railway 가입**
   - https://railway.app
   - GitHub로 로그인
   - 학생이라면 GitHub Student Pack으로 추가 크레딧

2. **새 프로젝트**
   - "New Project"
   - "Deploy from GitHub repo"
   - 저장소 선택

3. **서비스 2개 추가**
   
   **프론트엔드:**
   ```
   Root Directory: edumirror_frontend
   Build Command: npm run build
   Start Command: npm run preview
   Environment Variables:
     VITE_API_BASE_URL=https://edumirror-backend.up.railway.app/api
     VITE_WS_BASE_URL=wss://edumirror-backend.up.railway.app/ws
   ```

   **백엔드:**
   ```
   Root Directory: edumirror-backend
   Build Command: npm install
   Start Command: npm start
   Environment Variables:
     (위와 동일)
   ```

4. **PostgreSQL 추가**
   - "New" > "Database" > "PostgreSQL"
   - 자동으로 DATABASE_URL 연결됨

---

## 📝 배포 전 필수 수정 사항

### 1. 백엔드 CORS 설정 수정

`edumirror-backend/src/app.js`:
```javascript
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://edumirror.vercel.app", // Vercel 도메인
      "https://your-custom-domain.com" // 커스텀 도메인
    ],
    credentials: true,
  })
);
```

### 2. DB를 PostgreSQL로 마이그레이션

현재 SQLite 사용 중이므로 변경 필요:

#### Prisma 스키마 수정 (prisma/schema.prisma):
```prisma
datasource db {
  provider = "postgresql"  // sqlite에서 변경
  url      = env("DATABASE_URL")
}
```

#### 마이그레이션:
```bash
npm install pg
npx prisma migrate dev --name init
npx prisma generate
```

### 3. 환경 변수 파일 생성

**프론트엔드 `.env.production`:**
```
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_WS_BASE_URL=wss://your-backend-url.com/ws
```

**백엔드 환경 변수 (Render/Railway에서 설정):**
```
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_very_long_and_random_secret_key_123456789
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
```

### 4. package.json Scripts 추가

**프론트엔드:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview --port 8080 --host"
  }
}
```

**백엔드:**
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  }
}
```

---

## 🔒 보안 체크리스트

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] JWT_SECRET을 강력한 랜덤 문자열로 변경
- [ ] API 키들이 환경 변수로 설정되어 있는지 확인
- [ ] CORS 설정이 프로덕션 도메인만 허용하는지 확인
- [ ] Rate Limiting이 활성화되어 있는지 확인

---

## 🎓 포트폴리오 팁

배포 후 README.md에 추가하면 좋은 내용:

```markdown
## 🌐 Live Demo
- **프론트엔드**: https://edumirror.vercel.app
- **백엔드 API**: https://edumirror-api.onrender.com
- **API 문서**: https://edumirror-api.onrender.com/

## 🛠 기술 스택
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **AI**: Google Gemini API, OpenAI Whisper
- **Deployment**: Vercel (Frontend) + Render (Backend)
- **Real-time**: WebSocket

## 📱 주요 기능
1. AI 기반 발표 분석
2. 실시간 피드백
3. 음성 분석 (속도, 음량, 필러워드)
4. 비언어적 분석 (시선, 제스처)
5. 학생/교사 대시보드
```

---

## 🚨 주의사항

### Render 무료 플랜
- 15분 미사용 시 슬립 모드
- 첫 요청 시 30초 정도 소요
- 포트폴리오 시연 전 미리 접속해두기

### Railway 무료 플랜
- 월 $5 크레딧 (약 500시간)
- 크레딧 소진 시 서비스 중단
- 사용량 모니터링 필수

### Vercel 무료 플랜
- 대역폭 100GB/월
- 빌드 시간 6000분/월
- 충분히 사용 가능

---

## 📞 배포 후 확인사항

1. [ ] 회원가입 / 로그인 동작
2. [ ] API 요청 정상 동작
3. [ ] WebSocket 연결 확인
4. [ ] 파일 업로드 기능
5. [ ] 데이터베이스 연결
6. [ ] 환경 변수 모두 설정됨
7. [ ] HTTPS 적용됨
8. [ ] 모바일에서도 정상 동작

---

## 🎯 배포 완료 후

1. **커스텀 도메인 연결** (선택)
   - Vercel: 무료 도메인 연결 가능
   - Freenom에서 무료 도메인 (.tk, .ml 등)

2. **모니터링 설정**
   - Render: 자동 모니터링 제공
   - Sentry: 무료 에러 추적

3. **성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - Lazy Loading

---

**어떤 방법으로 하시겠어요? 제가 단계별로 도와드릴게요!**
