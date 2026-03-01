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
interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  onChange?: (value: string) => void;
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
    ...props
  }) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          onChange={handleOnChange}
          className={cn(
            "w-full px-4 py-2.5 text-base border rounded-lg transition-all duration-200",
            "bg-white text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:placeholder:text-gray-300",
            hasError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 hover:border-amber-400",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-red-600"
            role="alert"
          >
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
