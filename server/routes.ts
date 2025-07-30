import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { journalEntryWithAiSchema } from "@shared/schema";
import { generateParentingFeedback } from "./services/openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get journal entries
  app.get("/api/journal-entries", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const entries = await storage.getJournalEntries(limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  // Get a single journal entry
  app.get("/api/journal-entries/:id", async (req, res) => {
    try {
      const entry = await storage.getJournalEntry(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  // Create a new journal entry
  app.post("/api/journal-entries", async (req, res) => {
    try {
      const validatedData = journalEntryWithAiSchema.parse(req.body);
      const { requestAiFeedback, ...entryData } = validatedData;

      // Create the entry first
      let aiFeedback = null;
      let hasAiFeedback = "false";

      if (requestAiFeedback) {
        try {
          const feedback = await generateParentingFeedback(
            entryData.title ?? null,
            entryData.content,
            entryData.mood ?? null
          );
          
          aiFeedback = `**Validation:** ${feedback.validation}

**Suggestion:** ${feedback.suggestion}

**Growth:** ${feedback.growth}

**Summary:** ${feedback.summary}`;
          hasAiFeedback = "true";
        } catch (aiError) {
          console.error("AI feedback generation failed:", aiError);
          // Continue without AI feedback rather than failing the entire request
        }
      }

      const entry = await storage.createJournalEntry({
        ...entryData,
        aiFeedback,
        hasAiFeedback,
      });

      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating journal entry:", error);
        res.status(500).json({ message: "Failed to create journal entry" });
      }
    }
  });

  // Get journal statistics
  app.get("/api/journal-stats", async (req, res) => {
    try {
      const stats = await storage.getJournalStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
