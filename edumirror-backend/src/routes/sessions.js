const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { uploadPresentation, uploadAudio, uploadVideo } = require("../middleware/upload");
const { transcribeAudio, analyzeScript } = require("../services/aiService");

const {
  createSession,
  getSessionById,
  updateSessionStatus,
} = require("../services/sessionService");

const router = express.Router();

const { getAnalysisResult } = require("../services/analysisService");
// GET /sessions/:sessionId/analysis - 분석 결과 조회
router.get('/:sessionId/analysis', authenticateToken, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    // 세션 유효성 확인 (권한 체크)
    await getSessionById(sessionId, req.user.userId);
    const result = await getAnalysisResult(sessionId);
    if (!result) {
      return res.status(404).json({
        status: "error",
        error_code: "ANALYSIS_RESULT_NOT_FOUND",
        message: "Analysis result not found."
      });
    }
    res.json({
      status: "success",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "ANALYSIS_RESULT_FETCH_FAILED",
      message: error.message
    });
  }
});

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const sessionData = {
      title: req.body.title || "새 발표",
      theme: req.body.theme || "informative",
      background_noise: req.body.background_noise || "none",
      ai_questions_enabled: req.body.ai_questions_enabled !== false,
      expected_duration: req.body.expected_duration || 300
    };

    const result = await createSession(req.user.userId, sessionData);
    
    res.json({
      status: "success",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      error_code: "SESSION_CREATE_FAILED",
      message: error.message,
    });
  }
});

// 2. 세션 시작
router.post('/:sessionId/start', authenticateToken, async (req, res) => {
  try {
    const session = await getSessionById(req.params.sessionId, req.user.userId);
    
    // 세션 상태를 'active'로 업데이트
    await updateSessionStatus(session.id, 'active');
    
    res.json({
      status: "recording_started",
      session_id: session.id,
      websocket_url: `ws://localhost:${process.env.PORT || 8000}/ws/session_${session.id}`,
      ai_questions: [] // TODO: AI 질문 생성
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      error_code: "SESSION_START_FAILED",
      message: error.message,
    });
  }
});

// 3. 세션 상세 조회
router.get('/:sessionId/detail', authenticateToken, async (req, res) => {
  try {
    const session = await getSessionById(req.params.sessionId, req.user.userId);
    const analysisResult = await getAnalysisResult(req.params.sessionId);
    res.json({
      status: "success",
      data: {
        session_id: session.id,
        title: session.title,
        created_at: session.createdAt,
        status: session.status,
        duration: session.actualDuration,
        theme: session.theme,
        background_noise: session.backgroundNoise,
        ai_questions_enabled: session.aiQuestionsEnabled,
        analysisResult: analysisResult || null
      }
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      error_code: "SESSION_NOT_FOUND",
      message: error.message,
    });
  }
});

// 기존 자료 업로드
router.post(
  "/:sessionId/upload-material",
  authenticateToken,
  uploadPresentation.single("presentation_file"),
  async (req, res) => {
    try {
      await getSessionById(req.params.sessionId, req.user.userId);

      const result = {
        status: "success",
        page_count: 0,
      };

      if (req.body.script_text) {
        const scriptAnalysis = await analyzeScript(req.body.script_text);
        result.script_analysis = scriptAnalysis;
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({
        status: "error",
        error_code: "UPLOAD_FAILED",
        message: error.message,
      });
    }
  }
);

// 음성 업로드 및 분석
router.post(
  "/:sessionId/upload-audio",
  authenticateToken,
  uploadAudio.single("audio_file"),
  async (req, res) => {
    const fs = require("fs");
    try {
      const session = await getSessionById(
        req.params.sessionId,
        req.user.userId
      );

      if (!req.file) {
        console.error("[AUDIO_UPLOAD] 파일이 첨부되지 않았습니다.");
        return res.status(400).json({
          status: "error",
          error_code: "NO_AUDIO_FILE",
          message: "음성 파일이 필요합니다",
        });
      }

      // 파일 경로 및 존재 여부 로그
      console.log(`[AUDIO_UPLOAD] 업로드 파일 경로: ${req.file.path}`);
      if (!fs.existsSync(req.file.path)) {
        console.error(`[AUDIO_UPLOAD] 파일이 실제로 존재하지 않습니다: ${req.file.path}`);
      } else {
        const stats = fs.statSync(req.file.path);
        console.log(`[AUDIO_UPLOAD] 파일 크기: ${stats.size} bytes`);
      }

      // Whisper로 음성 텍스트 변환
      let transcription;
      try {
        transcription = await transcribeAudio(req.file.path);
        console.log("[AUDIO_UPLOAD] Whisper 변환 결과:", transcription);
      } catch (whisperError) {
        console.error("[AUDIO_UPLOAD] Whisper 변환 실패:", whisperError && whisperError.stack ? whisperError.stack : whisperError);
        return res.status(400).json({
          status: "error",
          error_code: "AUDIO_PROCESSING_FAILED",
          message: whisperError.message || "음성 텍스트 변환에 실패했습니다 (Whisper)"
        });
      }

      // 세션에 음성 데이터 저장
      const { saveAudioData } = require("../services/sessionService");
      await saveAudioData(session.id, {
        audioFilePath: req.file.path,
        transcription: transcription,
      });

      res.json({
        status: "success",
        transcription: {
          text: transcription.text,
          duration: transcription.duration,
          word_count: transcription.words?.length || 0,
        },
      });
    } catch (error) {
      console.error("[AUDIO_UPLOAD] 처리 실패:", error && error.stack ? error.stack : error);
      res.status(400).json({
        status: "error",
        error_code: "AUDIO_PROCESSING_FAILED",
        message: error.message,
      });
    }
  }
)

// 텍스트 전용 분석 엔드포인트 (텍스트 파일 저장 및 분석)
const fs = require("fs");
const path = require("path");
router.post("/:sessionId/analyze-text", authenticateToken, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.user.userId;
    const { transcript, duration } = req.body;

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({
        status: "error",
        error_code: "NO_TRANSCRIPT",
        message: "transcript(텍스트)가 필요합니다."
      });
    }

    // 세션 유효성 확인
    const session = await getSessionById(sessionId, userId);
    if (!session) {
      return res.status(404).json({
        status: "error",
        error_code: "SESSION_NOT_FOUND",
        message: "세션을 찾을 수 없습니다."
      });
    }

    // 텍스트 파일로 저장
    const resultTextDir = path.join(__dirname, "../../uploads/result-text");
    if (!fs.existsSync(resultTextDir)) {
      fs.mkdirSync(resultTextDir, { recursive: true });
    }
    const textFilePath = path.join(resultTextDir, `${sessionId}.txt`);
    fs.writeFileSync(textFilePath, transcript, "utf-8");

    // 세션 상태를 processing으로 변경
    await updateSessionStatus(session.id, "processing");

    // 파일에서 텍스트 읽어 분석
    const transcriptFromFile = fs.readFileSync(textFilePath, "utf-8");
    const { analyzePresentation } = require("../services/aiService");
    const analysisData = {
      scriptText: session.script || "",
      transcribedText: transcriptFromFile,
      sessionMetadata: {
        title: session.title,
        theme: session.theme,
        expectedDuration: session.expectedDuration,
        actualDuration: duration || null
      },
      realtimeMetrics: {}
    };
    const analysisResult = await analyzePresentation(analysisData);

    // DB에 분석 결과 저장
    const { saveAnalysisResult } = require("../services/sessionService");
    await saveAnalysisResult(session.id, analysisResult);

    // 세션 상태를 completed로 변경
    await updateSessionStatus(session.id, "completed");

    res.json({
      status: "success",
      analysis: analysisResult
    });
  } catch (error) {
    console.error("[ANALYZE_TEXT] 분석 실패:", error && error.stack ? error.stack : error);
    res.status(500).json({
      status: "error",
      error_code: "ANALYSIS_FAILED",
      message: error.message
    });
  }
});

// 영상 업로드 엔드포인트 (발표 종료 시 프론트에서 호출)
router.post(
  "/:sessionId/upload-video",
  authenticateToken,
  uploadVideo.single("video_file"),
  async (req, res) => {
    try {
      const session = await getSessionById(req.params.sessionId, req.user.userId);

      if (!req.file) {
        console.error("[VIDEO_UPLOAD] 파일이 첨부되지 않았습니다.");
        return res.status(400).json({
          status: "error",
          error_code: "NO_VIDEO_FILE",
          message: "영상 파일이 필요합니다",
        });
      }

      console.log(`[VIDEO_UPLOAD] 업로드 완료: ${req.file.path}`);

      // 영상 URL 저장 (상대 경로로 저장)
      const videoUrl = `/uploads/videos/${req.file.filename}`;
      
      // 세션에 영상 URL 저장
      const { saveVideoUrl } = require("../services/sessionService");
      await saveVideoUrl(session.id, videoUrl);

      res.json({
        status: "success",
        video_url: videoUrl,
        file_size: req.file.size,
        message: "영상 업로드 완료"
      });
    } catch (error) {
      console.error("[VIDEO_UPLOAD] 처리 실패:", error && error.stack ? error.stack : error);
      res.status(400).json({
        status: "error",
        error_code: "VIDEO_UPLOAD_FAILED",
        message: error.message,
      });
    }
  }
);

// 발표 종료 - 분석 시작
router.post("/:sessionId/end", authenticateToken, async (req, res) => {
  try {
    const session = await getSessionById(req.params.sessionId, req.user.userId);

    await updateSessionStatus(session.id, "processing");

    // 백그라운드에서 종합 분석 시작
    const { processComprehensiveAnalysis } = require("../services/comprehensiveAnalysis");
    
    // 비동기로 분석 실행 (await 하지 않음)
    processComprehensiveAnalysis(session.id).catch(err => {
      console.error("Background analysis failed:", err);
    });

    res.json({
      status: "session_completed",
      analysis_job_id: `analysis_${session.id}`,
      estimated_completion: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2분 후
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      error_code: "SESSION_END_FAILED",
      message: error.message,
    });
  }
});

// 종합 분석 처리 함수
async function processComprehensiveAnalysis(sessionId) {
  try {
    console.log(`Starting comprehensive analysis for session ${sessionId}`);
    // TODO: 실제 AI 분석 로직 구현
  } catch (error) {
    console.error("Comprehensive analysis failed:", error);
  }
}

module.exports = router;
