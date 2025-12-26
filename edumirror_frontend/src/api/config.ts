// API 기본 설정
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws',
  TIMEOUT: 30000, // 30초
};

// API 엔드포인트
export const API_ENDPOINTS = {
  // 인증 & 사용자 관리
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  
  // 발표 세션
  SESSIONS: {
    CREATE: '/sessions/create',
    UPLOAD_MATERIAL: (sessionId: string) => `/sessions/${sessionId}/upload-material`,
    START: (sessionId: string) => `/sessions/${sessionId}/start`,
    END: (sessionId: string) => `/sessions/${sessionId}/end`,
    DETAIL: (sessionId: string) => `/sessions/${sessionId}/detail`,
  },
  
  // 분석 결과
  ANALYSIS: {
    REPORT: (sessionId: string) => `/analysis/${sessionId}/report`,
  },
  
  // 사용자 프로필
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile/update',
    HISTORY: '/profile/history',
  },
  
  // 대시보드
  DASHBOARD: {
    STUDENTS: '/dashboard/students',
    STUDENT_DETAIL: (studentId: string) => `/dashboard/students/${studentId}/detail`,
    STUDENT_SESSIONS: (studentId: string) => `/dashboard/students/${studentId}/sessions`,
  },
  
  // AI 질문 생성
  AI: {
    GENERATE_QUESTIONS: '/ai/generate-questions',
  },
};

// HTTP 메서드
export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;
export type HttpMethod = typeof HttpMethod[keyof typeof HttpMethod];

// 응답 타입
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}
