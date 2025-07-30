import { type JournalEntry, type InsertJournalEntry, type ChildProfile, type InsertChildProfile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Journal entries
  getJournalEntry(id: string): Promise<JournalEntry | undefined>;
  getJournalEntries(limit?: number, search?: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  getJournalStats(): Promise<{
    totalEntries: number;
    weekEntries: number;
    longestStreak: number;
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

  async getJournalEntries(limit = 10, search?: string): Promise<JournalEntry[]> {
    let entries = Array.from(this.journalEntries.values());
    
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
      gender: insertProfile.gender ?? null,
      notes: insertProfile.notes ?? null,
      personalityTraits: insertProfile.personalityTraits ?? [],
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
