const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { getSessionById } = require("../services/sessionService");
const { getAnalysisResult } = require("../services/analysisService");

const router = express.Router();

// 분석 리포트 조회
router.get('/:sessionId/report', authenticateToken, async (req, res) => {
  try {
    const session = await getSessionById(req.params.sessionId, req.user.userId);
    
    // 분석 결과 조회
    const analysisResult = await getAnalysisResult(session.id);
    
    if (!analysisResult) {
      return res.status(404).json({
        status: "error",
        error_code: "ANALYSIS_NOT_FOUND",
        message: "분석 결과를 찾을 수 없습니다. 발표 종료 후 잠시 기다려주세요.",
      });
    }

    // 프론트 요구 형식에 맞춰 응답
    const report = {
      session_id: session.id,
      total_score: analysisResult.total_score || analysisResult.overall_score || 85,
      scores: analysisResult.scores || {
        delivery: 82,
        content: 88,
        engagement: 84,
        clarity: 86
      },
      speaking_metrics: analysisResult.speaking_metrics || {
        average_pace: 150,
        volume_consistency: 0.8,
        pause_count: 12,
        filler_word_count: 5
      },
      eye_contact: {
        audience_percentage: 0,
        slide_percentage: 0,
        heatmap_url: null,
        note: "시선 처리 분석 기능은 개발 중입니다"
      },
      script_comparison: analysisResult.script_comparison || analysisResult.speech_analysis || {
        accuracy: analysisResult.speech_analysis?.script_adherence || 0.89,
        omissions: analysisResult.speech_analysis?.missing_elements || [],
        additions: []
      },
      feedback: analysisResult.feedback || {
        strengths: ["명확한 발음", "적절한 속도"],
        areas_for_improvement: ["제스처 활용", "목소리 크기"],
        specific_suggestions: analysisResult.suggestions?.map(s => s.recommendation) || [
          "중요한 포인트에서 제스처를 활용해보세요",
          "청중 뒷줄까지 들릴 수 있도록 목소리를 조금 더 크게 해보세요"
        ]
      },
      transcript: analysisResult.transcript || null,
      video_url: analysisResult.video_url || null
    };
    
    res.json({
      status: "success",
      data: report
    });
  } catch (error) {
    console.error("Analysis retrieval error:", error);
    res.status(500).json({
      status: "error",
      error_code: "ANALYSIS_RETRIEVAL_FAILED",
      message: error.message,
    });
  }
});

// 분석 상태 조회
router.get('/:sessionId/status', authenticateToken, async (req, res) => {
  try {
    const session = await getSessionById(req.params.sessionId, req.user.userId);
    
    const isProcessing = session.status === 'processing';
    const isCompleted = session.status === 'completed';
    
    res.json({
      session_id: session.id,
      status: isProcessing ? 'processing' : isCompleted ? 'completed' : 'pending',
      progress: isProcessing ? 50 : isCompleted ? 100 : 0,
      result_available: isCompleted
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;