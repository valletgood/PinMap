"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLocationStore } from "@/stores/locationStore";
import { useMapStyleStore } from "@/stores/mapStyleStore";
import { type Location } from "@/apis/location/types";
import type { SavedLocation } from "@/db/schema";
import { LocationDetailModal, type ModalDetail } from "./LocationDetailModal";
import { SaveLocationModal } from "./SaveLocationModal";
import { EditLocationModal } from "./EditLocationModal";
import { CompleteModal } from "../modal/CompleteModal";
import { Spinner } from "@/components/ui/Spinner";
import {
  applyScaleToMarkers,
  createFlyToOptions,
  createMarkerElement,
  DEFAULT_MAP_CENTER,
  FLY_TO_DURATION_SLOW,
  FLY_TO_ZOOM,
  getMapStyleUrl,
  getSearchMarkerIconUrl,
  getSavedMarkerIconUrl,
  getMarkerScale,
  findSavedMatch,
  getModalDetailForLocation,
} from "@/lib/mapUtil";

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
   * 저장된 장소 목록 (마커는 map_favorite.svg, 다크모드에 따라 별 색상)
   */
  savedLocations?: SavedLocation[];
  /**
   * 저장 목록 패널에서 선택한 장소 (지도 flyTo + 모달 오픈 후 클리어)
   */
  savedLocationToOpen?: SavedLocation | null;
  /**
   * savedLocationToOpen 처리 후 호출 (상위에서 state 클리어용)
   */
  onClearedSavedLocationToOpen?: () => void;
  /**
   * 내 위치로 이동 트리거 (값이 바뀔 때마다 현재 위치로 flyTo)
   */
  flyToMyLocationTrigger?: number;
}

export function MapView({
  searchResults = [],
  selectedLocation = null,
  savedLocations = [],
  savedLocationToOpen = null,
  onClearedSavedLocationToOpen,
  flyToMyLocationTrigger,
}: MapViewProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const savedMarkersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const userLocationRef = useRef<{ lng: number; lat: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const setModalDetailRef = useRef<((detail: ModalDetail) => void) | null>(null);
  const [modalDetail, setModalDetail] = useState<ModalDetail>(null);
  const [saveLocation, setSaveLocation] = useState<Location | null>(null);
  const [editingSavedLocation, setEditingSavedLocation] = useState<SavedLocation | null>(null);
  const [isSaveComplete, setIsSaveComplete] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const { location } = useLocationStore();
  const { mapDarkMode } = useMapStyleStore();
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
      : DEFAULT_MAP_CENTER;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyleUrl(key, mapDarkMode),
      center: initialCenter,
      zoom: FLY_TO_ZOOM,
      pitch: 40,
      bearing: 0,
      attributionControl: false,
      interactive: true,
    });

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
      const scale = getMarkerScale(map.getZoom());
      applyScaleToMarkers(markersRef.current, scale);
      applyScaleToMarkers(savedMarkersRef.current, scale);
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
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      isInitializedRef.current = false;
      setIsMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 지도 다크 모드 토글 시 스타일만 변경
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!key || !mapRef.current || !isInitializedRef.current) return;
    mapRef.current.setStyle(getMapStyleUrl(key, mapDarkMode));
  }, [mapDarkMode]);

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
    mapRef.current.flyTo(
      createFlyToOptions([location.lng, location.lat], { duration: FLY_TO_DURATION_SLOW })
    );
  }, [location]);

  // 검색 결과에 마커 추가
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // 검색 결과가 없으면 종료
    if (!searchResults || searchResults.length === 0) return;

    const map = mapRef.current!;
    const scale = getMarkerScale(map.getZoom());

    // 검색 결과: 저장된 장소 → map_favorite(별 색상은 다크모드에 따라), 그 외 → map_default_white/black
    searchResults.forEach((loc) => {
      const lng = Number(loc.mapx) / 1e7;
      const lat = Number(loc.mapy) / 1e7;
      const isSaved = !!findSavedMatch(loc, savedLocations);
      const iconUrl = isSaved ? getSavedMarkerIconUrl() : getSearchMarkerIconUrl();

      const el = createMarkerElement({
        iconUrl,
        scale,
        onClick: () => {
          mapRef.current?.flyTo(createFlyToOptions([lng, lat]));
          setModalDetailRef.current?.(getModalDetailForLocation(loc, savedLocations));
        },
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lng, lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [searchResults, savedLocations]);

  // 검색 목록에서 장소 선택 시 해당 장소로 이동 + 모달을 저장/검색 타입에 맞게 오픈
  useEffect(() => {
    if (!selectedLocation) return;
    setModalDetail(getModalDetailForLocation(selectedLocation, savedLocations));
  }, [selectedLocation, savedLocations]);

  useEffect(() => {
    if (!mapRef.current || !selectedLocation || !isInitializedRef.current) return;

    const map = mapRef.current;
    const lng = Number(selectedLocation.mapx) / 1e7;
    const lat = Number(selectedLocation.mapy) / 1e7;
    const iconUrl = findSavedMatch(selectedLocation, savedLocations)
      ? getSavedMarkerIconUrl()
      : getSearchMarkerIconUrl();

    map.flyTo(createFlyToOptions([lng, lat]));

    const el = createMarkerElement({
      iconUrl,
      scale: getMarkerScale(map.getZoom()),
      onClick: () => {
        mapRef.current?.flyTo(createFlyToOptions([lng, lat]));
        setModalDetailRef.current?.(getModalDetailForLocation(selectedLocation, savedLocations));
      },
    });

    const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([lng, lat])
      .addTo(map);
    markersRef.current.push(marker);
  }, [selectedLocation, savedLocations]);

  // 저장된 장소 마커 (map_favorite.svg) — 지도 로드 완료(isMapReady) 후 또는 savedLocations 변경 시 실행
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
    const iconUrl = getSavedMarkerIconUrl();

    savedLocations.forEach((item) => {
      const lng = Number(item.longitude);
      const lat = Number(item.latitude);
      const el = createMarkerElement({
        iconUrl,
        scale,
        onClick: () => {
          map.flyTo(createFlyToOptions([lng, lat]));
          setModalDetailRef.current?.({ type: "saved", location: item });
        },
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lng, lat])
        .addTo(map);
      savedMarkersRef.current.push(marker);
    });
  }, [savedLocations, isMapReady]);

  // 실시간 현재 위치 마커
  useEffect(() => {
    if (!isMapReady) return;

    const createUserMarkerEl = () => {
      const el = document.createElement("div");
      el.style.width = "72px";
      el.style.height = "72px";
      el.style.backgroundImage = "url(/icons/ico_user.svg)";
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundPosition = "center";
      return el;
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        userLocationRef.current = { lng, lat };

        if (!mapRef.current) return;
        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat([lng, lat]);
        } else {
          userMarkerRef.current = new maplibregl.Marker({ element: createUserMarkerEl(), anchor: "center" })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);
        }
      },
      (err) => console.warn("geolocation error", err),
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      userLocationRef.current = null;
    };
  }, [isMapReady]);

  // 내 위치로 이동 트리거
  useEffect(() => {
    if (!flyToMyLocationTrigger || !mapRef.current || !isInitializedRef.current) return;
    const pos = userLocationRef.current;
    if (!pos) return;
    mapRef.current.flyTo(
      createFlyToOptions([pos.lng, pos.lat], { duration: FLY_TO_DURATION_SLOW })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyToMyLocationTrigger]);

  // 저장 목록 패널에서 장소 선택 시: 해당 좌표로 flyTo 후 saved 모달 오픈
  useEffect(() => {
    if (!savedLocationToOpen || !mapRef.current || !isInitializedRef.current) return;
    const lng = Number(savedLocationToOpen.longitude);
    const lat = Number(savedLocationToOpen.latitude);
    mapRef.current.flyTo(createFlyToOptions([lng, lat]));
    setModalDetail({ type: "saved", location: savedLocationToOpen });
    onClearedSavedLocationToOpen?.();
  }, [savedLocationToOpen, onClearedSavedLocationToOpen]);

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
          onEdit={
            modalDetail.type === "saved"
              ? (item) => {
                  setEditingSavedLocation(item);
                  setModalDetail(null);
                }
              : undefined
          }
        />
      )}
      {editingSavedLocation && (
        <EditLocationModal
          savedLocation={editingSavedLocation}
          onClose={() => setEditingSavedLocation(null)}
          onComplete={() => setEditingSavedLocation(null)}
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
