import jwt from "jsonwebtoken";

/**
 * JWT 시크릿 키 (환경 변수에서 가져오거나 기본값 사용)
 * 프로덕션에서는 반드시 환경 변수로 설정해야 합니다.
 */
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * JWT 토큰 만료 시간 (7일)
 */
const JWT_EXPIRES_IN = "7d";

/**
 * JWT 토큰 페이로드 타입
 */
export interface TokenPayload {
  userId: number;
  userUuid: string;
  email: string;
}

/**
 * JWT 토큰 생성
 *
 * @param payload - 토큰에 포함할 사용자 정보
 * @returns 생성된 JWT 토큰
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * JWT 토큰 검증
 *
 * @param token - 검증할 JWT 토큰
 * @returns 검증된 토큰 페이로드 또는 null
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
