const express = require("express");
const path = require("path");
const fs = require("fs");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// 발표 파일 다운로드
router.get("/presentations/:sessionId", authenticateToken, (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const filePath = path.join(
      process.env.UPLOAD_PATH,
      "presentations",
      `${sessionId}.pdf`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: "error",
        error_code: "FILE_NOT_FOUND",
        message: "파일을 찾을 수 없습니다",
      });
    }

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "FILE_SERVE_ERROR",
      message: "파일 서빙 중 오류가 발생했습니다",
    });
  }
});

// 녹화 파일 다운로드
router.get("/recordings/:sessionId", authenticateToken, (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const filePath = path.join(
      process.env.UPLOAD_PATH,
      "recordings",
      `${sessionId}.mp4`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: "error",
        error_code: "FILE_NOT_FOUND",
        message: "녹화 파일을 찾을 수 없습니다",
      });
    }

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "FILE_SERVE_ERROR",
      message: "파일 서빙 중 오류가 발생했습니다",
    });
  }
});

module.exports = router;
