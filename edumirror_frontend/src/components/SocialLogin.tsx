import React from 'react';

interface SocialLoginProps {
  onGoogleLogin?: () => void;
}

const GoogleIcon: React.FC = () => (
  <svg className="google-icon" viewBox="0 0 27 27" fill="none">
    <path d="M0 0H27.12V27.12H0V0Z" fill="#FFC107"/>
    <path d="M1.56 0H22.79V10.51H1.56V0Z" fill="#FF3D00"/>
    <path d="M1.49 16.31H22.65V27.12H1.49V16.31Z" fill="#4CAF50"/>
    <path d="M13.56 10.85H27.12V23.61H13.56V10.85Z" fill="#1976D2"/>
  </svg>
);

const SocialLogin: React.FC<SocialLoginProps> = ({ onGoogleLogin }) => {
  return (
    <div className="social-login">
      {/* 간편 로그인 헤더 */}
      <div className="social-header">
        <div className="social-line" />
        <span className="social-text">간편 로그인</span>
        <div className="social-line" />
      </div>

      {/* 소셜 로그인 버튼들 */}
      <div className="social-buttons">
        {/* 구글 아이콘 버튼 */}
        <button className="google-icon-button" onClick={onGoogleLogin}>
          <GoogleIcon />
        </button>

        {/* 구글 로그인 버튼 */}
        <button className="google-login-button" onClick={onGoogleLogin}>
          구글 계정으로 로그인
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;