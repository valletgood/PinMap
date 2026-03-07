"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { MapView } from "@/components/map/MapView";
import { FloatingSearchBar } from "@/components/ui/FloatingSearchBar";
import { useSearchLocation, useSavedLocations } from "@/apis/location/hooks";
import { useState } from "react";
import { type Location } from "@/apis/location/types";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const { data: searchLocationData, isFetching } = useSearchLocation(searchQuery, !!searchQuery);
  const { data: savedLocations } = useSavedLocations(true);

  const handleSearchSubmit = (query: string) => {
    // 검색 제출 로직 구현
    setSearchQuery(query);
    setSelectedLocation(null);
  };

  const handleLocationSelect = (location: Location | null) => {
    // 장소 선택 로직 구현
    setSearchQuery("");
    setSelectedLocation(location);
  };

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
          savedLocations={savedLocations?.data ?? []}
          onLocationSelect={handleLocationSelect}
          isFetching={isFetching}
        />
        <MapView
          searchResults={searchLocationData?.items || []}
          selectedLocation={selectedLocation}
          savedLocations={savedLocations?.data || []}
        />
      </div>
    </AuthGuard>
  );
}
