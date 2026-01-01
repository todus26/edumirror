import React, { useState, useEffect } from 'react';
import { sessionService } from '../api';
import { ArrowLeft, TrendingUp, Calendar, BookOpen, Target, Eye } from 'lucide-react';
import Navigation from './Navigation';
import type { NavigationTab } from './Navigation';

interface StudentReportProps {
  studentId: string;
  onBackClick: () => void;
  onPresentationDetailClick: (sessionId: string) => void;
  onChatClick?: () => void;
  onProfileClick?: () => void;
}

const StudentReport: React.FC<StudentReportProps> = ({
  studentId,
  onBackClick,
  onPresentationDetailClick,
  onChatClick,
  onProfileClick
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1month' | '3months'>('1month');
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (tab === 'chat' && onChatClick) {
      onChatClick();
    } else if (tab === 'profile' && onProfileClick) {
      onProfileClick();
    }
  };

  // API 연동용 state
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [strengthsAndWeaknesses, setStrengthsAndWeaknesses] = useState<any>({ strengths: [], weaknesses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API 연동: 학생 정보, 성과 요약, 최근 세션, 강점/약점
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 학생 정보 (예시: /students/:id/info)
        // 성과 요약 (예시: /students/:id/performance?period=1month|3months)
        // 최근 세션 (예시: /students/:id/sessions?limit=3)
        // 강점/약점 (예시: /students/:id/strengths)

        // 실제 API 엔드포인트에 맞게 수정 필요
        // 아래는 예시 구조
        const [infoRes, perfRes, sessionsRes, strengthsRes] = await Promise.all([
          sessionService.getStudentInfo ? sessionService.getStudentInfo(studentId) : Promise.resolve({ data: { name: '학생', grade: '', school: '' } }),
          sessionService.getStudentPerformance ? sessionService.getStudentPerformance(studentId) : Promise.resolve({ data: { last_30_days: {}, last_90_days: {} } }),
          sessionService.getStudentSessions ? sessionService.getStudentSessions(studentId, 1, 3) : Promise.resolve({ data: { sessions: [] } }),
          sessionService.getStudentStrengths ? sessionService.getStudentStrengths(studentId) : Promise.resolve({ data: { strengths: [], weaknesses: [] } })
        ]);
        setStudentInfo(infoRes.data);
        setPerformanceData(perfRes.data);
        setRecentSessions(sessionsRes.data.sessions || []);
        setStrengthsAndWeaknesses(strengthsRes.data);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  const currentData = performanceData
    ? (selectedPeriod === '1month' ? performanceData.last_30_days : performanceData.last_90_days)
    : { sessions_count: 0, average_score: 0, improvement_rate: 0 };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImprovementColor = (rate: number) => {
    if (rate > 5) return 'text-green-600';
    if (rate > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-500 text-lg">데이터를 불러오는 중...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-red-500 text-lg">{error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECF2ED] flex">
      <Navigation activeTab={activeTab} onNavClick={handleNavClick} />
      
      <div className="flex-1 flex flex-col lg:ml-64 pb-20 lg:pb-0">
        {/* 상단 헤더 */}
        <div className="bg-[#74CD79] px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackClick}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-white text-xl font-bold">{studentInfo.name} 학생 리포트</h1>
              <p className="text-white/80 text-sm">{studentInfo.school}</p>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto max-w-6xl mx-auto w-full">
          <div className="space-y-6">
            {/* 기간 선택 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">성과 요약</h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedPeriod('1month')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      selectedPeriod === '1month'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    1개월
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('3months')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      selectedPeriod === '3months'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    3개월
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">발표 횟수</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{currentData.sessions_count}회</div>
                  <div className="text-sm text-blue-700">지난 {selectedPeriod === '1month' ? '1개월' : '3개월'}</div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">평균 점수</span>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(currentData.average_score)}`}>
                    {currentData.average_score.toFixed(1)}점
                  </div>
                  <div className="text-sm text-green-700">100점 만점</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">성장률</span>
                  </div>
                  <div className={`text-2xl font-bold ${getImprovementColor(currentData.improvement_rate)}`}>
                    +{currentData.improvement_rate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-purple-700">이전 기간 대비</div>
                </div>
              </div>
            </div>

            {/* 강점과 약점 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">강점 & 개선 영역</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-green-700 mb-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>강점</span>
                  </h3>
                  <div className="space-y-2">
                    {strengthsAndWeaknesses.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-700">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-red-700 mb-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>개선 영역</span>
                  </h3>
                  <div className="space-y-2">
                    {strengthsAndWeaknesses.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                        <span className="text-sm text-gray-700">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 최근 발표 기록 */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">최근 발표 기록</h2>
                <p className="text-sm text-gray-500">발표 기록을 선택하여 상세 분석을 확인하세요</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {recentSessions.map((session) => (
                  <div
                    key={session.session_id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onPresentationDetailClick(session.session_id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#74CD79] rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{session.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{session.date}</span>
                            <span>•</span>
                            <span>{session.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`text-xl font-bold ${getScoreColor(session.score)}`}>
                          {session.score}점
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <div className="ml-13 space-y-1">
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-green-700 font-medium">향상:</span>
                        {session.key_improvements.map((improvement, index) => (
                          <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            {improvement}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-red-700 font-medium">개선:</span>
                        {session.areas_to_focus.map((area, index) => (
                          <span key={index} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 추가 액션 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">추천 활동</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-blue-900">발화 속도 개선 연습</h3>
                    <p className="text-sm text-blue-700">천천히 말하기 연습을 통해 명확한 전달력을 높여보세요</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    시작하기
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-green-900">시선 처리 심화 연습</h3>
                    <p className="text-sm text-green-700">청중과의 아이컨택을 통해 소통력을 강화해보세요</p>
                  </div>
                  <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                    시작하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReport;
