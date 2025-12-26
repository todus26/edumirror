import React from 'react';

// 임시 아이콘 컴포넌트들 (나중에 lucide-react로 교체)
const TrendingUp = () => <span>📈</span>;
const Home = () => <span>🏠</span>;
const User = () => <span>👤</span>;
const Plus = () => <span>➕</span>;
const BarChart2 = () => <span>📊</span>;
const Award = () => <span>🏆</span>;

interface DashboardProps {
  onPresentationClick?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPresentationClick }) => {
  // 추천 발표 테마
  const recommendedThemes = [
    { title: '설명형 발표', icon: '📊', description: '정보 전달에 집중' },
    { title: '이야기 들려주기', icon: '📖', description: '스토리텔링 연습' },
    { title: '토론', icon: '🗣️', description: '논리적 사고력 향상' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 상태바 */}
      <div className="bg-[#74CD79] px-4 py-2 text-white text-sm font-medium flex justify-between items-center">
        <span>9:30</span>
        <div className="flex space-x-1">
          <span>📶</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-4 py-6 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">민지님, 지난번보다 5% 성장했어요!</h1>
            <p className="text-gray-600 text-sm mt-1">오늘도 멋진 발표를 준비해볼까요?</p>
          </div>
          <div className="w-12 h-12 bg-[#74CD79] rounded-full flex items-center justify-center">
            <User />
          </div>
        </div>

        {/* 성장 그래프 카드 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">내 성장 한눈에 보기</h2>
            <TrendingUp />
          </div>
          
          <div className="mb-4">
            <div className="text-4xl font-bold text-[#74CD79] mb-2">84</div>
            <div className="flex space-x-4 text-sm mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#74CD79] rounded-full"></div>
                <span className="text-gray-600">이해도</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#94C7FF] rounded-full"></div>
                <span className="text-gray-600">표현력</span>
              </div>
            </div>
          </div>

          {/* 임시 차트 영역 - 피그마와 동일한 메시지 */}
          <div className="h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-500 text-sm">📈 성장 그래프 (Recharts 설치 후 표시)</span>
          </div>
        </div>

        {/* 발표 시작 버튼 */}
        <button 
          onClick={onPresentationClick}
          className="w-full bg-[#74CD79] text-white py-4 rounded-2xl font-semibold text-lg shadow-sm hover:bg-[#5FB366] transition-colors"
        >
          발표 시작하기
        </button>

        {/* 추천 발표 테마 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">다음 발표 시뮬레이션</h3>
          </div>
          
          <div className="space-y-3">
            {recommendedThemes.map((theme, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-xl">
                <div className="text-2xl mr-3">{theme.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{theme.title}</h4>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex justify-around items-center">
          <div className="flex flex-col items-center space-y-1">
            <Home />
            <span className="text-xs text-[#74CD79] font-medium">홈</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <BarChart2 />
            <span className="text-xs text-gray-400">분석</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Plus />
            <span className="text-xs text-gray-400">발표</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Award />
            <span className="text-xs text-gray-400">성취</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <User />
            <span className="text-xs text-gray-400">프로필</span>
          </div>
        </div>
      </div>

      {/* 하단 여백 */}
      <div className="h-20"></div>
    </div>
  );
};

export default Dashboard;