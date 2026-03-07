"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { type Location } from "@/apis/location/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { stripHtmlTags } from "@/lib/utils";
import Image from "next/image";
import { type NewSavedLocation } from "@/db/schema";
import { useAuthStore } from "@/stores/authStore";
import { useSaveLocation, useUploadLocationImages } from "@/apis/location/hooks";
import { useQueryClient } from "@tanstack/react-query";

const SAVE_CATEGORIES = ["맛집", "카페", "관광지", "쇼핑", "기타"] as const;
type SaveCategory = (typeof SAVE_CATEGORIES)[number];

const DEFAULT_ERROR_MESSAGE = "저장 중 오류가 발생했습니다.";

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: { message?: string } } }).response?.data;
    if (typeof data?.message === "string" && data.message) return data.message;
  }
  return err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
}

export type SaveLocationData = NewSavedLocation;

interface SaveLocationModalProps {
  location: Location;
  onClose: () => void;
  onComplete: () => void;
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

function ImageUploader({
  images,
  onChange,
}: {
  images: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const urlsToRevokeRef = useRef<string[]>([]);

  useEffect(() => {
    urlsToRevokeRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsToRevokeRef.current = [];

    if (images.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = images.map((file) => URL.createObjectURL(file));
    urlsToRevokeRef.current = urls;
    setPreviewUrls(urls);

    return () => {
      urlsToRevokeRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsToRevokeRef.current = [];
    };
  }, [images]);

  const handleAdd = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      onChange([...images, ...Array.from(files)]);
      if (inputRef.current) inputRef.current.value = "";
    },
    [images, onChange]
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {previewUrls.map((url, i) => (
          <div
            key={url}
            className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200"
          >
            {/* blob 미리보기: createObjectURL 캐시로 매 렌더 생성 방지, next/image 대신 img로 모바일 성능 개선 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={images[i]?.name ?? `미리보기 ${i + 1}`}
              className="h-full w-full object-cover"
              width={64}
              height={64}
              loading="lazy"
            />
            <Button
              variant="ghost"
              onClick={() => handleRemove(i)}
              className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
              type="button"
              aria-label="삭제"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          onClick={() => inputRef.current?.click()}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[#6f62cb]/30 transition-colors hover:border-[#6f62cb] hover:text-[#6f62cb]"
          aria-label="이미지 추가"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleAdd}
        className="hidden"
      />
    </div>
  );
}

export function SaveLocationModal({ location, onClose, onComplete }: SaveLocationModalProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [category, setCategory] = useState<SaveCategory>("맛집");
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { mutateAsync: uploadImages } = useUploadLocationImages();
  const { mutate: saveLocation } = useSaveLocation();

  const plainTitle = stripHtmlTags(location.title) || "위치 정보";
  const address = location.roadAddress || location.address || "";

  const handleSubmit = async () => {
    if (!user?.uuid) {
      setSubmitError("로그인이 필요합니다.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const imageUrls = images.length > 0 ? await uploadImages(images) : [];

      const lng = Number(location.mapx) / 1e7;
      const lat = Number(location.mapy) / 1e7;
      const payload: NewSavedLocation = {
        userId: user.uuid,
        latitude: lat,
        longitude: lng,
        title: plainTitle,
        roadAddress: address || undefined,
        category,
        rating,
        images: imageUrls,
        review: review.trim() || undefined,
        link: location.link || undefined,
      };
      saveLocation(payload, {
        onSuccess: () => {
          onComplete();
          queryClient.invalidateQueries({ queryKey: ["location", "saved"] });
        },
        onError: (err) => {
          setSubmitError(getErrorMessage(err));
        },
      });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} title="" onClose={onClose}>
      <div className="flex max-h-[70vh] flex-col">
        {/* 상단: 아이콘 + 타이틀 + 주소 (고정) */}
        <div className="shrink-0 flex flex-col">
          <div className="relative mb-5 flex justify-start">
            <div className="absolute h-20 w-20 rounded-full" aria-hidden />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <Image
                src="/icons/ico_love.svg"
                alt=""
                width={28}
                height={24}
                className="h-6 w-7 object-contain"
                aria-hidden
              />
            </div>
          </div>
          <h2 className="text-[20px] font-bold text-gray-800">{plainTitle}</h2>
          {address && <p className="mt-1 text-sm leading-relaxed text-gray-800">{address}</p>}
        </div>

        {/* 별점 ~ 나만의 리뷰: 스크롤 영역 */}
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex w-full flex-col gap-5">
            {/* 1. 별점 */}
            <fieldset className="flex w-full flex-col items-start">
              <legend className="mb-1.5 text-sm font-medium text-gray-700">별점</legend>
              <StarRating value={rating} onChange={setRating} />
            </fieldset>

            {/* 2. 이미지 */}
            <fieldset className="flex w-full flex-col items-start">
              <legend className="mb-1.5 text-sm font-medium text-gray-700">이미지</legend>
              <ImageUploader images={images} onChange={setImages} />
            </fieldset>

            {/* 3. 카테고리 */}
            <fieldset className="flex w-full flex-col items-start">
              <legend className="mb-1.5 text-sm font-medium text-gray-700">카테고리</legend>
              <div className="flex flex-wrap gap-2">
                {SAVE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-xl px-3.5 py-1.5 text-sm font-medium border border-[#6f62cb]/50 transition-all ${
                      category === cat
                        ? "bg-[#6f62cb] text-white"
                        : "bg-transparent text-gray-600 hover:bg-[#6f62cb]/10 hover:text-[#6f62cb]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* 4. 나만의 리뷰 */}
            <div className="flex w-full flex-col">
              <label
                htmlFor="save-review"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                나만의 리뷰
              </label>
              <textarea
                id="save-review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="이 장소에 대한 나만의 리뷰를 작성해보세요"
                rows={3}
                className="w-full resize-none rounded-lg border border-[#6f62cb]/50 bg-transparent px-4 py-2.5 text-base leading-relaxed text-gray-900 placeholder:text-gray-400 transition-all duration-200 hover:border-purple-400 focus:border-[#6f62cb] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {submitError && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}

      {/* 하단 버튼 */}
      <div className="mt-5 flex gap-3">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold"
        >
          취소
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold"
        >
          {isSubmitting ? "저장 중…" : "저장하기"}
        </Button>
      </div>
    </Modal>
  );
}
