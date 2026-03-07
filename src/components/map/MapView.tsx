"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLocationStore } from "@/stores/locationStore";
import { type Location } from "@/apis/location/types";
import type { SavedLocation } from "@/db/schema";
import { LocationDetailModal, type ModalDetail } from "./LocationDetailModal";
import { SaveLocationModal } from "./SaveLocationModal";
import { CompleteModal } from "../modal/CompleteModal";
import { Spinner } from "@/components/ui/Spinner";
import { applyMarkerSize, getMarkerIconUrl, getMarkerScale, MARKER_ICONS } from "@/lib/mapUtil";


interface MapViewProps {
  /**
   * 검색 결과 목록
   */
  searchResults?: Location[];
  /**
   * 선택된 장소
   */
  selectedLocation?: Location | null;
  /**
   * 저장된 장소 목록 (마커는 map_love.png)
   */
  savedLocations?: SavedLocation[];
}

export function MapView({
  searchResults = [],
  selectedLocation = null,
  savedLocations = [],
}: MapViewProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const savedMarkersRef = useRef<maplibregl.Marker[]>([]);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const setModalDetailRef = useRef<((detail: ModalDetail) => void) | null>(null);
  const [modalDetail, setModalDetail] = useState<ModalDetail>(null);
  const [saveLocation, setSaveLocation] = useState<Location | null>(null);
  const [isSaveComplete, setIsSaveComplete] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const { location } = useLocationStore();
  const isInitializedRef = useRef(false);

  setModalDetailRef.current = setModalDetail;

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

    // 지도가 로드된 후 초기화 완료 표시 (저장된 장소 마커 effect가 다시 실행되도록 state 갱신)
    mapRef.current.on("load", () => {
      isInitializedRef.current = true;
      setIsMapReady(true);
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
      savedMarkersRef.current.forEach((marker) => {
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
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      savedMarkersRef.current.forEach((marker) => marker.remove());
      savedMarkersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      isInitializedRef.current = false;
      setIsMapReady(false);
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
        setModalDetailRef.current?.({ type: "search", location: loc });
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
      setModalDetailRef.current?.({ type: "search", location: selectedLocation });
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

  // 저장된 장소 마커 (map_love.png) — 지도 로드 완료(isMapReady) 후 또는 savedLocations 변경 시 실행
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current || !savedLocations?.length) {
      savedMarkersRef.current.forEach((m) => m.remove());
      savedMarkersRef.current = [];
      return;
    }

    savedMarkersRef.current.forEach((marker) => marker.remove());
    savedMarkersRef.current = [];

    const map = mapRef.current;
    const scale = getMarkerScale(map.getZoom());
    const iconUrl = MARKER_ICONS.saved;

    savedLocations.forEach((item) => {
      const lng = Number(item.longitude);
      const lat = Number(item.latitude);
      const el = document.createElement("div");
      el.className = "marker";
      applyMarkerSize(el, scale);
      el.style.backgroundImage = `url(${iconUrl})`;
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundPosition = "center";
      el.style.cursor = "pointer";

      el.addEventListener("click", () => {
        setModalDetailRef.current?.({ type: "saved", location: item });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lng, lat])
        .addTo(map);
      savedMarkersRef.current.push(marker);
    });
  }, [savedLocations, isMapReady]);

  return (
    <>
      <div className="relative w-full h-full" style={{ width: "100%", height: "100%" }}>
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        {!isMapReady && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/20 backdrop-blur-md"
            aria-hidden={isMapReady}
          >
            <Spinner size="lg" />
          </div>
        )}
      </div>
      {modalDetail && (
        <LocationDetailModal
          detail={modalDetail}
          onClose={() => setModalDetail(null)}
          onSave={
            modalDetail.type === "search"
              ? () => {
                  setSaveLocation(modalDetail.location);
                  setModalDetail(null);
                }
              : undefined
          }
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
