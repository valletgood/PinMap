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
