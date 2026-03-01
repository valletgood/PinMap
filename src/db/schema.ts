import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// 예시 스키마 - 프로젝트에 맞게 수정하세요
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
