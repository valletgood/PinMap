"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLocationStore } from "@/stores/locationStore";

export function MapView() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { location } = useLocationStore();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!key) {
      console.error("NEXT_PUBLIC_MAPTILER_KEY가 없습니다.");
      return;
    }

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${key}`, // MapTiler 스타일 URL :contentReference[oaicite:2]{index=2}
      center: [location?.lng || 0, location?.lat || 0],
      zoom: 16,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      interactive: true,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // cleanup
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
