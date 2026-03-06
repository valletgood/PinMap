import { Location } from "@/apis/location/types";
import { Modal } from "../ui/Modal";
import { useMemo } from "react";
import { stripHtmlTags } from "@/lib/utils";
import Image from "next/image";
import { Button } from "../ui/Button";

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

interface LocationDetailModalProps {
  location: Location;
  onClose: () => void;
  onSave?: () => void;
}

export function LocationDetailModal({
  location,
  onClose,
  onSave,
}: LocationDetailModalProps) {
  const { title, link, category, description, roadAddress } = location;
  const hasLink = isNonEmpty(link);
  const hasCategory = isNonEmpty(category);
  const hasDescription = isNonEmpty(description);
  const hasRoadAddress = isNonEmpty(roadAddress);

  const plainTitle = useMemo(() => {
    if (!title) return "위치 정보";
    return stripHtmlTags(title);
  }, [title]);

  const descriptionParts: string[] = [];
  if (hasCategory) descriptionParts.push(category);
  if (hasRoadAddress) descriptionParts.push(roadAddress);
  if (hasDescription) descriptionParts.push(description);
  const hasDescriptionContent = descriptionParts.length > 0;

  return (
    <Modal isOpen={true} title="" onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        {/* 아이콘 영역: 은은한 글로우 + 흰 원 + ico_map.svg */}
        <div className="relative mb-5 flex items-center justify-center">
          <div
            className="absolute h-20 w-20 rounded-full bg-[#6f62cb]/25 blur-2xl"
            aria-hidden
          />
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

        {/* 제목 */}
        <h2 className="text-[20px] font-bold text-gray-800">{plainTitle}</h2>

        {/* 설명 블록: 카테고리, 주소, 설명, 바로가기 링크 */}
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

        {/* 하단 버튼: 닫기(흰색), 저장(6f62cb) */}
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
