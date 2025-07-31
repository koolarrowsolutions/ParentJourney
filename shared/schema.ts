import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const childProfiles = pgTable("child_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  pronouns: text("pronouns"), // Added pronouns field
  gender: text("gender"), // optional: "male", "female", "other", or null
  developmentalStage: text("developmental_stage"), // Added developmental stage
  notes: text("notes"),
  personalityTraits: text("personality_traits").array(), // array of selected personality trait keys
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title"),
  content: text("content").notNull(),
  mood: text("mood"),
  childProfileId: varchar("child_profile_id").references(() => childProfiles.id),
  aiFeedback: text("ai_feedback"),
  developmentalInsight: text("developmental_insight"),
  hasAiFeedback: text("has_ai_feedback").notNull().default("false"),
  photos: text("photos").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChildProfileSchema = createInsertSchema(childProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const journalEntryWithAiSchema = insertJournalEntrySchema.extend({
  requestAiFeedback: z.boolean().default(false),
});

export type InsertChildProfile = z.infer<typeof insertChildProfileSchema>;
export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntryWithAi = z.infer<typeof journalEntryWithAiSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
