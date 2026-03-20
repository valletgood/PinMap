"use client";

import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { SavedLocation } from "@/db/schema";
import { Button } from "./Button";
import { useDeleteLocation } from "@/apis/location/hooks";
import { DeleteModal } from "@/components/modal/DeleteModal";
import { useMapStyleStore } from "@/stores/mapStyleStore";
import Image from "next/image";

const SAVE_CATEGORIES = ["맛집", "카페", "관광지", "쇼핑", "기타"] as const;

interface SavedListPanelProps {
  savedLocations: SavedLocation[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelectItem: (item: SavedLocation) => void;
  className?: string;
}

function getCategoriesWithCount(
  savedLocations: SavedLocation[]
): { category: string; count: number }[] {
  const countByCategory = new Map<string, number>();
  savedLocations.forEach((item) => {
    const cat = item.category?.trim() || "기타";
    countByCategory.set(cat, (countByCategory.get(cat) ?? 0) + 1);
  });
  return SAVE_CATEGORIES.filter((c) => countByCategory.has(c)).map((category) => ({
    category,
    count: countByCategory.get(category) ?? 0,
  }));
}

export function SavedListPanel({
  savedLocations,
  isOpen,
  onOpen,
  onClose,
  onSelectItem,
  className = "",
}: SavedListPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<SavedLocation | null>(null);
  const queryClient = useQueryClient();
  const deleteLocation = useDeleteLocation();
  const mapDarkMode = useMapStyleStore((s) => s.mapDarkMode);

  const categoriesWithCount = useMemo(
    () => getCategoriesWithCount(savedLocations),
    [savedLocations]
  );

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    return savedLocations.filter((item) => (item.category?.trim() || "기타") === selectedCategory);
  }, [savedLocations, selectedCategory]);

  const handleSelectItem = (item: SavedLocation) => {
    onSelectItem(item);
    onClose();
  };

  const handleDeleteClick = (item: SavedLocation) => {
    setItemToDelete(item);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    deleteLocation.mutate(String(itemToDelete.id), {
      onSuccess: (res) => {
        if (res.error === 0) {
          queryClient.invalidateQueries({ queryKey: ["location", "saved"] });
          setItemToDelete(null);
        }
      },
    });
  };

  const hasItems = savedLocations.length > 0;

  return (
    <>
      {/* 트리거 버튼: 좌측 하단 */}
      <Button
        variant="ghost"
        onClick={() => {
          if (isOpen) {
            onClose();
            setSelectedCategory(null);
          } else {
            onOpen();
          }
        }}
        className={cn(
          "fixed bottom-20 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all p-0 backdrop-blur-md",
          mapDarkMode
            ? "bg-black/60 border-black hover:bg-black/70 active:bg-black/80"
            : "bg-white/60 border border-white/50 hover:bg-white/80 active:bg-white/90",
          "border active:scale-95",
          "focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none",
          isOpen
            ? mapDarkMode
              ? "text-white/90"
              : "text-gray-600"
            : mapDarkMode
              ? "text-[#a89ce8]"
              : "text-[#6f62cb]",
          className
        )}
        aria-label={isOpen ? "저장 목록 닫기" : "저장 목록 열기"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" stroke="#6f62cb" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="#6f62cb" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
        )}
      </Button>

      {/* 패널: 최대 높이 50vh, 카테고리(좌) + 장소 목록(우) */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-35 left-4 right-4 z-30 max-h-[50vh] overflow-hidden rounded-2xl shadow-xl backdrop-blur-md md:left-4 md:right-auto md:min-w-[320px] md:max-w-[420px] border",
            mapDarkMode ? "bg-black/60 border-black" : "border-white/40 bg-white/70"
          )}
          role="dialog"
          aria-label="저장한 장소 목록"
        >
          <div className="flex h-full max-h-[50vh] flex-col md:flex-row">
            {/* 카테고리 목록 */}
            <div
              className={cn(
                "flex-shrink-0 border-b p-2 md:border-b-0 md:border-r md:p-2",
                mapDarkMode ? "border-white/20" : "border-white/50"
              )}
            >
              <p
                className={cn(
                  "mb-2 px-2 text-xs font-medium uppercase tracking-wider",
                  mapDarkMode ? "text-white/70" : "text-gray-500"
                )}
              >
                카테고리
              </p>
              {!hasItems ? (
                <p
                  className={cn(
                    "px-2 py-4 text-sm",
                    mapDarkMode ? "text-white/60" : "text-gray-500"
                  )}
                >
                  저장한 장소가 없습니다.
                </p>
              ) : (
                <ul className="space-y-0.5 overflow-y-auto">
                  {categoriesWithCount.map(({ category, count }, index) => (
                    <li
                      key={category}
                      className="animate-list-item-in"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setSelectedCategory((prev) => (prev === category ? null : category))
                        }
                        className={cn(
                          "w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                          "focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none",
                          selectedCategory === category
                            ? "bg-[#6f62cb]/25 text-[#6f62cb]"
                            : mapDarkMode
                              ? "text-white/90 hover:bg-white/10"
                              : "text-gray-700 hover:bg-white/60"
                        )}
                      >
                        <span className="truncate">{category}</span>
                        <span
                          className={cn(
                            "ml-1.5 text-xs",
                            selectedCategory === category
                              ? "text-[#6f62cb]/80"
                              : mapDarkMode
                                ? "text-white/60"
                                : "text-gray-400"
                          )}
                        >
                          {count}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 장소 목록: 최대 5개 높이만 보이고, 그 이상은 목록만 스크롤 */}
            <div className="flex min-h-0 flex-1 flex-col">
              {selectedCategory ? (
                <>
                  <p
                    className={cn(
                      "flex-shrink-0 px-3 py-2 text-xs font-medium uppercase tracking-wider",
                      mapDarkMode ? "text-white/70" : "text-gray-500"
                    )}
                  >
                    {selectedCategory} 목록
                  </p>
                  <ul className="max-h-[calc(5*3.5rem)] min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
                    {filteredItems.map((item, index) => (
                      <li
                        key={item.id}
                        className="animate-list-item-in flex items-stretch gap-1"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <Button
                          variant="secondary"
                          onClick={() => handleSelectItem(item)}
                          className={cn(
                            "flex items-start justify-between min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-left backdrop-blur-sm",
                            "focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none transition-colors",
                            mapDarkMode
                              ? "bg-black/20 border-white/20 hover:bg-black/30 hover:border-white/30 active:bg-black/40"
                              : "border-white/40 bg-white/50 hover:bg-white/70 hover:border-white/60 active:bg-white/60"
                          )}
                        >
                          <div className="flex flex-col">
                            <span
                              className={cn(
                                "block truncate font-medium",
                                mapDarkMode ? "text-white" : "text-gray-900"
                              )}
                            >
                              {item.title}
                            </span>
                            {item.roadAddress && (
                              <span
                                className={cn(
                                  "mt-0.5 block truncate text-xs",
                                  mapDarkMode ? "text-white/60" : "text-gray-500"
                                )}
                              >
                                {item.roadAddress}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteClick(item)}
                            disabled={deleteLocation.isPending}
                            className="flex-shrink-0 rounded-xl p-2 text-[#6f62cb] hover:bg-[#6f62cb]/15 hover:text-[#5a2fb8] focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none"
                            aria-label={`${item.title} 삭제`}
                          >
                            <Image src="/icons/ico_delete.svg" alt="삭제" width={20} height={20} />
                          </Button>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div
                  className={cn(
                    "flex flex-1 items-center justify-center p-4 text-center text-sm",
                    mapDarkMode ? "text-white/60" : "text-gray-500"
                  )}
                >
                  카테고리를 선택하면 장소 목록이 여기에 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={itemToDelete?.title}
        isDeleting={deleteLocation.isPending}
      />
    </>
  );
}
