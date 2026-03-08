import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MapStyleState {
  /** 지도 다크 모드 여부 */
  mapDarkMode: boolean;
  toggleMapDarkMode: () => void;
}

export const useMapStyleStore = create<MapStyleState>()(
  persist(
    (set) => ({
      mapDarkMode: false,
      toggleMapDarkMode: () =>
        set((state) => ({ mapDarkMode: !state.mapDarkMode })),
    }),
    { name: "map-style-storage" }
  )
);
