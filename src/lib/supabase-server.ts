import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedAdmin: SupabaseClient | null = null;

/**
 * 서버 전용 Supabase 클라이언트 (RLS 우회). API Route 등에서만 사용.
 * 첫 호출 시에만 환경 변수를 검사하므로, 빌드 시 모듈 로드만으로는 에러가 나지 않음.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 환경 변수가 필요합니다."
    );
  }
  cachedAdmin = createClient(supabaseUrl, serviceRoleKey);
  return cachedAdmin;
}

export const STORAGE_BUCKET_LOCATION_IMAGES = "location-images";

/** Storage 공개 URL (경로에 /public/ 포함) */
export function getStoragePublicUrl(bucket: string, path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
