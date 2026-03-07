"use client";

import React from "react";
import { type Location } from "@/apis/location/types";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { useLocationStore } from "@/stores/locationStore";

/**
 * SearchLoctionList 컴포넌트
 *
 * 검색 결과 장소 목록을 표시하는 컴포넌트
 *
 * @example
 * ```tsx
 * <SearchLoctionList data={locations} />
 * ```
 */
interface SearchLoctionListProps {
  /**
   * 검색 결과 장소 데이터 배열
   */
  data: Location[];
  /**
   * 장소 선택 시 호출되는 콜백 함수
   */
  onSelect?: (location: Location) => void;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

export function SearchLoctionList({ data, onSelect, className = "" }: SearchLoctionListProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const handleLocationClick = (location: Location) => {
    const lon = Number(location.mapx) / 1e7;
    const lat = Number(location.mapy) / 1e7;
    useLocationStore.setState({ location: { lat, lng: lon } });
    onSelect?.(location);
  };

  return (
    <div className={cn("space-y-1 max-h-[60vh] overflow-y-auto", className)}>
      {data.map((location, index) => (
        <Button
          key={`${location.title}-${location.roadAddress}-${index}`}
          variant="secondary"
          onClick={() => handleLocationClick(location)}
          className={cn(
            "w-full text-left px-4 py-3 rounded-xl",
            "bg-white/40 backdrop-blur-sm",
            "hover:bg-white/60 active:bg-white/50",
            "transition-all duration-200",
            "border border-white/30 hover:border-white/50",
            "animate-list-item-in"
          )}
          style={{
            animationDelay: `${index * 40}ms`,
          }}
        >
          {/* 장소 제목 */}
          <div className="flex items-start gap-3">
            {/* 장소 아이콘 */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-lg bg-[#6938D3]/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-[#6938D3]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>

            {/* 장소 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate flex items-end gap-2 truncate">
                {location.title.replace(/<[^>]*>/g, "")}
                {location.category && (
                  <p className="text-xs text-gray-500 mb-1">
                    {location.category.split(">").pop()?.trim()}
                  </p>
                )}
              </h3>
              {location.roadAddress && (
                <p className="text-sm text-gray-600 mt-1 truncate">{location.roadAddress}</p>
              )}
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}
