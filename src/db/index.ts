import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Supabase 연결을 위한 PostgreSQL Pool 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  // Supabase 연결 풀링을 위한 추가 옵션
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const db = drizzle(pool, { schema });
