import React, { useState } from 'react';
import { ArrowLeft, Send, Bot, User, Lightbulb, Target } from 'lucide-react';

interface Message {
  id: string;
  type: 'teacher' | 'ai';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

interface TeacherImprovementChatProps {
  studentId: string;
  onBackClick: () => void;
}

const TeacherImprovementChat: React.FC<TeacherImprovementChatProps> = ({
  studentId,
  onBackClick
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '안녕하세요! 김민지 학생의 발표 능력 향상을 위한 개선 가이드를 제안해드리겠습니다.',
      timestamp: '2024-09-17T09:00:00Z'
    },
    {
      id: '2',
      type: 'ai',
      content: '최근 분석 결과를 바탕으로 다음과 같은 개선점을 발견했습니다:\n\n• 발화 속도: 평균보다 20% 빠름\n• 시선 처리: 70% 향상됨 (긍정적)\n• 제스처 활용: 부족함\n\n어떤 부분에 대한 구체적인 가이드가 필요하신가요?',
      timestamp: '2024-09-17T09:00:30Z',
      suggestions: ['발화 속도 개선', '제스처 활용법', '전체적인 개선 계획']
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const studentName = '김민지'; // 실제로는 props나 API에서 가져올 데이터

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'teacher',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputMessage),
        timestamp: new Date().toISOString(),
        suggestions: generateSuggestions(inputMessage)
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    if (input.includes('발화 속도') || input.includes('말하기 속도')) {
      return `발화 속도 개선을 위한 구체적인 가이드를 제안드립니다:

📋 **단계별 개선 방법**
1. **의식적 연습**: 발표 전 천천히 말하기 연습
2. **호흡 조절**: 문장 사이 1-2초 간격 두기
3. **키워드 강조**: 중요한 단어는 더 천천히

🎯 **실습 방법**
• 메트로놈 활용 (분당 120-140 BPM)
• 녹음 후 재생 속도 체크
• 친구들 앞에서 연습하며 피드백 받기

이 방법들을 2주간 꾸준히 연습하시면 개선 효과를 볼 수 있을 것입니다.`;
    }
    
    if (input.includes('제스처') || input.includes('손동작')) {
      return `제스처 활용을 위한 실용적인 가이드입니다:

🤚 **효과적인 제스처 유형**
1. **설명형**: 크기, 방향, 모양을 손으로 표현
2. **강조형**: 중요한 포인트에서 손가락 지시
3. **감정형**: 열정과 확신을 몸짓으로 표현

💡 **연습 팁**
• 거울 앞에서 발표 연습
• 자연스러운 손동작부터 시작
• 과도한 제스처보다는 의미 있는 동작에 집중

학생이 부담스러워하지 않도록 점진적으로 개선해 나가시기 바랍니다.`;
    }

    return `좋은 질문입니다! ${studentName} 학생의 경우, 현재 다음과 같은 특징을 보이고 있습니다:

✅ **잘하고 있는 부분**
• 내용 이해도가 우수함
• 논리적 구성 능력
• 최근 시선 처리 개선

🔄 **개선이 필요한 부분**
• 발화 속도 조절
• 제스처 활용
• 일시정지 효과적 사용

구체적으로 어떤 부분에 대해 더 자세한 가이드가 필요하신지 말씀해 주세요.`;
  };

  const generateSuggestions = (input: string): string[] => {
    if (input.includes('발화 속도')) {
      return ['연습 스케줄 제안', '평가 기준 설명', '학부모 연계 방안'];
    }
    if (input.includes('제스처')) {
      return ['동영상 자료 추천', '단계별 연습법', '평가 체크리스트'];
    }
    return ['맞춤형 연습 계획', '진도 체크 방법', '동기 부여 방안'];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
      <div className="bg-[#74CD79] px-4 py-4 flex items-center flex-shrink-0">
        <button
          onClick={onBackClick}
          className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">개선 가이드</h1>
            <p className="text-white/80 text-sm">AI 발표 코치</p>
          </div>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div className={`flex ${message.type === 'teacher' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex space-x-2 max-w-[80%] ${message.type === 'teacher' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'teacher' ? 'bg-blue-500' : 'bg-[#74CD79]'
                }`}>
                  {message.type === 'teacher' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`rounded-lg px-4 py-2 ${
                  message.type === 'teacher' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.type === 'teacher' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>

            {/* AI 메시지의 추천 액션 */}
            {message.type === 'ai' && message.suggestions && (
              <div className="ml-10 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Lightbulb className="w-4 h-4" />
                  <span>추천 질문</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 로딩 메시지 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-2 max-w-[80%]">
              <div className="w-8 h-8 bg-[#74CD79] rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 빠른 액션 버튼 */}
      <div className="sticky bottom-0 px-4 py-2 bg-white border-t border-gray-200 z-10">
        <div className="flex space-x-2 mb-2">
          <button
            onClick={() => handleSuggestionClick('전체적인 개선 계획을 세워주세요')}
            className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors"
          >
            <Target className="w-4 h-4" />
            <span>개선 계획</span>
          </button>
          <button
            onClick={() => handleSuggestionClick('학부모와 함께할 수 있는 방법은?')}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>학부모 연계</span>
          </button>
        </div>
        
        {/* 입력 영역 */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="학생 지도에 대해 질문해보세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CD79] focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-[#74CD79] text-white rounded-lg hover:bg-[#5FB366] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherImprovementChat;