import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  date,
  pgEnum,
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
