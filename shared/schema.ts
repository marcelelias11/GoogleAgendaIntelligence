import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela de usuários
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  googleId: text("google_id"),
  googleRefreshToken: text("google_refresh_token"),
  googleAccessToken: text("google_access_token"),
  googleTokenExpiry: timestamp("google_token_expiry", { mode: 'string' }),
  picture: text("picture"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

// Tabela de conversas com o assistente
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

// Tabela de mensagens
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  content: text("content").notNull(),
  role: text("role").notNull(),
  timestamp: timestamp("timestamp", { mode: 'string' }).defaultNow(),
});

// Tabela de eventos do calendário salvos localmente
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  googleEventId: text("google_event_id"),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: timestamp("start_time", { mode: 'string' }).notNull(),
  endTime: timestamp("end_time", { mode: 'string' }).notNull(),
  calendarId: text("calendar_id"),
  allDay: boolean("all_day").default(false),
  reminders: jsonb("reminders"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

// Tabela de calendários do usuário
export const calendars = pgTable("calendars", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  googleCalendarId: text("google_calendar_id").notNull(),
  name: text("name").notNull(),
  color: text("color"),
  selected: boolean("selected").default(true),
});

// Esquemas de inserção
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertCalendarSchema = createInsertSchema(calendars).omit({
  id: true,
});

// Tipos
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertCalendar = z.infer<typeof insertCalendarSchema>;
export type Calendar = typeof calendars.$inferSelect;
