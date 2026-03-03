"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Button 컴포넌트
 *
 * 다양한 variant와 size를 지원하는 재사용 가능한 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   클릭
 * </Button>
 * ```
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  isLoading?: boolean;
}

const variantStyles = {
  primary:
    "bg-[#6938D3] text-white hover:bg-[#5a2fb8] active:bg-[#4b269d] disabled:bg-purple-300 disabled:cursor-not-allowed",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed",
  outline:
    "border-2 border-[#6938D3] text-[#6938D3] hover:bg-purple-50 active:bg-purple-100 disabled:border-purple-300 disabled:text-purple-300 disabled:cursor-not-allowed",
  ghost:
    "text-[#6938D3] hover:bg-purple-50 active:bg-purple-100 disabled:text-purple-300 disabled:cursor-not-allowed",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button = React.memo<ButtonProps>(
  ({
    variant = "primary",
    size = "md",
    children,
    className = "",
    disabled = false,
    isLoading = false,
    ...props
  }) => {
    return (
      <button
        type="button"
        className={cn(
          "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6938D3] focus:ring-offset-2 disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>처리 중...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
