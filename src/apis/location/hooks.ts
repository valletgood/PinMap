import { useQuery, useMutation } from "@tanstack/react-query";
import { locationApi } from "./service";
import type { NewSavedLocation } from "@/db/schema";

export const useSearchLocation = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ["location", "search", query],
    queryFn: async () => {
      const response = await locationApi.getLocationSearch(query);
      return response;
    },
    enabled: enabled && !!query, // id가 있을 때만 쿼리 실행
  });
};

export const useSavedLocations = (enabled = true) => {
  return useQuery({
    queryKey: ["location", "saved"],
    queryFn: async () => locationApi.getSavedLocations(),
    enabled,
  });
};

export const useSaveLocation = () => {
  return useMutation({
    mutationFn: (data: NewSavedLocation) => locationApi.saveLocation(data),
  });
};

export const useUploadLocationImages = () => {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const response = await locationApi.saveImage(files);
      if (response.error !== 0) {
        throw new Error(response.message ?? "이미지 업로드에 실패했습니다.");
      }
      return response.data?.urls ?? [];
    },
  });
};

export const useDeleteLocation = () => {
  return useMutation({
    mutationFn: (id: string) => locationApi.deleteLocation(id),
  });
};

export const useEditLocation = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: Parameters<typeof locationApi.editLocation>[1];
    }) => locationApi.editLocation(id, data),
  });
};
