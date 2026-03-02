import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/db/schema";
import { removeToken } from "@/lib/auth";

/**
 * 인증 상태 인터페이스
 */
interface AuthState {
  /**
   * 로그인 여부
   */
  isAuthenticated: boolean;
  /**
   * 현재 로그인한 사용자 정보
   */
  user: User | null;
  /**
   * 토큰
   */
  token: string | null;
  /**
   * 로그인 처리
   */
  login: (user: User, token: string) => void;
  /**
   * 로그아웃 처리
   */
  logout: () => void;
  /**
   * 사용자 정보 업데이트
   */
  updateUser: (user: User) => void;
}

/**
 * 인증 상태 관리 스토어
 * persist 미들웨어를 사용하여 localStorage에 상태를 저장합니다.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,

      /**
       * 로그인 처리
       * 사용자 정보와 토큰을 저장하고 로그인 상태를 true로 설정합니다.
       */
      login: (user: User, token: string) => {
        set({
          isAuthenticated: true,
          user,
          token,
        });
      },

      /**
       * 로그아웃 처리
       * 모든 인증 정보를 초기화합니다.
       */
      logout: () => {
        removeToken();
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },

      /**
       * 사용자 정보 업데이트
       * 로그인 상태의 사용자 정보를 업데이트합니다.
       */
      updateUser: (user: User) => {
        set((state) => {
          if (state.isAuthenticated) {
            return { user };
          }
          return state;
        });
      },
    }),
    {
      name: "auth-storage", // localStorage 키 이름
      partialize: (state: AuthState) => ({
        // 저장할 상태만 선택
        user: state.user,
        token: state.token,
        isAuthenticated: state.token !== null, // 토큰이 있으면 로그인 상태로 복원
      }),
      // 복원 시 토큰이 있으면 인증 상태로 설정
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);
