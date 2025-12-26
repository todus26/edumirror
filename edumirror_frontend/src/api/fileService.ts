import { apiClient } from './client';

export const fileService = {
  // 발표자료 PDF 다운로드
  async downloadPresentation(sessionId: string) {
    const url = `/files/presentations/${sessionId}`;
    return apiClient.get(url);
  },

  // 녹화파일(mp4) 다운로드
  async downloadRecording(sessionId: string) {
    const url = `/files/recordings/${sessionId}`;
    return apiClient.get(url);
  },
};
