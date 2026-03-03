import { useQuery } from "@tanstack/react-query";
import { locationApi } from "./service";

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
