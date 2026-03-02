"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Radio } from "@/components/ui/Radio";
import { useCheckEmailDuplicate, useSignup } from "@/apis/auth/hooks";
import { ApiResponse, ErrorCode } from "@/lib/api-response";
import { AxiosError } from "axios";
import { SignupRequest } from "@/apis/auth/types";
import { toast } from "react-toastify";
import { GuestGuard } from "@/components/auth/GuestGuard";

/**
 * Signup 페이지
 *
 * 사용자 회원가입을 위한 페이지 컴포넌트
 * 이름, 이메일, 비밀번호를 입력받습니다.
 */
export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 이메일 중복확인 관련 상태
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(
    null
  );
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null);

  // 이메일 중복확인 훅
  const checkEmailMutation = useCheckEmailDuplicate();

  // 회원가입 훅
  const signupMutation = useSignup();

  // 라우터
  const router = useRouter();

  /**
   * 이메일 유효성 검사
   * @param emailValue - 검사할 이메일 주소
   * @returns 이메일 형식이 유효한지 여부
   */
  const isValidEmailFormat = useCallback((emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  }, []);

  /**
   * 이메일 중복확인 처리
   * 이메일 형식 검증 후 서버에 중복 여부를 확인합니다.
   */
  const handleCheckEmailDuplicate = useCallback(async () => {
    if (!email.trim()) {
      setEmailCheckError("이메일을 입력해주세요");
      setIsEmailAvailable(null);
      return;
    }

    if (!isValidEmailFormat(email)) {
      setEmailCheckError("올바른 이메일 형식이 아닙니다");
      setIsEmailAvailable(null);
      return;
    }

    setEmailCheckError(null);
    setIsEmailAvailable(null);

    checkEmailMutation.mutate(email.trim(), {
      onSuccess: () => {
        setIsEmailAvailable(true);
        setEmailCheckError(null);
      },
      onError: (error) => {
        const err = error as AxiosError<ApiResponse>;
        setEmailCheckError(
          err.response?.data.message ||
            "이메일 중복확인에 실패했습니다. 다시 시도해주세요."
        );
        setIsEmailAvailable(false);
      },
    });
  }, [email, isValidEmailFormat, checkEmailMutation]);

  const handlePassword = (value: string) => {
    setPassword(value);
  };

  const handleConfirmPassword = (value: string) => {
    setConfirmPassword(value);
  };

  const handleAgreeToTerms = (value: boolean) => {
    setAgreeToTerms(value);
  };

  const handleBirthDateChange = (value: string) => {
    setBirthDate(value);
  };

  const handleGenderChange = useCallback((value: "male" | "female") => {
    setGender(value);
  }, []);

  const isFormValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    isEmailAvailable === true &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    agreeToTerms;

  /**
   * 회원가입 제출 처리
   */
  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
      return;
    }

    setIsLoading(true);

    const signupData: SignupRequest = {
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      birthDate,
      gender,
      agreeToTerms,
    };

    signupMutation.mutate(signupData, {
      onSuccess: () => {
        toast.success("회원가입이 완료되었습니다.");
        router.push("/login");
      },
      onError: (error) => {
        const err = error as AxiosError<ApiResponse>;
        toast.error(err.response?.data.message || "회원가입에 실패했습니다.");
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });

    // 회원가입 성공 시 로그인 페이지로 이동
  }, [
    isFormValid,
    name,
    email,
    password,
    confirmPassword,
    birthDate,
    gender,
    agreeToTerms,
    signupMutation,
    router,
  ]);

  const handleName = (value: string) => {
    setName(value);
  };

  /**
   * 이메일 입력 핸들러
   * 이메일이 변경되면 중복확인 상태를 초기화합니다.
   */
  const handleEmail = useCallback((value: string) => {
    setEmail(value);
    setIsEmailAvailable(null);
    setEmailCheckError(null);
  }, []);

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

          {/* 회원가입 카드 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              회원가입
            </h2>

            <section className="space-y-5" aria-label="회원가입 폼">
              <Input
                type="text"
                label="이름"
                placeholder="홍길동"
                value={name}
                onChange={handleName}
                required
                disabled={isLoading || signupMutation.isPending}
                autoComplete="name"
                aria-label="이름 입력"
              />

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      label="이메일"
                      placeholder="your@email.com"
                      value={email}
                      onChange={handleEmail}
                      required
                      disabled={
                        isLoading ||
                        checkEmailMutation.isPending ||
                        signupMutation.isPending
                      }
                      autoComplete="email"
                      aria-label="이메일 입력"
                    />
                  </div>
                  <div className="flex items-end pb-0.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={handleCheckEmailDuplicate}
                      disabled={
                        !email.trim() ||
                        !isValidEmailFormat(email) ||
                        checkEmailMutation.isPending ||
                        isLoading ||
                        signupMutation.isPending ||
                        isEmailAvailable === true
                      }
                      isLoading={checkEmailMutation.isPending}
                      className="whitespace-nowrap"
                      aria-label="이메일 중복확인"
                    >
                      중복확인
                    </Button>
                  </div>
                </div>

                {isEmailAvailable === true && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <svg
                      className="w-5 h-5 text-green-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm font-medium text-green-700">
                      사용 가능한 이메일입니다
                    </span>
                  </div>
                )}

                {isEmailAvailable === false && emailCheckError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="text-sm font-medium text-red-700">
                      {emailCheckError}
                    </span>
                  </div>
                )}
              </div>

              <Input
                type="password"
                label="비밀번호"
                placeholder="8자 이상 입력하세요"
                value={password}
                onChange={handlePassword}
                required
                disabled={isLoading || signupMutation.isPending}
                autoComplete="new-password"
                aria-label="비밀번호 입력"
                helperText="영문, 숫자, 특수문자를 포함한 8자 이상 작성해주세요."
              />

              <Input
                type="password"
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={handleConfirmPassword}
                required
                disabled={isLoading || signupMutation.isPending}
                autoComplete="new-password"
                aria-label="비밀번호 확인 입력"
                error={
                  confirmPassword !== password
                    ? "비밀번호가 일치하지 않습니다."
                    : undefined
                }
              />

              <Input
                type="date"
                label="생년월일"
                placeholder="YYYY-MM-DD"
                value={birthDate}
                onChange={handleBirthDateChange}
                required
                disabled={isLoading || signupMutation.isPending}
                autoComplete="birth-date"
                aria-label="생년월일 입력"
              />

              <div className="space-y-3">
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700"
                >
                  성별
                </label>
                <div className="flex gap-3 items-center justify-start">
                  <Radio
                    id="gender-male"
                    name="gender"
                    value="male"
                    label="남성"
                    checked={gender === "male"}
                    onChange={() => handleGenderChange("male")}
                    disabled={isLoading || signupMutation.isPending}
                  />
                  <Radio
                    id="gender-female"
                    name="gender"
                    value="female"
                    label="여성"
                    checked={gender === "female"}
                    onChange={() => handleGenderChange("female")}
                    disabled={isLoading || signupMutation.isPending}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Checkbox
                  id="terms"
                  label="이용약관 및 개인정보처리방침에 동의합니다"
                  checked={agreeToTerms}
                  onChange={handleAgreeToTerms}
                  required
                  disabled={isLoading || signupMutation.isPending}
                  helperText="서비스 이용을 위해 필수 동의 항목입니다"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  isLoading={isLoading || signupMutation.isPending}
                  disabled={!isFormValid || signupMutation.isPending}
                  className="w-full"
                  aria-label="회원가입 버튼"
                >
                  회원가입
                </Button>
              </div>
            </section>

            {/* 추가 링크 */}
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600">
                이미 계정이 있으신가요?{" "}
                <a
                  href="/auth/login"
                  className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  로그인
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
