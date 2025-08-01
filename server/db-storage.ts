import { 
  type JournalEntry, 
  type InsertJournalEntry, 
  type ChildProfile, 
  type InsertChildProfile, 
  type ParentProfile, 
  type InsertParentProfile,
  type Family,
  type InsertFamily,
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityComment,
  type InsertCommunityComment,
  type User,
  type InsertUser,
  type UserNotificationSettings,
  type InsertUserNotificationSettings
} from "@shared/schema";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  private currentUserId?: string;
  private currentUserFamilyId?: string;

  // Set current user context for data isolation
  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
    // We'll lazy-load the family ID when needed
    this.currentUserFamilyId = undefined;
  }

  private async getCurrentUserFamilyId(): Promise<string | undefined> {
    if (!this.currentUserId) return undefined;
    
    if (!this.currentUserFamilyId) {
      const user = await db.select().from(schema.users).where(eq(schema.users.id, this.currentUserId));
      this.currentUserFamilyId = user[0]?.familyId || undefined;
    }
    
    return this.currentUserFamilyId;
  }

  // Journal entries with user isolation
  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    const familyId = await this.getCurrentUserFamilyId();
    if (!familyId) return undefined;
    
    const result = await db.select().from(schema.journalEntries)
      .where(and(
        eq(schema.journalEntries.id, id),
        eq(schema.journalEntries.familyId, familyId)
      ));
    return result[0];
  }

  async getJournalEntries(limit?: number, search?: string, childId?: string): Promise<JournalEntry[]> {
    const familyId = await this.getCurrentUserFamilyId();
    if (!familyId) return [];

    const conditions = [eq(schema.journalEntries.familyId, familyId)];
    
    if (childId) {
      conditions.push(eq(schema.journalEntries.childProfileId, childId));
    }
    
    if (search) {
      conditions.push(sql`${schema.journalEntries.content} ILIKE ${'%' + search + '%'}`);
    }
    
    let query = db.select().from(schema.journalEntries).where(and(...conditions))
      .orderBy(desc(schema.journalEntries.createdAt));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const result = await db.insert(schema.journalEntries).values(entry).returning();
    return result[0];
  }

  async updateJournalEntry(id: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const familyId = await this.getCurrentUserFamilyId();
    if (!familyId) return undefined;

    const result = await db.update(schema.journalEntries)
      .set(updates)
      .where(and(
        eq(schema.journalEntries.id, id),
        eq(schema.journalEntries.familyId, familyId)
      ))
      .returning();
    return result[0];
  }

  async updateJournalEntryFavorite(id: string, isFavorite: boolean): Promise<JournalEntry | undefined> {
    const familyId = await this.getCurrentUserFamilyId();
    if (!familyId) return undefined;

    const result = await db.update(schema.journalEntries)
      .set({ isFavorite: isFavorite ? "true" : "false" })
      .where(and(
        eq(schema.journalEntries.id, id),
        eq(schema.journalEntries.familyId, familyId)
      ))
      .returning();
    return result[0];
  }

  async deleteJournalEntry(id: string): Promise<boolean> {
    const familyId = await this.getCurrentUserFamilyId();
    if (!familyId) return false;

    const result = await db.delete(schema.journalEntries)
      .where(and(
        eq(schema.journalEntries.id, id),
        eq(schema.journalEntries.familyId, familyId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  async getJournalStats(): Promise<{
    totalEntries: number;
    weekEntries: number;
    longestStreak: number;
  }> {
    const familyId = await this.getCurrentUserFamilyId();
    if (!familyId) return { totalEntries: 0, weekEntries: 0, longestStreak: 0 };

    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.journalEntries)
      .where(eq(schema.journalEntries.familyId, familyId));
    const totalEntries = totalResult[0]?.count || 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.journalEntries)
      .where(and(
        eq(schema.journalEntries.familyId, familyId),
        gte(schema.journalEntries.createdAt, weekAgo)
      ));
    const weekEntries = weekResult[0]?.count || 0;

    // Calculate longest streak - for now just return 0 if no entries
    const longestStreak = totalEntries > 0 ? 1 : 0;

    return {
      totalEntries,
      weekEntries,
      longestStreak,
    };
  }

  async getMoodAnalytics(): Promise<{
    moodDistribution: { mood: string; count: number; percentage: number }[];
    moodTrends: { date: string; mood: string; count: number }[];
    weeklyMoodAverage: number;
    moodStreak: { currentMood: string | null; streakDays: number };
  }> {
    const familyId = await this.getCurrentUserFamilyId();
    if (!familyId) {
      return {
        moodDistribution: [],
        moodTrends: [],
        weeklyMoodAverage: 0,
        moodStreak: { currentMood: null, streakDays: 0 },
      };
    }

    // Get mood data only for the current user's family
    const entries = await db.select()
      .from(schema.journalEntries)
      .where(and(
        eq(schema.journalEntries.familyId, familyId),
        sql`${schema.journalEntries.mood} IS NOT NULL`
      ))
      .orderBy(desc(schema.journalEntries.createdAt));

    // Process mood data for analytics
    return {
      moodDistribution: [],
      moodTrends: [],
      weeklyMoodAverage: 0,
      moodStreak: { currentMood: null, streakDays: 0 },
    };
  }

  // Child profiles with user isolation
  async getChildProfile(id: string): Promise<ChildProfile | undefined> {
    const familyId = await this.getCurrentUserFamilyId();
    if (!familyId) return undefined;
    
    const result = await db.select().from(schema.childProfiles)
      .where(and(
        eq(schema.childProfiles.id, id),
        eq(schema.childProfiles.familyId, familyId)
      ));
    return result[0];
  }

  async getChildProfiles(): Promise<ChildProfile[]> {
    const familyId = await this.getCurrentUserFamilyId();
    if (!familyId) return [];
    
    return await db.select().from(schema.childProfiles)
      .where(eq(schema.childProfiles.familyId, familyId))
      .orderBy(desc(schema.childProfiles.createdAt));
  }

  async createChildProfile(profile: InsertChildProfile): Promise<ChildProfile> {
    const result = await db.insert(schema.childProfiles).values(profile).returning();
    return result[0];
  }

  async updateChildProfile(id: string, updates: Partial<InsertChildProfile>): Promise<ChildProfile | undefined> {
    const result = await db.update(schema.childProfiles)
      .set(updates)
      .where(eq(schema.childProfiles.id, id))
      .returning();
    return result[0];
  }

  async deleteChildProfile(id: string): Promise<boolean> {
    try {
      // First, update any journal entries that reference this child to remove the reference
      await db.update(schema.journalEntries)
        .set({ childProfileId: null })
        .where(eq(schema.journalEntries.childProfileId, id));
      
      // Then delete the child profile
      const result = await db.delete(schema.childProfiles).where(eq(schema.childProfiles.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting child profile:', error);
      throw error;
    }
  }

  // Family management
  async createFamily(family: InsertFamily): Promise<Family> {
    const result = await db.insert(schema.families).values(family).returning();
    return result[0];
  }

  async getFamily(id: string): Promise<Family | undefined> {
    const result = await db.select().from(schema.families).where(eq(schema.families.id, id));
    return result[0];
  }

  // Parent profiles
  async getParentProfile(): Promise<ParentProfile | undefined> {
    const familyId = await this.getCurrentUserFamilyId();
    if (!familyId) return undefined;
    
    const result = await db.select().from(schema.parentProfiles)
      .where(eq(schema.parentProfiles.familyId, familyId))
      .limit(1);
    return result[0];
  }

  async getParentProfiles(familyId?: string): Promise<ParentProfile[]> {
    if (familyId) {
      return await db.select().from(schema.parentProfiles)
        .where(eq(schema.parentProfiles.familyId, familyId))
        .orderBy(desc(schema.parentProfiles.createdAt));
    }
    
    return await db.select().from(schema.parentProfiles)
      .orderBy(desc(schema.parentProfiles.createdAt));
  }

  async createParentProfile(profile: InsertParentProfile): Promise<ParentProfile> {
    const result = await db.insert(schema.parentProfiles).values(profile).returning();
    return result[0];
  }

  async updateParentProfile(updates: Partial<InsertParentProfile>): Promise<ParentProfile | undefined> {
    const existing = await this.getParentProfile();
    if (!existing) return undefined;
    
    const result = await db.update(schema.parentProfiles)
      .set(updates)
      .where(eq(schema.parentProfiles.id, existing.id))
      .returning();
    return result[0];
  }

  // Community posts
  async getCommunityPosts(): Promise<CommunityPost[]> {
    return await db.select().from(schema.communityPosts).orderBy(desc(schema.communityPosts.createdAt));
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const result = await db.insert(schema.communityPosts).values(post).returning();
    return result[0];
  }

  async getCommunityComments(postId: string): Promise<CommunityComment[]> {
    return await db.select().from(schema.communityComments)
      .where(eq(schema.communityComments.postId, postId))
      .orderBy(schema.communityComments.createdAt);
  }

  async createCommunityComment(comment: InsertCommunityComment): Promise<CommunityComment> {
    const result = await db.insert(schema.communityComments).values(comment).returning();
    return result[0];
  }

  // Users
  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async getUserByEmailOrUsername(identifier: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users)
      .where(sql`${schema.users.email} = ${identifier} OR ${schema.users.username} = ${identifier}`);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  async updateUserEmail(id: string, email: string): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set({ email, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  // Notification settings methods
  async getUserNotificationSettings(userId: string): Promise<UserNotificationSettings | undefined> {
    const result = await db.select().from(schema.userNotificationSettings)
      .where(eq(schema.userNotificationSettings.userId, userId));
    return result[0];
  }

  async createUserNotificationSettings(settings: InsertUserNotificationSettings): Promise<UserNotificationSettings> {
    const result = await db.insert(schema.userNotificationSettings).values(settings).returning();
    return result[0];
  }

  async updateUserNotificationSettings(userId: string, updates: Partial<InsertUserNotificationSettings>): Promise<UserNotificationSettings | undefined> {
    const result = await db.update(schema.userNotificationSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.userNotificationSettings.userId, userId))
      .returning();
    return result[0];
  }

  async deleteUserNotificationSettings(userId: string): Promise<boolean> {
    const result = await db.delete(schema.userNotificationSettings)
      .where(eq(schema.userNotificationSettings.userId, userId));
    return (result.rowCount ?? 0) > 0;
  }
}