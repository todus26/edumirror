import React from 'react';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  message: string;
  timestamp: Date;
}

interface ImprovementChatProps {
  onBackClick: () => void;
}

const ImprovementChat: React.FC<ImprovementChatProps> = ({ onBackClick }) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: '안녕하세요, 민지님! 🎉 최근 발표 분석 결과를 바탕으로 개선 가이드를 제안드리겠습니다.',
      timestamp: new Date(Date.now() - 30000)
    },
    {
      id: '2',
      type: 'ai',
      message: '👋 **제스처 활용 개선하기**\n\n손동작을 더 활용하면 설득력이 높아져요! 다음 연습을 시도해보세요:\n\n• 핵심 포인트를 강조할 때 손으로 숫자 표현하기\n• 크기나 범위를 설명할 때 손으로 크기 표현하기\n• 자연스러운 제스처로 청중의 시선 끌기',
      timestamp: new Date(Date.now() - 25000)
    },
    {
      id: '3',
      type: 'ai',
      message: '🗣️ **발음 명확성 향상하기**\n\n2:30 구간에서 발음이 불명확했어요. 다음 방법을 추천드려요:\n\n• 입 모양을 크게 하여 또박또박 발음하기\n• 중요한 단어는 천천히 강조해서 말하기\n• 발표 전 입 풀기 운동하기',
      timestamp: new Date(Date.now() - 20000)
    },
    {
      id: '4',
      type: 'ai',
      message: '👀 **시선 처리 개선하기**\n\n청중을 더 골고루 바라봐주세요!\n\n• 좌측-중앙-우측 순서로 시선 이동하기\n• 한 구역당 3-5초씩 시선 유지하기\n• 특정 사람이 아닌 구역을 바라보기',
      timestamp: new Date(Date.now() - 15000)
    },
    {
      id: '5',
      type: 'user',
      message: '제스처 연습 방법을 더 자세히 알고 싶어요!',
      timestamp: new Date(Date.now() - 10000)
    },
    {
      id: '6',
      type: 'ai',
      message: '좋은 질문이에요! 제스처 연습 방법을 단계별로 안내드릴게요:\n\n**1단계: 거울 앞 연습**\n• 거울 앞에서 발표 내용을 말하며 자연스러운 손동작 연습\n• 어색한 동작은 바로 수정\n\n**2단계: 의도적 제스처**\n• "첫 번째로..." → 검지손가락으로 1 표현\n• "이만큼 큰..." → 두 손으로 크기 표현\n• "함께 해봅시다" → 열린 손바닥으로 초대하는 동작\n\n**3단계: 자연스러운 흐름**\n• 제스처를 말과 동시에 하기\n• 과장하지 않고 자연스럽게\n• 양손을 균형있게 사용하기',
      timestamp: new Date(Date.now() - 5000)
    }
  ]);

  const [newMessage, setNewMessage] = React.useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        message: newMessage.trim(),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');

      // AI 자동 응답 시뮬레이션
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          message: '네, 좋은 질문이에요! 더 구체적인 조언을 드리기 위해 어떤 부분이 가장 어려우신지 알려주세요. 😊',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1500);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 헤더 */}
      <div className="bg-[#74CD79] px-4 py-4 flex items-center">
        <button
          onClick={onBackClick}
          className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">개선 가이드</h1>
            <p className="text-white/80 text-sm">AI 발표 코치</p>
          </div>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              {message.type === 'ai' && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-[#74CD79] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">AI</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                </div>
              )}
              
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-[#74CD79] text-white'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                }`}
              >
                <div className="text-left text-sm leading-relaxed whitespace-pre-line">
                  {message.message}
                </div>
              </div>
              
              {message.type === 'user' && (
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 추천 질문 버튼들 */}
      <div className="px-4 py-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setNewMessage('발음 연습 방법을 더 알려주세요')}
            className="px-3 py-2 bg-white rounded-full text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            발음 연습 방법
          </button>
          <button
            onClick={() => setNewMessage('시선 처리 연습은 어떻게 하나요?')}
            className="px-3 py-2 bg-white rounded-full text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            시선 처리 연습
          </button>
          <button
            onClick={() => setNewMessage('다음 발표 주제 추천해주세요')}
            className="px-3 py-2 bg-white rounded-full text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            주제 추천
          </button>
        </div>
      </div>

      {/* 메시지 입력 영역 */}
      <div className="px-4 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="발표 관련 질문을 입력해주세요..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#74CD79] focus:bg-white transition-colors"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-colors ${
              newMessage.trim()
                ? 'bg-[#74CD79] text-white hover:bg-[#5FB366]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImprovementChat;