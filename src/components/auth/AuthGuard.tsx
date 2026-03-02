"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

/**
 * 인증 필요 가드 컴포넌트
 *
 * 로그인이 필요한 페이지에서 사용합니다.
 * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트합니다.
 *
 * @example
 * ```tsx
 * <AuthGuard>
 *   <ProtectedPage />
 * </AuthGuard>
 * ```
 */
interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // zustand persist가 복원될 때까지 대기
    const checkAuth = () => {
      if (!isAuthenticated || !token) {
        router.push("/login");
      } else {
        setIsChecking(false);
      }
    };

    // 약간의 지연을 두어 persist 복원 대기
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, token, router]);

  // 로그인하지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (isChecking || !isAuthenticated || !token) {
    return null;
  }

  return <>{children}</>;
}
