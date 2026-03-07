"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Input } from "./Input";
import { SearchLoctionList } from "./SearchLoctionList";
import { type Location } from "@/apis/location/types";
import type { SavedLocation } from "@/db/schema";

/**
 * FloatingSearchBar 컴포넌트
 *
 * 상단에 고정된 플로팅 검색바 컴포넌트
 * 맛집 검색을 위한 UI 컴포넌트
 *
 * @example
 * ```tsx
 * <FloatingSearchBar
 *   placeholder="맛집을 검색하세요"
 *   onSubmit={(query) => console.log(query)}
 * />
 * ```
 */
interface FloatingSearchBarProps {
  /**
   * 검색 입력 필드의 placeholder 텍스트
   */
  placeholder?: string;
  /**
   * 검색어가 제출될 때 호출되는 콜백 함수
   */
  onSubmit: (query: string) => void;
  /**
   * 검색 결과 데이터
   */
  searchResults?: Location[];
  /**
   * 저장된 장소 목록 (검색 결과에서 저장 여부 표시용)
   */
  savedLocations?: SavedLocation[];
  /**
   * 장소 선택 시 호출되는 콜백 함수
   */
  onLocationSelect?: (location: Location | null) => void;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
  /**
   * 비활성화 상태
   */
  disabled?: boolean;
  /**
   * 검색 중인지 여부
   */
  isFetching?: boolean;
}

export const FloatingSearchBar = React.memo<FloatingSearchBarProps>(
  ({
    placeholder = "맛집을 검색하세요",
    onSubmit,
    searchResults = [],
    savedLocations = [],
    onLocationSelect,
    className = "",
    disabled = false,
    isFetching = false,
  }) => {
    const [query, setQuery] = useState("");
    const hasResults = searchResults && searchResults.length > 0;

    const handleChange = (value: string) => {
      setQuery(value);
    };

    const handleSubmit = () => {
      if (query.trim()) {
        onSubmit(query.trim());
      }
    };

    return (
      <div className={cn("fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:px-6 md:pt-6", className)}>
        <div className="max-w-2xl mx-auto" aria-label="맛집 검색">
          {/* 검색바 - 항상 rounded-full 유지 */}
          <div className="bg-white/60 backdrop-blur-sm shadow-lg border border-gray rounded-full">
            <div className="flex items-center gap-3 px-2 py-2 md:px-5 md:py-1">
              <Input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                showClearButton={true}
                className={cn(
                  "flex-1 bg-transparent text-gray-900 placeholder:text-gray-400",
                  "px-2 py-1",
                  "border-none",
                  "rounded-full",
                  "text-base md:text-lg",
                  "focus:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
                aria-label="검색어 입력"
              />

              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={disabled || !query.trim()}
                className={cn(
                  "flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full",
                  "flex items-center justify-center p-0"
                )}
                aria-label="검색 실행"
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </Button>
            </div>
          </div>

          {/* 결과 영역 - 검색바 아래 별도 카드 */}
          {(isFetching || hasResults) && (
            <div className="mt-2 bg-white/60 backdrop-blur-sm shadow-lg border border-gray rounded-2xl md:rounded-3xl overflow-hidden animate-slide-up-fade-in">
              {/* 검색 중 스피너 */}
              {isFetching && (
                <div className="flex items-center justify-center py-4 px-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="animate-spin h-5 w-5 text-[#6938D3]"
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
                    <span className="text-sm">검색 중...</span>
                  </div>
                </div>
              )}

              {/* 검색 결과 목록 */}
              {!isFetching && hasResults && (
                <div className="p-2">
                  <SearchLoctionList
                    data={searchResults}
                    savedLocations={savedLocations}
                    onSelect={onLocationSelect}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

FloatingSearchBar.displayName = "FloatingSearchBar";
