import { NextRequest } from "next/server";
import { successResponse, errorResponse, ErrorCode } from "@/lib/api-response";
import { LocationSearchResponse } from "@/apis/location/types";

/**
 * 네이버 장소 검색 API
 * GET /api/location/location-list?query=검색어
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    // 검색어 유효성 검사
    if (!query || !query.trim()) {
      return errorResponse(ErrorCode.BAD_REQUEST, "검색어를 입력해주세요.");
    }

    // 네이버 API 클라이언트 정보 확인
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return errorResponse(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "네이버 API 설정이 올바르지 않습니다."
      );
    }

    // 네이버 장소 검색 API 호출
    const apiUrl = new URL("https://openapi.naver.com/v1/search/local.json");
    apiUrl.searchParams.set("query", query.trim());
    apiUrl.searchParams.set("display", "10"); // 최대 10개 결과
    console.log(`apiUrl: ${apiUrl.toString()}`);

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return errorResponse(
        ErrorCode.INTERNAL_SERVER_ERROR,
        errorData.errorMessage || "장소 검색에 실패했습니다."
      );
    }

    const data: LocationSearchResponse = await response.json();

    // 네이버 API 응답을 프로젝트 형식에 맞게 변환
    return successResponse("장소 검색이 완료되었습니다.", {
      items: data.items || [],
      total: data.total || 0,
    });
  } catch (error) {
    console.error("장소 검색 API 오류:", error);
    return errorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      "장소 검색 중 오류가 발생했습니다."
    );
  }
}
