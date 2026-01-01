import React from 'react';
import { Home, MessageSquare, User } from 'lucide-react';

export type NavigationTab = 'home' | 'chat' | 'profile';
export const NAVIGATION_TABS = ['home', 'chat', 'profile'] as const;

interface NavigationProps {
  activeTab: NavigationTab;
  onNavClick: (tab: NavigationTab) => void;
  className?: string; // 추가: 외부에서 스타일 커스터마이징 가능
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onNavClick, className }) => {
  return (
    <>
      {/* 데스크톱 왼쪽 사이드바 (1024px 이상) */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:z-50">
        {/* 로고 영역 */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#74CD79]">EduMirror</h1>
        </div>
        
        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => onNavClick('chat')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'chat' 
                ? 'bg-[#74CD79] text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">메시지</span>
          </button>
          
          <button
            onClick={() => onNavClick('home')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'home' 
                ? 'bg-[#74CD79] text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">홈 화면</span>
          </button>
          
          <button
            onClick={() => onNavClick('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'profile' 
                ? 'bg-[#74CD79] text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">내 정보</span>
          </button>
        </nav>
      </div>

      {/* 모바일 하단 네비게이션 (1024px 미만) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-center items-center space-x-16">
          <button
            onClick={() => onNavClick('chat')}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MessageSquare className={`w-6 h-6 ${activeTab === 'chat' ? 'text-[#74CD79]' : 'text-gray-600'}`} />
          </button>

          <button 
            onClick={() => onNavClick('home')}
            className={`p-3 rounded-full ${activeTab === 'home' ? 'bg-[#74CD79] text-white' : 'hover:bg-gray-100'}`}
          >
            <Home className="w-6 h-6" />
          </button>

          <button
            onClick={() => onNavClick('profile')}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <User className={`w-6 h-6 ${activeTab === 'profile' ? 'text-[#74CD79]' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Navigation;
