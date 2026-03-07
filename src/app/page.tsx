"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { MapView } from "@/components/map/MapView";
import { FloatingSearchBar } from "@/components/ui/FloatingSearchBar";
import { SavedListPanel } from "@/components/ui/SavedListPanel";
import { useSearchLocation, useSavedLocations } from "@/apis/location/hooks";
import { useState, useCallback } from "react";
import { type Location } from "@/apis/location/types";
import type { SavedLocation } from "@/db/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSavedListOpen, setIsSavedListOpen] = useState(false);
  const [savedLocationToOpen, setSavedLocationToOpen] = useState<SavedLocation | null>(null);

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
        />
        <SavedListPanel
          savedLocations={savedList}
          isOpen={isSavedListOpen}
          onOpen={() => setIsSavedListOpen(true)}
          onClose={() => setIsSavedListOpen(false)}
          onSelectItem={(item) => {
            setSavedLocationToOpen(item);
            setIsSavedListOpen(false);
          }}
        />
      </div>
    </AuthGuard>
  );
}
