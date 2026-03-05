"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { MapView } from "@/components/map/MapView";
import { Header } from "@/components/ui/Header";
import { FloatingSearchBar } from "@/components/ui/FloatingSearchBar";
import { useSearchLocation } from "@/apis/location/hooks";
import { useState } from "react";
import { Location } from "@/apis/location/types";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const { data: searchLocationData, isFetching } = useSearchLocation(
    searchQuery,
    !!searchQuery
  );

  const handleSearch = (query: string) => {
    // 검색 로직 구현
    console.log("검색어:", query);
  };

  const handleSearchSubmit = (query: string) => {
    // 검색 제출 로직 구현
    setSearchQuery(query);
    setSelectedLocation(null);
  };

  const handleLocationSelect = (location: Location) => {
    // 장소 선택 로직 구현
    console.log("선택된 장소:", location);
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
          onSearch={handleSearch}
          onSubmit={handleSearchSubmit}
          searchResults={searchLocationData?.items || []}
          onLocationSelect={handleLocationSelect}
          isFetching={isFetching}
        />
        <MapView
          searchResults={searchLocationData?.items || []}
          selectedLocation={selectedLocation}
        />
      </div>
    </AuthGuard>
  );
}
