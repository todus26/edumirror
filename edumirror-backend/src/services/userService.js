const { PrismaClient } = require("@prisma/client");
const { hashPassword, verifyPassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

const prisma = new PrismaClient();

const createUser = async (userData) => {
  const { email, password, name, user_type, grade, school, phone } = userData;

  // 이메일 중복 검사
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("이미 존재하는 이메일입니다");
  }

  // 비밀번호 해싱
  const passwordHash = await hashPassword(password);

  // 사용자 생성
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
      name: true,          // 이름 추가!
      email: true,         // 이메일 추가
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
