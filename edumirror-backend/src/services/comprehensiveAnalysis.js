const { analyzePresentation } = require("./aiService");
const { saveAnalysisResult, getAnalysisResult } = require("./analysisService");
const { getSessionAudioData } = require("./sessionService");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const processComprehensiveAnalysis = async (sessionId) => {
  try {
    console.log(`Starting comprehensive analysis for session ${sessionId}`);

    // 1. 세션 데이터 수집
    const sessionData = await collectSessionData(sessionId);

    // 2. Gemini로 종합 분석
    const analysisResult = await analyzePresentation(sessionData);

    // 3. 결과 저장
    await saveAnalysisResult(sessionId, analysisResult);

    // 4. 세션 상태 업데이트
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        actualDuration: sessionData.sessionMetadata.actualDuration,
      },
    });

    console.log(`Comprehensive analysis completed for session ${sessionId}`);
    return analysisResult;
  } catch (error) {
    console.error(
      `Comprehensive analysis failed for session ${sessionId}:`,
      error
    );

    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "failed" },
    });
    
    throw error;
  }
};

const collectSessionData = async (sessionId) => {
  // 세션 기본 정보 조회
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: true,
      audioData: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
  });

  if (!session) {
    throw new Error("세션을 찾을 수 없습니다");
  }

  // 음성 데이터에서 transcription 가져오기
  let transcribedText = "";
  let actualDuration = 0;
  
  if (session.audioData && session.audioData.length > 0) {
    const audio = session.audioData[0];
    if (audio.transcription) {
      const transcription = JSON.parse(audio.transcription);
      transcribedText = transcription.text || "";
      actualDuration = transcription.duration || audio.duration || 0;
    }
  }

  // 대본은 업로드 시 저장된 것을 가져오기 (임시로 빈 문자열)
  // TODO: 별도 테이블에서 조회하도록 개선
  const scriptText = ""; 

  // 실시간 메트릭 (실제로는 realtime_metrics 테이블에서 집계)
  const realtimeMetrics = {
    avgVolume: 0.7,
    avgSpeakingPace: 150,
    audienceContactRatio: 0, // 시선 처리는 개발 중
    pageTransitions: 0,
  };

  return {
    scriptText,
    transcribedText,
    sessionMetadata: {
      title: session.title,
      theme: session.theme,
      expectedDuration: session.expectedDuration || 300,
      actualDuration: actualDuration || session.actualDuration || 0,
    },
    realtimeMetrics,
  };
};

module.exports = {
  processComprehensiveAnalysis,
  collectSessionData,
};