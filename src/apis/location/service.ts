import { ApiResponse } from "@/lib/api-response";
import { axiosInstance } from "../axios";
import { Location } from "./types";
import { normalizeResponse } from "../types";

/**
 * Location API
 * 위치 관련 API 엔드포인트
 */
export interface LocationSearchResult {
  items: Location[];
  total: number;
}

export const locationApi = {
  getLocationSearch: async (query: string): Promise<LocationSearchResult> => {
    const response = await axiosInstance.get<ApiResponse<LocationSearchResult>>(
      `/api/location/location-list?query=${encodeURIComponent(query)}`
    );
    return normalizeResponse<ApiResponse<LocationSearchResult>>(response).data!;
  },
};
