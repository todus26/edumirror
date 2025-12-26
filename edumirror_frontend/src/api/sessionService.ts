import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type { ApiResponse } from './config';

// 발표 세션 관련 타입
export interface CreateSessionRequest {
  title?: string;
  theme?: string;
  environment_noise?: string;
  ai_questions_enabled?: boolean;
  question_count?: number;
}

export interface CreateSessionResponse {
  session_id: string;
  websocket_url: string;
}

export interface UploadMaterialResponse {
  status: string;
  file_url?: string;
  page_count: number;
  script_analysis?: {
    word_count: number;
    estimated_duration: number;
    key_topics: string[];
  };
}

export interface SessionDetailResponse {
  session_id: string;
  title: string;
  created_at: string;
  status: string;
  duration?: number;
  total_score?: number;
  // ... 기타 세션 상세 정보
}

export interface UserSessionItem {
  session_id: string;
  title: string;
  created_at: string;
  status: string;
  duration?: number;
  total_score?: number;
}

export interface UserSessionsResponse {
  sessions: UserSessionItem[];
  total_count: number;
  page: number;
  page_size: number;
}

// 발표 세션 API 서비스
export const sessionService = {
  // 발표 녹음본(음성 파일) 업로드
  async uploadAudio(sessionId: string, formData: FormData): Promise<ApiResponse<any>> {
    // /sessions/:sessionId/upload-audio
    return apiClient.postFormData(`/sessions/${sessionId}/upload-audio`, formData);
  },
  // 새 세션 생성
  async createSession(data?: CreateSessionRequest) {
    return apiClient.post<CreateSessionResponse>(
      API_ENDPOINTS.SESSIONS.CREATE,
      data
    );
  },

  // 발표 자료 업로드
  async uploadMaterial(sessionId: string, file: File, scriptText?: string) {
    const formData = new FormData();
    formData.append('presentation_file', file);
    if (scriptText) {
      formData.append('script_text', scriptText);
    }

    return apiClient.postFormData<UploadMaterialResponse>(
      API_ENDPOINTS.SESSIONS.UPLOAD_MATERIAL(sessionId),
      formData
    );
  },

  // 발표 시작
  async startSession(sessionId: string) {
    return apiClient.post(API_ENDPOINTS.SESSIONS.START(sessionId));
  },

  // 발표 종료
  async endSession(sessionId: string) {
    return apiClient.post(API_ENDPOINTS.SESSIONS.END(sessionId));
  },

  // 세션 상세 조회
  async getSessionDetail(sessionId: string) {
    return apiClient.get<SessionDetailResponse>(
      API_ENDPOINTS.SESSIONS.DETAIL(sessionId)
    );
  },

  // 사용자 발표 기록 조회
  async getUserSessions(page: number = 1, limit: number = 10, theme?: string): Promise<ApiResponse<UserSessionsResponse>> {
    let url = `/my/sessions?page=${page}&limit=${limit}`;
    if (theme) {
      url += `&theme=${encodeURIComponent(theme)}`;
    }
    return apiClient.get<UserSessionsResponse>(url);
  },
};
