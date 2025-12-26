import { API_CONFIG, HttpMethod, type ApiResponse } from './config';

// 토큰 관리
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'edumirror_access_token';
  private static REFRESH_TOKEN_KEY = 'edumirror_refresh_token';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}

// API 클라이언트
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    method: HttpMethod = HttpMethod.GET,
    data?: any,
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = TokenManager.getAccessToken();

    const headers: HeadersInit = {};
    
    // FormData가 아닌 경우에만 Content-Type 설정
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      method,
      headers,
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    };

    try {
      console.log(`🌐 API 요청: ${method} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // 401 Unauthorized - 토큰 만료
        if (response.status === 401) {
          TokenManager.clearTokens();
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();
      console.log(`✅ API 응답:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ API 에러:`, error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }

  // GET 요청
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HttpMethod.GET);
  }

  // POST 요청
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HttpMethod.POST, data);
  }

  // POST 요청 (FormData)
  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HttpMethod.POST, formData, true);
  }

  // PUT 요청
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HttpMethod.PUT, data);
  }

  // DELETE 요청
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HttpMethod.DELETE);
  }

  // PATCH 요청
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HttpMethod.PATCH, data);
  }
}

// 싱글톤 인스턴스 export
export const apiClient = new ApiClient();
export { TokenManager };
