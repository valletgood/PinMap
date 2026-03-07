import { stripHtmlTags } from "@/lib/utils";
import { type Location } from "@/apis/location/types";
import type { SavedLocation } from "@/db/schema";
import { type ModalDetail } from "@/components/map/LocationDetailModal";

const COORD_EPS = 0.00002; // 약 2m 오차 허용 (SearchLoctionList와 동일)

/** 지도 초기 중심 (서울) */
export const DEFAULT_MAP_CENTER: [number, number] = [126.978, 37.5665];

/** flyTo 기본 줌 레벨 */
export const FLY_TO_ZOOM = 16;
/** flyTo 기본 duration (ms) */
export const FLY_TO_DURATION = 600;
/** flyTo 느린 이동 duration (ms), 예: location 변경 시 */
export const FLY_TO_DURATION_SLOW = 1000;

export function createFlyToOptions(
  center: [number, number],
  options?: { duration?: number }
): { center: [number, number]; zoom: number; duration: number; essential: true } {
  return {
    center,
    zoom: FLY_TO_ZOOM,
    duration: options?.duration ?? FLY_TO_DURATION,
    essential: true,
  };
}

/** 마커 DOM 엘리먼트 생성 (className, 크기, 배경 아이콘, 클릭 핸들러 적용) */
export function createMarkerElement(params: {
  iconUrl: string;
  scale: number;
  onClick: () => void;
}): HTMLDivElement {
  const { iconUrl, scale, onClick } = params;
  const el = document.createElement("div");
  el.className = "marker";
  applyMarkerSize(el, scale);
  el.style.backgroundImage = `url(${iconUrl})`;
  el.style.backgroundSize = "contain";
  el.style.backgroundRepeat = "no-repeat";
  el.style.backgroundPosition = "center";
  el.style.cursor = "pointer";
  el.addEventListener("click", onClick);
  return el;
}

/** ref에 담긴 마커들에 동일 scale 적용 (줌 변경 시 호출) */
export function applyScaleToMarkers(
  markers: Array<{ getElement(): HTMLElement | undefined }>,
  scale: number
): void {
  markers.forEach((marker) => {
    const el = marker.getElement();
    if (el) applyMarkerSize(el, scale);
  });
}

const FOOD_CATEGORIES = ["한식", "양식", "일식", "중식"];
const DESSERT_CATEGORIES = ["카페", "디저트"];

export const MARKER_ICONS = {
  food: "/icons/map_food.png",
  dessert: "/icons/map_dessert.png",
  default: "/icons/map_default.png",
  saved: "/icons/map_love.png",
} as const;

const MARKER_SIZE = { width: 63, height: 81 }; // 42x54 기준 1.5배
const REF_ZOOM = 16; // 이 줌 레벨에서 scale = 1
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.8;

export function getMarkerScale(zoom: number): number {
  const scale = Math.pow(2, (zoom - REF_ZOOM) * 0.35);
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function applyMarkerSize(el: HTMLElement, scale: number): void {
  el.style.width = `${MARKER_SIZE.width * scale}px`;
  el.style.height = `${MARKER_SIZE.height * scale}px`;
}

export function getMarkerIconUrl(category: string): string {
  const normalized = category?.trim() ?? "";
  if (FOOD_CATEGORIES.some((c) => normalized.includes(c))) return MARKER_ICONS.food;
  if (DESSERT_CATEGORIES.some((c) => normalized.includes(c))) return MARKER_ICONS.dessert;
  return MARKER_ICONS.default;
}

export function findSavedMatch(
  location: Location,
  savedLocations: SavedLocation[]
): SavedLocation | undefined {
  if (!savedLocations?.length) return undefined;
  const locLng = Number(location.mapx) / 1e7;
  const locLat = Number(location.mapy) / 1e7;
  const locTitle = (stripHtmlTags(location.title) ?? "").trim();
  return savedLocations.find((s) => {
    const titleMatch = (s.title?.trim() ?? "") === locTitle;
    const coordMatch =
      Math.abs(Number(s.longitude) - locLng) < COORD_EPS &&
      Math.abs(Number(s.latitude) - locLat) < COORD_EPS;
    return titleMatch && coordMatch;
  });
}

export function getModalDetailForLocation(
  location: Location,
  savedLocations: SavedLocation[]
): ModalDetail {
  const saved = findSavedMatch(location, savedLocations);
  if (saved) return { type: "saved", location: saved };
  return { type: "search", location };
}
