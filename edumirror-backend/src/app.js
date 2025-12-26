const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
require("dotenv").config();

const { authenticateToken } = require("./middleware/auth");
const { setupWebSocket } = require("./websocket/server");

const app = express();
const server = http.createServer(app);

// WebSocket 설정
setupWebSocket(server);

// 미들웨어
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:5173",
      "http://localhost:5174",
      "http://192.168.56.1:5174",
      "http://localhost:5175",
      "http://192.168.56.1:5175",
      "https://edumirror-frontend.vercel.app"
    ],
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
app.get("/", (req, res) => {
  res.json({
    message: "에듀미러 API 서버가 실행중입니다.",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      user: "/api/my",
      sessions: "/api/sessions",
    },
  });
});

// API 라우트
app.use("/api/auth", require("./routes/auth"));
app.use("/api/my", authenticateToken, require("./routes/user"));
app.use("/api/sessions", authenticateToken, require("./routes/sessions"));
app.use("/api/analysis", authenticateToken, require("./routes/analysis"));
app.use("/api/files", require("./routes/files"));

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      status: "error",
      error_code: "FILE_TOO_LARGE",
      message: "파일 크기가 너무 큽니다",
    });
  }

  res.status(500).json({
    status: "error",
    error_code: "INTERNAL_ERROR",
    message: "내부 서버 오류가 발생했습니다",
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    error_code: "NOT_FOUND",
    message: "요청한 리소스를 찾을 수 없습니다",
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행중입니다.`);
  console.log(`API 문서: http://localhost:${PORT}/`);
  console.log(`WebSocket: ws://localhost:${PORT}/ws/session_{sessionId}`);
});
