import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url?.trim()) {
  throw new Error("DATABASE_URL이 비어 있습니다. Vercel 환경 변수에 DB 연결 URI를 설정하세요.");
}

const client = postgres(url.trim(), {
  max: 1,
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

export const db = drizzle(client, { schema });
