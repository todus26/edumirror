import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 세션 상태 타입
export interface AnalysisStatus {
  status: 'creating' | 'processing' | 'completed' | 'failed';
  session_id: string;
  created_at: string;
  updated_at?: string;
  progress_percentage?: number;
  current_step?: string;
  estimated_completion?: string;
  error_message?: string;
}

// 분석 결과 타입
export interface AnalysisReportResponse {
  session_id: string;
  total_score: number;
  scores: {
    delivery: number;
    content: number;
    engagement: number;
    clarity: number;
  };
  speaking_metrics: {
    average_pace: number;
    volume_consistency: number;
    pause_count: number;
    filler_word_count: number;
  };
  eye_contact: {
    audience_percentage: number;
    slide_percentage: number;
    heatmap_url?: string;
  };
  script_comparison?: {
    accuracy: number;
    omissions: string[];
    additions: string[];
  };
  feedback: {
    strengths: string[];
    areas_for_improvement: string[];
    specific_suggestions: string[];
  };
  transcript?: string;
  video_url?: string;
}

// 상세 분석 결과 타입 (백엔드 실제 구조)
export interface DetailedAnalysisResult {
  session_id: string;
  overall_score: number;
  detailed_scores: {
    expression: number;
    comprehension: number;
    delivery: number;
    engagement: number;
  };
  speech_analysis: {
    script_adherence: number;
    improvisation_quality: string;
    key_points_covered: string[];
    missing_elements: string[];
    filler_words_count: number;
    speaking_pace_evaluation: string;
  };
  content_analysis: {
    clarity: string;
    depth: string;
    relevance: string;
  };
  delivery_analysis: {
    voice_quality: string;
    timing: string;
    engagement: string;
  };
  suggestions: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  analysis_completed_at: string;
}

// 분석 API 서비스
export const analysisService = {
  // 세션 상태 조회 (분석 진행 상황 확인)
  async getAnalysisStatus(sessionId: string): Promise<AnalysisStatus> {
    try {
  const response = await apiClient.get<any>(`/sessions/${sessionId}/detail`);
      
      // API가 실패한 경우
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to get session status');
      }

      const sessionData = response.data;
      
      // 백엔드 응답을 AnalysisStatus 형식으로 변환
      return {
        session_id: sessionData.id,
        status: this.mapBackendStatus(sessionData.status),
        created_at: sessionData.createdAt || sessionData.created_at,
        updated_at: sessionData.updatedAt || sessionData.updated_at,
        progress_percentage: this.getProgressFromStatus(sessionData.status),
        current_step: this.getCurrentStepFromStatus(sessionData.status),
        estimated_completion: sessionData.estimated_completion,
        error_message: sessionData.error_message
      };
    } catch (error) {
      console.error('Failed to get analysis status:', error);
      throw error;
    }
  },

  // 백엔드 상태를 프론트엔드 상태로 매핑
  mapBackendStatus(status: string): 'creating' | 'processing' | 'completed' | 'failed' {
    switch (status) {
      case 'created':
      case 'active':
        return 'creating';
      case 'processing':
        return 'processing';
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      default:
        return 'creating';
    }
  },

  // 분석 결과 조회 (상세 결과)
  async getDetailedAnalysisResult(sessionId: string): Promise<DetailedAnalysisResult> {
    try {
      // 먼저 세션 상태 확인
  const response = await apiClient.get<any>(`/sessions/${sessionId}/detail`);
      
      // API가 실패한 경우
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to get session data');
      }

      const sessionData = response.data;
      if (sessionData.status !== 'completed') {
        // 분석이 완료되지 않은 경우 조용히 처리 (에러를 throw하지 않음)
        return null as any; // null을 반환하여 호출하는 곳에서 처리하도록 함
      }
      // 실제 응답 구조: analysisResult가 data 하위에 있음
      const ar = sessionData.analysisResult;
      if (ar) {
        return {
          session_id: sessionData.session_id,
          overall_score: ar.overall_score ?? 0,
          detailed_scores: ar.detailed_scores ?? {
            expression: 0,
            comprehension: 0,
            delivery: 0,
            engagement: 0
          },
          speech_analysis: ar.speech_analysis ?? {
            script_adherence: 0,
            improvisation_quality: '분석 중',
            key_points_covered: [],
            missing_elements: [],
            filler_words_count: 0,
            speaking_pace_evaluation: '분석 중'
          },
          content_analysis: ar.content_analysis ?? {
            clarity: '분석 중',
            depth: '분석 중',
            relevance: '분석 중'
          },
          delivery_analysis: ar.delivery_analysis ?? {
            voice_quality: '분석 중',
            timing: '분석 중',
            engagement: '분석 중'
          },
          suggestions: ar.suggestions ?? [],
          analysis_completed_at: ar.createdAt || new Date().toISOString()
        };
      }
      throw new Error('Analysis result not found');
    } catch (error) {
      console.error('Failed to get detailed analysis result:', error);
      throw error;
    }
  },

  // 분석 리포트 조회 (기존 호환성 유지)
  async getAnalysisReport(sessionId: string) {
    return apiClient.get<AnalysisReportResponse>(
      API_ENDPOINTS.ANALYSIS.REPORT(sessionId)
    );
  },

  // 상태에 따른 진행률 계산
  getProgressFromStatus(status: string): number {
    switch (status) {
      case 'creating': return 0;
      case 'processing': return 50;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  },

  // 상태에 따른 현재 단계 문자열 반환
  getCurrentStepFromStatus(status: string): string {
    switch (status) {
      case 'creating': return '세션 생성 중';
      case 'processing': return 'AI 분석 중';
      case 'completed': return '분석 완료';
      case 'failed': return '분석 실패';
      default: return '대기 중';
    }
  },

  // 실시간 분석 상태 폴링
  async pollAnalysisStatus(
    sessionId: string, 
    onUpdate: (status: AnalysisStatus) => void,
    onComplete: (result: DetailedAnalysisResult) => void,
    onError: (error: Error) => void,
    interval: number = 2000
  ): Promise<() => void> {
    let polling = true;
    let timeoutId: number;

    const poll = async () => {
      if (!polling) return;

      try {
        const status = await this.getAnalysisStatus(sessionId);
        onUpdate(status);

        if (status.status === 'completed') {
          polling = false;
          try {
            const result = await this.getDetailedAnalysisResult(sessionId);
            onComplete(result);
          } catch (resultError) {
            console.error('Failed to get analysis result:', resultError);
            onError(new Error('분석 결과를 가져올 수 없습니다.'));
          }
        } else if (status.status === 'failed') {
          polling = false;
          onError(new Error(status.error_message || '분석에 실패했습니다.'));
        } else {
          // 계속 폴링
          timeoutId = window.setTimeout(poll, interval);
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (polling) {
          // 에러가 발생해도 계속 시도 (실패 시 간격 늘리기)
          timeoutId = window.setTimeout(poll, Math.min(interval * 2, 10000));
        }
      }
    };

    // 첫 번째 폴링 시작
    poll();

    // 폴링 중지 함수 반환
    return () => {
      polling = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }
};
