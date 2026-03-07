import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  date,
  pgEnum,
  integer,
  doublePrecision,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * 성별 enum 정의
 */
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

/**
 * 사용자 테이블 스키마
 * 회원가입 시 필요한 모든 정보를 저장합니다.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(), // 해시된 비밀번호 저장
  birthDate: date("birth_date"), // 생년월일 (선택사항)
  gender: genderEnum("gender"), // 성별 (선택사항)
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false), // 이용약관 동의 여부
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * 저장한 장소 테이블 스키마
 * 사용자가 저장한 장소 정보(위도·경도·제목·주소·별점·이미지·메모·카테고리·리뷰·바로가기)를 저장합니다.
 */
export const savedLocation = pgTable("saved_location", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  title: text("title").notNull(),
  roadAddress: text("road_address"),
  rating: integer("rating").notNull().default(0),
  images: jsonb("images").$type<string[]>().default([]),
  memo: text("memo"),
  category: text("category").notNull(),
  review: text("review"),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SavedLocation = typeof savedLocation.$inferSelect;
export type NewSavedLocation = typeof savedLocation.$inferInsert;
