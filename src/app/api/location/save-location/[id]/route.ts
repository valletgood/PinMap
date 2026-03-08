import { type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedLocation, type NewSavedLocation } from "@/db/schema";
import { successResponse, errorResponse, ErrorCode } from "@/lib/api-response";
import { verifyToken } from "@/lib/jwt";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * 저장된 장소 삭제 API
 * DELETE /api/location/save-location/:id
 * 인증: 쿠키 auth_token (필수), 본인 소유만 삭제 가능
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return errorResponse(ErrorCode.UNAUTHORIZED, "로그인이 필요합니다.");
    }

    const { id } = await context.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum) || idNum < 1) {
      return errorResponse(ErrorCode.BAD_REQUEST, "유효하지 않은 장소 id입니다.");
    }

    const deleted = await db
      .delete(savedLocation)
      .where(and(eq(savedLocation.id, idNum), eq(savedLocation.userId, payload.userUuid)))
      .returning({ id: savedLocation.id });

    if (!deleted || deleted.length === 0) {
      return errorResponse(ErrorCode.NOT_FOUND, "해당 장소를 찾을 수 없거나 삭제 권한이 없습니다.");
    }

    return successResponse("장소가 삭제되었습니다.", { id: idNum });
  } catch (error) {
    console.error("장소 삭제 API 오류:", error);
    return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, "장소 삭제에 실패했습니다.");
  }
}

/**
 * 저장된 장소 수정 API
 * PATCH /api/location/save-location/:id
 * Body (전부 선택): title?, roadAddress?, rating?, images?, category?, review?, link?
 * 인증: 쿠키 auth_token (필수), 본인 소유만 수정 가능
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return errorResponse(ErrorCode.UNAUTHORIZED, "로그인이 필요합니다.");
    }

    const { id } = await context.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum) || idNum < 1) {
      return errorResponse(ErrorCode.BAD_REQUEST, "유효하지 않은 장소 id입니다.");
    }

    const body = await request.json().catch(() => ({}));
    if (typeof body !== "object" || body === null) {
      return errorResponse(ErrorCode.BAD_REQUEST, "요청 본문이 올바르지 않습니다.");
    }

    const {
      title,
      roadAddress,
      rating,
      images,
      category,
      review,
      link,
    } = body as Record<string, unknown>;

    const updates: Record<string, unknown> = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return errorResponse(ErrorCode.BAD_REQUEST, "제목은 비어 있을 수 없습니다.");
      }
      updates.title = title.trim();
    }
    if (roadAddress !== undefined) {
      updates.roadAddress =
        roadAddress != null && typeof roadAddress === "string"
          ? roadAddress.trim() || null
          : null;
    }
    if (rating !== undefined) {
      const ratingNum = Number(rating);
      updates.rating =
        Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5
          ? 0
          : Math.round(ratingNum);
    }
    if (images !== undefined) {
      updates.images = Array.isArray(images)
        ? images.filter((u): u is string => typeof u === "string")
        : [];
    }
    if (category !== undefined) {
      if (typeof category !== "string" || category.trim() === "") {
        return errorResponse(ErrorCode.BAD_REQUEST, "카테고리는 비어 있을 수 없습니다.");
      }
      updates.category = category.trim();
    }
    if (review !== undefined) {
      updates.review =
        review != null && typeof review === "string" && review.trim()
          ? review.trim()
          : null;
    }
    if (link !== undefined) {
      updates.link =
        link != null && typeof link === "string" && link.trim() ? link.trim() : null;
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(ErrorCode.BAD_REQUEST, "수정할 필드가 없습니다.");
    }

    const [updated] = await db
      .update(savedLocation)
      .set(updates as Partial<NewSavedLocation>)
      .where(and(eq(savedLocation.id, idNum), eq(savedLocation.userId, payload.userUuid)))
      .returning();

    if (!updated) {
      return errorResponse(ErrorCode.NOT_FOUND, "해당 장소를 찾을 수 없거나 수정 권한이 없습니다.");
    }

    return successResponse("장소가 수정되었습니다.", updated);
  } catch (error) {
    console.error("장소 수정 API 오류:", error);
    return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, "장소 수정에 실패했습니다.");
  }
}
