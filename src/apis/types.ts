import type { AxiosResponse } from "axios";

/**
 * API 응답을 정규화하는 함수
 *
 * @param rawData - Axios 응답 객체
 * @returns 정규화된 데이터
 */
export function normalizeResponse<T>(rawData: AxiosResponse<T>): T {
  return rawData.data;
}
