"use client";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6 border-2",
  md: "h-10 w-10 border-2",
  lg: "h-14 w-14 border-[3px]",
} as const;

export function Spinner({ className = "", size = "md" }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-[#6f62cb]/25 border-t-[#6f62cb] ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="로딩 중"
    />
  );
}
