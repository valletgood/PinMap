"use client";

import { useState, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import type { SavedLocation } from "@/db/schema";
import { useEditLocation, useUploadLocationImages } from "@/apis/location/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useMapStyleStore } from "@/stores/mapStyleStore";
import { cn } from "@/lib/utils";

const SAVE_CATEGORIES = ["맛집", "카페", "관광지", "쇼핑", "기타"] as const;
type SaveCategory = (typeof SAVE_CATEGORIES)[number];

const DEFAULT_ERROR_MESSAGE = "수정 중 오류가 발생했습니다.";

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: { message?: string } } }).response?.data;
    if (typeof data?.message === "string" && data.message) return data.message;
  }
  return err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="별점">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
            aria-label={`${star}점`}
            role="radio"
            aria-checked={star === value}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill={filled ? "#6f62cb" : "none"}
              stroke="#6f62cb"
              strokeWidth="1.5"
              strokeLinejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

interface EditLocationModalProps {
  savedLocation: SavedLocation;
  onClose: () => void;
  onComplete: () => void;
}

export function EditLocationModal({ savedLocation, onClose, onComplete }: EditLocationModalProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(savedLocation.rating ?? 0);
  const [imageUrls, setImageUrls] = useState<string[]>(
    Array.isArray(savedLocation.images) ? [...savedLocation.images] : []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<SaveCategory>(
    (SAVE_CATEGORIES.includes(savedLocation.category as SaveCategory)
      ? savedLocation.category
      : "맛집") as SaveCategory
  );
  const [review, setReview] = useState(savedLocation.review ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutateAsync: uploadImages } = useUploadLocationImages();
  const { mutate: editLocation } = useEditLocation();
  const mapDarkMode = useMapStyleStore((s) => s.mapDarkMode);

  const removeImageUrl = useCallback((index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addNewFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setNewFiles((prev) => [...prev, ...Array.from(files)]);
    e.target.value = "";
  }, []);

  const removeNewFile = useCallback((index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const uploadedUrls = newFiles.length > 0 ? await uploadImages(newFiles) : [];
      const allImages = [...imageUrls, ...uploadedUrls];

      editLocation(
        {
          id: savedLocation.id,
          data: {
            title: savedLocation.title,
            roadAddress: savedLocation.roadAddress ?? undefined,
            rating,
            images: allImages,
            category,
            review: review.trim() || undefined,
            link: savedLocation.link || undefined,
          },
        },
        {
          onSuccess: (res) => {
            if (res.error === 0) {
              queryClient.invalidateQueries({ queryKey: ["location", "saved"] });
              onComplete();
            } else {
              setSubmitError(res.message ?? DEFAULT_ERROR_MESSAGE);
            }
          },
          onError: (err) => {
            setSubmitError(getErrorMessage(err));
          },
        }
      );
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalClassName = mapDarkMode ? "bg-black/60 border-black" : "";

  return (
    <Modal isOpen={true} title="" onClose={onClose} className={modalClassName}>
      <div className="flex max-h-[70vh] flex-col">
        <div className="shrink-0 flex flex-col">
          <div className="relative mb-5 flex justify-start">
            <div
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-full",
                mapDarkMode ? "bg-white/10" : "bg-white"
              )}
            >
              <Image
                src="/icons/ico_love.svg"
                alt=""
                width={28}
                height={24}
                className={cn("h-6 w-7 object-contain", mapDarkMode && "brightness-0 invert")}
                aria-hidden
              />
            </div>
          </div>
          <h2 className={cn("text-[20px] font-bold", mapDarkMode ? "text-white" : "text-gray-800")}>
            {savedLocation.title}
          </h2>
          {savedLocation.roadAddress && (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                mapDarkMode ? "text-white/80" : "text-gray-800"
              )}
            >
              {savedLocation.roadAddress}
            </p>
          )}
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex w-full flex-col gap-5">
            <fieldset className="flex w-full flex-col items-start">
              <legend
                className={cn(
                  "mb-1.5 text-sm font-medium",
                  mapDarkMode ? "text-white/70" : "text-gray-700"
                )}
              >
                별점
              </legend>
              <StarRating value={rating} onChange={setRating} />
            </fieldset>

            <fieldset className="flex w-full flex-col items-start">
              <legend
                className={cn(
                  "mb-1.5 text-sm font-medium",
                  mapDarkMode ? "text-white/70" : "text-gray-700"
                )}
              >
                이미지
              </legend>
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "block overflow-hidden rounded-lg border",
                        mapDarkMode ? "border-white/30" : "border-gray-200"
                      )}
                    >
                      <Image
                        src={url}
                        alt=""
                        width={80}
                        height={80}
                        className="h-20 w-20 object-cover"
                      />
                    </a>
                    <Button
                      type="button"
                      onClick={() => removeImageUrl(i)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white p-0"
                      aria-label="이미지 제거"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                {newFiles.map((file, i) => (
                  <div key={`new-${i}`} className="relative">
                    <div
                      className={cn(
                        "flex h-20 w-20 items-center justify-center rounded-lg border border-dashed text-xs",
                        mapDarkMode
                          ? "border-white/30 bg-black/20 text-white/60"
                          : "border-gray-300 bg-gray-50 text-gray-500"
                      )}
                    >
                      새 이미지
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => removeNewFile(i)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white p-0"
                      aria-label="제거"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <label
                  className={cn(
                    "flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed text-sm transition-colors",
                    mapDarkMode
                      ? "border-white/30 bg-white/5 text-white/80 hover:bg-white/10"
                      : "border-[#6f62cb]/50 bg-[#6f62cb]/5 text-[#6f62cb] hover:bg-[#6f62cb]/10"
                  )}
                >
                  추가
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={addNewFiles}
                    className="hidden"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="flex w-full flex-col items-start">
              <legend
                className={cn(
                  "mb-1.5 text-sm font-medium",
                  mapDarkMode ? "text-white/70" : "text-gray-700"
                )}
              >
                카테고리
              </legend>
              <div className="flex flex-wrap gap-2">
                {SAVE_CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant="primary"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "rounded-xl px-3.5 py-1.5 text-sm font-medium border border-[#6f62cb]/50 transition-all",
                      category === cat
                        ? "bg-[#6f62cb] text-white"
                        : mapDarkMode
                          ? "bg-transparent text-white/80 hover:bg-[#6f62cb]/20 hover:text-white"
                          : "bg-transparent text-gray-600 hover:bg-[#6f62cb]/10 hover:text-[#6f62cb]"
                    )}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </fieldset>

            <div className="flex w-full flex-col">
              <label
                htmlFor="edit-review"
                className={cn(
                  "mb-1.5 block text-sm font-medium",
                  mapDarkMode ? "text-white/70" : "text-gray-700"
                )}
              >
                나만의 리뷰
              </label>
              <textarea
                id="edit-review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="이 장소에 대한 나만의 리뷰를 작성해보세요"
                rows={3}
                className={cn(
                  "w-full resize-none rounded-lg border border-[#6f62cb]/50 bg-transparent px-4 py-2.5 text-base leading-relaxed transition-all duration-200 focus:border-[#6f62cb] focus:outline-none",
                  mapDarkMode
                    ? "text-white placeholder:text-white/50 border-white/30"
                    : "text-gray-900 placeholder:text-gray-400"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {submitError && (
        <p className="mt-3 text-sm text-red-500" role="alert">
          {submitError}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isSubmitting}
          className={cn(
            "flex-1 rounded-xl px-4 py-3 text-sm font-semibold",
            mapDarkMode
              ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
              : "border border-gray-200"
          )}
        >
          취소
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold"
        >
          {isSubmitting ? "수정 중…" : "수정하기"}
        </Button>
      </div>
    </Modal>
  );
}
