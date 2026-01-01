import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SplashScreen from './components/SplashScreen';
import StudentDashboard from './components/StudentDashboard';
import MainDashboard from './components/MainDashboard';
import PresentationSetup from './components/PresentationSetup';
import PresentationSimulation from './components/PresentationSimulation';
import SignUpPage from './components/SignUpPage';
import PresentationHistory from './components/PresentationHistory';
import ImprovementChat from './components/ImprovementChat';
import UserProfile from './components/UserProfile';
import TeacherDashboard from './components/TeacherDashboard';
import StudentReport from './components/StudentReport';
import TeacherImprovementChat from './components/TeacherImprovementChat';
import TeacherStudentChat from './components/TeacherStudentChat';
import TeacherPresentationHistory from './components/TeacherPresentationHistory';
import PresentationAnalysis from './components/PresentationAnalysis';
import StudentPresentationResult from './components/StudentPresentationResult';
import { TokenManager } from './api';
import './App.css';

type PageType = 
  | 'splash' 
  | 'login' 
  | 'signup' 
  | 'student-dashboard'
  | 'main-dashboard'
  | 'presentation-setup'
  | 'presentation-simulation'
  | 'presentation-history' 
  | 'improvement-chat'
  | 'user-profile'
  | 'teacher-dashboard'
  | 'student-report'
  | 'teacher-improvement-chat'
  | 'teacher-presentation-history'
  | 'presentation-analysis'
  | 'student-presentation-result';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('splash');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 초기 인증 상태 확인
  useEffect(() => {
    const token = TokenManager.getAccessToken();
    if (token) {
      setIsAuthenticated(true);
      // 토큰이 있으면 바로 대시보드로
      if (currentPage === 'splash' || currentPage === 'login') {
        setCurrentPage('student-dashboard');
      }
    }
  }, []);

  // 스플래쉬 화면에서 자동으로 로그인 화면으로 이동
  useEffect(() => {
    if (currentPage === 'splash' && !isAuthenticated) {
      const timer = setTimeout(() => {
        setCurrentPage('login');
      }, 3000); // 3초 후 로그인 화면으로
      return () => clearTimeout(timer);
    }
  }, [currentPage, isAuthenticated]);

  // 로그인 성공 처리
  const handleLogin = () => {
    console.log('로그인 성공');
    setIsAuthenticated(true);
    setCurrentPage('student-dashboard'); // 학생 로그인 후 학생 대시보드로
  };

  const handleTeacherLogin = () => {
    console.log('교사 로그인 성공');
    setIsAuthenticated(true);
    setCurrentPage('teacher-dashboard'); // 교사 대시보드로
  };

  const handleGoogleLogin = () => {
    console.log('구글 로그인 성공');
    setIsAuthenticated(true);
    setCurrentPage('student-dashboard');
  };



  // 회원가입 처리
  const handleSignUpClick = () => {
    setCurrentPage('signup');
  };

  const handleSignUp = () => {
    setCurrentPage('login'); // 회원가입 후 로그인 화면으로
  };

  const handleBackToLogin = () => {
    setCurrentPage('login');
  };

  // 학생 대시보드 관련
  const handleRecordClick = (record: any) => {
    console.log('발표 기록 클릭:', record);
    setCurrentPage('main-dashboard'); // 발표 기록 클릭 시 메인 대시보드로
  };

  const handleNewPresentationClick = () => {
    setCurrentPage('presentation-setup');
  };

  const handleProfileClick = () => {
    setCurrentPage('user-profile');
  };

  const handleChatClick = () => {
    setCurrentPage('improvement-chat');
  };

  // 메인 대시보드 관련
  const handleBackToStudentDashboard = () => {
    setCurrentPage('student-dashboard');
  };

  const handleDetailedAnalysisClick = () => {
    setCurrentPage('presentation-history');
  };

  // 발표 관련
  const handleStartPresentation = (file?: File, sessionData?: any) => {
    if (file) setUploadedFile(file);
    if (sessionData?.session_id) {
      setSelectedSessionId(sessionData.session_id);
      console.log('✅ 세션 ID 저장:', sessionData.session_id);
    }
    setCurrentPage('presentation-simulation');
  };

  const handleBackToPresentationSetup = () => {
    setCurrentPage('presentation-setup');
  };

  const handleBackToMainDashboard = () => {
    setCurrentPage('main-dashboard');
  };

  const handlePresentationComplete = () => {
    setCurrentPage('presentation-analysis');
  };

  const handleAnalysisComplete = () => {
    setCurrentPage('student-presentation-result');
  };

  const handleRetryPresentation = () => {
    setCurrentPage('presentation-setup');
  };

  const handleBackFromResult = () => {
    setCurrentPage('student-dashboard');
  };

  // 공통 뒤로가기
  const handleBackFromProfile = () => {
    setCurrentPage('student-dashboard');
  };

  const handleBackFromChat = () => {
    setCurrentPage('student-dashboard');
  };

  const handleBackFromHistory = () => {
    setCurrentPage('main-dashboard');
  };

  // 교사 플로우 관련
  const handleBackToTeacherDashboard = () => {
    setCurrentPage('teacher-dashboard');
  };

  const handleStudentReportClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentPage('student-report');
  };

  const handleTeacherImprovementChatClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentPage('teacher-improvement-chat');
  };

  const handleTeacherPresentationDetailClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentPage('teacher-presentation-history');
  };

  const handleBackFromStudentReport = () => {
    setCurrentPage('teacher-dashboard');
  };

  const handleBackFromTeacherChat = () => {
    setCurrentPage('teacher-dashboard');
  };

  const handleBackFromTeacherHistory = () => {
    setCurrentPage('student-report');
  };

  // 로그아웃
  const handleLogout = () => {
    TokenManager.clearTokens();
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'splash':
        return <SplashScreen />;
        
      case 'login':
        return (
          <LoginPage 
            onLogin={handleLogin}
            onTeacherLogin={handleTeacherLogin}
            onGoogleLogin={handleGoogleLogin}
            onSignUpClick={handleSignUpClick}
          />
        );
        
      case 'signup':
        return (
          <SignUpPage 
            onSignUp={handleSignUp}
            onBackToLogin={handleBackToLogin}
          />
        );
        
      case 'student-dashboard':
        return (
          <StudentDashboard 
            onRecordClick={handleRecordClick}
            onNewPresentationClick={handleNewPresentationClick}
            onProfileClick={handleProfileClick}
            onChatClick={handleChatClick}
          />
        );
        
      case 'main-dashboard':
        return (
          <MainDashboard 
            onBackClick={handleBackToStudentDashboard}
            onNewPresentationClick={handleNewPresentationClick}
            onDetailedAnalysisClick={handleDetailedAnalysisClick}
            onChatClick={handleChatClick}
            onProfileClick={handleProfileClick}
          />
        );
        
      case 'presentation-setup':
        return (
          <PresentationSetup 
            onBackClick={handleBackToMainDashboard}
            onStartPresentation={handleStartPresentation}
          />
        );
        
      case 'presentation-simulation':
        return (
          <PresentationSimulation 
            sessionId={selectedSessionId}
            onBack={handleBackToPresentationSetup}
            onComplete={handlePresentationComplete}
            uploadedFile={uploadedFile}
          />
        );
        
      case 'presentation-analysis':
        return (
          <PresentationAnalysis 
            sessionId={selectedSessionId}
            onAnalysisComplete={handleAnalysisComplete}
          />
        );
        
      case 'student-presentation-result':
        return (
          <StudentPresentationResult 
            sessionId={selectedSessionId}
            onBackClick={handleBackFromResult}
            onRetryClick={handleRetryPresentation}
          />
        );
        
      case 'presentation-history':
        return (
          <PresentationHistory 
            onRecordClick={handleRecordClick}
            onNewPresentationClick={handleNewPresentationClick}
            onBackClick={handleBackFromHistory}
            onChatClick={handleChatClick}
            onProfileClick={handleProfileClick}
          />
        );
        
      case 'improvement-chat':
        return (
          <ImprovementChat 
            onBackClick={handleBackFromChat}
            onHomeClick={handleBackToStudentDashboard}
            onProfileClick={handleProfileClick}
          />
        );
        
      case 'user-profile':
        return (
          <UserProfile 
            onBackClick={handleBackFromProfile}
            onLogoutClick={handleLogout}
            onHomeClick={handleBackToStudentDashboard}
            onChatClick={handleChatClick}
          />
        );
        
      case 'teacher-dashboard':
        return (
          <TeacherDashboard 
            onBackClick={handleBackToLogin}
            onStudentReportClick={handleStudentReportClick}
            onImprovementChatClick={handleTeacherImprovementChatClick}
          />
        );

      case 'student-report':
        return (
          <StudentReport 
            studentId={selectedStudentId}
            onBackClick={handleBackFromStudentReport}
            onPresentationDetailClick={handleTeacherPresentationDetailClick}
            onChatClick={handleTeacherImprovementChatClick}
            onProfileClick={handleBackToTeacherDashboard}
          />
        );

      case 'teacher-improvement-chat':
        return (
          <TeacherStudentChat 
            studentId={selectedStudentId}
            studentName="김민지"
            onBackClick={handleBackFromTeacherChat}
          />
        );

      case 'teacher-presentation-history':
        return (
          <TeacherPresentationHistory 
            sessionId={selectedSessionId}
            studentId={selectedStudentId}
            onBackClick={handleBackFromTeacherHistory}
          />
        );
        
      default:
        return <SplashScreen />;
    }
  };

  return (
    <div className="App w-full bg-white min-h-screen">
      {renderPage()}
    </div>
  );
}

export default App;
