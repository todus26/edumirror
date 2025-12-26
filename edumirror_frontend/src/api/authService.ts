import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 인증 관련 타입
export interface SignUpRequest {
  email: string;
  password: string;
  user_type: 'student' | 'teacher' | 'parent';
  name: string;
  grade?: string;
  school?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user_id?: string;
  name?: string;
  error?: string;
}

// 인증 API 서비스
export const authService = {
  // 회원가입
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, data);
    // response.data가 없으면 response 자체를 반환 (백엔드가 data 없이 바로 반환하는 경우 대응)
    return (response && response.data) ? (response.data as AuthResponse) : (response as unknown as AuthResponse);
  },
  //로그인
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    return (response && response.data) ? (response.data as AuthResponse) : (response as unknown as AuthResponse);
  },
  // 로그아웃
  async logout() {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // 토큰 갱신
  async refresh(refreshToken: string) {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });
  },
};
