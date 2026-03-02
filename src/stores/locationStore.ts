import { MapCenter } from "@/lib/location";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
  location: MapCenter | null;
  setLocation: (location: MapCenter) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: null,
      setLocation: (location: MapCenter) => {
        set({ location });
      },
    }),
    {
      name: "location-storage",
      partialize: (state: LocationState) => ({
        location: state.location,
      }),
    }
  )
);
