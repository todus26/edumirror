import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, ChevronLeft, ChevronRight, Square, Play, Pause, StopCircle } from 'lucide-react';

// Web Speech API 실시간 자막 및 전체 텍스트 분석용 상태 및 함수
// (컴포넌트 내부에서 사용)





interface PresentationSimulationProps {
  onBack: () => void;
  onComplete?: () => void;
  uploadedFile?: File | null;
  sessionId: string;
  websocketUrl?: string; // ✅ 서버에서 받은 WebSocket URL
}

const PresentationSimulation: React.FC<PresentationSimulationProps> = ({ onBack, onComplete, uploadedFile, sessionId, websocketUrl }) => {
  // Web Speech API 실시간 자막/텍스트 상태 및 ref
  const [subtitle, setSubtitle] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [speechDuration, setSpeechDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const speechStartTimeRef = useRef<number | null>(null);

  // 발표 시작 시 음성 인식도 시작
  const startSpeechRecognition = () => {
    setSubtitle('');
    setFinalTranscript('');
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('이 브라우저는 Web Speech API를 지원하지 않습니다.');
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = true;
  recognition.continuous = true; // 여러 문장 연속 인식
    let fullText = '';
    recognition.onstart = () => {
      speechStartTimeRef.current = Date.now();
    };
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          fullText += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setSubtitle(interim);
      setFinalTranscript(fullText.trim());
      if (speechStartTimeRef.current) {
        setSpeechDuration(Math.round((Date.now() - speechStartTimeRef.current) / 1000));
      }
    };
    recognition.onerror = (event: any) => {
      // 오류 발생 시 콘솔에만 출력 (UI 미노출)
      console.error('음성 인식 오류:', event.error);
    };
    recognition.onend = () => {
      setSubtitle('');
      // 필요시 자동 재시작 (연속 인식 UX)
      // recognition.start();
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // 발표 종료 시 음성 인식 중지 및 전체 텍스트/시간 분석 요청
  const stopSpeechRecognitionAndAnalyze = async (sessionId: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (finalTranscript && speechStartTimeRef.current && sessionId) {
      try {
        const { TokenManager } = await import('../api/client');
        const token = TokenManager.getAccessToken();
        const res = await fetch(`/api/sessions/${sessionId}/analyze-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ transcript: finalTranscript, duration: speechDuration })
        });
        if (!res.ok) {
          throw new Error('분석 요청 실패');
        }
        // 성공 안내(필요시)
      } catch (e: any) {
        // 분석 요청 실패 시 콘솔에만 출력 (UI 미노출)
        console.error('분석 요청 실패:', e);
      }
    }
  };
  const [isRecording, setIsRecording] = useState(false);
  // MediaRecorder 및 오디오/비디오 청크 관리
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  // 오디오 녹음 시작 (mp3/wav 우선, 지원 안되면 webm)
  const startAudioRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    let mimeType = '';
    if (MediaRecorder.isTypeSupported('audio/wav')) {
      mimeType = 'audio/wav';
    } else if (MediaRecorder.isTypeSupported('audio/mp3')) {
      mimeType = 'audio/mp3';
    } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else {
      mimeType = '';
    }
    if (mimeType && mimeType !== 'audio/webm;codecs=opus') {
      alert(`이 브라우저는 ${mimeType}로 녹음이 지원됩니다. Whisper 인식률이 더 높아질 수 있습니다.`);
    } else if (!mimeType) {
      alert('이 브라우저는 wav/mp3/webm 녹음을 지원하지 않습니다. 최신 브라우저를 사용해 주세요.');
    }
    const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    audioChunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mr.start();
  };

  // 오디오 녹음 정지 및 업로드 (Blob 타입/크기 확인, mp3/wav 우선)
  const stopAudioRecordingAndUpload = async () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    await new Promise<void>((res) => {
      mr.onstop = () => res();
      mr.stop();
    });
    // Blob 타입 자동 감지
    const mimeType = audioChunksRef.current[0]?.type || mr.mimeType || 'audio/webm';
    const ext = mimeType.includes('wav') ? 'wav' : mimeType.includes('mp3') ? 'mp3' : 'webm';
    const blob = new Blob(audioChunksRef.current, { type: mimeType });
    console.log('[녹음 업로드] Blob 타입:', mimeType, '크기:', blob.size, 'bytes');
    if (blob.size > 10 * 1024 * 1024) {
      alert('녹음 파일이 너무 큽니다. 녹음 시간을 줄여주세요.');
      return;
    }
    const form = new FormData();
    form.append('audio_file', blob, `recording.${ext}`);
    // JWT 토큰 추가
    const { TokenManager } = await import('../api/client');
    const token = TokenManager.getAccessToken();
    await fetch(`/api/sessions/${sessionId}/upload-audio`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form
    });
  };

  // 비디오 녹화 시작 (카메라 + 화면 녹화)
  const startVideoRecording = async () => {
    try {
      // 카메라와 마이크 스트림 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // 브라우저 호환성을 위한 MIME 타입 확인
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }
      console.log('[비디오 녹화] 사용 중인 MIME 타입:', mimeType);
      
      const videoRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      videoRecorderRef.current = videoRecorder;
      videoChunksRef.current = [];
      
      videoRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log('[비디오 녹화] 청크 수집:', e.data.size, 'bytes');
          videoChunksRef.current.push(e.data);
        }
      };
      
      // 1초마다 데이터 수집 (timeslice 추가)
      videoRecorder.start(1000);
      console.log('[비디오 녹화] 시작 - 1초마다 청크 수집');
    } catch (error) {
      console.error('[비디오 녹화] 시작 실패:', error);
    }
  };

  // 비디오 녹화 중지 및 업로드
  const stopVideoRecordingAndUpload = async () => {
    const vr = videoRecorderRef.current;
    if (!vr) {
      console.log('[비디오 업로드] 녹화기가 없습니다.');
      return;
    }
    
    // 스트림 참조 보관
    const stream = vr.stream;
    
    await new Promise<void>((res) => {
      vr.onstop = () => {
        console.log('[비디오 녹화] 정지됨');
        res();
      };
      vr.stop();
    });
    
    console.log('[비디오 업로드] 수집된 청크 개수:', videoChunksRef.current.length);
    
    const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
    console.log('[비디오 업로드] 크기:', videoBlob.size, 'bytes');
    
    if (videoBlob.size === 0) {
      console.error('[비디오 업로드] 비디오 데이터가 없습니다.');
      // 스트림 종료
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      return;
    }
    
    const form = new FormData();
    form.append('video_file', videoBlob, 'presentation.webm');
    
    const { TokenManager } = await import('../api/client');
    const token = TokenManager.getAccessToken();
    
    try {
      console.log('[비디오 업로드] 업로드 시작...');
      const response = await fetch(`/api/sessions/${sessionId}/upload-video`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('[비디오 업로드] 성공:', result);
      } else {
        const errorText = await response.text();
        console.error('[비디오 업로드] 실패:', response.status, errorText);
      }
    } catch (error) {
      console.error('[비디오 업로드] 예외:', error);
    }
    
    // 스트림 종료
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      console.log('[비디오 녹화] 스트림 종료');
    }
  };
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  // WebSocket 연결 및 해제 (websocketUrl prop 우선 사용)
  useEffect(() => {
    if (isRecording && (websocketUrl || sessionId)) {
      const wsUrl = websocketUrl ?? `ws://localhost:8000/ws/${sessionId}`;
      const socket = new window.WebSocket(wsUrl);
      setWs(socket);

      socket.onopen = () => {
        console.log('WebSocket 연결됨:', wsUrl);
      };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('실시간 피드백:', data);
          if (data.type === 'realtime_feedback') {
            setFeedbackMsg(data.message);
          }
        } catch (e) {
          console.error('WebSocket 메시지 파싱 오류:', e);
        }
      };
      socket.onerror = (err) => {
        console.error('WebSocket 에러:', err);
      };
      socket.onclose = () => {
        console.log('WebSocket 연결 종료');
        setWs(null);
      };
      return () => {
        socket.close();
      };
    } else if (!isRecording && ws) {
      ws.close();
      setWs(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, sessionId, websocketUrl]);
  const [isPaused, setIsPaused] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [presenterHeight, setPresenterHeight] = useState(45); // 발표자 화면 높이 비율 (%)
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  // 슬라이드 변경 시 WebSocket으로 page_turn 메시지 전송
  useEffect(() => {
    if (ws && isRecording && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'page_turn',
        timestamp: Date.now(),
        page_number: currentSlide
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide]);
    // 더미 audio_chunk 데이터 WebSocket 전송 (실제 오디오 분석 연동 전 임시)
  useEffect(() => {
    if (ws && isRecording && ws.readyState === WebSocket.OPEN) {
      const interval = setInterval(() => {
        ws.send(JSON.stringify({
          type: 'audio_chunk',
          timestamp: Date.now(),
          volume_level: Math.random(),
          speaking_pace: 120 + Math.floor(Math.random() * 60)
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [ws, isRecording]);

  // 카메라/마이크 토글 시 gaze_data 메시지 전송 (예시)
  useEffect(() => {
    if (ws && isRecording && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'gaze_data',
        timestamp: Date.now(),
        looking_at_audience: isCameraOn && isMicOn // 예시: 둘 다 켜져 있으면 audience를 본다고 가정
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOn, isMicOn]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 테스트 파일들 - public 폴더로 이동 필요
  const testFiles = [
    { name: 'test1.pdf', path: '/test/test1.pdf', type: 'pdf' },
    { name: 'test2.pptx', path: '/test/test2.pptx', type: 'pptx' }
  ];

  const totalSlides = uploadedFile ? 8 : 8; // 실제 파일에서는 동적으로 계산 가능
  const questions = [
    "방금 말씀하신 이론의 실제 적용 사례는 무엇인가요?",
    "이 연구 결과가 미래에 어떤 영향을 줄 것이라고 생각하시나요?",
    "다른 과학자들의 반대 의견에 대해서는 어떻게 생각하시나요?"
  ];

  // 녹화 시간 카운터
  useEffect(() => {
    let interval: number | undefined;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  // 파일 URL 생성
  useEffect(() => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setFileUrl(url);
      console.log('📁 업로드된 파일 URL 생성:', url, uploadedFile.name);
      return () => URL.revokeObjectURL(url);
    } else {
      // 테스트 파일 사용 (랜덤 선택)
      const randomTestFile = testFiles[Math.floor(Math.random() * testFiles.length)];
      setFileUrl(randomTestFile.path);
      console.log('🧪 테스트 파일 선택:', randomTestFile.name, randomTestFile.path);
    }
  }, [uploadedFile]);

  // 슬라이드 변경 디버깅
  useEffect(() => {
    console.log('🔄 슬라이드 변경됨:', currentSlide, '/', totalSlides);
    console.log('📄 현재 파일 URL:', fileUrl);
  }, [currentSlide, fileUrl]);

  // 카메라 스트림 관리
  useEffect(() => {
    const startCamera = async () => {
      if (isCameraOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: false 
          });
          setVideoStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          console.log('📹 카메라 활성화됨');
        } catch (error) {
          console.error('카메라 접근 실패:', error);
          setIsCameraOn(false);
        }
      } else {
        // 카메라 끄기
        if (videoStream) {
          videoStream.getTracks().forEach(track => track.stop());
          setVideoStream(null);
          console.log('📹 카메라 비활성화됨');
        }
      }
    };

    startCamera();

    // 컴포넌트 언마운트 시 스트림 정리
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn]);

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // AI 질문 시뮬레이션
  useEffect(() => {
    if (isRecording && !isPaused) {
      const questionTimer = setTimeout(() => {
        setShowQuestion(true);
        setQuestionIndex(prev => (prev + 1) % questions.length);
        // 8초 후 질문 숨기기
        setTimeout(() => setShowQuestion(false), 8000);
      }, 20000); // 20초마다 질문 표시

      return () => clearTimeout(questionTimer);
    }
  }, [isRecording, isPaused, recordingTime]);


  // 발표 시작 API 연동
  const handleStartRecording = async () => {
    if (!sessionId) return;
    try {
      // TokenManager에서 토큰을 가져옴
      const { TokenManager } = await import('../api/client');
      const token = TokenManager.getAccessToken();
      const res = await fetch(`/api/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'recording_started') {
        setIsRecording(true);
        setIsPaused(false);
        setFeedbackMsg(null);
        await startAudioRecording(); // ✅ 오디오 녹음 시작
        await startVideoRecording(); // ✅ 비디오 녹화 시작
        startSpeechRecognition(); // ✅ 음성 인식 시작
      } else {
        alert('발표 시작에 실패했습니다.');
      }
    } catch (e) {
      alert('발표 시작에 실패했습니다.');
    }
  };

  const handlePauseRecording = () => {
    setIsPaused(!isPaused);
  };

  // 발표 종료 API 연동
  const handleStopRecording = async () => {
    if (!sessionId) return;
    try {
      await stopAudioRecordingAndUpload(); // ✅ 오디오 업로드
      await stopVideoRecordingAndUpload(); // ✅ 비디오 업로드
      await stopSpeechRecognitionAndAnalyze(sessionId); // ✅ 음성 인식 종료 및 분석 요청
      // TokenManager에서 토큰을 가져옴
      const { TokenManager } = await import('../api/client');
      const token = TokenManager.getAccessToken();
      const res = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { // ✅ 200 OK 기준으로 성공 처리
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        setFeedbackMsg(null);
        if (onComplete) onComplete();
      } else {
        alert('발표 종료에 실패했습니다.');
      }
    } catch (e) {
      alert('발표 종료에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* 상단 상태바 */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-black/50 px-4 py-2 text-white text-sm font-medium flex justify-between items-center">
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

      {/* 상단 컨트롤 바 */}
      <div className="absolute top-8 left-0 right-0 z-20 bg-black/60 backdrop-blur-sm px-4 py-3 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="text-white text-lg font-mono">
            {formatTime(recordingTime)}
          </div>
          {isRecording && !isPaused && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">REC</span>
            </div>
          )}
          {isPaused && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-white text-sm font-medium">PAUSED</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsSoundOn(!isSoundOn)}
            className={`p-2 rounded-full transition-colors ${
              isSoundOn ? 'bg-[#74CD79] text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
            {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 메인 발표 영역 - 세로 분할 */}
      <div className="flex flex-col h-screen pt-20">
        {/* 발표자 웹캠 영역 (위) */}
        <div 
          className="relative bg-black border-b border-gray-600"
          style={{ height: `${presenterHeight}%` }}
        >
          {isCameraOn ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center relative">
              {/* 실제 웹캠 화면 */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // 거울 효과
              />
              
              {/* 웹캠이 없을 때 fallback */}
              {!videoStream && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-32 h-32 bg-white/20 rounded-full mb-4 mx-auto flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-5xl">👤</span>
                    </div>
                    <p className="text-sm opacity-80 font-medium">웹캠 연결 중...</p>
                    <p className="text-xs opacity-60 mt-1">카메라 권한을 허용해주세요</p>
                  </div>
                </div>
              )}

              {/* 시선 추적 표시 */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="text-xs text-white/90 font-medium">시선 추적</div>
              </div>

              {/* 음성 레벨 표시 */}
              {isMicOn && isRecording && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs text-white/80 mb-2">음성 레벨</div>
                    <div className="flex space-x-1">
                      {Array.from({length: 10}).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-6 rounded-sm ${
                            i < 6 ? 'bg-green-400' : 'bg-gray-600'
                          }`}
                          style={{
                            height: `${8 + (i * 2)}px`,
                            animation: i < 6 ? 'pulse 1s infinite' : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 실시간 분석 표시 */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 backdrop-blur-sm text-white p-3 rounded-xl text-sm space-y-2 border border-white/20 min-w-[180px]">
                <h4 className="font-semibold text-xs text-gray-300 uppercase tracking-wide">실시간 분석</h4>
                {feedbackMsg ? (
                  <div className="text-base text-green-300 font-bold py-2">{feedbackMsg}</div>
                ) : (
                  <div className="text-xs text-gray-400">AI 피드백 대기 중...</div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <CameraOff className="w-16 h-16 mx-auto mb-4" />
                <p className="text-sm">카메라 꺼짐</p>
              </div>
            </div>
          )}
        </div>

        {/* 크기 조정 구분선 및 버튼 */}
        <div className="h-1 bg-gray-600 flex items-center justify-center group relative">
          <div className="w-8 h-0.5 bg-gray-400 group-hover:bg-gray-300 transition-colors"></div>
          
          {/* 크기 조정 버튼 */}
          <div className="absolute left-4 flex space-x-2">
            <button
              onClick={() => setPresenterHeight(Math.max(25, presenterHeight - 10))}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold touch-manipulation active:scale-95"
              disabled={presenterHeight <= 25}
            >
              −
            </button>
            <button
              onClick={() => setPresenterHeight(Math.min(75, presenterHeight + 10))}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold touch-manipulation active:scale-95"
              disabled={presenterHeight >= 75}
            >
              +
            </button>
          </div>
          
          {/* 크기 표시 */}
          <div className="absolute right-4 bg-gray-800 text-white px-2 py-1 rounded text-xs">
            {Math.round(presenterHeight)}%
          </div>
        </div>

        {/* 슬라이드 영역 (아래) - 발표자료만 꽉 차게 */}
        <div 
          className="flex-1 relative bg-white"
          style={{ height: `${100 - presenterHeight}%` }}
        >
          {/* 발표 자료 전체 화면 */}
          <div className="w-full h-full relative overflow-hidden">
            {uploadedFile || fileUrl ? (
              <div className="w-full h-full flex flex-col">
                {/* 실제 파일 미리보기 - 전체 화면 */}
                {uploadedFile && (
                  <div className="flex-1 w-full">
                    {uploadedFile.type.includes('pdf') ? (
                      <iframe 
                        key={`pdf-uploaded-${currentSlide}`}
                        src={`${fileUrl}#page=${currentSlide}&toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-0"
                        title="PDF 발표자료"
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center border">
                        <div className="text-center p-8">
                          <div className="text-8xl mb-6">📊</div>
                          <h2 className="text-3xl font-bold text-gray-800 mb-4">PowerPoint 발표자료</h2>
                          <p className="text-lg text-gray-600 mb-4">{uploadedFile.name}</p>
                          <p className="text-base text-gray-500">슬라이드 {currentSlide} / {totalSlides}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 테스트 파일 미리보기 - 전체 화면 */}
                {!uploadedFile && fileUrl && (
                  <div className="flex-1 w-full">
                    {fileUrl.includes('.pdf') ? (
                      <iframe 
                        key={`pdf-test-${currentSlide}`}
                        src={`${fileUrl}#page=${currentSlide}&toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-0"
                        title="테스트 PDF 발표자료"
                        onError={() => console.log('PDF 로드 실패:', fileUrl)}
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center border">
                        <div className="text-center p-8">
                          <div className="text-8xl mb-6">📊</div>
                          <h2 className="text-3xl font-bold text-gray-800 mb-4">PowerPoint 발표자료</h2>
                          <p className="text-lg text-gray-600 mb-4">{fileUrl.split('/').pop()}</p>
                          <p className="text-base text-gray-500">슬라이드 {currentSlide} / {totalSlides}</p>
                          
                          {/* 모의 슬라이드 내용 */}
                          <div className="mt-8 bg-gray-50 p-6 rounded-lg max-w-2xl mx-auto">
                            <h3 className="text-xl font-semibold mb-4 text-blue-600">
                              슬라이드 {currentSlide}: {
                                currentSlide === 1 ? 'DNA의 구조' :
                                currentSlide === 2 ? '유전자 발현' :
                                currentSlide === 3 ? '돌연변이' :
                                '진화 메커니즘'
                              }
                            </h3>
                            <div className="text-left space-y-3">
                              {currentSlide === 1 && (
                                <>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>이중 나선 구조의 특징</p>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>염기쌍의 상보성 원리</p>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>유전정보 저장 방식</p>
                                </>
                              )}
                              {currentSlide === 2 && (
                                <>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>전사: DNA → RNA</p>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>번역: RNA → 단백질</p>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>단백질 합성 과정</p>
                                </>
                              )}
                              {currentSlide === 3 && (
                                <>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>점 돌연변이의 종류</p>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>염색체 이상</p>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>진화의 원동력 역할</p>
                                </>
                              )}
                              {currentSlide >= 4 && (
                                <>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>자연선택의 원리</p>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>유전적 부동</p>
                                  <p className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>종 분화 과정</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-8xl mb-6">🧬</div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-6">유전과 진화</h1>
                  <div className="flex justify-center items-center space-x-8 mb-6">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🧬</div>
                      <p className="text-base text-gray-600">DNA 구조</p>
                    </div>
                    <div className="text-3xl text-gray-400">→</div>
                    <div className="text-center">
                      <div className="text-4xl mb-2">🌱</div>
                      <p className="text-base text-gray-600">진화 과정</p>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    생명체의 유전 정보가 어떻게 전달되고 변화하는지 알아보겠습니다
                  </p>
                </div>
              </div>
            )}

            {/* 크고 명확한 슬라이드 네비게이션 버튼 */}
            <div className="absolute bottom-32 left-8 right-8 flex justify-between items-center z-20">
              <button 
                onClick={() => {
                  const newSlide = Math.max(1, currentSlide - 1);
                  console.log('이전 버튼 클릭:', currentSlide, '->', newSlide);
                  setCurrentSlide(newSlide);
                }}
                className={`bg-black/90 text-white p-2 rounded-2xl backdrop-blur-sm transition-all duration-200 touch-manipulation shadow-2xl ${
                  currentSlide === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-black active:scale-95 hover:shadow-3xl'
                }`}
                disabled={currentSlide === 1}
              >
                <div className="flex items-center space-x-3">
                  <ChevronLeft className="w-8 h-8" />
                </div>
              </button>
              
              <div className="bg-black/50 text-white px-4 py-2 rounded-2xl backdrop-blur-sm font-bold text-xl shadow-2xl border border-white/20">
                {currentSlide} / {totalSlides}
              </div>
              
              <button 
                onClick={() => {
                  const newSlide = Math.min(totalSlides, currentSlide + 1);
                  console.log('다음 버튼 클릭:', currentSlide, '->', newSlide);
                  setCurrentSlide(newSlide);
                }}
                className={`bg-black/90 text-white p-2 rounded-2xl backdrop-blur-sm transition-all duration-200 touch-manipulation shadow-2xl ${
                  currentSlide === totalSlides ? 'opacity-40 cursor-not-allowed' : 'hover:bg-black active:scale-95 hover:shadow-3xl'
                }`}
                disabled={currentSlide === totalSlides}
              >
                <div className="flex items-center space-x-3">
                  <ChevronRight className="w-8 h-8" />
                </div>
              </button>
            </div>

            {/* 추가 컨트롤 버튼들 - 우상단 */}
            <div className="absolute top-4 right-4 flex space-x-3 z-20">
              <button 
                onClick={isRecording ? handlePauseRecording : handleStartRecording}
                className={`p-4 rounded-xl backdrop-blur-sm transition-all touch-manipulation shadow-lg active:scale-95 ${
                  isRecording 
                    ? (isPaused ? 'bg-green-500/90 text-white' : 'bg-yellow-500/90 text-white')
                    : 'bg-red-500/90 text-white'
                }`}
              >
                {!isRecording ? (
                  <Play className="w-6 h-6" />
                ) : isPaused ? (
                  <Play className="w-6 h-6" />
                ) : (
                  <Pause className="w-6 h-6" />
                )}
              </button>
              
              {isRecording && (
                <button 
                  onClick={handleStopRecording}
                  className="p-4 rounded-xl bg-gray-600/90 text-white backdrop-blur-sm transition-all touch-manipulation shadow-lg active:scale-95"
                >
                  <Square className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* 배경 소음 표시 */}
          {isSoundOn && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm z-20">
              🔊 강당 환경음
            </div>
          )}
        </div>
      </div>

      {/* AI 예상 질문 팝업 */}
      {showQuestion && (
        <div className="absolute bottom-32 left-6 right-6 bg-black/90 backdrop-blur-sm text-white p-6 rounded-2xl z-30 animate-slide-up border border-white/20">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-[#74CD79] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">AI</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-3 text-lg">💭 예상 질문</h4>
              <p className="text-gray-200 leading-relaxed">{questions[questionIndex]}</p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#74CD79] rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-[#74CD79] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-[#74CD79] rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="text-xs text-gray-400">AI가 질문을 준비 중입니다</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 실시간 자막 표시 (발표 중) */}
      {isRecording && (
        <div className="absolute left-0 right-0 bottom-32 z-40 flex justify-center pointer-events-none">
          <div className="bg-black/80 text-white px-6 py-3 rounded-2xl text-lg font-mono shadow-lg max-w-2xl w-full text-center animate-fade-in">
            {subtitle || '...'}
          </div>
        </div>
      )}
      {/* 하단 컨트롤 패널 - 모바일 최적화 */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 flex justify-center items-center space-x-6 z-20 border-t border-white/10">
        {/* 마이크 버튼 */}
        <button 
          onClick={() => setIsMicOn(!isMicOn)}
          className={`p-5 rounded-full transition-all duration-200 touch-manipulation ${
            isMicOn 
              ? 'bg-[#74CD79] text-white shadow-lg hover:bg-[#5FB366] active:scale-95' 
              : 'bg-red-500 text-white shadow-lg hover:bg-red-600 active:scale-95'
          }`}
        >
          {isMicOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
        </button>

        {/* 녹화 제어 버튼들 */}
        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <button 
              onClick={handleStartRecording}
              className="p-5 rounded-full bg-red-500 text-white transition-all duration-200 hover:bg-red-600 active:scale-95 shadow-lg touch-manipulation"
            >
              <Play className="w-7 h-7" />
            </button>
          ) : (
            <>
              <button 
                onClick={handlePauseRecording}
                className={`p-5 rounded-full transition-all duration-200 shadow-lg touch-manipulation active:scale-95 ${
                  isPaused 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                {isPaused ? <Play className="w-7 h-7" /> : <Pause className="w-7 h-7" />}
              </button>
              
              <button 
                onClick={handleStopRecording}
                className="p-5 rounded-full bg-gray-600 text-white transition-all duration-200 hover:bg-gray-700 active:scale-95 shadow-lg touch-manipulation"
              >
                <StopCircle className="w-7 h-7" />
              </button>
            </>
          )}
        </div>

        {/* 카메라 버튼 */}
        <button 
          onClick={() => setIsCameraOn(!isCameraOn)}
          className={`p-5 rounded-full transition-all duration-200 touch-manipulation ${
            isCameraOn 
              ? 'bg-[#74CD79] text-white shadow-lg hover:bg-[#5FB366] active:scale-95' 
              : 'bg-red-500 text-white shadow-lg hover:bg-red-600 active:scale-95'
          }`}
        >
          {isCameraOn ? <Camera className="w-7 h-7" /> : <CameraOff className="w-7 h-7" />}
        </button>
      </div>
    </div>
  );
};

export default PresentationSimulation;