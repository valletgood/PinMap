import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 환경 변수가 필요합니다."
  );
}

/** 서버 전용 Supabase 클라이언트 (RLS 우회). API Route 등에서만 사용 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export const STORAGE_BUCKET_LOCATION_IMAGES = "location-images";

/** Storage 공개 URL (경로에 /public/ 포함) */
export function getStoragePublicUrl(bucket: string, path: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
