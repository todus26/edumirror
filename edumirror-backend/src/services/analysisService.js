const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 분석 결과 저장
const saveAnalysisResult = async (sessionId, analysisData) => {
  try {
    // 기존 결과가 있으면 업데이트, 없으면 생성
    const existingResult = await prisma.analysisResult.findUnique({
      where: { sessionId }
    });

    const analysisResult = {
      sessionId,
      overallScore: analysisData.overall_score || analysisData.total_score,
      expressionScore: analysisData.detailed_scores?.expression || analysisData.scores?.delivery,
      comprehensionScore: analysisData.detailed_scores?.comprehension || analysisData.scores?.content,
      deliveryScore: analysisData.detailed_scores?.delivery || analysisData.scores?.delivery,
      engagementScore: analysisData.detailed_scores?.engagement || analysisData.scores?.engagement,
      analysisData: JSON.stringify(analysisData)
    };

    if (existingResult) {
      return await prisma.analysisResult.update({
        where: { sessionId },
        data: analysisResult
      });
    } else {
      return await prisma.analysisResult.create({
        data: analysisResult
      });
    }
  } catch (error) {
    console.error("Failed to save analysis result:", error);
    throw error;
  }
};

// 분석 결과 조회
const getAnalysisResult = async (sessionId) => {
  try {
    const result = await prisma.analysisResult.findUnique({
      where: { sessionId }
    });
    if (!result || !result.analysisData) {
      return null;
    }
    const analysisData = JSON.parse(result.analysisData);
    
    // video_url을 분석 데이터에 추가
    return {
      ...analysisData,
      video_url: result.videoUrl || null
    };
  } catch (error) {
    console.error("Failed to get analysis result:", error);
    throw error;
  }
};

module.exports = {
  saveAnalysisResult,
  getAnalysisResult
};