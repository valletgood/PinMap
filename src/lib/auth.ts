/**
 * 토큰 관리 유틸리티 함수
 * 클라이언트 사이드에서 토큰을 관리합니다.
 */

const TOKEN_KEY = "auth_token";

/**
 * 토큰 저장
 *
 * @param token - 저장할 JWT 토큰
 */
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * 토큰 조회
 *
 * @returns 저장된 JWT 토큰 또는 null
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * 토큰 삭제
 */
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * 토큰 존재 여부 확인
 *
 * @returns 토큰이 존재하는지 여부
 */
export function hasToken(): boolean {
  return getToken() !== null;
}
