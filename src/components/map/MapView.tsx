"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLocationStore } from "@/stores/locationStore";
import { type Location } from "@/apis/location/types";
import { LocationDetailModal } from "./LocationDetailModal";
import { SaveLocationModal } from "./SaveLocationModal";
import { CompleteModal } from "../modal/CompleteModal";

const FOOD_CATEGORIES = ["한식", "양식", "일식", "중식"];
const DESSERT_CATEGORIES = ["카페", "디저트"];

const MARKER_ICONS = {
  food: "/icons/map_food.png",
  dessert: "/icons/map_dessert.png",
  default: "/icons/map_default.png",
} as const;

const MARKER_SIZE = { width: 63, height: 81 }; // 42x54 기준 1.5배
const REF_ZOOM = 16; // 이 줌 레벨에서 scale = 1
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.8;

function getMarkerScale(zoom: number): number {
  const scale = Math.pow(2, (zoom - REF_ZOOM) * 0.35);
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function applyMarkerSize(el: HTMLElement, scale: number): void {
  el.style.width = `${MARKER_SIZE.width * scale}px`;
  el.style.height = `${MARKER_SIZE.height * scale}px`;
}

function getMarkerIconUrl(category: string): string {
  const normalized = category?.trim() ?? "";
  if (FOOD_CATEGORIES.some((c) => normalized.includes(c))) return MARKER_ICONS.food;
  if (DESSERT_CATEGORIES.some((c) => normalized.includes(c))) return MARKER_ICONS.dessert;
  return MARKER_ICONS.default;
}

interface MapViewProps {
  /**
   * 검색 결과 목록
   */
  searchResults?: Location[];
  /**
   * 선택된 장소
   */
  selectedLocation?: Location | null;
}

export function MapView({ searchResults = [], selectedLocation = null }: MapViewProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const setModalLocationRef = useRef<((loc: Location | null) => void) | null>(null);
  const [modalLocation, setModalLocation] = useState<Location | null>(null);
  const [saveLocation, setSaveLocation] = useState<Location | null>(null);
  const [isSaveComplete, setIsSaveComplete] = useState(false);
  const { location } = useLocationStore();
  const isInitializedRef = useRef(false);

  // 마커 클릭 시 setState 호출을 위해 ref에 최신 setter 연결
  setModalLocationRef.current = setModalLocation;

  const handleSaveComplete = () => {
    setSaveLocation(null);
    setIsSaveComplete(true);
  };

  // 지도 초기화
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!key) {
      console.error("NEXT_PUBLIC_MAPTILER_KEY가 없습니다.");
      return;
    }

    // 초기 위치는 기본값(서울) 또는 location이 있으면 사용
    const initialCenter: [number, number] = location
      ? [location.lng, location.lat]
      : [126.978, 37.5665];

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/019cc3b6-4ea1-78b9-82c0-189623ed6346/style.json?key=${key}`,
      center: initialCenter,
      zoom: 16,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      interactive: true,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "bottom-right");

    // 지도가 로드된 후 초기화 완료 표시
    mapRef.current.on("load", () => {
      isInitializedRef.current = true;
    });

    // 마커 호버용 툴팁 엘리먼트 생성
    const tooltipEl = document.createElement("div");
    tooltipEl.className = "map-marker-tooltip";
    tooltipEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(tooltipEl);
    tooltipRef.current = tooltipEl;

    // 줌 변경 시 모든 마커 크기 동적 조정 및 툴팁 숨김
    const updateMarkerSizes = (): void => {
      const map = mapRef.current;
      if (!map) return;
      tooltipRef.current?.classList.remove("is-visible");
      const zoom = map.getZoom();
      const scale = getMarkerScale(zoom);
      markersRef.current.forEach((marker) => {
        const el = marker.getElement();
        if (el) applyMarkerSize(el, scale);
      });
    };

    mapRef.current.on("zoom", updateMarkerSizes);

    const hideTooltipOnMove = (): void => {
      tooltipRef.current?.classList.remove("is-visible");
    };
    mapRef.current.on("move", hideTooltipOnMove);

    // cleanup
    return () => {
      mapRef.current?.off("zoom", updateMarkerSizes);
      mapRef.current?.off("move", hideTooltipOnMove);
      tooltipRef.current?.remove();
      tooltipRef.current = null;
      // 기존 마커 제거
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      isInitializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // location 변경 시 지도 중심 이동
  useEffect(() => {
    if (!mapRef.current || !location || !isInitializedRef.current) return;

    // 현재 중심과 동일한 좌표면 이동하지 않음
    const currentCenter = mapRef.current.getCenter();
    const currentLng = currentCenter.lng;
    const currentLat = currentCenter.lat;

    // 좌표 차이가 0.0001도 미만이면 이동하지 않음 (약 10m)
    if (
      Math.abs(currentLng - location.lng) < 0.0001 &&
      Math.abs(currentLat - location.lat) < 0.0001
    ) {
      return;
    }

    // 부드러운 애니메이션으로 중심 이동
    mapRef.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 16,
      duration: 1000,
      essential: true,
    });
  }, [location]);

  // 검색 결과에 마커 추가
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // 검색 결과가 없으면 종료
    if (!searchResults || searchResults.length === 0) return;

    // SVG 아이콘을 이미지로 로드

    const tooltipEl = tooltipRef.current;

    // 각 검색 결과에 마커 추가
    searchResults.forEach((loc) => {
      // 네이버 좌표계를 WGS84로 변환
      const lng = Number(loc.mapx) / 1e7;
      const lat = Number(loc.mapy) / 1e7;
      const iconUrl = getMarkerIconUrl(loc.category);

      // 마커 엘리먼트 생성
      const el = document.createElement("div");
      el.className = "marker";
      applyMarkerSize(el, getMarkerScale(mapRef.current!.getZoom()));
      el.style.backgroundImage = `url(${iconUrl})`;
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundPosition = "center";
      el.style.cursor = "pointer";

      el.addEventListener("click", () => {
        setModalLocationRef.current?.(loc);
      });

      // 마커 생성 및 추가
      const marker = new maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [searchResults]);

  useEffect(() => {
    if (!mapRef.current || !selectedLocation || !isInitializedRef.current) return;

    const lng = Number(selectedLocation.mapx) / 1e7;
    const lat = Number(selectedLocation.mapy) / 1e7;
    const iconUrl = getMarkerIconUrl(selectedLocation.category);

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 600,
      essential: true,
    });

    // 마커 엘리먼트 생성
    const el = document.createElement("div");
    el.className = "marker";
    applyMarkerSize(el, getMarkerScale(mapRef.current.getZoom()));
    el.style.backgroundImage = `url(${iconUrl})`;
    el.style.backgroundSize = "contain";
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundPosition = "center";
    el.style.cursor = "pointer";

    el.addEventListener("click", () => {
      setModalLocationRef.current?.(selectedLocation);
    });

    // 마커 생성 및 추가
    const marker = new maplibregl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat([lng, lat])
      .addTo(mapRef.current!);

    markersRef.current.push(marker);
  }, [selectedLocation]);

  return (
    <>
      <div ref={containerRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
      {modalLocation && (
        <LocationDetailModal
          location={modalLocation}
          onClose={() => setModalLocation(null)}
          onSave={() => {
            setSaveLocation(modalLocation);
            setModalLocation(null);
          }}
        />
      )}
      {saveLocation && (
        <SaveLocationModal
          location={saveLocation}
          onClose={() => setSaveLocation(null)}
          onComplete={handleSaveComplete}
        />
      )}
      {isSaveComplete && (
        <CompleteModal isOpen={isSaveComplete} onClose={() => setIsSaveComplete(false)} />
      )}
    </>
  );
}
