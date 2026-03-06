import { Location } from "@/apis/location/types";
import { Modal } from "../ui/Modal";
import { useMemo } from "react";
import { stripHtmlTags } from "@/lib/utils";

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

interface LocationDetailModalProps {
  location: Location;
  onClose: () => void;
}

const STAGGER_DELAYS = [0, 80, 160, 240];

function PinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6f62cb"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6f62cb"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function LocationDetailModal({
  location,
  onClose,
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

  let delayIndex = 0;

  return (
    <Modal isOpen={true} title={plainTitle} onClose={onClose}>
      <div className="flex flex-col gap-3.5">
        {/* 카테고리 필 */}
        {hasCategory && (
          <div
            className="animate-list-item-in"
            style={{ animationDelay: `${STAGGER_DELAYS[delayIndex++]}ms` }}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6f62cb]/15 px-3.5 py-1.5 text-sm font-semibold tracking-wide text-[#6f62cb]"
              aria-label={`카테고리: ${category}`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#6f62cb]"
                aria-hidden
              />
              {category}
            </span>
          </div>
        )}

        {/* 도로명 주소 */}
        {hasRoadAddress && (
          <div
            className="animate-list-item-in rounded-xl bg-[#6f62cb]/15 p-3.5"
            style={{ animationDelay: `${STAGGER_DELAYS[delayIndex++]}ms` }}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-px shrink-0 opacity-80">
                <PinIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#6f62cb]">
                  도로명 주소
                </p>
                <p className="mt-1 text-md leading-relaxed text-gray-700">
                  {roadAddress}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 설명 */}
        {hasDescription && (
          <div
            className="animate-list-item-in rounded-xl bg-[#6f62cb]/5 p-3.5"
            style={{ animationDelay: `${STAGGER_DELAYS[delayIndex++]}ms` }}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-px shrink-0 opacity-80">
                <InfoIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f62cb]/60">
                  설명
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 바로가기 CTA */}
        {hasLink && (
          <div
            className="animate-list-item-in pt-0.5"
            style={{ animationDelay: `${STAGGER_DELAYS[delayIndex++]}ms` }}
          >
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#6f62cb] px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(111,98,203,0.4)] transition-all duration-200 hover:bg-[#6357b8] hover:shadow-[0_6px_24px_-4px_rgba(111,98,203,0.55)] active:scale-[0.98]"
            >
              <ExternalLinkIcon />
              <span>바로가기</span>
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}
