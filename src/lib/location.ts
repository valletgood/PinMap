/**
 * 위치 좌표 타입
 */
export interface MapCenter {
  lat: number;
  lng: number;
}

/**
 * 현재 위치를 가져오는 유틸 함수
 *
 * Geolocation API를 사용하여 사용자의 현재 위치를 가져옵니다.
 * 위치 정보를 가져올 수 없는 경우 기본 위치(서울)를 반환합니다.
 *
 * @returns Promise<MapCenter> - 현재 위치 좌표 또는 기본 위치(서울)
 *
 * @example
 * ```tsx
 * const location = await handleCurrentLocation();
 * console.log(location); // { lat: 37.5665, lng: 126.978 }
 * ```
 */
export const handleCurrentLocation = async (): Promise<MapCenter> => {
  // Geolocation API를 지원하지 않는 경우
  if (typeof window === "undefined" || !navigator.geolocation) {
    // eslint-disable-next-line no-console
    console.warn("Geolocation을 지원하지 않는 브라우저입니다.");
    return {
      lat: 37.5665,
      lng: 126.978,
    };
  }

  // Promise로 래핑하여 async/await 사용 가능하게 만들기
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      // 성공 콜백
      (position) => {
        const location: MapCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // eslint-disable-next-line no-console
        console.log("현재 위치:", location);
        resolve(location);
      },
      // 에러 콜백
      (error) => {
        // eslint-disable-next-line no-console
        console.error("위치 가져오기 실패:", error.message);

        // 에러 발생 시 기본 위치(서울) 반환
        const defaultLocation: MapCenter = {
          lat: 37.5665,
          lng: 126.978,
        };

        // 에러 타입별 처리
        switch (error.code) {
          case error.PERMISSION_DENIED:
            // eslint-disable-next-line no-console
            console.warn(
              "사용자가 위치 권한을 거부했습니다. 기본 위치(서울)로 설정합니다."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            // eslint-disable-next-line no-console
            console.warn(
              "위치 정보를 사용할 수 없습니다. 기본 위치(서울)로 설정합니다."
            );
            break;
          case error.TIMEOUT:
            // eslint-disable-next-line no-console
            console.warn(
              "위치 정보 요청 시간이 초과되었습니다. 기본 위치(서울)로 설정합니다."
            );
            break;
          default:
            // eslint-disable-next-line no-console
            console.warn(
              "알 수 없는 오류가 발생했습니다. 기본 위치(서울)로 설정합니다."
            );
            break;
        }

        resolve(defaultLocation);
      },
      {
        // 옵션: 정확도와 타임아웃 설정
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000, // 1분간 캐시된 위치 사용
      }
    );
  });
};
