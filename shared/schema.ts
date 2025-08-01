import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, jsonb, date } from "drizzle-orm/pg-core";
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
  photoUrl: text("photo_url"), // Profile photo URL from object storage
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
  photoUrl: text("photo_url"), // Profile photo URL from object storage
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  familyId: varchar("family_id").references(() => families.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User notification settings
export const userNotificationSettings = pgTable("user_notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  dailyReminder: text("daily_reminder").notNull().default("false"),
  weeklyProgress: text("weekly_progress").notNull().default("false"),
  reminderTime: text("reminder_time").notNull().default("20:00"),
  notificationEmail: text("notification_email"),
  notificationPhone: text("notification_phone"),
  browserNotifications: text("browser_notifications").notNull().default("false"),
  emailVerified: text("email_verified").notNull().default("false"),
  phoneVerified: text("phone_verified").notNull().default("false"),
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
  familyId: varchar("family_id").references(() => families.id),
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
  dailyCheckIn: json("dailyCheckIn"), // Daily parent wellness check-in data
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserNotificationSettingsSchema = createInsertSchema(userNotificationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserNotificationSettings = typeof userNotificationSettings.$inferSelect;
export type InsertUserNotificationSettings = z.infer<typeof insertUserNotificationSettingsSchema>;
