import { createClient } from "@supabase/supabase-js";

// 클라이언트(브라우저)에서 사용하므로 NEXT_PUBLIC_ 접두사 필수
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 필요합니다."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET_LOCATION_IMAGES = "location-images";
