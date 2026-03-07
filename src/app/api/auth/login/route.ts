import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse, ErrorCode } from "@/lib/api-response";
import { generateToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

/**
 * 로그인 API
 * POST /api/auth/login
 *
 * @param request - 로그인 정보를 포함한 요청
 * @returns 로그인 결과 및 사용자 정보
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 필수 필드 검증
    if (!email || typeof email !== "string" || email.trim() === "") {
      return errorResponse(ErrorCode.BAD_REQUEST, "이메일을 입력해주세요.");
    }

    if (!password || typeof password !== "string" || password.trim() === "") {
      return errorResponse(ErrorCode.BAD_REQUEST, "비밀번호를 입력해주세요.");
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(ErrorCode.BAD_REQUEST, "올바른 이메일 형식이 아닙니다.");
    }

    // 사용자 조회
    const normalizedEmail = email.toLowerCase().trim();
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    // 사용자가 존재하지 않거나 비밀번호가 일치하지 않는 경우
    // 보안을 위해 동일한 에러 메시지 반환
    if (!user || !user.password) {
      return errorResponse(ErrorCode.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(ErrorCode.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.id,
      userUuid: user.uuid,
      email: user.email,
    });

    // 비밀번호를 제외한 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user;

    // 응답 생성
    const response = successResponse("로그인에 성공했습니다.", {
      user: userWithoutPassword,
      token,
    });

    // HTTP-only 쿠키에 토큰 저장 (보안 강화)
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: "/",
    });

    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("로그인 오류:", error);

    return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, "로그인 중 오류가 발생했습니다.");
  }
}
