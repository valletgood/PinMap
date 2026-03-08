import axios from "axios";
import { getToken, removeToken } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";

export const axiosInstance = axios.create({
  timeout: 10000,
});

// 요청 인터셉터: 모든 요청에 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    // zustand 스토어에서 토큰 가져오기
    if (typeof window !== "undefined") {
      const token = useAuthStore.getState().token || getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 토큰 제거 및 로그인 페이지로 리다이렉트
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      removeToken();

      // zustand 스토어에서 로그아웃 처리
      if (typeof window !== "undefined") {
        void import("@/stores/authStore").then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
          window.location.href = "/login";
        });
      }
    }
    return Promise.reject(error);
  }
);
