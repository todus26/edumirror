const { verifyToken } = require("../utils/jwt");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: "error",
      error_code: "MISSING_TOKEN",
      message: "토큰이 필요합니다",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      error_code: "INVALID_TOKEN",
      message: "유효하지 않은 토큰입니다",
    });
  }
};

module.exports = {
  authenticateToken,
};
