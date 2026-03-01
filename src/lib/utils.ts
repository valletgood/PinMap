import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 클래스명을 병합하는 유틸리티 함수
 * clsx와 tailwind-merge를 결합하여 조건부 클래스와 Tailwind 클래스 충돌을 해결
 *
 * @param inputs - 병합할 클래스명들
 * @returns 병합된 클래스명 문자열
 *
 * @example
 * ```tsx
 * cn("px-2 py-1", isActive && "bg-blue-500", className)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
