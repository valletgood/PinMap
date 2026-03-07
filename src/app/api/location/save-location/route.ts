import { type NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { savedLocation } from "@/db/schema";
import { successResponse, errorResponse, ErrorCode } from "@/lib/api-response";
import { verifyToken } from "@/lib/jwt";

/**
 * 장소 저장 API
 * POST /api/location/save-location
 *
 * Body: latitude, longitude, title, roadAddress?, rating, images?, category, review?, link?
 * 인증: 쿠키 auth_token (필수)
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return errorResponse(ErrorCode.UNAUTHORIZED, "로그인이 필요합니다.");
    }

    const body = await request.json();
    const { latitude, longitude, title, roadAddress, rating, images, category, review, link } =
      body;

    if (
      latitude == null ||
      longitude == null ||
      !title ||
      typeof title !== "string" ||
      title.trim() === ""
    ) {
      return errorResponse(ErrorCode.BAD_REQUEST, "위도, 경도, 장소 제목은 필수입니다.");
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return errorResponse(ErrorCode.BAD_REQUEST, "위도와 경도는 숫자여야 합니다.");
    }

    if (!category || typeof category !== "string" || category.trim() === "") {
      return errorResponse(ErrorCode.BAD_REQUEST, "카테고리는 필수입니다.");
    }

    const ratingNum = rating != null ? Number(rating) : 0;
    const safeRating =
      Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5 ? 0 : Math.round(ratingNum);

    const imageList = Array.isArray(images)
      ? images.filter((u): u is string => typeof u === "string")
      : [];

    const [inserted] = await db
      .insert(savedLocation)
      .values({
        userId: payload.userUuid,
        latitude: lat,
        longitude: lng,
        title: title.trim(),
        roadAddress:
          roadAddress != null && typeof roadAddress === "string"
            ? roadAddress.trim() || undefined
            : undefined,
        rating: safeRating,
        images: imageList,
        category: category.trim(),
        review:
          review != null && typeof review === "string" && review.trim() ? review.trim() : undefined,
        link: link != null && typeof link === "string" && link.trim() ? link.trim() : undefined,
      })
      .returning({ id: savedLocation.id });

    return successResponse("장소가 저장되었습니다.", {
      id: inserted?.id,
    });
  } catch (error) {
    console.error("장소 저장 API 오류:", error);
    return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, "장소 저장에 실패했습니다.");
  }
}

/**
 * 저장된 장소 목록 조회 API
 * GET /api/location/save-location
 * 인증: 쿠키 auth_token (필수)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return errorResponse(ErrorCode.UNAUTHORIZED, "로그인이 필요합니다.");
    }

    const list = await db
      .select()
      .from(savedLocation)
      .where(eq(savedLocation.userId, payload.userUuid))
      .orderBy(desc(savedLocation.createdAt));

    return successResponse("저장된 장소 목록입니다.", list);
  } catch (error) {
    console.error("장소 조회 API 오류:", error);
    return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, "장소 조회에 실패했습니다.");
  }
}
