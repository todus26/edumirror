import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Clock, BarChart3, Eye, Mic, Video, AlertCircle } from 'lucide-react';
import { analysisService } from '../api/analysisService';
import type { AnalysisStatus, DetailedAnalysisResult } from '../api/analysisService';

interface PresentationAnalysisProps {
  sessionId: string;
  onAnalysisComplete: () => void;
}

const PresentationAnalysis: React.FC<PresentationAnalysisProps> = ({
  sessionId,
  onAnalysisComplete
}) => {
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const stopPollingRef = useRef<(() => void) | null>(null);

  const analysisSteps = [
    { 
      id: 'video', 
      title: '영상 처리', 
      description: '발표 영상을 분석하고 있습니다',
      icon: Video
    },
    { 
      id: 'audio', 
      title: '음성 분석', 
      description: '발화 속도와 억양을 분석하고 있습니다',
      icon: Mic
    },
    { 
      id: 'eye_tracking', 
      title: '시선 추적', 
      description: '시선 처리 패턴을 분석하고 있습니다',
      icon: Eye
    },
    { 
      id: 'comprehensive', 
      title: '종합 분석', 
      description: 'AI가 전체 성과를 종합 평가하고 있습니다',
      icon: BarChart3
    }
  ];

  // API 폴링을 통한 실제 분석 상태 추적
  useEffect(() => {
    if (!sessionId) {
      setError('세션 ID가 제공되지 않았습니다.');
      return;
    }

    console.log('🔄 분석 상태 폴링 시작:', sessionId);

    const startPolling = async () => {
      try {
        const stopPolling = await analysisService.pollAnalysisStatus(
          sessionId,
          // 상태 업데이트 콜백
          (status: AnalysisStatus) => {
            console.log('📊 분석 상태 업데이트:', status);
            setAnalysisStatus(status);
            
            // 상태에 따른 단계 인덱스 설정
            switch (status.status) {
              case 'creating':
                setCurrentStepIndex(0);
                break;
              case 'processing':
                setCurrentStepIndex(2); // 진행 중일 때는 중간 단계
                break;
              case 'completed':
                setCurrentStepIndex(3);
                break;
              case 'failed':
                setCurrentStepIndex(0);
                break;
            }
          },
          // 완료 콜백
          (result: DetailedAnalysisResult) => {
            console.log('✅ 분석 완료:', result);
            setIsComplete(true);
            setTimeout(() => {
              onAnalysisComplete();
            }, 1500);
          },
          // 에러 콜백
          (error: Error) => {
            console.error('❌ 분석 실패:', error);
            setError(error.message);
          }
        );

        stopPollingRef.current = stopPolling;
      } catch (error) {
        console.error('❌ 폴링 시작 실패:', error);
        setError('분석 상태를 확인할 수 없습니다.');
      }
    };

    startPolling();

    // 컴포넌트 언마운트 시 폴링 중지
    return () => {
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
    };
  }, [sessionId, onAnalysisComplete]);

  const getCurrentStepIcon = () => {
    if (error) {
      return <AlertCircle className="w-12 h-12 text-red-500" />;
    }
    
    if (isComplete) {
      return <CheckCircle className="w-12 h-12 text-green-500" />;
    }

    if (currentStepIndex < analysisSteps.length) {
      const IconComponent = analysisSteps[currentStepIndex].icon;
      return <IconComponent className="w-12 h-12 text-[#74CD79]" />;
    }
    return <CheckCircle className="w-12 h-12 text-green-500" />;
  };

  const getOverallProgress = () => {
    if (isComplete) return 100;
    if (error) return 0;
    if (analysisStatus) {
      return analysisStatus.progress_percentage || 0;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
      {/* 상단 상태바 */}
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
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? '분석 실패' : isComplete ? '분석 완료!' : '발표 분석 중'}
          </h1>
          <p className="text-gray-600">
            {error 
              ? '분석 중 문제가 발생했습니다' 
              : isComplete 
                ? 'AI가 당신의 발표를 완벽하게 분석했습니다' 
                : 'AI가 당신의 발표를 자세히 분석하고 있습니다'
            }
          </p>
        </div>

        {/* 메인 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isComplete ? 'bg-green-50' : 'bg-[#74CD79]/10'
          } ${!isComplete ? 'animate-pulse' : ''}`}>
            {getCurrentStepIcon()}
          </div>
        </div>

        {/* 전체 진행률 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">전체 진행률</span>
            <span className="text-sm font-medium text-[#74CD79]">{getOverallProgress()}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#74CD79] to-[#5FB366] transition-all duration-300 ease-out"
              style={{ width: `${getOverallProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* 현재 단계 정보 */}
        {!isComplete && !error && currentStepIndex < analysisSteps.length && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-medium text-gray-900">
                {analysisSteps[currentStepIndex].title}
              </span>
            </div>
            <p className="text-gray-600 ml-8">
              {analysisStatus?.current_step || analysisSteps[currentStepIndex].description}
            </p>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">분석 실패</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* 분석 단계 목록 */}
        <div className="space-y-3">
          {analysisSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex || isComplete;
            const isCurrent = index === currentStepIndex && !isComplete && !error;

            return (
              <div 
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isCompleted ? 'bg-green-50' : 
                  isCurrent ? 'bg-[#74CD79]/5 border border-[#74CD79]/20' : 
                  'bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500' : 
                  isCurrent ? 'bg-[#74CD79]' : 
                  'bg-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <step.icon className={`w-4 h-4 ${
                      isCurrent ? 'text-white' : 'text-gray-500'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium ${
                    isCompleted ? 'text-green-700' : 
                    isCurrent ? 'text-[#74CD79]' : 
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  {isCurrent && (
                    <div className="text-sm text-gray-600 mt-1">
                      {analysisStatus?.current_step || step.description}
                    </div>
                  )}
                </div>

                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* 완료 메시지 */}
        {isComplete && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">분석이 완료되었습니다!</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              곧 상세한 분석 결과를 확인하실 수 있습니다
            </p>
          </div>
        )}

        {/* 팁 */}
        {!isComplete && !error && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">💡</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  {analysisStatus?.status === 'creating' ? '분석 준비 중' : '분석 진행 중'}
                </h3>
                <p className="text-xs text-blue-700">
                  {analysisStatus?.status === 'creating' 
                    ? '발표 세션을 준비하고 있습니다. 곧 분석이 시작됩니다.'
                    : 'AI가 당신의 발표를 다각도로 분석하여 정확한 피드백을 준비하고 있습니다. 잠시만 기다려주세요.'
                  }
                </p>
                {analysisStatus?.estimated_completion && (
                  <p className="text-xs text-blue-600 mt-1">
                    예상 완료 시간: {new Date(analysisStatus.estimated_completion).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 에러 발생 시 재시도 안내 */}
        {error && (
          <div className="mt-8 p-4 bg-red-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-900 mb-1">분석 실패</h3>
                <p className="text-xs text-red-700">
                  분석 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationAnalysis;