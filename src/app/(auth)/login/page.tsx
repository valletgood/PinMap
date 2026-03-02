"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin } from "@/apis/auth/hooks";
import { AxiosError } from "axios";
import { ApiResponse } from "@/lib/api-response";
import { toast } from "react-toastify";
import { setToken } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import { GuestGuard } from "@/components/auth/GuestGuard";
import { handleCurrentLocation } from "@/lib/location";
import { useLocationStore } from "@/stores/locationStore";

/**
 * Login 페이지
 *
 * 사용자 로그인을 위한 페이지 컴포넌트
 * 이메일과 비밀번호를 통해 인증합니다.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuthStore();
  const { setLocation } = useLocationStore();

  const loginMutation = useLogin();

  /**
   * 페이지 로드 시 위치 권한 요청
   */
  useEffect(() => {
    const requestLocationPermission = async () => {
      // 브라우저가 Geolocation을 지원하는지 확인
      if (typeof window === "undefined" || !navigator.geolocation) {
        return;
      }

      try {
        // 위치 권한 요청 (브라우저 알림 팝업 표시)
        const location = await handleCurrentLocation();
        setLocation(location);
      } catch (error) {
        console.log("위치 권한 요청 결과:", error);
      }
    };

    // 페이지 로드 후 약간의 지연을 두고 위치 권한 요청
    const timer = setTimeout(() => {
      requestLocationPermission();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setError(null);

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          // 토큰 저장 (응답에 토큰이 포함된 경우)
          if (data.token && data.user) {
            setToken(data.token);
            // zustand 스토어에 로그인 상태 저장
            login(data.user, data.token);
          }
          toast.success("로그인에 성공했습니다.");
          router.push("/");
        },
        onError: (error) => {
          const err = error as AxiosError<ApiResponse>;
          toast.error(err.response?.data.message || "로그인에 실패했습니다.");
        },
      }
    );
  }, [email, password, loginMutation, router, login]);

  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 px-4 py-12">
        <div className="w-full max-w-md">
          {/* 헤더 */}
          <div className="text-center mb-8 space-y-3">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              PinMap
            </h1>
            <p className="text-gray-600 text-lg">
              실제로 가본 맛집을 공유하세요
            </p>
          </div>

          {/* 로그인 카드 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              로그인
            </h2>

            <div className="space-y-5">
              {error && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <Input
                type="email"
                label="이메일"
                placeholder="your@email.com"
                value={email}
                onChange={(value: string) => setEmail(value)}
                required
                disabled={loginMutation.isPending}
                autoComplete="email"
                aria-label="이메일 입력"
              />

              <Input
                type="password"
                label="비밀번호"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(value: string) => setPassword(value)}
                required
                disabled={loginMutation.isPending}
                autoComplete="current-password"
                aria-label="비밀번호 입력"
              />

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleLogin}
                  isLoading={loginMutation.isPending}
                  disabled={
                    !email.trim() || !password.trim() || loginMutation.isPending
                  }
                  className="w-full"
                >
                  로그인
                </Button>
              </div>
            </div>

            {/* 추가 링크 */}
            <div className="mt-6 text-center space-y-3">
              <a
                href="#"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                비밀번호를 잊으셨나요?
              </a>
              <div className="text-sm text-gray-600">
                계정이 없으신가요?{" "}
                <a
                  href="/signup"
                  className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  회원가입
                </a>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <p className="mt-8 text-center text-sm text-gray-500">
            광고 없는, 진정성 있는 맛집 추천 플랫폼
          </p>
        </div>
      </div>
    </GuestGuard>
  );
}
