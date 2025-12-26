const { PrismaClient } = require("@prisma/client");
const { hashPassword, verifyPassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

const prisma = new PrismaClient();

const createUser = async (userData) => {
  console.log("🔵 createUser 호출됨:", userData);
  
  const { email, password, name, user_type, grade, school, phone } = userData;

  // 이메일 중복 검사
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("❌ 이메일 중복:", email);
    throw new Error("이미 존재하는 이메일입니다");
  }

  console.log("✅ 이메일 중복 체크 통과");

  // 비밀번호 해싱
  const passwordHash = await hashPassword(password);
  console.log("✅ 비밀번호 해싱 완료");

  // 사용자 생성
  try {
    console.log("🟡 Prisma create 시작:", {
      email,
      name,
      userType: user_type,
      grade,
      school,
      phone,
    });
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        userType: user_type,
        grade,
        school,
        phone,
      },
    });
    
    console.log("✅ 사용자 생성 성공:", user.id);

    // 토큰 생성
    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
      token,
    };
  } catch (error) {
    console.log("❌ Prisma create 에러:", error.message);
    console.log("❌ 상세 에러:", error);
    throw error;
  }
};

const authenticateUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("비밀번호가 올바르지 않습니다");
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
    },
    token,
  };
};

const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      grade: true,
      school: true,
      presentationCount: true,
      averageScore: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다");
  }

  return user;
};

module.exports = {
  createUser,
  authenticateUser,
  getUserProfile,
};