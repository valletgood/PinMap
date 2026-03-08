import { type NextRequest } from "next/server";
import { successResponse, errorResponse, ErrorCode } from "@/lib/api-response";
import { verifyToken } from "@/lib/jwt";
import {
  getSupabaseAdmin,
  STORAGE_BUCKET_LOCATION_IMAGES,
  getStoragePublicUrl,
} from "@/lib/supabase-server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function getFileExtension(name: string): string {
  const last = name.lastIndexOf(".");
  return last >= 0 ? name.slice(last) : ".jpg";
}

/**
 * 이미지 업로드 API (서버에서 Storage에 업로드, RLS 우회)
 * POST /api/location/upload-image
 * Body: FormData, key "images" (multiple files)
 * 인증: 쿠키 auth_token (필수)
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return errorResponse(ErrorCode.UNAUTHORIZED, "로그인이 필요합니다.");
    }

    const userUuid = payload.userUuid;
    if (!userUuid || typeof userUuid !== "string") {
      return errorResponse(
        ErrorCode.UNAUTHORIZED,
        "토큰에 사용자 정보가 없습니다. 다시 로그인해 주세요."
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("images");
    const fileList = Array.isArray(files) ? files : [files];
    const validFiles = fileList.filter((f): f is File => f instanceof File);

    if (validFiles.length === 0) {
      return errorResponse(ErrorCode.BAD_REQUEST, "이미지 파일이 없습니다.");
    }

    for (const file of validFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(
          ErrorCode.BAD_REQUEST,
          `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB 이하여야 합니다.`
        );
      }
      const type = file.type || "";
      if (!ALLOWED_TYPES.includes(type)) {
        return errorResponse(
          ErrorCode.BAD_REQUEST,
          "JPEG, PNG, GIF, WebP 이미지만 업로드 가능합니다."
        );
      }
    }

    const supabaseAdmin = getSupabaseAdmin();
    const prefix = `${userUuid}/${Date.now()}`;
    const urls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const ext = getFileExtension(file.name) || ".jpg";
      const path = `${prefix}-${i}${ext}`;

      const buffer = await file.arrayBuffer();
      const { error: uploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET_LOCATION_IMAGES)
        .upload(path, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage 업로드 오류:", uploadError);
        return errorResponse(
          ErrorCode.INTERNAL_SERVER_ERROR,
          uploadError.message || "이미지 업로드에 실패했습니다."
        );
      }

      urls.push(getStoragePublicUrl(STORAGE_BUCKET_LOCATION_IMAGES, path));
    }

    return successResponse("이미지가 업로드되었습니다.", { urls });
  } catch (error) {
    console.error("이미지 업로드 API 오류:", error);
    return errorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      "이미지 업로드 처리 중 오류가 발생했습니다."
    );
  }
}
