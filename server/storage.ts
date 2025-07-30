import { type JournalEntry, type InsertJournalEntry } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getJournalEntry(id: string): Promise<JournalEntry | undefined>;
  getJournalEntries(limit?: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  getJournalStats(): Promise<{
    totalEntries: number;
    weekEntries: number;
    longestStreak: number;
  }>;
}

export class MemStorage implements IStorage {
  private journalEntries: Map<string, JournalEntry>;

  constructor() {
    this.journalEntries = new Map();
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async getJournalEntries(limit = 10): Promise<JournalEntry[]> {
    const entries = Array.from(this.journalEntries.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return entries.slice(0, limit);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = randomUUID();
    const entry: JournalEntry = {
      ...insertEntry,
      title: insertEntry.title ?? null,
      mood: insertEntry.mood ?? null,
      aiFeedback: insertEntry.aiFeedback ?? null,
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
}

export const storage = new MemStorage();
