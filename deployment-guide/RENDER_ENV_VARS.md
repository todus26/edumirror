# Render 백엔드 환경 변수 (복사해서 사용)

## 필수 환경 변수

### 1. NODE_ENV
production

### 2. PORT
10000

### 3. DATABASE_URL
postgresql://... (STEP 1에서 복사한 URL)

### 4. JWT_SECRET
edumirror_super_secret_jwt_key_change_this_to_random_long_string_12345678901234567890

⚠️ 위 JWT_SECRET은 반드시 변경하세요! 랜덤 문자열 생성:
https://randomkeygen.com/ 에서 "CodeIgniter Encryption Keys" 복사

### 5. GEMINI_API_KEY
AIzaSyA1_88gnmLiUnBmWUnO3BjBUtGFPXbyHFY

### 6. OPENAI_API_KEY
sk-proj-1IHFPExydFWCOoSayCD6H-NdvCkBwM3W9ry4CDfwt6jdUUBkQPUQfM_b1FQEttokk j3-c3yvO-T3BlbkFJBDj2LGC3fapesVkCy14dS-33pXHDChhGLVcA5gRWQeNeH-1BECTgJcS61kGusKabMgoUU0qooA

---

## 환경 변수 입력 형식 (Render에서)

Key: NODE_ENV
Value: production

Key: PORT
Value: 10000

Key: DATABASE_URL
Value: postgresql://edumirror:xxx@xxx.oregon-postgres.render.com/edumirror

Key: JWT_SECRET
Value: edumirror_super_secret_jwt_key_change_this_to_random_long_string_12345678901234567890

Key: GEMINI_API_KEY
Value: AIzaSyA1_88gnmLiUnBmWUnO3BjBUtGFPXbyHFY

Key: OPENAI_API_KEY
Value: sk-proj-1IHFPExydFWCOoSayCD6H-NdvCkBwM3W9ry4CDfwt6jdUUBkQPUQfM_b1FQEttokk j3-c3yvO-T3BlbkFJBDj2LGC3fapesVkCy14dS-33pXHDChhGLVcA5gRWQeNeH-1BECTgJcS61kGusKabMgoUU0qooA
