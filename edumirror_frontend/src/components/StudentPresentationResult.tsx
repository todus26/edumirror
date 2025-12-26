import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, TrendingUp, Target, Eye, Mic, Users, Award, Loader2, AlertCircle } from 'lucide-react';
import { analysisService } from '../api/analysisService';
import type { DetailedAnalysisResult } from '../api/analysisService';

interface StudentPresentationResultProps {
  sessionId: string;
  onBackClick: () => void;
  onRetryClick: () => void;
}

const StudentPresentationResult: React.FC<StudentPresentationResultProps> = ({
  sessionId,
  onBackClick,
  onRetryClick
}) => {
  // Web Speech API 관련 상태
  // 실시간 자막 및 전체 텍스트 인식 구조
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const [subtitle, setSubtitle] = useState(''); // 실시간 자막
  const [finalTranscript, setFinalTranscript] = useState(''); // 전체 텍스트
  const [speechDuration, setSpeechDuration] = useState(0); // 초 단위
  const speechStartTimeRef = useRef<number | null>(null);

  // Web Speech API로 실시간 인식 시작
  const startSpeechRecognition = () => {
    setSpeechError(null);
    setSubtitle('');
    setFinalTranscript('');
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechError('이 브라우저는 Web Speech API를 지원하지 않습니다.');
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;
    recognition.continuous = false;
    let fullText = '';
    recognition.onstart = () => {
      setIsRecognizing(true);
      speechStartTimeRef.current = Date.now();
    };
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          fullText += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setSubtitle(interim);
      setFinalTranscript(fullText.trim());
      if (speechStartTimeRef.current) {
        setSpeechDuration(Math.round((Date.now() - speechStartTimeRef.current) / 1000));
      }
    };
    recognition.onerror = (event: any) => {
      setSpeechError(event.error || '음성 인식 오류');
      setIsRecognizing(false);
    };
    recognition.onend = async () => {
      setIsRecognizing(false);
      setSubtitle('');
      // 인식 종료 시 전체 텍스트와 시간 백엔드로 전송
      if (fullText.trim() && speechStartTimeRef.current) {
        try {
          const { TokenManager } = await import('../api/client');
          const token = TokenManager.getAccessToken();
          const res = await fetch(`/api/sessions/${sessionId}/analyze-text`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ transcript: fullText.trim(), duration: Math.round((Date.now() - speechStartTimeRef.current) / 1000) })
          });
          if (!res.ok) {
            throw new Error('분석 요청 실패');
          }
          alert('분석 요청이 성공적으로 전송되었습니다!');
        } catch (e: any) {
          alert('분석 요청 실패: ' + (e?.message || e));
        }
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // 인식 중지
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'detailed' | 'suggestions'>('overview');
  const [analysisResult, setAnalysisResult] = useState<DetailedAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API 결과를 컴포넌트에서 사용하는 형태로 변환
  const getDisplayData = () => {
    if (!analysisResult) return null;
    
    return {
      session_id: analysisResult.session_id,
      title: `발표 세션 ${analysisResult.session_id.slice(-8)}`, // 임시 제목
      date: analysisResult.analysis_completed_at,
      duration: 750, // 임시 duration (API에 duration 필드가 없음)
      overall_score: analysisResult.overall_score,
      scores: {
        expression: analysisResult.detailed_scores.expression,
        understanding: analysisResult.detailed_scores.comprehension,
        voice_quality: analysisResult.detailed_scores.delivery,
        gesture: analysisResult.detailed_scores.delivery, // 제스처는 delivery 점수 사용
        eye_contact: analysisResult.detailed_scores.engagement,
        content_structure: analysisResult.detailed_scores.comprehension
      },
      strengths: analysisResult.suggestions
        .filter(s => s.priority === 'high')
        .map(s => s.description)
        .slice(0, 3), // 상위 3개만
      improvements: analysisResult.suggestions
        .filter(s => s.priority === 'medium' || s.priority === 'high')
        .map(s => ({
          category: s.category,
          current_score: 70, // 임시 점수
          target_score: 85, // 임시 목표 점수
          feedback: s.description,
          tips: [s.recommendation]
        }))
        .slice(0, 2) // 상위 2개만
    };
  };

  const displayData = getDisplayData();

  // API를 통해 분석 결과 로드
  useEffect(() => {
    const loadAnalysisResult = async () => {
      if (!sessionId) {
        setError('세션 ID가 제공되지 않았습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 분석 결과 조회:', sessionId);
        
        const result = await analysisService.getDetailedAnalysisResult(sessionId);
        console.log('✅ 분석 결과 로드 완료:', result);
        
        setAnalysisResult(result);
        setError(null);
      } catch (error) {
        console.error('❌ 분석 결과 로드 실패:', error);
        setError(error instanceof Error ? error.message : '분석 결과를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysisResult();
  }, [sessionId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-300';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-100';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* 종합 점수 */}
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4 relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#74CD79"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 50 * ((displayData?.overall_score || 0) / 100)} ${2 * Math.PI * 50}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{displayData?.overall_score || 0}</div>
              <div className="text-sm text-gray-500">점</div>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">발표 분석 결과</h2>
        <p className="text-gray-600">전반적으로 우수한 발표였습니다!</p>
      </div>

      {/* 세부 점수 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className={`text-xl font-bold ${getScoreColor(analysisResult?.detailed_scores.expression || 0)}`}>
            {analysisResult?.detailed_scores.expression || 0}
          </div>
          <div className="text-sm text-gray-600">표현력</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className={`text-xl font-bold ${getScoreColor(displayData?.scores?.understanding || 0)}`}>
            {displayData?.scores?.understanding || 0}
          </div>
          <div className="text-sm text-gray-600">이해도</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Mic className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className={`text-xl font-bold ${getScoreColor(displayData?.scores?.voice_quality || 0)}`}>
            {displayData?.scores?.voice_quality || 0}
          </div>
          <div className="text-sm text-gray-600">음성</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="w-6 h-6 text-orange-600 mx-auto mb-2">🤚</div>
          <div className={`text-xl font-bold ${getScoreColor(displayData?.scores?.gesture || 0)}`}>
            {displayData?.scores?.gesture || 0}
          </div>
          <div className="text-sm text-gray-600">제스처</div>
        </div>
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <Eye className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <div className={`text-xl font-bold ${getScoreColor(displayData?.scores?.eye_contact || 0)}`}>
            {displayData?.scores?.eye_contact || 0}
          </div>
          <div className="text-sm text-gray-600">시선처리</div>
        </div>
        <div className="text-center p-4 bg-pink-50 rounded-lg">
          <Award className="w-6 h-6 text-pink-600 mx-auto mb-2" />
          <div className={`text-xl font-bold ${getScoreColor(displayData?.scores?.content_structure || 0)}`}>
            {displayData?.scores?.content_structure || 0}
          </div>
          <div className="text-sm text-gray-600">구성력</div>
        </div>
      </div>

      {/* 강점 */}
      <div className="bg-green-50 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          잘한 점
        </h3>
        <div className="space-y-2">
          {displayData?.strengths?.map((strength, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-green-700 text-sm">{strength}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDetailedTab = () => (
    <div className="space-y-6">
      {/* 개선 포인트 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">개선 포인트</h3>
        {displayData?.improvements?.map((improvement, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">{improvement.category}</h4>
              <div className="flex items-center space-x-2">
                <span className={`text-sm px-2 py-1 rounded ${getScoreBgColor(improvement.current_score)}`}>
                  현재 {improvement.current_score}점
                </span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  목표 {improvement.target_score}점
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm mb-3">{improvement.feedback}</p>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">개선 방법:</h5>
              <div className="space-y-1">
                {improvement.tips.map((tip, tipIndex) => (
                  <div key={tipIndex} className="flex items-start space-x-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 타임라인 피드백 - 추후 구현 예정 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">타임라인 피드백</h3>
        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
          타임라인 피드백 기능은 추후 업데이트될 예정입니다.
        </div>

      </div>
    </div>
  );

  const renderSuggestionsTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-[#74CD79]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-[#74CD79]" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">다음 발표를 위한 추천</h3>
        <p className="text-gray-600">AI가 분석한 결과를 바탕으로 맞춤형 연습을 추천합니다</p>
      </div>

      <div className="space-y-4">
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-2">발화 속도 개선 연습</h4>
          <p className="text-blue-700 text-sm mb-3">천천히 말하기 연습을 통해 명확한 전달력을 높이세요</p>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            연습 시작하기
          </button>
        </div>

        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-2">제스처 활용 트레이닝</h4>
          <p className="text-green-700 text-sm mb-3">효과적인 손동작으로 발표력을 향상시키세요</p>
          <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
            연습 시작하기
          </button>
        </div>

        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
          <h4 className="font-semibold text-purple-900 mb-2">유사한 주제로 재연습</h4>
          <p className="text-purple-700 text-sm mb-3">비슷한 과학 주제로 연습하여 전문성을 높이세요</p>
          <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
            주제 선택하기
          </button>
        </div>
      </div>

      {/* 목표 설정 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">다음 목표 설정</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">전체 점수</span>
            <span className="text-sm font-medium">85점 → 90점</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">발화 속도</span>
            <span className="text-sm font-medium">70점 → 85점</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">제스처 활용</span>
            <span className="text-sm font-medium">75점 → 90점</span>
          </div>
        </div>
        <button className="w-full mt-4 px-4 py-2 bg-[#74CD79] text-white rounded-lg hover:bg-[#5FB366] transition-colors">
          목표 저장하기
        </button>
      </div>
    </div>
  );

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#74CD79] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">분석 결과 로딩 중</h2>
          <p className="text-gray-600">AI가 분석한 결과를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
        {/* 상단 헤더 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">분석 결과</h1>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">결과를 불러올 수 없습니다</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#74CD79] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#5FB366] transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 분석 결과가 없는 경우
  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">분석 결과가 없습니다</h2>
          <p className="text-gray-600">아직 분석이 완료되지 않았거나 결과를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
  {/* ...existing code... */}
      <div className="bg-[#FFFFFF] px-4 py-2 text-black text-sm font-medium flex justify-between items-center">
        <span>9:30</span>
        <div className="flex space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
          </div>
          <div className="text-xs">📶</div>
          <div className="text-xs">📶</div>
          <div className="text-xs">🔋</div>
        </div>
      </div>
      {/* 상단 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-left text-lg font-semibold text-gray-900">{displayData?.title}</h1>
            <p className="text-left text-sm text-gray-500">
              {formatTime(displayData?.duration || 0)} • 방금 완료됨
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                selectedTab === 'overview'
                  ? 'text-[#74CD79] border-b-2 border-[#74CD79]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              종합 결과
            </button>
            <button
              onClick={() => setSelectedTab('detailed')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                selectedTab === 'detailed'
                  ? 'text-[#74CD79] border-b-2 border-[#74CD79]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              상세 분석
            </button>
            <button
              onClick={() => setSelectedTab('suggestions')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                selectedTab === 'suggestions'
                  ? 'text-[#74CD79] border-b-2 border-[#74CD79]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              맞춤 추천
            </button>
          </div>
          
          <div className="p-4">
            {selectedTab === 'overview' && renderOverviewTab()}
            {selectedTab === 'detailed' && renderDetailedTab()}
            {selectedTab === 'suggestions' && renderSuggestionsTab()}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex space-x-3">
          <button
            onClick={onRetryClick}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
          >
            다시 발표하기
          </button>
          <button
            onClick={onBackClick}
            className="flex-1 bg-[#74CD79] hover:bg-[#5FB366] text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPresentationResult;