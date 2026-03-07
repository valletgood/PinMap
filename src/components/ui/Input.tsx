"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Input 컴포넌트
 *
 * 폼 입력을 위한 재사용 가능한 입력 컴포넌트
 *
 * @example
 * ```tsx
 * <Input
 *   type="email"
 *   label="이메일"
 *   placeholder="email@example.com"
 *   error="이메일을 입력해주세요"
 * />
 * ```
 */
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  onChange?: (value: string) => void;
  /**
   * 클리어 버튼 표시 여부
   * value가 있을 때만 표시됩니다.
   */
  showClearButton?: boolean;
}

export const Input = React.memo<InputProps>(
  ({
    label,
    error,
    helperText,
    className = "",
    id,
    type = "text",
    onChange,
    showClearButton = false,
    value,
    ...props
  }) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    const hasValue = Boolean(value && String(value).trim());
    const showClear = showClearButton && hasValue;

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const handleClear = () => {
      onChange?.("");
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            value={value}
            onChange={handleOnChange}
            className={cn(
              "w-full px-4 py-2.5 text-base border rounded-lg transition-all duration-200",
              "bg-transparent text-gray-900 placeholder:text-gray-400",
              "focus:outline-none focus:border-[#6f62cb]",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:placeholder:text-gray-300",
              hasError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 hover:border-purple-400",
              showClear && "pr-10",
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {showClear && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="입력 내용 지우기"
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
