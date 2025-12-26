// 분석 결과 저장 (analysisData 필드만 사용)
const saveAnalysisResult = async (sessionId, analysisResult) => {
  return await prisma.analysisResult.upsert({
    where: { sessionId },
    update: {
      analysisData: JSON.stringify(analysisResult),
      overallScore: analysisResult.overall_score || null,
    },
    create: {
      sessionId,
      analysisData: JSON.stringify(analysisResult),
      overallScore: analysisResult.overall_score || null,
    },
  });
};
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

const generateSessionId = () => {
  return `session_${crypto.randomBytes(4).toString("hex")}`;
};

const createSession = async (userId, sessionData) => {
  const sessionId = generateSessionId();

  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      title: sessionData.title,
      theme: sessionData.theme,
      backgroundNoise: sessionData.background_noise,
      aiQuestionsEnabled: sessionData.ai_questions_enabled,
      expectedDuration: sessionData.expected_duration,
    },
  });

  return {
    session_id: session.id,
    websocket_url: `ws://localhost:${process.env.PORT}/ws/${session.id}`,
  };
};

const getSessionById = async (sessionId, userId) => {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      userId: userId,
    },
  });

  if (!session) {
    throw new Error("세션을 찾을 수 없습니다");
  }

  return session;
};

const updateSessionStatus = async (sessionId, status) => {
  return await prisma.session.update({
    where: { id: sessionId },
    data: { status },
  });
};

const getUserSessions = async (userId, page = 1, limit = 10, theme = null) => {
  const skip = (page - 1) * limit;

  const where = {
    userId: userId,
    ...(theme && { theme }),
  };

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        analysisResult: {
          select: { overallScore: true },
        },
      },
    }),
    prisma.session.count({ where }),
  ]);

  return {
    sessions: sessions.map((session) => ({
      session_id: session.id,
      title: session.title,
      date: session.createdAt,
      duration: session.actualDuration,
      overall_score: session.analysisResult?.overallScore,
      theme: session.theme,
    })),
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_count: total,
    },
  };
};

// 세션 데이터 저장 함수들 추가
const saveAudioData = async (sessionId, audioData) => {
  return await prisma.audioData.create({
    data: {
      sessionId,
      filePath: audioData.audioFilePath,
      transcription: JSON.stringify(audioData.transcription),
      duration: audioData.transcription?.duration
    }
  });
};

const saveScriptText = async (sessionId, scriptText) => {
  // 세션에 스크립트 저장 (별도 테이블이 없으므로 analysisData에 저장)
  // 나중에 분석에서 사용
  return scriptText;
};

const getSessionAudioData = async (sessionId) => {
  const audioData = await prisma.audioData.findFirst({
    where: { sessionId },
    orderBy: { createdAt: 'desc' }
  });
  
  if (audioData && audioData.transcription) {
    return {
      ...audioData,
      transcription: JSON.parse(audioData.transcription)
    };
  }
  
  return audioData;
};

// 영상 URL 저장
const saveVideoUrl = async (sessionId, videoUrl) => {
  return await prisma.analysisResult.upsert({
    where: { sessionId },
    update: {
      videoUrl: videoUrl,
    },
    create: {
      sessionId,
      videoUrl: videoUrl,
      analysisData: '{}',
    },
  });
};

module.exports = {
  createSession,
  getSessionById,
  updateSessionStatus,
  getUserSessions,
  saveAudioData,
  saveScriptText,
  getSessionAudioData,
  saveAnalysisResult,
  saveVideoUrl,
};
