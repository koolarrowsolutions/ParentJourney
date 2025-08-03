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
import { eq, desc, asc, and, gte, lte, sql } from "drizzle-orm";
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

    // Join with child_profiles to ensure proper family filtering
    let baseQuery = db.select({
      id: schema.journalEntries.id,
      familyId: schema.journalEntries.familyId,
      title: schema.journalEntries.title,
      content: schema.journalEntries.content,
      mood: schema.journalEntries.mood,
      aiAnalyzedMood: schema.journalEntries.aiAnalyzedMood,
      emotionTags: schema.journalEntries.emotionTags,
      childProfileId: schema.journalEntries.childProfileId,
      aiFeedback: schema.journalEntries.aiFeedback,
      developmentalInsight: schema.journalEntries.developmentalInsight,
      hasAiFeedback: schema.journalEntries.hasAiFeedback,
      photos: schema.journalEntries.photos,
      dailyCheckIn: schema.journalEntries.dailyCheckIn,
      isFavorite: schema.journalEntries.isFavorite,
      calmResetUsed: schema.journalEntries.calmResetUsed,
      entryType: schema.journalEntries.entryType,
      createdAt: schema.journalEntries.createdAt
    })
    .from(schema.journalEntries)
    .leftJoin(schema.childProfiles, eq(schema.journalEntries.childProfileId, schema.childProfiles.id));

    const conditions = [
      eq(schema.journalEntries.familyId, familyId)
    ];
    
    if (childId) {
      conditions.push(eq(schema.journalEntries.childProfileId, childId));
    }
    
    if (search) {
      conditions.push(sql`${schema.journalEntries.content} ILIKE ${'%' + search + '%'}`);
    }
    
    let query = baseQuery.where(and(...conditions))
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
    weekSharedJourneys: number;
    weekQuickMoments: number;
  }> {
    console.log("Getting journal stats - current user ID:", this.currentUserId);
    const familyId = await this.getCurrentUserFamilyId();
    console.log("Family ID for stats:", familyId);
    if (!familyId) return { totalEntries: 0, weekEntries: 0, longestStreak: 0, weekSharedJourneys: 0, weekQuickMoments: 0 };

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

    // Calculate weekly shared journeys (entries that are 'shared_journey' or have no entryType - backward compatibility)
    const weekSharedJourneysResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.journalEntries)
      .where(and(
        eq(schema.journalEntries.familyId, familyId),
        gte(schema.journalEntries.createdAt, weekAgo),
        sql`(${schema.journalEntries.entryType} = 'shared_journey' OR ${schema.journalEntries.entryType} IS NULL)`
      ));
    const weekSharedJourneys = weekSharedJourneysResult[0]?.count || 0;

    // Calculate weekly quick moments
    const weekQuickMomentsResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.journalEntries)
      .where(and(
        eq(schema.journalEntries.familyId, familyId),
        gte(schema.journalEntries.createdAt, weekAgo),
        eq(schema.journalEntries.entryType, 'quick_moment')
      ));
    const weekQuickMoments = weekQuickMomentsResult[0]?.count || 0;

    // Calculate longest streak (consecutive days with entries)
    let longestStreak = 0;
    if (totalEntries > 0) {
      const entries = await db.select({ 
        createdAt: schema.journalEntries.createdAt 
      })
      .from(schema.journalEntries)
      .where(eq(schema.journalEntries.familyId, familyId))
      .orderBy(asc(schema.journalEntries.createdAt));

      // Group entries by date and calculate streak
      const entryDates = Array.from(new Set(
        entries.map(e => new Date(e.createdAt).toDateString())
      )).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      let currentStreak = 0;
      let lastDate: Date | null = null;

      for (const dateStr of entryDates) {
        const entryDate = new Date(dateStr);
        
        if (lastDate) {
          const dayDiff = Math.floor((entryDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            currentStreak++;
          } else if (dayDiff > 1) {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        
        lastDate = entryDate;
      }
      
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    return {
      totalEntries,
      weekEntries,
      longestStreak,
      weekSharedJourneys,
      weekQuickMoments,
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
    const familyId = await this.getCurrentUserFamilyId();
    if (!familyId) return undefined;
    
    const result = await db.update(schema.childProfiles)
      .set(updates)
      .where(and(
        eq(schema.childProfiles.id, id),
        eq(schema.childProfiles.familyId, familyId)
      ))
      .returning();
    return result[0];
  }

  async deleteChildProfile(id: string): Promise<boolean> {
    try {
      const familyId = await this.getCurrentUserFamilyId();
      if (!familyId) return false;
      
      // First, update any journal entries that reference this child to remove the reference
      await db.update(schema.journalEntries)
        .set({ childProfileId: null })
        .where(eq(schema.journalEntries.childProfileId, id));
      
      // Then delete the child profile (only if it belongs to current user's family)
      const result = await db.delete(schema.childProfiles)
        .where(and(
          eq(schema.childProfiles.id, id),
          eq(schema.childProfiles.familyId, familyId)
        ));
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

  // Admin methods
  async getAllUsers(searchTerm?: string): Promise<User[]> {
    if (searchTerm) {
      return await db.select().from(schema.users)
        .where(sql`${schema.users.username} ILIKE ${'%' + searchTerm + '%'} OR ${schema.users.email} ILIKE ${'%' + searchTerm + '%'} OR ${schema.users.name} ILIKE ${'%' + searchTerm + '%'}`)
        .orderBy(desc(schema.users.createdAt));
    }
    return await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    newUsersThisMonth: number;
    churnRate: number;
  }> {
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // For now, return demo stats since we don't have subscription schema
    return {
      totalUsers,
      activeSubscriptions: 0,
      monthlyRevenue: 0,
      newUsersThisMonth: 0,
      churnRate: 0,
    };
  }

  async grantFreeAccess(userId: string, months: number): Promise<User | undefined> {
    // For now, just update the user's updatedAt field as a placeholder
    // In a real implementation, you'd update subscription fields
    const result = await db.update(schema.users)
      .set({ updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    return result[0];
  }

  async addAdminNote(userId: string, note: string): Promise<User | undefined> {
    // For now, just update the user's updatedAt field as a placeholder
    // In a real implementation, you'd have an admin notes field or separate table
    const result = await db.update(schema.users)
      .set({ updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    return result[0];
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    // For now, just update the user's updatedAt field as a placeholder
    // In a real implementation, you'd have a role field
    const result = await db.update(schema.users)
      .set({ updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    return result[0];
  }

  async updateUserSubscriptionStatus(userId: string, status: string, endDate?: Date): Promise<User | undefined> {
    // For now, just update the user's updatedAt field as a placeholder
    // In a real implementation, you'd have subscription status fields
    const result = await db.update(schema.users)
      .set({ updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    return result[0];
  }

  async getUserByProvider(provider: string, providerId: string): Promise<User | undefined> {
    // For now, return undefined since we don't have provider fields in the schema
    // In a real implementation, you'd have provider and providerId fields
    return undefined;
  }
}