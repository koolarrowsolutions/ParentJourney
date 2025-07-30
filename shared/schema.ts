import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title"),
  content: text("content").notNull(),
  mood: text("mood"),
  aiFeedback: text("ai_feedback"),
  hasAiFeedback: text("has_ai_feedback").notNull().default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const journalEntryWithAiSchema = insertJournalEntrySchema.extend({
  requestAiFeedback: z.boolean().default(false),
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntryWithAi = z.infer<typeof journalEntryWithAiSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
