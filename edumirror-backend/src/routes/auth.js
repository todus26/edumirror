const express = require("express");
const { authenticateToken } = require('../middleware/auth');
const {
  signupValidation,
  loginValidation,
  handleValidationErrors,
} = require("../middleware/validation");
const { createUser, authenticateUser } = require("../services/userService");

const router = express.Router();

// 회원가입
router.post(
  "/signup",
  signupValidation,
  handleValidationErrors,
  async (req, res) => {
    console.log("🟢 회원가입 요청 받음:", req.body);
    try {
      const result = await createUser(req.body);

      res.status(201).json({
        status: "success",
        access_token: result.token,
        expires_in: 7200,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        error_code: "SIGNUP_FAILED",
        message: error.message,
      });
    }
  }
);

// 로그인
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  async (req, res) => {
    console.log("🔵 로그인 요청 받음:", req.body);
    try {
      const { email, password } = req.body;
      const result = await authenticateUser(email, password);

      res.json({
        status: "success",
        access_token: result.token,
        expires_in: 7200,
      });
    } catch (error) {
      res.status(401).json({
        status: "error",
        error_code: "LOGIN_FAILED",
        message: error.message,
      });
    }
  }
);

// 로그아웃
router.post('/logout', authenticateToken, (req, res) => {
  // 클라이언트에서 토큰을 삭제하므로 서버는 성공 응답만
  res.json({
    status: "success",
    message: "로그아웃되었습니다"
  });
});

// 토큰 갱신
router.post('/refresh', (req, res) => {
  // TODO: 실제 refresh token 검증 로직 구현
  // 지금은 간단히 성공 응답만
  res.json({
    status: "success",
    access_token: "new_token_placeholder",
    expires_in: 7200
  });
});

module.exports = router;
