import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  uniqueIndex("users_username_idx").on(table.username),
  uniqueIndex("users_email_idx").on(table.email),
]);

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("sessions_user_idx").on(table.userId)]);

export const verdicts = sqliteTable("verdicts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  caseNumber: text("case_number").notNull(),
  story: text("story").notNull(),
  title: text("title").notNull(),
  orderText: text("order_text").notNull(),
  mood: text("mood").notNull(),
  score: integer("score").notNull(),
  outcome: text("outcome").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("verdicts_user_created_idx").on(table.userId, table.createdAt),
]);
