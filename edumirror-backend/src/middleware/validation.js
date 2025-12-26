const { body, validationResult } = require("express-validator");

const signupValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("유효한 이메일을 입력해주세요"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("비밀번호는 최소 8자 이상이어야 합니다"),
  body("name").trim().isLength({ min: 1 }).withMessage("이름을 입력해주세요"),
  body("user_type")
    .isIn(["student", "teacher", "parent"])
    .withMessage("올바른 사용자 유형을 선택해주세요"),
  body("grade")
    .optional()
    .isIn([
      "elementary_1",
      "elementary_2",
      "elementary_3",
      "elementary_4",
      "elementary_5",
      "elementary_6",
      "middle_1",
      "middle_2",
      "middle_3",
      "high_school_1",
      "high_school_2",
      "high_school_3",
    ]),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("❌ Validation 에러:", errors.array());
    return res.status(400).json({
      status: "error",
      error_code: "VALIDATION_ERROR",
      message: "입력 데이터가 올바르지 않습니다",
      details: errors.array(),
    });
  }
  console.log("✅ Validation 통과");
  next();
};

module.exports = {
  signupValidation,
  loginValidation,
  handleValidationErrors,
};
