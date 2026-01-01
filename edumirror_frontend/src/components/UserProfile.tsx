import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Loader2, AlertCircle } from 'lucide-react';
import { userService } from '../api/userService';
import Navigation from './Navigation';
import type { NavigationTab } from './Navigation';

interface UserProfileProps {
  onBackClick: () => void;
  onEditClick?: () => void;
  onLogoutClick?: () => void;
  onChatClick?: () => void;
  onHomeClick?: () => void;
}

interface UserProfileData {
  name: string;
  school?: string;
  grade?: string;
  strengths: string[];
  weaknesses: string[];
}

const formatGrade = (grade?: string): string => {
  if (!grade) return '';
  
  const gradeMap: { [key: string]: string } = {
    'elementary_1': '초등학교 1학년',
    'elementary_2': '초등학교 2학년',
    'elementary_3': '초등학교 3학년',
    'elementary_4': '초등학교 4학년',
    'elementary_5': '초등학교 5학년',
    'elementary_6': '초등학교 6학년',
    'middle_1': '중학교 1학년',
    'middle_2': '중학교 2학년',
    'middle_3': '중학교 3학년',
    'high_school_1': '고등학교 1학년',
    'high_school_2': '고등학교 2학년',
    'high_school_3': '고등학교 3학년',
  };
  
  return gradeMap[grade] || grade;
};

const UserProfile: React.FC<UserProfileProps> = ({
  onBackClick,
  onLogoutClick,
  onChatClick,
  onHomeClick
}) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('profile');
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingRef, setIsLoadingRef] = useState(false);

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (tab === 'home' && onHomeClick) {
      onHomeClick();
    } else if (tab === 'chat' && onChatClick) {
      onChatClick();
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (isLoadingRef || !isMounted) {
        console.log('⚠️ 이미 프로필 로드 중...');
        return;
      }

      try {
        setIsLoadingRef(true);
        setLoading(true);
        const response = await userService.getProfile();
        console.log('✅ 프로필 API 응답:', response);
        
        const storedName = localStorage.getItem('user_name');
        const storedSchool = localStorage.getItem('user_school');
        const storedGrade = localStorage.getItem('user_grade');
        
        const data = response.data || response;
        console.log('📊 파싱된 데이터:', data);
        
        if (data && (data.school || data.grade || data.name)) {
          const apiName = data.name || data.username;
          
          if (apiName) {
            localStorage.setItem('user_name', apiName);
          }
          
          setProfileData({
            name: apiName || storedName || '사용자',
            school: data.school || storedSchool || undefined,
            grade: data.grade || storedGrade || undefined,
            strengths: [],
            weaknesses: []
          });
          setError(null);
        } else {
          console.log('⚠️ API 응답에 데이터 없음, localStorage 사용');
          setProfileData({
            name: storedName || '사용자',
            school: storedSchool || undefined,
            grade: storedGrade || undefined,
            strengths: [],
            weaknesses: []
          });
          setError(null);
        }
      } catch (err) {
        console.error('❌ 프로필 로드 실패:', err);
        setError('프로필 정보를 불러올 수 없습니다.');
        const storedName = localStorage.getItem('user_name');
        const storedSchool = localStorage.getItem('user_school');
        const storedGrade = localStorage.getItem('user_grade');
        setProfileData({
          name: storedName || '사용자',
          school: storedSchool || undefined,
          grade: storedGrade || undefined,
          strengths: [],
          weaknesses: []
        });
      } finally {
        setLoading(false);
        setIsLoadingRef(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#74CD79] animate-spin mb-4" />
        <p className="text-gray-600">프로필을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <Navigation activeTab={activeTab} onNavClick={handleNavClick} />

      {/* 메인 컨텐츠 영역 */}
      <div className="lg:ml-64 pb-16 lg:pb-0 min-h-screen bg-gray-50 flex flex-col">
        {/* 상단 헤더 */}
        <div className="bg-[#74CD79] px-4 lg:px-8 py-4 flex items-center w-full">
          <button
            onClick={onBackClick}
            className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">내 정보</h1>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 overflow-y-auto">
          {/* 환영 메시지 */}
          <div className="px-4 lg:px-8 pt-6 pb-4 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-neutral-600 font-['Golos_Text']">{profileData?.name}님, 안녕하세요!</h2>
            {error && (
              <div className="mt-2 flex items-center text-sm text-orange-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* 메인 정보 카드 */}
          <div className="text-left mx-4 lg:mx-auto max-w-4xl bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <User className="w-6 h-6 text-[#74CD79] mr-2" />
                <h3 className="text-xl font-bold text-neutral-600 font-['Golos_Text']">내 정보</h3>
              </div>
            </div>
            
            {/* 이름 */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-neutral-600 font-['Golos_Text'] ml-4 mb-4">이름</h4>
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-[20px]" />
                <div className="relative ml-2 bg-gray-50 rounded-[20px] border border-zinc-100 p-4">
                  <span className="text-base font-bold text-neutral-600 font-['Golos_Text']">{profileData?.name || '사용자'}</span>
                </div>
              </div>
            </div>

            {/* 소속 */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-neutral-600 font-['Golos_Text'] ml-4 mb-4">소속</h4>
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-[20px]" />
                <div className="relative ml-2 bg-gray-50 rounded-[20px] border border-zinc-100 p-4">
                  <div className="text-base font-bold text-neutral-600 font-['Golos_Text']">
                    {profileData?.school || '정보를 입력해주세요!'}
                  </div>
                </div>
              </div>
            </div>

            {/* 학년 */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-neutral-600 font-['Golos_Text'] ml-4 mb-4">학년</h4>
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-[20px]" />
                <div className="relative ml-2 bg-gray-50 rounded-[20px] border border-zinc-100 p-4">
                  <div className="text-base font-bold text-neutral-600 font-['Golos_Text']">
                    {profileData?.grade ? formatGrade(profileData.grade) : '정보를 입력해주세요!'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="mx-4 lg:mx-auto max-w-4xl mb-6">
            <button
              onClick={onLogoutClick}
              className="w-full bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] py-4 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-6 h-6 text-neutral-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <span className="text-lg font-bold text-neutral-400 font-['Golos_Text']">로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
