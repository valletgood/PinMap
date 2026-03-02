import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse, ErrorCode } from "@/lib/api-response";

/**
 * 이메일 중복 확인 API
 * POST /api/auth/check-email
 *
 * @param request - 이메일 주소를 포함한 요청
 * @returns 이메일 사용 가능 여부
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // 이메일 유효성 검사
    if (!email || typeof email !== "string") {
      return errorResponse(ErrorCode.BAD_REQUEST, "이메일 주소가 필요합니다.");
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(
        ErrorCode.BAD_REQUEST,
        "올바른 이메일 형식이 아닙니다."
      );
    }

    // 데이터베이스에서 이메일 중복 확인
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    const isAvailable = existingUser.length === 0;
    console.log(isAvailable);
    if (isAvailable) {
      return successResponse("사용 가능한 이메일입니다.");
    } else {
      return errorResponse(ErrorCode.CONFLICT, "이미 사용 중인 이메일입니다.");
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("이메일 중복 확인 오류:", error);

    return errorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      "이메일 중복 확인 중 오류가 발생했습니다."
    );
  }
}
