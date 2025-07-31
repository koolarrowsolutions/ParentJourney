import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertJournalEntrySchema, 
  journalEntryWithAiSchema, 
  insertChildProfileSchema, 
  insertParentProfileSchema, 
  insertFamilySchema,
  insertCommunityPostSchema,
  insertCommunityCommentSchema
} from "@shared/schema";
import { generateParentingFeedback, analyzeMood } from "./services/openai";
import { generateDevelopmentalInsight, calculateAgeInMonths } from "./services/developmental-insights";
import { z, ZodError } from "zod";

// Configure session
function configureSession(app: Express) {
  app.use(require('express-session')({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
  }));
}

// Simple OAuth routes (will need actual keys to work)
function setupOAuthRoutes(app: Express) {
  // Google OAuth
  app.get('/auth/google', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }
    // Redirect to Google OAuth
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&scope=email profile&response_type=code`;
    res.redirect(googleAuthUrl);
  });

  app.get('/auth/google/callback', (req, res) => {
    // Mark user as signed up and redirect
    req.session.hasJustSignedUp = true;
    res.send(`<script>window.close();</script>`);
  });

  // Facebook OAuth
  app.get('/auth/facebook', (req, res) => {
    if (!process.env.FACEBOOK_APP_ID) {
      return res.status(500).json({ error: 'Facebook OAuth not configured' });
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/facebook/callback`;
    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=email`;
    res.redirect(facebookAuthUrl);
  });

  app.get('/auth/facebook/callback', (req, res) => {
    req.session.hasJustSignedUp = true;
    res.send(`<script>window.close();</script>`);
  });

  // GitHub OAuth
  app.get('/auth/github', (req, res) => {
    if (!process.env.GITHUB_CLIENT_ID) {
      return res.status(500).json({ error: 'GitHub OAuth not configured' });
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/github/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
    res.redirect(githubAuthUrl);
  });

  app.get('/auth/github/callback', (req, res) => {
    req.session.hasJustSignedUp = true;
    res.send(`<script>window.close();</script>`);
  });

  // Twitter OAuth
  app.get('/auth/twitter', (req, res) => {
    if (!process.env.TWITTER_CLIENT_ID) {
      return res.status(500).json({ error: 'Twitter OAuth not configured' });
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/twitter/callback`;
    const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${redirectUri}&scope=tweet.read users.read`;
    res.redirect(twitterAuthUrl);
  });

  app.get('/auth/twitter/callback', (req, res) => {
    req.session.hasJustSignedUp = true;
    res.send(`<script>window.close();</script>`);
  });

  // Logout
  app.get('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      res.redirect('/');
    });
  });

  // Check auth status
  app.get('/auth/user', (req, res) => {
    if (req.session.hasJustSignedUp) {
      res.json({ hasJustSignedUp: true });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session and OAuth
  configureSession(app);
  setupOAuthRoutes(app);
  // Get journal entries
  app.get("/api/journal-entries", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string;
      const childId = req.query.childId as string;
      const entries = await storage.getJournalEntries(limit, search, childId);
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

  // Update journal entry favorite status
  app.patch("/api/journal-entries/:id/favorite", async (req, res) => {
    try {
      const { isFavorite } = req.body;
      const entry = await storage.updateJournalEntryFavorite(req.params.id, isFavorite);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update favorite status" });
    }
  });

  // Create a new journal entry
  app.post("/api/journal-entries", async (req, res) => {
    try {
      const validatedData = journalEntryWithAiSchema.parse(req.body);
      const { requestAiFeedback, ...entryData } = validatedData;

      // Create the entry first
      let aiFeedback = null;
      let developmentalInsight = null;
      let hasAiFeedback = "false";
      let aiAnalyzedMood = null;

      // Always analyze mood using AI (for mood trends)
      try {
        aiAnalyzedMood = await analyzeMood(entryData.content);
      } catch (error) {
        console.error("Failed to analyze mood:", error);
        // Continue without mood analysis
      }

      // Generate developmental insight if child profile is selected
      if (entryData.childProfileId) {
        try {
          const childProfile = await storage.getChildProfile(entryData.childProfileId);
          if (childProfile) {
            const ageInMonths = calculateAgeInMonths(new Date(childProfile.dateOfBirth));
            developmentalInsight = generateDevelopmentalInsight(ageInMonths, childProfile.personalityTraits || []);
          }
        } catch (error) {
          console.error("Failed to generate developmental insight:", error);
        }
      }

      if (requestAiFeedback) {
        try {
          let childAge: number | undefined;
          let childTraits: string[] | undefined;
          
          if (entryData.childProfileId) {
            const childProfile = await storage.getChildProfile(entryData.childProfileId);
            if (childProfile) {
              childAge = calculateAgeInMonths(new Date(childProfile.dateOfBirth));
              childTraits = childProfile.personalityTraits || [];
            }
          }
          
          const feedback = await generateParentingFeedback(
            entryData.title ?? null,
            entryData.content,
            entryData.mood ?? null,
            childAge,
            childTraits
          );
          
          aiFeedback = `**Encouragement:** ${feedback.encouragement}

**Insight:** ${feedback.insight}

**Suggestion:** ${feedback.suggestion}`;
          hasAiFeedback = "true";
        } catch (aiError) {
          console.error("AI feedback generation failed:", aiError);
          // Continue without AI feedback rather than failing the entire request
        }
      }

      const entry = await storage.createJournalEntry({
        ...entryData,
        aiFeedback,
        developmentalInsight,
        hasAiFeedback,
        aiAnalyzedMood,
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

  // Get mood analytics
  app.get("/api/mood-analytics", async (req, res) => {
    try {
      const analytics = await storage.getMoodAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mood analytics" });
    }
  });

  // Update journal entry
  app.patch("/api/journal-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertJournalEntrySchema.partial().parse(req.body);
      
      const updatedEntry = await storage.updateJournalEntry(id, updateData);
      if (!updatedEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });

  // Delete journal entry
  app.delete("/api/journal-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteJournalEntry(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.json({ message: "Journal entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Child profile routes
  app.get("/api/child-profiles", async (req, res) => {
    try {
      const profiles = await storage.getChildProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch child profiles" });
    }
  });

  app.get("/api/child-profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getChildProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Child profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch child profile" });
    }
  });

  app.post("/api/child-profiles", async (req, res) => {
    try {
      const validatedData = insertChildProfileSchema.parse(req.body);
      const profile = await storage.createChildProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating child profile:", error);
        res.status(500).json({ message: "Failed to create child profile" });
      }
    }
  });

  app.put("/api/child-profiles/:id", async (req, res) => {
    try {
      const validatedData = insertChildProfileSchema.partial().parse(req.body);
      const profile = await storage.updateChildProfile(req.params.id, validatedData);
      if (!profile) {
        return res.status(404).json({ message: "Child profile not found" });
      }
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error updating child profile:", error);
        res.status(500).json({ message: "Failed to update child profile" });
      }
    }
  });

  app.delete("/api/child-profiles/:id", async (req, res) => {
    try {
      const success = await storage.deleteChildProfile(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Child profile not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting child profile:", error);
      res.status(500).json({ message: "Failed to delete child profile" });
    }
  });

  // Family routes
  app.post("/api/families", async (req, res) => {
    try {
      const validatedData = insertFamilySchema.parse(req.body);
      const family = await storage.createFamily(validatedData);
      res.status(201).json(family);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating family:", error);
        res.status(500).json({ message: "Failed to create family" });
      }
    }
  });

  app.get("/api/families/:id", async (req, res) => {
    try {
      const family = await storage.getFamily(req.params.id);
      if (!family) {
        return res.status(404).json({ message: "Family not found" });
      }
      res.json(family);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch family" });
    }
  });

  // Parent profile routes
  app.get("/api/parent-profiles", async (req, res) => {
    try {
      const familyId = req.query.familyId as string;
      const profiles = await storage.getParentProfiles(familyId);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parent profiles" });
    }
  });

  app.post("/api/parent-profiles", async (req, res) => {
    try {
      const validatedData = insertParentProfileSchema.parse(req.body);
      const profile = await storage.createParentProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating parent profile:", error);
        res.status(500).json({ message: "Failed to create parent profile" });
      }
    }
  });

  // Community routes
  app.get("/api/community/posts", async (req, res) => {
    try {
      const posts = await storage.getCommunityPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.post("/api/community/posts", async (req, res) => {
    try {
      const validatedData = insertCommunityPostSchema.parse(req.body);
      const post = await storage.createCommunityPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating community post:", error);
        res.status(500).json({ message: "Failed to create community post" });
      }
    }
  });

  app.get("/api/community/posts/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommunityComments(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/community/posts/:id/comments", async (req, res) => {
    try {
      const commentData = { ...req.body, postId: req.params.id };
      const validatedData = insertCommunityCommentSchema.parse(commentData);
      const comment = await storage.createCommunityComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Failed to create comment" });
      }
    }
  });

  // Parenting chatbot endpoint
  app.post("/api/parenting-chat", async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Check if OpenAI key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured",
          reply: "I'm sorry, but I'm not properly configured right now. Please ask the administrator to set up the OpenAI API key."
        });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Build conversation context
      const messages = [
        {
          role: "system" as const,
          content: `You are a knowledgeable and supportive AI parenting assistant. You specialize in:

- Child development stages and milestones (0-18 years)
- Behavioral challenges and positive discipline strategies
- Different parenting styles and techniques
- Sleep, feeding, and routine guidance
- Age-appropriate activities and learning
- Social and emotional development
- Managing difficult behaviors (tantrums, defiance, etc.)
- Sibling relationships and family dynamics
- Safety and health considerations
- Supporting parent well-being and self-care

Guidelines for your responses:
- Be warm, empathetic, and non-judgmental
- Provide practical, evidence-based advice
- Acknowledge that every child and family is unique
- Suggest when professional help might be beneficial
- Keep responses concise but comprehensive
- Use encouraging, supportive language
- Never provide medical advice - refer to healthcare providers when appropriate
- Respect different parenting philosophies while prioritizing child well-being

Remember: You're supporting parents who are doing their best. Validate their efforts while providing helpful guidance.`
        }
      ];

      // Add conversation history for context (last 10 messages)
      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.slice(-10).forEach((msg: any) => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({
              role: msg.role as "user" | "assistant",
              content: msg.content
            });
          }
        });
      }

      // Add current message
      messages.push({
        role: "user" as const,
        content: message
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

      res.json({ reply });
    } catch (error) {
      console.error("Parenting chat error:", error);
      res.status(500).json({ 
        error: "Failed to process chat message",
        reply: "I'm experiencing some technical difficulties. Please try again in a moment."
      });
    }
  });

  // Parent profile endpoints
  app.get("/api/parent-profile", async (req, res) => {
    try {
      const profile = await storage.getParentProfile();
      res.json(profile);
    } catch (error) {
      console.error("Failed to fetch parent profile:", error);
      res.status(500).json({ message: "Failed to fetch parent profile" });
    }
  });

  app.post("/api/parent-profile", async (req, res) => {
    try {
      const validatedData = insertParentProfileSchema.parse(req.body);
      const profile = await storage.createParentProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Failed to create parent profile:", error);
      res.status(500).json({ message: "Failed to create parent profile" });
    }
  });

  app.patch("/api/parent-profile", async (req, res) => {
    try {
      const updates = req.body;
      const profile = await storage.updateParentProfile(updates);
      if (!profile) {
        return res.status(404).json({ message: "Parent profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Failed to update parent profile:", error);
      res.status(500).json({ message: "Failed to update parent profile" });
    }
  });

  // OpenAI Text-to-Speech endpoint
  app.post('/api/text-to-speech', async (req, res) => {
    try {
      const { text, voice = 'nova' } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice,
          response_format: 'mp3'
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      });
      
      res.send(Buffer.from(audioBuffer));
      
    } catch (error) {
      console.error('Text-to-speech error:', error);
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
