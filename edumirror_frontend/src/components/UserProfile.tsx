import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Loader2, AlertCircle } from 'lucide-react';
import { userService } from '../api/userService';

interface UserProfileProps {
  onBackClick: () => void;
  onEditClick?: () => void;
  onLogoutClick?: () => void;
}

interface UserProfileData {
  name: string;
  school?: string;
  grade?: string;
  strengths: string[];
  weaknesses: string[];
}

// 학년 코드를 한글로 변환하는 함수
const formatGrade = (grade?: string): string => {
  if (!grade) return '';
  
  const gradeMap: { [key: string]: string } = {
    // 초등학교
    'elementary_1': '초등학교 1학년',
    'elementary_2': '초등학교 2학년',
    'elementary_3': '초등학교 3학년',
    'elementary_4': '초등학교 4학년',
    'elementary_5': '초등학교 5학년',
    'elementary_6': '초등학교 6학년',
    // 중학교
    'middle_1': '중학교 1학년',
    'middle_2': '중학교 2학년',
    'middle_3': '중학교 3학년',
    // 고등학교
    'high_school_1': '고등학교 1학년',
    'high_school_2': '고등학교 2학년',
    'high_school_3': '고등학교 3학년',
  };
  
  return gradeMap[grade] || grade;
};

const UserProfile: React.FC<UserProfileProps> = ({
  onBackClick,
  onLogoutClick
}) => {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingRef, setIsLoadingRef] = useState(false); // 중복 요청 방지

  // 프로필 데이터 로드
  useEffect(() => {
    // 컴포넌트 마운트 시 한 번만 실행
    let isMounted = true;

    const loadProfile = async () => {
      // 이미 로드 중이면 중복 요청 방지
      if (isLoadingRef || !isMounted) {
        console.log('⚠️ 이미 프로필 로드 중...');
        return;
      }

      try {
        setIsLoadingRef(true);
        setLoading(true);
        const response = await userService.getProfile();
        console.log('✅ 프로필 API 응답:', response);
        
        // localStorage에서 사용자 정보 가져오기
        const storedName = localStorage.getItem('user_name');
        const storedSchool = localStorage.getItem('user_school');
        const storedGrade = localStorage.getItem('user_grade');
        
        // API 응답 데이터 추출 (response.data 또는 response 자체)
        const data = response.data || response;
        
        console.log('📊 파싱된 데이터:', data);
        
        // API 응답 구조 확인 - data에 school이나 grade가 있으면 사용
        if (data && (data.school || data.grade || data.name)) {
          // API 응답의 이름을 우선적으로 사용 (localStorage보다 우선)
          const apiName = data.name || data.username;
          
          // API에서 이름을 받아왔다면 localStorage에도 저장
          if (apiName) {
            localStorage.setItem('user_name', apiName);
          }
          
          // API 응답을 컴포넌트 형식에 맞게 변환
          setProfileData({
            name: apiName || storedName || '사용자',
            school: data.school || storedSchool || undefined,
            grade: data.grade || storedGrade || undefined,
            strengths: [],
            weaknesses: []
          });
          setError(null);
        } else {
          // API가 성공해도 데이터가 없는 경우 localStorage 사용
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
        // 에러 시 localStorage 데이터 사용
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
  }, []); // 빈 배열로 한 번만 실행

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#74CD79] animate-spin mb-4" />
        <p className="text-gray-600">프로필을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 상태바 */}
      <div className="bg-[#74CD79] px-4 py-2 text-white text-sm font-medium flex justify-between items-center">
        <span>9:30</span>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1 h-1 bg-white rounded-full" />
            <span className="w-1 h-1 bg-white rounded-full" />
            <span className="w-1 h-1 bg-white rounded-full" />
            <span className="w-1 h-1 bg-white rounded-full" />
          </div>
          <span className="text-xs">📶</span>
          <span className="text-xs">📶</span>
          <span className="text-xs">🔋</span>
        </div>
      </div>

      {/* 상단 헤더 */}
      <div className="bg-[#74CD79] px-4 py-4 flex items-center">
        <button
          onClick={onBackClick}
          className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white text-xl font-bold">내 정보</h1>
      </div>

      {/* 환영 메시지 */}
      <div className="px-8 pt-6 pb-4">
        <h2 className="text-xl font-bold text-neutral-600 font-['Golos_Text']">{profileData?.name}님, 안녕하세요!</h2>
        {error && (
          <div className="mt-2 flex items-center text-sm text-orange-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 메인 정보 카드 */}
      <div className="text-left mx-6 bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-6 mb-6">
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

        {/* 소속 - 학교만 표시 */}
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

        {/* 학년 - 별도 섹션 */}
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
      <div className="mx-6 mb-6">
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

      {/* 메뉴 닫기를 위한 배경 오버레이 */}
      {showEditMenu && (
        <div 
          className="fixed inset-0 z-10 bg-transparent"
          onClick={() => setShowEditMenu(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;