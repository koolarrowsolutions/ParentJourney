import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const families = pgTable("families", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parentProfiles = pgTable("parent_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").references(() => families.id),
  name: text("name").notNull(),
  age: text("age"),
  relationship: text("relationship"), // Primary, Partner, Co-parent, Guardian
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
  familyId: varchar("family_id").references(() => families.id),
  name: text("name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender"), // optional: "male", "female", "other", or null
  developmentalStage: text("developmental_stage"), // Added developmental stage
  notes: text("notes"),
  personalityTraits: text("personality_traits").array(), // array of selected personality trait keys
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// OAuth Users table for authentication
export const oauthUsers = pgTable("oauth_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: text("provider_id").notNull(),
  provider: text("provider").notNull(), // google, facebook, github, twitter
  email: text("email"),
  name: text("name").notNull(),
  avatar: text("avatar"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  familyId: varchar("family_id").references(() => families.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").references(() => parentProfiles.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"), // General, Advice, Milestone, Support, etc.
  isAnonymous: text("is_anonymous").notNull().default("false"),
  likes: text("likes").array().default([]), // Array of parent IDs who liked
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityComments = pgTable("community_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => communityPosts.id),
  parentId: varchar("parent_id").references(() => parentProfiles.id),
  content: text("content").notNull(),
  isAnonymous: text("is_anonymous").notNull().default("false"),
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

export const insertFamilySchema = createInsertSchema(families).omit({
  id: true,
  createdAt: true,
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

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityCommentSchema = createInsertSchema(communityComments).omit({
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

export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type Family = typeof families.$inferSelect;
export type InsertParentProfile = z.infer<typeof insertParentProfileSchema>;
export type ParentProfile = typeof parentProfiles.$inferSelect;
export type InsertChildProfile = z.infer<typeof insertChildProfileSchema>;
export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntryWithAi = z.infer<typeof journalEntryWithAiSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;
export type CommunityComment = typeof communityComments.$inferSelect;
export type OAuthUser = typeof oauthUsers.$inferSelect;
export type InsertOAuthUser = typeof oauthUsers.$inferInsert;
