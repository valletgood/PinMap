import { type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse, ErrorCode } from "@/lib/api-response";
import bcrypt from "bcryptjs";

/**
 * 회원가입 API
 * POST /api/auth/signup
 *
 * @param request - 회원가입 정보를 포함한 요청
 * @returns 회원가입 결과
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword, birthDate, gender, agreeToTerms } = body;

    // 필수 필드 검증
    if (!name || typeof name !== "string" || name.trim() === "") {
      return errorResponse(ErrorCode.BAD_REQUEST, "이름을 입력해주세요.");
    }

    if (!email || typeof email !== "string") {
      return errorResponse(ErrorCode.BAD_REQUEST, "이메일 주소가 필요합니다.");
    }

    if (!password || typeof password !== "string") {
      return errorResponse(ErrorCode.BAD_REQUEST, "비밀번호를 입력해주세요.");
    }

    if (!confirmPassword || typeof confirmPassword !== "string") {
      return errorResponse(ErrorCode.BAD_REQUEST, "비밀번호 확인을 입력해주세요.");
    }

    if (!birthDate || typeof birthDate !== "string") {
      return errorResponse(ErrorCode.BAD_REQUEST, "생년월일을 입력해주세요.");
    }

    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
      return errorResponse(ErrorCode.BAD_REQUEST, "비밀번호가 일치하지 않습니다.");
    }

    // 비밀번호 강도 검증 (영문, 숫자, 특수문자 포함 8자 이상)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return errorResponse(
        ErrorCode.BAD_REQUEST,
        "비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다."
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(ErrorCode.BAD_REQUEST, "올바른 이메일 형식이 아닙니다.");
    }

    // 이용약관 동의 확인
    if (!agreeToTerms) {
      return errorResponse(ErrorCode.BAD_REQUEST, "이용약관에 동의해주세요.");
    }

    // 이메일 중복 확인
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return errorResponse(ErrorCode.CONFLICT, "이미 사용 중인 이메일입니다.");
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 생년월일 형식 변환 (YYYY-MM-DD)
    let formattedBirthDate: string | null = null;

    if (birthDate) {
      if (typeof birthDate !== "string") {
        return errorResponse(ErrorCode.BAD_REQUEST, "생년월일 형식이 올바르지 않습니다.");
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthDate)) {
        return errorResponse(ErrorCode.BAD_REQUEST, "생년월일은 YYYY-MM-DD 형식이어야 합니다.");
      }

      const date = new Date(birthDate);
      if (isNaN(date.getTime())) {
        return errorResponse(ErrorCode.BAD_REQUEST, "유효하지 않은 날짜입니다.");
      }

      formattedBirthDate = birthDate;
    }

    // 성별 검증 (male, female, other만 허용)
    let validGender: "male" | "female" | "other" | null = null;
    if (gender) {
      if (gender === "male" || gender === "female" || gender === "other") {
        validGender = gender;
      } else {
        return errorResponse(ErrorCode.BAD_REQUEST, "올바른 성별을 선택해주세요.");
      }
    }

    // 사용자 생성
    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: name.trim(),
        password: hashedPassword,
        birthDate: formattedBirthDate || undefined,
        gender: validGender || undefined,
        agreedToTerms: agreeToTerms,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      });

    return successResponse("회원가입이 완료되었습니다.", {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("회원가입 오류:", error);

    // 데이터베이스 제약 조건 위반 (예: 중복 이메일)
    if (error instanceof Error && error.message.includes("unique")) {
      return errorResponse(ErrorCode.CONFLICT, "이미 사용 중인 이메일입니다.");
    }

    return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, "회원가입 중 오류가 발생했습니다.");
  }
}
