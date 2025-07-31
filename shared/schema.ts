import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const parentProfiles = pgTable("parent_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: text("age"),
  pronouns: text("pronouns"),
  parentingStyle: text("parenting_style"), // Authoritative, Permissive, Authoritarian, Uninvolved, etc.
  parentingPhilosophy: text("parenting_philosophy"), // Free-form text about their approach
  personalityTraits: text("personality_traits").array(), // array of selected personality trait keys
  parentingGoals: text("parenting_goals"), // What they hope to achieve as a parent
  stressors: text("stressors").array(), // Common parenting stressors
  supportSystems: text("support_systems"), // Family, friends, professionals, etc.
  notes: text("notes"), // Additional notes about parenting style/preferences
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  aiAnalyzedMood: text("ai_analyzed_mood"), // AI-detected mood for trend analysis
  emotionTags: text("emotion_tags").array(),
  childProfileId: varchar("child_profile_id").references(() => childProfiles.id),
  aiFeedback: text("ai_feedback"),
  developmentalInsight: text("developmental_insight"),
  hasAiFeedback: text("has_ai_feedback").notNull().default("false"),
  photos: text("photos").array(),
  isFavorite: text("is_favorite").notNull().default("false"), // Bookmarking support
  calmResetUsed: text("calm_reset_used").notNull().default("false"), // Track calm reset usage
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertParentProfileSchema = createInsertSchema(parentProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export type InsertParentProfile = z.infer<typeof insertParentProfileSchema>;
export type ParentProfile = typeof parentProfiles.$inferSelect;
export type InsertChildProfile = z.infer<typeof insertChildProfileSchema>;
export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntryWithAi = z.infer<typeof journalEntryWithAiSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
