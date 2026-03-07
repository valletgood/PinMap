import { type Location } from "@/apis/location/types";
import type { SavedLocation } from "@/db/schema";
import { Modal } from "../ui/Modal";
import { useMemo } from "react";
import { stripHtmlTags } from "@/lib/utils";
import Image from "next/image";
import { Button } from "../ui/Button";

export type ModalDetail =
  | { type: "search"; location: Location }
  | { type: "saved"; location: SavedLocation }
  | null;

function isNonEmpty(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function formatCreatedAt(value: Date | string | null | undefined): string {
  if (value == null) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface LocationDetailModalProps {
  detail: NonNullable<ModalDetail>;
  onClose: () => void;
  onSave?: () => void;
}

export function LocationDetailModal({ detail, onClose, onSave }: LocationDetailModalProps) {
  const isSearch = detail.type === "search";
  const plainTitle = useMemo(() => {
    if (detail.type !== "search") return "";
    const title = detail.location.title;
    if (!title) return "위치 정보";
    return stripHtmlTags(title);
  }, [detail]);

  if (isSearch) {
    const location = detail.location;
    const { link, category, description, roadAddress } = location;
    const hasLink = isNonEmpty(link);
    const hasCategory = isNonEmpty(category);
    const hasDescription = isNonEmpty(description);
    const hasRoadAddress = isNonEmpty(roadAddress);

    const descriptionParts: string[] = [];
    if (hasCategory) descriptionParts.push(category);
    if (hasRoadAddress) descriptionParts.push(roadAddress);
    if (hasDescription) descriptionParts.push(description);
    const hasDescriptionContent = descriptionParts.length > 0;

    return (
      <Modal isOpen={true} title="" onClose={onClose}>
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute h-20 w-20 rounded-full bg-[#6f62cb]/25 blur-2xl" aria-hidden />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <Image
                src="/icons/ico_map.svg"
                alt="검색 아이콘"
                width={28}
                height={28}
                className="h-7 w-7"
                aria-hidden
              />
            </div>
          </div>
          <h2 className="text-[20px] font-bold text-gray-800">{plainTitle}</h2>
          {(hasDescriptionContent || hasLink) && (
            <div className="mt-2 flex flex-col gap-0.5 text-md leading-relaxed text-gray-600">
              {descriptionParts.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {hasLink && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm font-medium text-[#6f62cb] underline underline-offset-2 hover:text-[#6357b8]"
                >
                  바로가기
                </a>
              )}
            </div>
          )}
          <div className="mt-6 flex w-full gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
            >
              닫기
            </Button>
            <Button
              variant="primary"
              onClick={onSave}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6357b8]"
            >
              저장
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // type === "saved"
  const item = detail.location;
  const images = Array.isArray(item.images) ? item.images : [];
  const createdAtStr = formatCreatedAt(item.createdAt);

  return (
    <Modal isOpen={true} title="" onClose={onClose}>
      <div className="flex flex-col items-start text-left">
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full bg-[#6f62cb]/25 blur-2xl" aria-hidden />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <Image
              src="/icons/ico_love.svg"
              alt="저장 아이콘"
              width={28}
              height={24}
              className="h-7 w-6 object-contain"
              aria-hidden
            />
          </div>
        </div>

        <h2 className="text-[20px] font-bold text-gray-800">{item.title}</h2>
        {isNonEmpty(item.category) && (
          <p className="mt-1 mr-auto text-md">
            <span className="font-medium text-gray-700">{item.category}</span>
          </p>
        )}

        {isNonEmpty(item.roadAddress) && (
          <p className="mt-1 mr-auto text-md">
            <span className="font-medium text-gray-700">{item.roadAddress}</span>
          </p>
        )}

        {isNonEmpty(item.review) && (
          <div className="mt-1 w-full flex flex-col text-left">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">나만의 리뷰</label>
            <textarea
              readOnly
              value={item.review}
              rows={3}
              className="w-full resize-none rounded-lg border border-[#6f62cb]/50 bg-transparent px-4 py-2.5 text-base leading-relaxed text-gray-900 transition-all duration-200"
            />
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border border-gray-200"
              >
                <Image
                  src={url}
                  alt={`${item.title} 이미지 ${i + 1}`}
                  width={80}
                  height={80}
                  className="h-20 w-20 object-cover"
                />
              </a>
            ))}
          </div>
        )}

        {isNonEmpty(item.link) && (
          <p className="mt-3 mr-auto text-md">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6f62cb] underline underline-offset-2 hover:text-[#6357b8]"
            >
              바로가기
            </a>
          </p>
        )}

        {createdAtStr && (
          <p className="mr-auto mt-3 font-medium text-md text-gray-700">
            <span className="">저장일</span> {createdAtStr}
          </p>
        )}

        <div className="mt-6 w-full">
          <Button
            onClick={onClose}
            variant="secondary"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
          >
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
