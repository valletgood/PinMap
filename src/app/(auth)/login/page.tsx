"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin } from "@/apis/auth/hooks";
import { type AxiosError } from "axios";
import { type ApiResponse } from "@/lib/api-response";
import { toast } from "react-toastify";
import { setToken } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import { GuestGuard } from "@/components/auth/GuestGuard";
import { handleCurrentLocation } from "@/lib/location";
import { useLocationStore } from "@/stores/locationStore";
import Image from "next/image";
import logo from "../../../../public/icons/logo.png";
import { Checkbox } from "@/components/ui/Checkbox";

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
  const [isRemember, setIsRemember] = useState(false);
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
  }, [setLocation]);

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
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-6 md:px-4 md:py-12 relative overflow-hidden">
        {/* SVG와 동일한 배경 그라데이션 효과 */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 좌측 상단 베이지 원형 그라데이션 */}
          <div className="absolute top-0 left-0 w-[300px] h-[300px] md:w-[582px] md:h-[582px] -translate-x-1/3 -translate-y-1/3 md:-translate-x-1/4 md:-translate-y-1/4 opacity-90 md:opacity-80 blur-[80px] md:blur-[184px]">
            <div className="w-full h-full rounded-full bg-[#EBC894]"></div>
          </div>
          {/* 우측 하단 라벤더 원형 그라데이션 */}
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] md:w-[934px] md:h-[934px] translate-x-1/3 translate-y-1/3 md:translate-x-1/4 md:translate-y-1/4 opacity-90 md:opacity-80 blur-[100px] md:blur-[295px]">
            <div className="w-full h-full rounded-full bg-[#B49EF4]"></div>
          </div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* 헤더 */}

          {/* 로그인 카드 - 부드러운 파스텔 스타일 */}
          <div className="bg-white/60 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray">
            <div className="text-center mb-6 md:mb-8 space-y-3 md:space-y-4">
              <div className="flex justify-center mb-6">
                <Image
                  src={logo}
                  alt="PinMap"
                  className="w-12 h-12 md:w-14 md:h-14 drop-shadow-sm"
                />
              </div>
            </div>
            <h2 className="text-center text-xl md:text-2xl font-semibold text-gray-600 mb-5 md:mb-6">
              로그인
            </h2>

            <div className="space-y-4 md:space-y-5">
              {error && (
                <div
                  className="bg-red-50/80 border border-red-200/60 text-red-600 px-4 py-3 rounded-lg text-sm backdrop-blur-sm"
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    label="로그인 상태 유지"
                    checked={isRemember}
                    onChange={setIsRemember}
                  />
                </div>
                <a
                  href="#"
                  className="text-sm text-[#0052B4] opacity-90 hover:text-purple-700 font-medium transition-colors active:opacity-70"
                >
                  비밀번호를 잊으셨나요?
                </a>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleLogin}
                  isLoading={loginMutation.isPending}
                  disabled={!email.trim() || !password.trim() || loginMutation.isPending}
                  className="w-full"
                >
                  로그인
                </Button>
              </div>
            </div>

            {/* 추가 링크 */}
            <div className="mt-5 md:mt-6 text-center space-y-2 md:space-y-3">
              <div className="text-sm text-gray-600">
                계정이 없으신가요?{" "}
                <a
                  href="/signup"
                  className="text-[#0052B4] opacity-90 hover:text-[#0052B4] font-medium transition-colors active:opacity-70"
                >
                  회원가입
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
