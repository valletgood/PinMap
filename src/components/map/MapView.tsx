"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLocationStore } from "@/stores/locationStore";
import { Location } from "@/apis/location/types";

interface MapViewProps {
  /**
   * 검색 결과 목록
   */
  searchResults?: Location[];
}

export function MapView({ searchResults = [] }: MapViewProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const { location } = useLocationStore();
  const isInitializedRef = useRef(false);

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
      style: `https://api.maptiler.com/maps/streets/style.json?key=${key}`,
      center: initialCenter,
      zoom: 16,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      interactive: true,
    });

    mapRef.current.addControl(
      new maplibregl.NavigationControl(),
      "bottom-right"
    );

    // 지도가 로드된 후 초기화 완료 표시
    mapRef.current.on("load", () => {
      isInitializedRef.current = true;
    });

    // cleanup
    return () => {
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
      essential: true, // 사용자 제스처에 의한 이동이어도 애니메이션 실행
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
    const iconUrl = "/icons/map_pin.svg";

    // 각 검색 결과에 마커 추가
    searchResults.forEach((location) => {
      // 네이버 좌표계를 WGS84로 변환
      const lng = Number(location.mapx) / 1e7;
      const lat = Number(location.mapy) / 1e7;

      // 마커 엘리먼트 생성
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "42px";
      el.style.height = "54px";
      el.style.backgroundImage = `url(${iconUrl})`;
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundPosition = "center";
      el.style.cursor = "pointer";

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

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
