import React, { useState, useEffect } from 'react';
import { Home, MessageSquare, User, Plus, MoreVertical, Loader2, AlertCircle, FileText } from 'lucide-react';
import springIcon from '../assets/note-spring.svg';
import { sessionService } from '../api';

interface PresentationRecord {
  id: string;
  date: string;
  title: string;
  score: number;
  status: 'excellent' | 'good' | 'normal';
}

interface StudentDashboardProps {
  onRecordClick: (record: PresentationRecord) => void;
  onNewPresentationClick: () => void;
  onProfileClick: () => void;
  onChatClick: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onRecordClick,
  onNewPresentationClick,
  onProfileClick,
  onChatClick
}) => {
  const [presentationRecords, setPresentationRecords] = useState<PresentationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingRef, setIsLoadingRef] = useState(false); // 중복 요청 방지

  // API 데이터 로드
  // 페이지네이션 지원: page, hasMore
  const loadPresentationRecords = async (nextPage = 1) => {
    // 이미 로드 중이면 중복 요청 방지
    if (isLoadingRef) {
      console.log('⚠️ 이미 데이터 로드 중...');
      return;
    }

    try {
      setIsLoadingRef(true);
      setLoading(true);
      console.log('🔍 발표 기록 조회 중... (page:', nextPage, ')');
      const response = await sessionService.getUserSessions(nextPage, 10);
      console.log('✅ 발표 기록 로드 완료:', response);
      const sessions = (response && response.data && Array.isArray(response.data.sessions))
        ? response.data.sessions
        : (response && Array.isArray((response as any).sessions))
          ? (response as any).sessions
          : null;
      if (sessions) {
        console.log('sessions 배열:', sessions);
        const records: PresentationRecord[] = sessions.map((session: any) => {
          const score = session.overall_score ?? session.total_score ?? 0;
          const dateRaw = session.date || session.created_at;
          return {
            id: session.session_id,
            date: dateRaw ? new Date(dateRaw).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : '',
            title: session.title || `발표 ${session.session_id.slice(-8)}`,
            score,
            status: score >= 80 ? 'excellent' as const : score >= 70 ? 'good' as const : 'normal' as const
          };
        });
        console.log('records:', records);
        if (nextPage === 1) {
          setPresentationRecords(records);
        } else {
          setPresentationRecords(prev => [...prev, ...records]);
        }
        // hasMore 계산: pagination 정보가 있으면 활용, 없으면 10개 미만이면 끝
  const pagination = (response?.data && (response.data as any).pagination) || (response as any).pagination;
  const totalCount = pagination?.total_count;
  const totalPages = pagination?.total_pages;
        if (totalPages) {
          setHasMore(nextPage < totalPages);
        } else if (totalCount) {
          setHasMore(presentationRecords.length + records.length < totalCount);
        } else {
          setHasMore(records.length === 10);
        }
        setPage(nextPage);
        setError(null);
      } else {
        console.log('sessions 배열이 없거나 올바르지 않음:', response);
        if (nextPage === 1) setPresentationRecords([]);
        setHasMore(false);
        setError('발표 기록을 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('❌ 발표 기록 로드 실패:', error);
      setError('발표 기록을 불러오는 중 오류가 발생했습니다.');
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsLoadingRef(false);
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 한 번만 실행
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await loadPresentationRecords(1);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []); // 빈 배열로 한 번만 실행

  const getScoreColor = (status: 'excellent' | 'good' | 'normal') => {
    switch (status) {
      case 'excellent':
        return 'bg-[#74CD79]';
      case 'good':
        return 'bg-orange-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#ECF2ED] flex flex-col">
      {/* 상단 상태바 */}
      <div className="bg-[#74CD79] px-4 py-2 text-white text-sm font-medium flex justify-between items-center">
        <span>9:30</span>
        <div className="flex space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
          <div className="text-xs">📶</div>
          <div className="text-xs">📶</div>
          <div className="text-xs">🔋</div>
        </div>
      </div>

      {/* 상단 헤더 */}
      <div className="bg-[#74CD79] px-4 py-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">내 발표 기록</h1>
        <button
          onClick={onNewPresentationClick}
          className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-[20px] flex items-center space-x-2 border border-white/30"
        >
          <Plus className="w-5 h-5 text-white" />
          <span className="text-white font-medium">새 발표</span>
        </button>
      </div>

      {/* 발표 기록 영역 */}
      <div className="flex-1 py-6 px-5 space-y-6">
        {loading ? (
          // 로딩 상태
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#74CD79] mb-4" />
            <span className="text-gray-600">발표 기록을 불러오는 중...</span>
          </div>
        ) : error ? (
          // 에러 상태
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              className="px-4 py-2 bg-[#74CD79] text-white rounded-md hover:bg-[#5fb864] transition-colors"
              onClick={() => window.location.reload()} 
            >
              다시 시도
            </button>
          </div>
        ) : presentationRecords.length === 0 ? (
          // 빈 상태
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">아직 발표 기록이 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 발표를 시작해보세요!</p>
            <button 
              onClick={onNewPresentationClick}
              className="px-6 py-2 bg-[#74CD79] text-white rounded-md hover:bg-[#5fb864] transition-colors"
            >
              새 발표 시작하기
            </button>
          </div>
        ) : (
          // 발표 기록 리스트 + 더보기 버튼
          <>
            {presentationRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => onRecordClick(record)}
                className="justify-center max-w-80 max-w-md mx-auto relative cursor-pointer hover:opacity-50 transition-opacity"
              >
                {/* 컨테이너 - 카드 높이 설정 */}
                <div className="h-24 relative">
                  {/* 배경 그림자 카드 */}
                  <div className="absolute inset-0 bg-green-400 rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transform translate-x-1" />
                  {/* 메인 카드 */}
                  <div className="absolute inset-0 bg-white rounded-[20px] transform translate-x-3" />
                  {/* 카드 내용 */}
                  <div className="relative h-full flex items-center px-6 py-4 ml-2">
                    {/* 왼쪽 스프링 아이콘 */}
                    <div className="absolute left-0 top-1/3 transform -translate-y-1/2 -translate-x-5">
                      <img 
                        src={springIcon} 
                        alt="Spring decoration" 
                        className="w-8 h-8 sm:w-10 sm:h-10 pointer-events-none select-none" 
                        draggable={false}
                      />
                    </div>
                    {/* 텍스트 영역 */}
                    <div className="flex-1 pr-4 text-left pb-4">
                      {/* 날짜 */}
                      <div className="text-neutral-400 text-xs sm:text-sm font-normal font-['Golos_Text'] mb-2">
                        {record.date}
                      </div>
                      {/* 제목 */}
                      <div className="text-neutral-600 text-base sm:text-xl font-bold font-['Golos_Text'] leading-tight">
                        {record.title}
                      </div>
                    </div>
                    {/* 점수 영역 */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 ${getScoreColor(record.status)} rounded-full flex items-center justify-center`}>
                        <div className="text-center">
                          <span className="text-white text-xl sm:text-3xl font-semibold font-['Golos_Text'] leading-none">{record.score}</span>
                          <span className="text-white text-sm sm:text-base font-semibold font-['Golos_Text']">점</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {hasMore && !loading && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => loadPresentationRecords(page + 1)}
                  className="px-6 py-2 bg-[#74CD79] text-white rounded-md hover:bg-[#5fb864] transition-colors font-semibold"
                >
                  더보기
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-center items-center space-x-16">
          {/* 채팅 버튼 */}
          <button
            onClick={onChatClick}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-gray-600" />
          </button>

          {/* 홈 버튼 (현재 활성화) */}
          <button className="p-3 rounded-full bg-[#74CD79] text-white">
            <Home className="w-6 h-6" />
          </button>

          {/* 프로필 버튼 */}
          <button
            onClick={onProfileClick}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <User className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;