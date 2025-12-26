import { apiClient } from './client';

export const userService = {
  // 내 프로필 조회
  async getProfile() {
    return apiClient.get('/my/profile');
  },

  // 내 세션 목록 조회
  async getSessions(page: number = 1, limit: number = 10, theme?: string) {
    let url = `/my/sessions?page=${page}&limit=${limit}`;
    if (theme) url += `&theme=${encodeURIComponent(theme)}`;
    return apiClient.get(url);
  },

  // 내 진행상황 조회
  async getProgress(period: string = 'month', metric: string = 'overall') {
    return apiClient.get(`/my/progress?period=${period}&metric=${metric}`);
  },
};
