import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
  id: string;
  sender: 'teacher' | 'student';
  content: string;
  timestamp: string;
}

interface TeacherStudentChatProps {
  studentId: string;
  studentName: string;
  onBackClick: () => void;
}

const TeacherStudentChat: React.FC<TeacherStudentChatProps> = ({
  studentId,
  studentName,
  onBackClick
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'teacher',
      content: '안녕하세요! 김민지 학생의 발표 능력 향상을 위한 개선 가이드를 제안해드리겠습니다.',
      timestamp: '18:00'
    },
    {
      id: '2',
      sender: 'teacher',
      content: '최근 분석 결과를 바탕으로 다음과 같은 개선점을 발견했습니다. 발화 속도가 평균보다 20% 빠르고, 시선 처리는 70% 향상됐어요. 제스처 활용은 부족합니다.',
      timestamp: '18:00'
    },
    {
      id: '3',
      sender: 'student',
      content: '네, 감사합니다 선생님! 선생님 말씀 듣고 보니 제가 너무 빨리 말하는 것 같아요.',
      timestamp: '18:02'
    },
    {
      id: '4',
      sender: 'teacher',
      content: '발표 속도를 좀만 천천히 해봐요. 중요한 포인트에서는 잠깐 멈춰서 강조하는 톤으로 해보면 훨씬 좋을 거예요',
      timestamp: '18:03'
    },
    {
      id: '5',
      sender: 'student',
      content: '감사합니다. 혹시 제스처는 괜찮았나요?',
      timestamp: '18:04'
    },
    {
      id: '6',
      sender: 'teacher',
      content: '네, 제스처는 아주 좋았어요! 특히 중요한 포인트를 설명할 때 손동작이 자연스러웠어요',
      timestamp: '18:05'
    },
    {
      id: '7',
      sender: 'student',
      content: '다음 발표 때는 말하는 속도를 더 신경써보겠습니다!',
      timestamp: '18:06'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 추천 피드백 목록
  const feedbackSuggestions = [
    { label: '발표 속도 개선', text: '발표 속도가 조금 빨랐어요. 천천히 말하면서 중요한 부분을 강조해보세요' },
    { label: '제스처 칭찬법', text: '제스처 활용이 아주 좋았습니다! 계속 이렇게 자연스럽게 표현해주세요' },
    { label: '시선 처리', text: '시선 처리가 많이 좋아졌네요. 청중과의 눈맞춤을 조금 더 늘려보면 어떨까요' },
    { label: '목소리 톤', text: '목소리 톤을 조금 더 진중하게 해보면 발표가 더 설득력있을 것 같아요' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'teacher',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // 학생 응답 시뮬레이션 (실제로는 서버에서 받아올 데이터)
    setTimeout(() => {
      const studentResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'student',
        content: '네, 감사합니다 선생님! 다음에는 더 신경써서 발표하겠습니다',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, studentResponse]);
    }, 1500);
  };

  const handleSuggestionClick = (text: string) => {
    setInputMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 헤더 */}
      <div className="bg-[#74CD79] px-4 py-4 flex items-center flex-shrink-0">
        <button
          onClick={onBackClick}
          className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {studentName.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">개선 가이드</h1>
            <p className="text-white/80 text-sm">AI 발표 코치</p>
          </div>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#E8F5E9]">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'student' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[75%] ${message.sender === 'student' ? 'items-start' : 'items-end'} flex flex-col`}>
              <div className={`px-4 py-2 rounded-2xl ${
                message.sender === 'student'
                  ? 'bg-[#74CD79] text-white rounded-tl-sm'
                  : 'bg-white text-gray-900 rounded-tr-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1 px-2">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 하단 입력 영역 */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        {/* 추천 피드백 버튼들 */}
        <div className="px-4 pt-3 pb-2 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {feedbackSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors whitespace-nowrap border border-gray-300"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>

        {/* 메시지 입력창 */}
        <div className="px-4 pb-4 flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="학생 지도에 대해 질문해보세요..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CD79] focus:border-transparent text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="px-4 py-3 bg-[#74CD79] text-white rounded-lg hover:bg-[#5FB366] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentChat;
