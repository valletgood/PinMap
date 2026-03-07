import { type ApiResponse } from "@/lib/api-response";
import { axiosInstance } from "../axios";
import { type Location } from "./types";
import { normalizeResponse } from "../types";
import type { NewSavedLocation, SavedLocation } from "@/db/schema";

/**
 * Location API
 * 위치 관련 API 엔드포인트
 */
export interface LocationSearchResult {
  items: Location[];
  total: number;
}

export const locationApi = {
  /** 저장된 장소 목록 조회 (로그인 사용자) */
  getSavedLocations: async (): Promise<ApiResponse<SavedLocation[]>> => {
    const response = await axiosInstance.get<ApiResponse<SavedLocation[]>>(
      "/api/location/save-location",
      {
        withCredentials: true,
      }
    );
    return normalizeResponse<ApiResponse<SavedLocation[]>>(response);
  },
  getLocationSearch: async (query: string): Promise<LocationSearchResult> => {
    const response = await axiosInstance.get<ApiResponse<LocationSearchResult>>(
      `/api/location/location-list?query=${encodeURIComponent(query)}`
    );
    return normalizeResponse<ApiResponse<LocationSearchResult>>(response).data!;
  },
  saveLocation: async (data: NewSavedLocation): Promise<ApiResponse> => {
    const response = await axiosInstance.post<ApiResponse>(`/api/location/save-location`, data);
    return response.data;
  },
  /** 이미지 파일들을 업로드하고 공개 URL 배열 반환 */
  saveImage: async (files: File[]): Promise<ApiResponse<{ urls: string[] }>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const response = await axiosInstance.post<ApiResponse<{ urls: string[] }>>(
      "/api/location/upload-image",
      formData,
      { withCredentials: true }
    );
    return response.data;
  },
};
