import { axiosInstance } from "../axios";
import type { ApiResponse } from "@/lib/api-response";
import { normalizeResponse } from "../types";
import { type LoginRequest, type SignupRequest, type SignupResponse } from "./types";
import { type User } from "@/db/schema";

export const authService = {
  /**
   * 이메일 중복 확인
   * @param email - 확인할 이메일 주소
   * @returns 정규화된 응답 데이터 (available: boolean)
   * @throws ApiError - 에러 발생 시
   */
  checkEmailDuplicate: async (email: string): Promise<ApiResponse> => {
    const { data } = await axiosInstance.post<ApiResponse>("/api/auth/check-email", { email });
    return data;
  },
  /**
   * 회원가입
   * @param signupData - 회원가입 정보
   * @returns 정규화된 응답 데이터 (user 정보)
   * @throws ApiError - 에러 발생 시
   */
  signup: async (signupData: SignupRequest): Promise<SignupResponse> => {
    const response = await axiosInstance.post<ApiResponse<SignupResponse>>(
      "/api/auth/signup",
      signupData
    );

    // 응답 정규화
    return normalizeResponse<ApiResponse<SignupResponse>>(response).data;
  },

  /**
   * 로그인
   * @param loginData - 로그인 정보 (이메일, 비밀번호)
   * @returns 정규화된 응답 데이터 (user 정보 및 토큰)
   * @throws ApiError - 에러 발생 시
   */
  login: async (loginData: LoginRequest): Promise<{ user: User; token: string }> => {
    const response = await axiosInstance.post<ApiResponse<{ user: User; token: string }>>(
      "/api/auth/login",
      loginData
    );

    return normalizeResponse<ApiResponse<{ user: User; token: string }>>(response).data;
  },
};
