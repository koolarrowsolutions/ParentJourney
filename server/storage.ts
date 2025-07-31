import { type JournalEntry, type InsertJournalEntry, type ChildProfile, type InsertChildProfile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Journal entries
  getJournalEntry(id: string): Promise<JournalEntry | undefined>;
  getJournalEntries(limit?: number, search?: string, childId?: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: string): Promise<boolean>;
  getJournalStats(): Promise<{
    totalEntries: number;
    weekEntries: number;
    longestStreak: number;
  }>;
  getMoodAnalytics(): Promise<{
    moodDistribution: { mood: string; count: number; percentage: number }[];
    moodTrends: { date: string; mood: string; count: number }[];
    weeklyMoodAverage: number;
    moodStreak: { currentMood: string | null; streakDays: number };
  }>;
  
  // Child profiles
  getChildProfile(id: string): Promise<ChildProfile | undefined>;
  getChildProfiles(): Promise<ChildProfile[]>;
  createChildProfile(profile: InsertChildProfile): Promise<ChildProfile>;
  updateChildProfile(id: string, updates: Partial<InsertChildProfile>): Promise<ChildProfile | undefined>;
  deleteChildProfile(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private journalEntries: Map<string, JournalEntry>;
  private childProfiles: Map<string, ChildProfile>;

  constructor() {
    this.journalEntries = new Map();
    this.childProfiles = new Map();
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async getJournalEntries(limit = 10, search?: string, childId?: string): Promise<JournalEntry[]> {
    let entries = Array.from(this.journalEntries.values());
    
    // Apply child filter if provided
    if (childId && childId.trim()) {
      entries = entries.filter(entry => entry.childProfileId === childId);
    }
    
    // Apply search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      entries = entries.filter(entry => {
        const titleMatch = entry.title?.toLowerCase().includes(searchTerm) || false;
        const contentMatch = entry.content.toLowerCase().includes(searchTerm);
        const moodMatch = entry.mood?.toLowerCase().includes(searchTerm) || false;
        
        return titleMatch || contentMatch || moodMatch;
      });
    }
    
    // Sort by creation date (newest first)
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return entries.slice(0, limit);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = randomUUID();
    const entry: JournalEntry = {
      ...insertEntry,
      title: insertEntry.title ?? null,
      mood: insertEntry.mood ?? null,
      childProfileId: insertEntry.childProfileId ?? null,
      aiFeedback: insertEntry.aiFeedback ?? null,
      developmentalInsight: insertEntry.developmentalInsight ?? null,
      hasAiFeedback: insertEntry.hasAiFeedback ?? "false",
      photos: insertEntry.photos ?? null,
      id,
      createdAt: new Date(),
    };
    
    this.journalEntries.set(id, entry);
    return entry;
  }

  async updateJournalEntry(id: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const existing = this.journalEntries.get(id);
    if (!existing) return undefined;

    const updated: JournalEntry = {
      ...existing,
      ...updates,
    };

    this.journalEntries.set(id, updated);
    return updated;
  }

  async deleteJournalEntry(id: string): Promise<boolean> {
    return this.journalEntries.delete(id);
  }

  async getJournalStats(): Promise<{
    totalEntries: number;
    weekEntries: number;
    longestStreak: number;
  }> {
    const entries = Array.from(this.journalEntries.values())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const totalEntries = entries.length;
    
    // Calculate entries from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekEntries = entries.filter(entry => 
      new Date(entry.createdAt) >= oneWeekAgo
    ).length;

    // Calculate longest streak (simplified - consecutive days with entries)
    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const entry of entries) {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);

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
    const entries = Array.from(this.journalEntries.values());
    const entriesWithMood = entries.filter(entry => entry.mood);
    
    if (entriesWithMood.length === 0) {
      return {
        moodDistribution: [],
        moodTrends: [],
        weeklyMoodAverage: 0,
        moodStreak: { currentMood: null, streakDays: 0 },
      };
    }

    // Mood distribution
    const moodCounts = new Map<string, number>();
    entriesWithMood.forEach(entry => {
      const mood = entry.mood!;
      moodCounts.set(mood, (moodCounts.get(mood) || 0) + 1);
    });

    const moodDistribution = Array.from(moodCounts.entries()).map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / entriesWithMood.length) * 100),
    }));

    // Mood trends (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentEntries = entriesWithMood.filter(entry => 
      new Date(entry.createdAt) >= thirtyDaysAgo
    );

    const trendMap = new Map<string, Map<string, number>>();
    recentEntries.forEach(entry => {
      const dateKey = new Date(entry.createdAt).toISOString().split('T')[0];
      const mood = entry.mood!;
      
      if (!trendMap.has(dateKey)) {
        trendMap.set(dateKey, new Map());
      }
      const dayMoods = trendMap.get(dateKey)!;
      dayMoods.set(mood, (dayMoods.get(mood) || 0) + 1);
    });

    const moodTrends: { date: string; mood: string; count: number }[] = [];
    trendMap.forEach((moods, date) => {
      moods.forEach((count, mood) => {
        moodTrends.push({ date, mood, count });
      });
    });

    // Weekly mood average (simplified - count positive vs negative moods)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyEntries = entriesWithMood.filter(entry => 
      new Date(entry.createdAt) >= weekAgo
    );
    
    const positiveMoods = ['😊', '😄', '🥰', '😌', '🤗'];
    const positiveCount = weeklyEntries.filter(entry => 
      positiveMoods.includes(entry.mood!)
    ).length;
    
    const weeklyMoodAverage = weeklyEntries.length > 0 
      ? Math.round((positiveCount / weeklyEntries.length) * 100)
      : 0;

    // Mood streak (consecutive days with same mood)
    const sortedEntries = entriesWithMood
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    let currentMood = sortedEntries[0]?.mood || null;
    let streakDays = 0;
    
    if (currentMood) {
      const entriesByDate = new Map<string, string>();
      sortedEntries.forEach(entry => {
        const dateKey = new Date(entry.createdAt).toDateString();
        if (!entriesByDate.has(dateKey)) {
          entriesByDate.set(dateKey, entry.mood!);
        }
      });
      
      const dates = Array.from(entriesByDate.keys()).sort().reverse();
      for (const date of dates) {
        if (entriesByDate.get(date) === currentMood) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    return {
      moodDistribution,
      moodTrends,
      weeklyMoodAverage,
      moodStreak: { currentMood, streakDays },
    };
  }

  // Child profile methods
  async getChildProfile(id: string): Promise<ChildProfile | undefined> {
    return this.childProfiles.get(id);
  }

  async getChildProfiles(): Promise<ChildProfile[]> {
    return Array.from(this.childProfiles.values())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createChildProfile(insertProfile: InsertChildProfile): Promise<ChildProfile> {
    const id = randomUUID();
    const profile: ChildProfile = {
      ...insertProfile,
      pronouns: insertProfile.pronouns ?? null,
      gender: insertProfile.gender ?? null,
      developmentalStage: insertProfile.developmentalStage ?? null,
      notes: insertProfile.notes ?? null,
      personalityTraits: insertProfile.personalityTraits ?? null,
      id,
      createdAt: new Date(),
    };
    
    this.childProfiles.set(id, profile);
    return profile;
  }

  async updateChildProfile(id: string, updates: Partial<InsertChildProfile>): Promise<ChildProfile | undefined> {
    const existing = this.childProfiles.get(id);
    if (!existing) return undefined;

    const updated: ChildProfile = {
      ...existing,
      ...updates,
    };

    this.childProfiles.set(id, updated);
    return updated;
  }

  async deleteChildProfile(id: string): Promise<boolean> {
    return this.childProfiles.delete(id);
  }
}

export const storage = new MemStorage();
