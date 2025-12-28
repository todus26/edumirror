import React, { useRef, useState } from 'react';
import appLogo from '../assets/app-logo.svg';
import textLogo from '../assets/login-text-logo.svg';
import googleIcon from '../assets/google-login.svg';
import { authService, TokenManager } from '../api';

interface LoginPageProps {
  onLogin: () => void;
  onTeacherLogin: () => void;
  onGoogleLogin: () => void;
  onSignUpClick?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onTeacherLogin, onGoogleLogin, onSignUpClick }) => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    const email = emailInputRef.current?.value;
    const password = passwordInputRef.current?.value;

    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authService.login({ email, password });
      
      if (response.status === 'success' && response.access_token) {
        TokenManager.setAccessToken(response.access_token);
        if (response.refresh_token) {
          TokenManager.setRefreshToken(response.refresh_token);
        }
        
        if (response.name) {
          localStorage.setItem('user_name', response.name);
        } else {
          const userName = email.split('@')[0];
          localStorage.setItem('user_name', userName);
        }
        localStorage.setItem('user_email', email);
        
        console.log('로그인 성공!');
        onLogin();
      } else {
        setErrorMessage(response.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      setErrorMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-[#74CD79] flex flex-col items-center justify-center px-4 py-4 overflow-y-auto">
      {/* 메인 로그인 카드 */}
      <div className="w-full max-w-sm bg-[#DEDEDE] rounded-3xl p-6 md:p-8 shadow-lg">
        {/* 로고 섹션 */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center mb-0">
            <div className="mb-0">
              <img
                src={appLogo}
                alt="Edu-Mirror App Logo"
                className="w-20 h-20 md:w-24 md:h-24"
                draggable={false}
              />
            </div>
          </div>

          <div className="text-center mb-0">
            <img
              src={textLogo}
              alt="Edu-Mirror"
              className="h-6 md:h-8 lg:h-10 mx-auto"
              draggable={false}
            />
          </div>
        </div>

        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-2xl text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* 입력 필드들 */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1 px-2 text-left">이메일</label>
            <input 
              ref={emailInputRef}
              type="email" 
              placeholder="example@email.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-[30px] bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#74CD79] focus:border-transparent text-sm"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1 px-2 text-left">비밀번호</label>
            <input 
              ref={passwordInputRef}
              type="password" 
              placeholder="password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-[30px] bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#74CD79] focus:border-transparent text-sm"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>
        </div>

        {/* 로그인 버튼들 */}
        <div className="space-y-2.5 mb-4">
          <button 
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full py-2.5 rounded-[30px] font-medium transition-colors text-sm ${
              isLoading 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-[#74CD79] text-white hover:bg-[#5FB366]'
            }`}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
          
          <button 
            onClick={onTeacherLogin}
            disabled={isLoading}
            className={`w-full py-2.5 rounded-[30px] font-medium transition-colors text-sm ${
              isLoading 
                ? 'bg-gray-200 border-2 border-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-[#74CD79] text-[#74CD79] hover:bg-[#74CD79] hover:text-white'
            }`}
          >
            교사/부모 계정으로 체험하기
          </button>
        </div>

        {/* 회원가입 및 찾기 링크 */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500">
            계정이 없으시다면, 
            <button 
              onClick={onSignUpClick}
              className="text-[#74CD79] font-medium ml-1"
            >
              회원가입 바로가기
            </button>
          </p>
        </div>

        {/* 간편 로그인 섹션 */}
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="flex-1 h-px bg-gray-400"></div>
            <span className="px-4 text-xs text-gray-400">간편 로그인</span>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>
        
          <button
            type="button"
            onClick={onGoogleLogin}
            aria-label="구글 계정으로 로그인"
            className="w-full inline-flex items-center justify-center gap-2 focus:outline-none"
          >
            <span className="w-10 h-10 bg-white rounded-full outline outline-[0.68px] outline-offset-[-2px] outline-zinc-400 flex justify-center items-center shadow-sm shrink-0">
              <img src={googleIcon} alt="" className="w-8 h-8 pointer-events-none select-none" draggable={false}/>
            </span>

            <span className="p-2 bg-white text-neutral-400 text-xs font-normal font-[Gotu] whitespace-nowrap rounded-full outline outline-[0.68px] hover:bg-[#74CD79] hover:text-white" >
              구글 계정으로 로그인
            </span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
