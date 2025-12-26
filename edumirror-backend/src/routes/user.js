const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { getUserProfile } = require("../services/userService");
const { getUserSessions } = require("../services/sessionService");

const router = express.Router();

// 프로필 조회
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.userId);
    res.json(profile);
  } catch (error) {
    res.status(404).json({
      status: "error",
      error_code: "USER_NOT_FOUND",
      message: error.message,
    });
  }
});

// 내 세션 목록 조회
router.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, theme } = req.query;
    const result = await getUserSessions(
      req.user.userId,
      parseInt(page),
      parseInt(limit),
      theme
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "FETCH_SESSIONS_FAILED",
      message: error.message,
    });
  }
});

// 진행상황 조회
router.get("/progress", authenticateToken, async (req, res) => {
  try {
    const { period = "month", metric = "overall" } = req.query;

    const progress = {
      current_period: {
        total_sessions: 8,
        average_score: 84.2,
        improvement_rate: 5.2,
        last_session_date: new Date().toISOString(),
      },
      score_history: [
        {
          date: "2024-03-01",
          overall_score: 78,
          expression: 75,
          comprehension: 85,
        },
        {
          date: "2024-03-08",
          overall_score: 82,
          expression: 80,
          comprehension: 87,
        },
      ],
      strengths: ["내용 이해도", "논리적 구성"],
      areas_for_improvement: ["발화 속도", "제스처 활용"],
    };

    res.json(progress);
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "PROGRESS_FETCH_FAILED",
      message: error.message,
    });
  }
});

module.exports = router;
