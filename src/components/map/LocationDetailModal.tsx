"use client";

import { type Location } from "@/apis/location/types";
import type { SavedLocation } from "@/db/schema";
import { Modal } from "../ui/Modal";
import { useMemo, useState } from "react";
import { stripHtmlTags } from "@/lib/utils";
import Image from "next/image";
import { Button } from "../ui/Button";
import { DeleteModal } from "@/components/modal/DeleteModal";
import { useDeleteLocation } from "@/apis/location/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useMapStyleStore } from "@/stores/mapStyleStore";
import { cn } from "@/lib/utils";

const ICON_MAP = "/icons/ico_map.svg";
const ICON_LOVE = "/icons/ico_love.svg";
const ICON_DELETE = "/icons/ico_delete.svg";
const GLOW_CLASS = "absolute h-20 w-20 rounded-full bg-[#6f62cb]/25 blur-2xl";
const BTN_BASE = "flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-colors";

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

interface IconCircleProps {
  iconSrc: string;
  alt: string;
  showGlow?: boolean;
  imageClassName?: string;
  darkMode?: boolean;
}

function IconCircle({
  iconSrc,
  alt,
  showGlow = false,
  imageClassName = "h-7 w-7",
  darkMode = false,
}: IconCircleProps) {
  return (
    <div className="relative mb-5 flex items-center justify-center">
      {showGlow && <div className={GLOW_CLASS} aria-hidden />}
      <div
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full shadow-sm",
          darkMode ? "bg-white/10" : "bg-white"
        )}
      >
        <Image
          src={iconSrc}
          alt={alt}
          width={28}
          height={28}
          className={cn(imageClassName, darkMode && "brightness-0 invert")}
          aria-hidden
        />
      </div>
    </div>
  );
}

const LINK_CLASS =
  "text-[#6f62cb] underline underline-offset-2 hover:text-[#6357b8]";
const LINK_CLASS_DARK =
  "text-[#a89ce8] underline underline-offset-2 hover:text-[#c4b8f5]";

interface SearchDetailContentProps {
  location: Location;
  plainTitle: string;
  onClose: () => void;
  onSave?: () => void;
  darkMode?: boolean;
}

function SearchDetailContent({
  location,
  plainTitle,
  onClose,
  onSave,
  darkMode = false,
}: SearchDetailContentProps) {
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
    <div className="flex flex-col items-center text-center">
      <IconCircle iconSrc={ICON_MAP} alt="검색 아이콘" showGlow darkMode={darkMode} />
      <h2
        className={cn(
          "text-[20px] font-bold",
          darkMode ? "text-white" : "text-gray-800"
        )}
      >
        {plainTitle}
      </h2>
      {(hasDescriptionContent || hasLink) && (
        <div
          className={cn(
            "mt-2 flex flex-col gap-0.5 text-md leading-relaxed",
            darkMode ? "text-white/70" : "text-gray-600"
          )}
        >
          {descriptionParts.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {hasLink && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("mt-1 text-sm font-medium", darkMode ? LINK_CLASS_DARK : LINK_CLASS)}
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
          className={cn(
            BTN_BASE,
            darkMode
              ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
              : "border border-gray-200 text-gray-800 hover:bg-gray-50"
          )}
        >
          닫기
        </Button>
        <Button variant="primary" onClick={onSave} className={cn(BTN_BASE, "text-white hover:bg-[#6357b8]")}>
          저장
        </Button>
      </div>
    </div>
  );
}

interface SavedDetailContentProps {
  item: SavedLocation;
  onClose: () => void;
  onEdit?: (item: SavedLocation) => void;
  onDeleteClick: () => void;
  darkMode?: boolean;
}

function SavedDetailContent({
  item,
  onClose,
  onEdit,
  onDeleteClick,
  darkMode = false,
}: SavedDetailContentProps) {
  const images = Array.isArray(item.images) ? item.images : [];
  const createdAtStr = formatCreatedAt(item.createdAt);
  const textPrimary = darkMode ? "text-white" : "text-gray-800";
  const textSecondary = darkMode ? "text-white/80" : "text-gray-700";
  const labelClass = darkMode ? "text-white/70" : "text-gray-700";

  return (
    <div className="flex flex-col items-start text-left">
      <IconCircle
        iconSrc={ICON_LOVE}
        alt="저장 아이콘"
        imageClassName="h-7 w-6 object-contain"
        darkMode={darkMode}
      />

      <div className="flex w-full items-center justify-between gap-2">
        <h2 className={cn("min-w-0 flex-1 truncate text-[20px] font-bold", textPrimary)}>
          {item.title}
        </h2>
        <Button
          variant="ghost"
          onClick={onDeleteClick}
          className="flex-shrink-0 rounded-lg p-1.5 text-[#6f62cb] hover:bg-[#6f62cb]/10 hover:text-[#5a2fb8]"
          aria-label={`${item.title} 삭제`}
        >
          <Image
            src={ICON_DELETE}
            alt=""
            width={22}
            height={22}
            className="h-[22px] w-[22px]"
          />
        </Button>
      </div>
      {isNonEmpty(item.category) && (
        <p className={cn("mt-1 mr-auto text-md font-medium", textSecondary)}>{item.category}</p>
      )}

      {isNonEmpty(item.roadAddress) && (
        <p className={cn("mt-1 mr-auto text-md font-medium", textSecondary)}>{item.roadAddress}</p>
      )}

      {isNonEmpty(item.review) && (
        <div className="mt-1 w-full flex flex-col text-left">
          <label className={cn("mb-1.5 block text-sm font-medium", labelClass)}>나만의 리뷰</label>
          <textarea
            readOnly
            value={item.review}
            rows={3}
            className={cn(
              "w-full resize-none rounded-lg border border-[#6f62cb]/50 bg-transparent px-4 py-2.5 text-base leading-relaxed transition-all duration-200",
              darkMode ? "text-white border-white/30" : "text-gray-900"
            )}
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
              className={cn(
                "block overflow-hidden rounded-lg border",
                darkMode ? "border-white/30" : "border-gray-200"
              )}
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
        <p className="mt-3 mr-auto text-sm">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={darkMode ? LINK_CLASS_DARK : LINK_CLASS}
          >
            바로가기
          </a>
        </p>
      )}

      {createdAtStr && (
        <p className={cn("mr-auto mt-3 font-medium text-md", textSecondary)}>
          <span>저장일</span> {createdAtStr}
        </p>
      )}

      <div className="mt-6 flex w-full gap-3">
        <Button
          onClick={onClose}
          variant="secondary"
          className={cn(
            BTN_BASE,
            darkMode
              ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
              : "border border-gray-200 text-gray-800 hover:bg-gray-50"
          )}
        >
          닫기
        </Button>
        {onEdit && (
          <Button
            variant="primary"
            onClick={() => {
              onEdit(item);
              onClose();
            }}
            className={cn(BTN_BASE, "text-white hover:bg-[#6357b8]")}
          >
            수정
          </Button>
        )}
      </div>
    </div>
  );
}

interface LocationDetailModalProps {
  detail: NonNullable<ModalDetail>;
  onClose: () => void;
  onSave?: () => void;
  /** type === "saved" 일 때 수정 버튼 클릭 시 호출 */
  onEdit?: (item: SavedLocation) => void;
}

export function LocationDetailModal({ detail, onClose, onSave, onEdit }: LocationDetailModalProps) {
  const isSearch = detail.type === "search";
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();
  const deleteLocation = useDeleteLocation();
  const mapDarkMode = useMapStyleStore((s) => s.mapDarkMode);

  const plainTitle = useMemo(() => {
    if (detail.type !== "search") return "";
    const title = detail.location.title;
    if (!title) return "위치 정보";
    return stripHtmlTags(title);
  }, [detail]);

  const handleDeleteConfirm = () => {
    if (detail.type !== "saved") return;
    deleteLocation.mutate(String(detail.location.id), {
      onSuccess: (res) => {
        if (res.error === 0) {
          queryClient.invalidateQueries({ queryKey: ["location", "saved"] });
          setShowDeleteConfirm(false);
          onClose();
        }
      },
    });
  };

  const modalClassName = mapDarkMode ? "bg-black/60 border-black" : "";

  if (isSearch) {
    return (
      <Modal isOpen={true} title="" onClose={onClose} className={modalClassName}>
        <SearchDetailContent
          location={detail.location}
          plainTitle={plainTitle}
          onClose={onClose}
          onSave={onSave}
          darkMode={mapDarkMode}
        />
      </Modal>
    );
  }

  const item = detail.location;
  return (
    <Modal isOpen={true} title="" onClose={onClose} className={modalClassName}>
      <SavedDetailContent
        item={item}
        onClose={onClose}
        onEdit={onEdit}
        onDeleteClick={() => setShowDeleteConfirm(true)}
        darkMode={mapDarkMode}
      />
      <DeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title={item.title}
        isDeleting={deleteLocation.isPending}
      />
    </Modal>
  );
}
