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

/**
 * HTML 태그를 제거하고 순수 텍스트만 반환
 * @param html - HTML이 포함된 문자열
 * @returns 순수 텍스트
 */
export function stripHtmlTags(html: string): string {
  if (!html) return "";

  // DOMParser를 사용하여 안전하게 HTML 파싱 (브라우저 환경)
  if (typeof window !== "undefined" && window.DOMParser) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  // 폴백: 정규식으로 태그 제거 (서버 환경 또는 DOMParser 미지원)
  return html
    .replace(/<[^>]*>/g, "") // HTML 태그 제거
    .replace(/&nbsp;/g, " ") // &nbsp; → 공백
    .replace(/&amp;/g, "&") // &amp; → &
    .replace(/&lt;/g, "<") // &lt; → <
    .replace(/&gt;/g, ">") // &gt; → >
    .replace(/&quot;/g, '"') // &quot; → "
    .replace(/&#39;/g, "'") // &#39; → '
    .trim();
}
