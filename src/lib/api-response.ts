import { NextResponse } from "next/server";

/**
 * API 응답 타입 정의
 */
export interface ApiResponse<T = unknown> {
  error: number;
  message: string;
  data?: T;
}

/**
 * 에러 코드 상수
 */
export const ErrorCode = {
  SUCCESS: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 성공 응답 생성
 *
 * @param message - 성공 메시지
 * @param data - 응답 데이터 (선택사항)
 * @param status - HTTP 상태 코드 (기본값: 200)
 * @returns NextResponse
 */
export function successResponse<T>(
  message: string,
  data?: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      error: ErrorCode.SUCCESS,
      message,
      ...(data !== undefined && { data }),
    },
    { status }
  );
}

/**
 * 에러 응답 생성
 *
 * @param errorCode - 에러 코드
 * @param message - 에러 메시지
 * @param status - HTTP 상태 코드 (기본값: errorCode와 동일)
 * @returns NextResponse
 */
export function errorResponse(
  errorCode: number,
  message: string,
  status?: number
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      error: errorCode,
      message,
    },
    { status: status ?? errorCode }
  );
}
