import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList, LineChart, Line, Legend
} from 'recharts';
import { sessionService, analysisService, userService } from '../api';
import { ArrowLeft, BarChart2, Mic } from 'lucide-react';
import Navigation from './Navigation';
import type { NavigationTab } from './Navigation';


/* ---- 추천 테마 카드 재사용 컴포넌트 ---- */
function ThemeCard({
  title,
  sub,
}: {
  title: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="relative">
      {/* 뒤 그린 레이어 (왼쪽 얇은 띠) */}
      <div aria-hidden className="absolute inset-0 rounded-[20px] bg-[#74CD79]" />
      {/* 실제 카드: 왼쪽 띠 보이도록 살짝 우측으로 */}
      <div className="relative ml-2 rounded-[20px] border border-zinc-100 bg-[#F7FCF8] p-4">
        <h4 className="mb-1 font-bold text-neutral-600 text-lg">{title}</h4>
        <p className="text-sm text-neutral-400">{sub}</p>
      </div>
    </div>
  );
}

interface MainDashboardProps {
  onBackClick: () => void;
  onNewPresentationClick: () => void;
  onDetailedAnalysisClick: () => void;
  onChatClick: () => void;
  onProfileClick: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  onBackClick,
  onNewPresentationClick,
  onDetailedAnalysisClick,
  onChatClick,
  onProfileClick
}) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('사용자');
  const [scoreChartData, setScoreChartData] = useState<any[]>([]);
  const [scoreChartLoading, setScoreChartLoading] = useState(true);
  const [scoreChartError, setScoreChartError] = useState<string | null>(null);
  const [growthChartData, setGrowthChartData] = useState<any[]>([]);
  const [growthChartLoading, setGrowthChartLoading] = useState(true);
  const [growthChartError, setGrowthChartError] = useState<string | null>(null);
  
  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (tab === 'chat') onChatClick();
    else if (tab === 'profile') onProfileClick();
  };

  // 최근 5개 발표 detailed_scores 성장 그래프 데이터 준비
  useEffect(() => {
    const fetchGrowthChart = async () => {
      try {
        setGrowthChartLoading(true);
        setGrowthChartError(null);
        const response = await sessionService.getUserSessions(1, 5);
        const sessions = (response && response.data && Array.isArray(response.data.sessions))
          ? response.data.sessions
          : (response && Array.isArray((response as any).sessions))
            ? (response as any).sessions
            : null;
        if (sessions && sessions.length > 0) {
          const chartData = await Promise.all(
            sessions.map(async (s: any) => {
              let dateLabel = '-';
              if (s.created_at) {
                const d = new Date(s.created_at);
                dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
              }
              try {
                const result = await analysisService.getDetailedAnalysisResult(s.session_id);
                if (!result) {
                  return {
                    date: dateLabel,
                    comprehension: 0,
                    expression: 0,
                  };
                }
                return {
                  date: dateLabel,
                  comprehension: typeof result.detailed_scores?.comprehension === 'number' && !isNaN(result.detailed_scores.comprehension) ? result.detailed_scores.comprehension : 0,
                  expression: typeof result.detailed_scores?.expression === 'number' && !isNaN(result.detailed_scores.expression) ? result.detailed_scores.expression : 0,
                };
              } catch (err) {
                return {
                  date: dateLabel,
                  comprehension: 0,
                  expression: 0,
                };
              }
            })
          );
          setGrowthChartData(chartData.reverse());
        } else {
          setGrowthChartData([]);
        }
      } catch (e) {
        setGrowthChartError('성장 그래프 데이터를 불러올 수 없습니다.');
        setGrowthChartData([]);
      } finally {
        setGrowthChartLoading(false);
      }
    };
    fetchGrowthChart();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await userService.getProfile();
        if (profile?.data?.username) {
          setUserName(profile.data.username);
        }
      } catch (err) {
        console.warn('사용자 프로필을 불러올 수 없습니다.');
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await sessionService.getUserSessions(1, 1);
        const sessions = (response && response.data && Array.isArray(response.data.sessions))
          ? response.data.sessions
          : (response && Array.isArray((response as any).sessions))
            ? (response as any).sessions
            : null;
        if (sessions && sessions.length > 0) {
          const s = sessions[0];
          setSessionTitle(s.title || `발표 ${s.session_id.slice(-8)}`);
          setSessionDate(s.date || s.created_at);
          try {
            const analysisResult = await analysisService.getDetailedAnalysisResult(s.session_id);
            if (!analysisResult) {
              setAnalysis(null);
              setError('분석이 아직 완료되지 않았습니다.');
            } else {
              setAnalysis(analysisResult);
            }
          } catch (err) {
            setAnalysis(null);
            setError('분석이 아직 완료되지 않았습니다.');
          }
        } else {
          setAnalysis(null);
        }
      } catch (e) {
        setError('발표 기록을 불러올 수 없습니다.');
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestAnalysis();
  }, []);

  useEffect(() => {
    const fetchScoreChart = async () => {
      try {
        setScoreChartLoading(true);
        setScoreChartError(null);
        const response = await sessionService.getUserSessions(1, 5);
        const sessions = (response && response.data && Array.isArray(response.data.sessions))
          ? response.data.sessions
          : (response && Array.isArray((response as any).sessions))
            ? (response as any).sessions
            : null;
        if (sessions && sessions.length > 0) {
          const chartData = await Promise.all(
            sessions.map(async (s: any) => {
              let dateLabel = '-';
              if (s.created_at) {
                const d = new Date(s.created_at);
                dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
              }
              try {
                const result = await analysisService.getDetailedAnalysisResult(s.session_id);
                if (!result) {
                  return {
                    date: dateLabel,
                    score: 0,
                    fill: '#F3F4F6',
                    title: s.title || '',
                  };
                }
                return {
                  date: dateLabel,
                  score: typeof result.overall_score === 'number' && !isNaN(result.overall_score) ? result.overall_score : 0,
                  fill: '#34D399',
                  title: s.title || '',
                };
              } catch (err) {
                return {
                  date: dateLabel,
                  score: 0,
                  fill: '#F3F4F6',
                  title: s.title || '',
                };
              }
            })
          );
          setScoreChartData(chartData.reverse());
        } else {
          setScoreChartData([]);
        }
      } catch (e) {
        setScoreChartError('점수 통계 데이터를 불러올 수 없습니다.');
        setScoreChartData([]);
      } finally {
        setScoreChartLoading(false);
      }
    };
    fetchScoreChart();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <Navigation activeTab={activeTab} onNavClick={handleNavClick} />

      {/* 메인 컨텐츠 영역 */}
      <div className="lg:ml-64 pb-20 lg:pb-0 min-h-screen bg-gray-50 w-full">
        {/* 상단 헤더 */}
        <div className="bg-[#74CD79] px-4 lg:px-8 py-4 flex items-center w-full">
          <button
            onClick={onBackClick}
            className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">내 성장 현황</h1>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 px-4 lg:px-8 py-6 space-y-6 overflow-y-auto max-w-6xl mx-auto w-full">

          {/* 발표 정보 카드 */}
          <div className="text-left bg-white rounded-2xl p-6 shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
            {loading ? (
              <span className="text-gray-400">발표 기록을 불러오는 중...</span>
            ) : error ? (
              <span className="text-red-400">{error}</span>
            ) : analysis ? (
              <>
                <div className="mb-2">
                  <span className="text-sm text-gray-500">{sessionDate ? new Date(sessionDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{sessionTitle}</h3>
                <p className="text-gray-600 text-sm">최근 발표 점수: <span className="font-bold text-green-600">{analysis.overall_score}점</span></p>
              </>
            ) : (
              <span className="text-gray-400">최근 발표 기록이 없습니다.</span>
            )}
          </div>

          {/* 성장 분석 섹션 */}
          <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
            {/* 상단 점수 */}
            <div className="text-center mb-8">
              {loading ? (
                <span className="text-gray-400">점수 불러오는 중...</span>
              ) : error ? (
                <span className="text-red-400">-</span>
              ) : analysis ? (
                <>
                  <div className="mb-4">
                    <span className="text-green-600 text-6xl font-semibold font-['Golos_Text']">{analysis.overall_score}</span>
                    <span className="text-green-600 text-3xl font-semibold font-['Golos_Text']">점</span>
                  </div>
                </>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>

            {/* 발표 점수 통계 차트 */}
            <div className="bg-neutral-50 rounded-[20px] border border-zinc-100 p-6 mb-6 h-48">
              {scoreChartLoading ? (
                <div className="flex items-center justify-center h-full text-gray-300">차트 불러오는 중...</div>
              ) : scoreChartError ? (
                <div className="flex items-center justify-center h-full text-red-400">{scoreChartError}</div>
              ) : scoreChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-300">데이터 없음</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreChartData} barCategoryGap={20} margin={{ left: 8, right: 70, top: 8, bottom: 0 }} barSize={15}>
                    <CartesianGrid stroke="#F4F4F5" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: any) => `${v}점`} labelFormatter={(label: any) => (label && label !== '-') ? `날짜: ${label}` : ''} />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      <LabelList dataKey="score" position="top" formatter={(v: any) => (typeof v === 'number' && !isNaN(v)) ? `${v}점` : ''} />
                      {scoreChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 성장 그래프 */}
            <div className="bg-neutral-50 rounded-[20px] border border-zinc-100 p-6 mb-6 h-48">
              {growthChartLoading ? (
                <div className="flex items-center justify-center h-full text-gray-300">그래프 불러오는 중...</div>
              ) : growthChartError ? (
                <div className="flex items-center justify-center h-full text-red-400">{growthChartError}</div>
              ) : growthChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-300">데이터 없음</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthChartData} margin={{ left: 10, right: 40, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#F4F4F5" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} width={40} />
                    <Tooltip formatter={(v: any) => `${v}점`} labelFormatter={(label: any) => (label && label !== '-') ? `날짜: ${label}` : ''} />
                    <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ paddingLeft: '20px' }}/>
                    <Line type="monotone" dataKey="comprehension" name="이해도" stroke="#60A5FA" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="expression" name="표현력" stroke="#FBBF24" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 세부 점수 카드 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50/95 rounded-2xl border border-zinc-100 p-4 text-center">
                <div className="text-green-400 text-3xl font-semibold font-['Golos_Text'] mb-2">{analysis?.detailed_scores?.comprehension ?? '-'}</div>
                <div className="text-neutral-400 text-sm font-semibold font-['Golos_Text']">이해도</div>
              </div>
              <div className="bg-amber-50/95 rounded-2xl border border-zinc-100 p-4 text-center">
                <div className="text-green-400 text-3xl font-semibold font-['Golos_Text'] mb-2">{analysis?.detailed_scores?.expression ?? '-'}</div>
                <div className="text-neutral-400 text-sm font-semibold font-['Golos_Text']">표현력</div>
              </div>
            </div>
          </div>

          {/* AI 추천 연습 테마 */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
            <h3 className="mb-5 text-xl font-bold text-neutral-600">AI 추천 연습 테마</h3>

            <div className="space-y-5 mb-8 text-left">
              <ThemeCard title={<>👩‍🔬 과학 발표</>} sub="실험 결과를 발표해보세요!" />
              <ThemeCard title={<>🗣️ 영어 자기 소개</>} sub="영어로 5분 내외의 자기소개를 진행해보세요!" />
              <ThemeCard title={<>👩‍🏫 토론 연습</>} sub="당신의 찬반 의견을 발표해보세요!" />
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-4">
              <button
                onClick={onNewPresentationClick}
                className="flex h-16 w-full items-center justify-center gap-2 rounded-[20px] bg-[#74CD79] text-white text-lg font-bold"
              >
                <Mic className="h-5 w-5" />
                <span>새 발표 시작하기</span>
              </button>

              <button
                onClick={onDetailedAnalysisClick}
                className="flex h-16 w-full items-center justify-center gap-2 rounded-[20px] bg-lime-400 text-white text-lg font-bold"
              >
                <BarChart2 className="h-5 w-5" />
                <span>상세 분석 보기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
