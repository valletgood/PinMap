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

/** 지도 스타일 URL (라이트) */
export const MAP_STYLE_LIGHT =
  "https://api.maptiler.com/maps/019cc3b6-4ea1-78b9-82c0-189623ed6346/style.json";
/** 지도 스타일 URL (다크) */
export const MAP_STYLE_DARK =
  "https://api.maptiler.com/maps/019cc3de-df75-7713-ba27-4592ce2fcd6d/style.json";

export function getMapStyleUrl(key: string, dark: boolean): string {
  const base = dark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;
  return `${base}?key=${key}`;
}

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

/** 검색된 장소 마커: 다크모드 → white, 라이트 → black */
export const MARKER_ICONS = {
  defaultDark: "/icons/map_default_white.png",
  savedDark: "/icons/map_favorite.svg",
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

/** 검색된 장소 마커 아이콘 (다크모드 여부에 따라 white/black) */
export function getSearchMarkerIconUrl(): string {
  return MARKER_ICONS.defaultDark;
}

/** 저장된 장소 마커 아이콘 (다크모드 → 별 흰색, 라이트 → 별 검정) */
export function getSavedMarkerIconUrl(): string {
  return MARKER_ICONS.savedDark;
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
