"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { MapView } from "@/components/map/MapView";
import { FloatingSearchBar } from "@/components/ui/FloatingSearchBar";
import { SavedListPanel } from "@/components/ui/SavedListPanel";
import { SettingsTrigger } from "@/components/ui/SettingsTrigger";
import { Button } from "@/components/ui/Button";
import { useSearchLocation, useSavedLocations } from "@/apis/location/hooks";
import { useState, useCallback } from "react";
import { type Location } from "@/apis/location/types";
import type { SavedLocation } from "@/db/schema";
import { useMapStyleStore } from "@/stores/mapStyleStore";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSavedListOpen, setIsSavedListOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [savedLocationToOpen, setSavedLocationToOpen] = useState<SavedLocation | null>(null);
  const [flyToMyLocationTrigger, setFlyToMyLocationTrigger] = useState(0);
  const { mapDarkMode } = useMapStyleStore();

  const { data: searchLocationData, isFetching } = useSearchLocation(searchQuery, !!searchQuery);
  const { data: savedLocations } = useSavedLocations(true);
  const savedList = savedLocations?.data ?? [];

  const handleSearchSubmit = (query: string) => {
    // 검색 제출 로직 구현
    setSearchQuery(query);
    setSelectedLocation(null);
  };

  const handleLocationSelect = (location: Location | null) => {
    setSearchQuery("");
    setSelectedLocation(location);
  };

  const handleClearedSavedLocationToOpen = useCallback(() => {
    setSavedLocationToOpen(null);
  }, []);

  return (
    <AuthGuard>
      <div
        className="relative h-full min-h-screen overflow-hidden"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* <Header /> */}
        <FloatingSearchBar
          placeholder="맛집을 검색하세요"
          onSubmit={handleSearchSubmit}
          searchResults={searchLocationData?.items || []}
          savedLocations={savedList}
          onLocationSelect={handleLocationSelect}
          isFetching={isFetching}
        />
        <MapView
          searchResults={searchLocationData?.items || []}
          selectedLocation={selectedLocation}
          savedLocations={savedList}
          savedLocationToOpen={savedLocationToOpen}
          onClearedSavedLocationToOpen={handleClearedSavedLocationToOpen}
          flyToMyLocationTrigger={flyToMyLocationTrigger}
        />
        <SavedListPanel
          savedLocations={savedList}
          isOpen={isSavedListOpen}
          onOpen={() => {
            setIsSavedListOpen(true);
            setIsSettingsOpen(false);
          }}
          onClose={() => setIsSavedListOpen(false)}
          onSelectItem={(item) => {
            setSavedLocationToOpen(item);
            setIsSavedListOpen(false);
          }}
        />
        <Button
          variant="ghost"
          onClick={() => setFlyToMyLocationTrigger((n) => n + 1)}
          className={[
            "fixed bottom-6 left-4 z-40 h-12 w-12 flex items-center justify-center rounded-full shadow-lg p-0 backdrop-blur-md border active:scale-95",
            "focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none",
            mapDarkMode
              ? "bg-black/60 border-black hover:bg-black/70 active:bg-black/80 text-[#a89ce8] hover:bg-black/70"
              : "bg-white/60 border-white/50 hover:bg-white/80 active:bg-white/90 text-[#6f62cb]",
          ].join(" ")}
          aria-label="내 위치로 이동"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L4 20l.8-.4L12 17l7.2 2.6.8.4L12 2z" />
          </svg>
        </Button>
        <SettingsTrigger
          isOpen={isSettingsOpen}
          onOpen={() => {
            setIsSettingsOpen(true);
            setIsSavedListOpen(false);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </AuthGuard>
  );
}
