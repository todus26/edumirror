import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, BarChart3, User, ChevronDown } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  grade: string;
  recent_activity: string;
  average_score: number;
  total_sessions: number;
  improvement_trend: 'up' | 'down' | 'stable';
}

interface TeacherDashboardProps {
  onBackClick: () => void;
  onStudentReportClick: (studentId: string) => void;
  onImprovementChatClick: (studentId: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onBackClick,
  onStudentReportClick,
  onImprovementChatClick
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // 더미 데이터
  const students: Student[] = [
    {
      id: 'student_001',
      name: '김민지',
      grade: 'high_school_2',
      recent_activity: '2024-09-16T10:30:00Z',
      average_score: 85.2,
      total_sessions: 12,
      improvement_trend: 'up'
    },
    {
      id: 'student_002', 
      name: '이준호',
      grade: 'high_school_2',
      recent_activity: '2024-09-15T14:20:00Z',
      average_score: 72.8,
      total_sessions: 8,
      improvement_trend: 'stable'
    },
    {
      id: 'student_003',
      name: '박서연',
      grade: 'high_school_2', 
      recent_activity: '2024-09-14T16:45:00Z',
      average_score: 91.5,
      total_sessions: 15,
      improvement_trend: 'up'
    },
    {
      id: 'student_004',
      name: '최동현',
      grade: 'high_school_2',
      recent_activity: '2024-09-13T11:15:00Z',
      average_score: 68.3,
      total_sessions: 5,
      improvement_trend: 'down'
    }
  ];

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
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
      <div className="bg-[#74CD79] px-4 py-4 flex items-center">
        <button
          onClick={onBackClick}
          className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center text-left space-x-3">
          <div>
            <h1 className="text-white text-xl font-bold">교사/부모용 대시보드</h1>
            <p className="text-white/80 text-sm">학생들의 발표 성장을 확인하세요!</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 학급 요약 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2학년 3반 현황</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#74CD79]">{students.length}</div>
              <div className="text-sm text-gray-500">총 학생 수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {students.filter(s => new Date(s.recent_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-gray-500">이주 활동</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(students.reduce((sum, s) => sum + s.average_score, 0) / students.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">평균 점수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {students.filter(s => s.improvement_trend === 'up').length}
              </div>
              <div className="text-sm text-gray-500">성장 중인 학생</div>
            </div>
          </div>
        </div>

        {/* 학생 목록 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">학생 목록</h2>
            <p className="text-sm text-gray-500">학생을 선택하여 상세 정보를 확인하세요</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {students.map((student) => (
              <div
                key={student.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedStudentId === student.id ? 'bg-yellow-50 border-l-4 border-l-[#74CD79]' : ''
                }`}
                onClick={() => setSelectedStudentId(student.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {student.name.slice(0, 1)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(student.recent_activity)} 마지막 활동 • {student.total_sessions}회 발표
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={`font-semibold ${getScoreColor(student.average_score)}`}>
                        {student.average_score.toFixed(1)}점
                      </div>
                      <div className="text-sm text-gray-500">
                        {getTrendIcon(student.improvement_trend)} 평균
                      </div>
                    </div>
                    <ChevronDown 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedStudentId === student.id ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 선택된 학생 상세 정보 */}
        {selectedStudent && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedStudent.name} 학생 요약
            </h3>
            
            {/* 최근 성과 */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">최근 발표 성과</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">표현력</div>
                    <div className="text-lg font-semibold text-blue-600">82점</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">이해도</div>
                    <div className="text-lg font-semibold text-green-600">89점</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-600">
                    • 시선 처리가 많이 향상되었습니다
                  </div>
                  <div className="text-sm text-gray-600">
                    • 발화 속도 조절이 필요합니다
                  </div>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex space-x-3">
              <button
                onClick={() => onImprovementChatClick(selectedStudent.id)}
                className="flex-1 bg-[#74CD79] hover:bg-[#5FB366] text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>가이드 전송</span>
              </button>
              <button
                onClick={() => onStudentReportClick(selectedStudent.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>전체 리포트</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;