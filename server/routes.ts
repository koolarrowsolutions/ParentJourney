import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { 
  insertJournalEntrySchema, 
  journalEntryWithAiSchema, 
  insertChildProfileSchema, 
  insertParentProfileSchema, 
  insertFamilySchema,
  insertCommunityPostSchema,
  insertCommunityCommentSchema,
  insertUserSchema
} from "@shared/schema";
import { generateParentingFeedback, analyzeMood, openai } from "./services/openai";
import { generateDevelopmentalInsight, calculateAgeInMonths } from "./services/developmental-insights";
import { z, ZodError } from "zod";

// Configure session
function configureSession(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-for-parenting-journal',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' // Important for cross-origin requests
    },
    name: 'parentjourney.sid' // Custom cookie name
  }));
}

import { setupAuthRoutes } from "./auth-routes";

// Legacy function - now using imported setupAuthRoutes
function setupOldAuthRoutes(app: Express) {
  // Google OAuth
  app.get('/auth/google', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      // For demo purposes, create a demo user directly
      return res.redirect('/auth/google/callback?demo=true');
    }
    // Redirect to Google OAuth
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&scope=email profile&response_type=code`;
    res.redirect(googleAuthUrl);
  });

  app.get('/auth/google/callback', async (req, res) => {
    try {
      // In a real implementation, you'd exchange the auth code for user info
      // For demo purposes, we'll create a dummy user
      const demoUser = await storage.createUser({
        name: 'Google User',
        email: 'user@gmail.com',
        providerId: 'google_demo_' + Date.now(),
        provider: 'google',
        avatar: null,
        accessToken: null,
        refreshToken: null,
        familyId: null
      });
      
      req.session.hasJustSignedUp = true;
      req.session.userId = demoUser.id;
      res.send(`<script>window.close();</script>`);
    } catch (error) {
      console.error('Google auth error:', error);
      res.send(`<script>alert('Authentication failed'); window.close();</script>`);
    }
  });

  // Facebook OAuth
  app.get('/auth/facebook', (req, res) => {
    if (!process.env.FACEBOOK_APP_ID) {
      return res.redirect('/auth/facebook/callback?demo=true');
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/facebook/callback`;
    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=email`;
    res.redirect(facebookAuthUrl);
  });

  app.get('/auth/facebook/callback', async (req, res) => {
    try {
      const demoUser = await storage.createUser({
        name: 'Facebook User',
        email: 'user@facebook.com',
        providerId: 'facebook_demo_' + Date.now(),
        provider: 'facebook',
        avatar: null,
        accessToken: null,
        refreshToken: null,
        familyId: null
      });
      
      req.session.hasJustSignedUp = true;
      req.session.userId = demoUser.id;
      res.send(`<script>window.close();</script>`);
    } catch (error) {
      console.error('Facebook auth error:', error);
      res.send(`<script>alert('Authentication failed'); window.close();</script>`);
    }
  });

  // GitHub OAuth
  app.get('/auth/github', (req, res) => {
    if (!process.env.GITHUB_CLIENT_ID) {
      return res.redirect('/auth/github/callback?demo=true');
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/github/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
    res.redirect(githubAuthUrl);
  });

  app.get('/auth/github/callback', async (req, res) => {
    try {
      const demoUser = await storage.createUser({
        name: 'GitHub User',
        email: 'user@github.com',
        providerId: 'github_demo_' + Date.now(),
        provider: 'github',
        avatar: null,
        accessToken: null,
        refreshToken: null,
        familyId: null
      });
      
      req.session.hasJustSignedUp = true;
      req.session.userId = demoUser.id;
      res.send(`<script>window.close();</script>`);
    } catch (error) {
      console.error('GitHub auth error:', error);
      res.send(`<script>alert('Authentication failed'); window.close();</script>`);
    }
  });

  // Twitter OAuth
  app.get('/auth/twitter', (req, res) => {
    if (!process.env.TWITTER_CLIENT_ID) {
      return res.redirect('/auth/twitter/callback?demo=true');
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/twitter/callback`;
    const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${redirectUri}&scope=tweet.read users.read`;
    res.redirect(twitterAuthUrl);
  });

  app.get('/auth/twitter/callback', async (req, res) => {
    try {
      const demoUser = await storage.createUser({
        name: 'Twitter User',
        email: 'user@twitter.com',
        providerId: 'twitter_demo_' + Date.now(),
        provider: 'twitter',
        avatar: null,
        accessToken: null,
        refreshToken: null,
        familyId: null
      });
      
      req.session.hasJustSignedUp = true;
      req.session.userId = demoUser.id;
      res.send(`<script>window.close();</script>`);
    } catch (error) {
      console.error('Twitter auth error:', error);
      res.send(`<script>alert('Authentication failed'); window.close();</script>`);
    }
  });

  // Logout
  app.get('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      res.redirect('/');
    });
  });

  // Check auth status
  app.get('/auth/user', async (req, res) => {
    if (req.session.userId) {
      // User is authenticated, get their info
      const user = await storage.getUserById(req.session.userId);
      if (user) {
        res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email 
          },
          hasJustSignedUp: req.session.hasJustSignedUp || false
        });
      } else {
        // Session exists but user not found - clear session
        req.session.destroy((err) => {
          res.json({ success: false, user: null });
        });
      }
    } else {
      res.json({ success: false, user: null });
    }
  });

  // Email/Password Authentication Routes
  app.post('/auth/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByProvider('email', email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Create new user with email provider
      const newUser = await storage.createUser({
        name,
        email,
        providerId: email, // Use email as providerId for email accounts
        provider: 'email',
        avatar: null,
        accessToken: null,
        refreshToken: null,
        familyId: null
      });

      // Set session
      req.session.hasJustSignedUp = true;
      req.session.userId = newUser.id;
      
      res.json({ 
        success: true, 
        message: 'Account created successfully',
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  });

  app.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user by email
      const user = await storage.getUserByProvider('email', email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // In a real app, you'd verify the password hash here
      // For now, we'll accept any password for existing email users
      
      // Set session
      req.session.hasJustSignedUp = true;
      req.session.userId = user.id;
      
      res.json({ 
        success: true, 
        message: 'Logged in successfully',
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to log in' });
    }
  });

  // Logout route
  app.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Failed to log out' });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session and OAuth
  configureSession(app);
  setupAuthRoutes(app);
  
  // Add a test route to verify auth is working
  app.get('/api/test-auth', (req, res) => {
    res.json({ session: req.session, userId: req.session?.userId });
  });
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
              role: msg.role,
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

  // AI Analysis routes for comprehensive insights
  app.post("/api/ai-analysis/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const { entries, childProfiles, parentProfile } = req.body;

      if (!["parenting-progress", "child-development", "personalized-tips", "considerations"].includes(type)) {
        return res.status(400).json({ error: "Invalid analysis type" });
      }

      // Generate AI analysis based on type
      const analysis = await generateAIAnalysis(type, entries, childProfiles, parentProfile);
      
      res.json(analysis);
    } catch (error) {
      console.error("AI Analysis error:", error);
      res.status(500).json({ 
        error: "Failed to generate AI analysis",
        fallback: getFallbackAnalysis(req.params.type)
      });
    }
  });

  // Helper functions for AI analysis
  async function generateAIAnalysis(
    type: string, 
    entries: any[], 
    childProfiles: any[], 
    parentProfile: any | null
  ): Promise<any> {
    
    const contextData = {
      entriesCount: entries?.length || 0,
      recentEntries: entries?.slice(0, 5) || [],
      childrenCount: childProfiles?.length || 0,
      parentTraits: parentProfile?.personalityTraits || [],
      parentingStyle: parentProfile?.parentingStyle || "Not specified",
      childAges: childProfiles?.map(child => {
        const age = child.dateOfBirth ? Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
        return { name: child.name, age };
      }) || []
    };

    const prompts = {
      "parenting-progress": `
        Analyze this parent's journey and provide comprehensive progress insights:
        
        Parent Profile: ${JSON.stringify(parentProfile || {})}
        Journal Entries: ${contextData.entriesCount} total entries
        Recent Entries: ${JSON.stringify(contextData.recentEntries.map(e => ({ content: e.content, mood: e.mood, createdAt: e.createdAt })))}
        
        Provide a detailed analysis with:
        1. Progress Overview - Overall assessment of their parenting development
        2. Strengths - 3-4 specific strengths identified from their entries and profile
        3. Growth Areas - 3-4 areas where they could continue developing
        4. Next Steps - Specific actionable recommendations for continued growth
        
        Focus on their emotional intelligence, consistency, self-awareness, and parenting effectiveness.
        Be encouraging and specific, referencing patterns from their actual entries.
      `,
      
      "child-development": `
        Analyze child development patterns based on available data:
        
        Children: ${JSON.stringify(contextData.childAges)}
        Parent Observations: ${contextData.entriesCount} journal entries
        Recent Child-Related Entries: ${JSON.stringify(contextData.recentEntries.filter(e => e.childProfileId).map(e => ({ content: e.content, childName: e.childProfileId })))}
        
        Provide analysis covering:
        1. Development Overview - General assessment of developmental progress
        2. Milestones - Age-appropriate milestones being achieved or approached
        3. Focus Areas - Developmental areas requiring attention or support
        4. Recommendations - Specific activities and approaches to support development
        
        Consider typical developmental stages and provide age-appropriate insights.
        Be supportive and informative, focusing on healthy development patterns.
      `,
      
      "personalized-tips": `
        Generate personalized parenting tips based on this family profile:
        
        Parent: ${JSON.stringify(parentProfile || {})}
        Children: ${JSON.stringify(contextData.childAges)}
        Recent Challenges/Successes: ${JSON.stringify(contextData.recentEntries.map(e => ({ content: e.content, mood: e.mood })))}
        
        Provide 3 specific, actionable tips that include:
        1. Category (Communication, Routine, Connection, Discipline, etc.)
        2. Specific tip/strategy
        3. Reason why this tip is relevant to their situation
        
        Make tips practical, evidence-based, and tailored to their specific family dynamics.
        Consider the parent's personality traits and parenting style.
      `,
      
      "considerations": `
        Suggest three important parenting concepts for reflection:
        
        Current Context: ${JSON.stringify(contextData)}
        Parent Profile: ${JSON.stringify(parentProfile || {})}
        
        Provide 3 thoughtful considerations, each with:
        1. Concept name and clear description
        2. Why this concept matters for parenting effectiveness
        3. How it specifically relates to their current parenting journey
        
        Focus on evidence-based parenting concepts that could enhance their family dynamics.
        Make suggestions thought-provoking and developmentally supportive.
      `
    };

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert parenting coach providing comprehensive, personalized analysis. Be supportive, specific, and evidence-based. Return your response as JSON matching the expected format for the analysis type."
          },
          {
            role: "user", 
            content: prompts[type as keyof typeof prompts]
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      // Try to parse as JSON, fallback to structured text parsing
      try {
        return JSON.parse(content);
      } catch {
        return parseStructuredResponse(content, type);
      }
      
    } catch (error) {
      console.error("OpenAI API error:", error);
      return getFallbackAnalysis(type);
    }
  }

  function parseStructuredResponse(content: string, type: string): any {
    // Parse structured text response into appropriate format
    const sections = content.split('\n\n').filter(section => section.trim());
    
    switch (type) {
      case "parenting-progress":
        return {
          progressOverview: sections[0] || "You're developing strong parenting habits through consistent reflection.",
          strengths: sections[1]?.split('\n').slice(1) || ["Emotional awareness", "Growth mindset", "Consistent reflection"],
          growthAreas: sections[2]?.split('\n').slice(1) || ["Patience during challenges", "Self-care prioritization"],
          nextSteps: sections[3] || "Continue documenting experiences and celebrating small wins."
        };
        
      case "child-development":
        return {
          developmentOverview: sections[0] || "Your child is showing healthy developmental patterns.",
          milestones: ["Social interaction skills", "Language development", "Motor skill progress"],
          focusAreas: ["Emotional regulation", "Independence building", "Creative expression"],
          recommendations: sections[sections.length - 1] || "Encourage exploration through play and maintain consistent routines."
        };
        
      case "personalized-tips":
        return {
          tips: [
            {
              category: "Communication",
              tip: "Use descriptive praise when acknowledging your child's efforts.",
              reason: "This builds understanding of positive behaviors and encourages repetition."
            },
            {
              category: "Routine", 
              tip: "Implement visual schedules for daily activities.",
              reason: "Visual cues help children anticipate transitions and feel more in control."
            },
            {
              category: "Connection",
              tip: "Schedule 10 minutes of uninterrupted one-on-one time daily.",
              reason: "This strengthens your bond and gives them a sense of agency."
            }
          ]
        };
        
      case "considerations":
        return {
          considerations: [
            {
              concept: "Emotional Co-regulation",
              description: "The practice of helping your child manage emotions by first managing your own.",
              importance: "When you remain calm during emotional moments, you provide a secure base for learning.",
              relevance: "This builds emotional intelligence and strengthens your relationship."
            },
            {
              concept: "Growth Mindset Modeling", 
              description: "Demonstrating how to approach challenges as learning opportunities.",
              importance: "Children who develop growth mindset are more resilient and creative.",
              relevance: "Your attitude toward mistakes directly influences how your child approaches difficulties."
            },
            {
              concept: "Play-Based Connection",
              description: "Using unstructured play as a method for building relationship and understanding.",
              importance: "Play is how children naturally process experiences and develop life skills.",
              relevance: "Regular play-based interaction gives you insights into your child's inner world."
            }
          ]
        };
        
      default:
        return { error: "Unknown analysis type" };
    }
  }

  function getFallbackAnalysis(type: string): any {
    // Provide fallback analysis when AI fails
    switch (type) {
      case "parenting-progress":
        return {
          progressOverview: "You're building positive parenting habits through consistent reflection and journaling. Your commitment to growth is evident in your regular documentation of experiences.",
          strengths: [
            "Consistent reflection and self-awareness",
            "Commitment to learning and growth", 
            "Emotional awareness in parenting situations",
            "Dedication to documenting your journey"
          ],
          growthAreas: [
            "Developing patience during challenging moments",
            "Prioritizing self-care and emotional regulation",
            "Building consistent response strategies",
            "Celebrating small wins and progress"
          ],
          nextSteps: "Continue your journaling practice, focus on one growth area at a time, and consider exploring new parenting strategies that align with your values and family needs."
        };
        
      case "child-development":
        return {
          developmentOverview: "Based on your observations, your child is progressing through important developmental stages. Continue supporting their growth with age-appropriate activities and consistent nurturing.",
          milestones: [
            "Social and emotional skill development",
            "Language and communication progress", 
            "Physical and motor skill advancement",
            "Cognitive and problem-solving growth"
          ],
          focusAreas: [
            "Emotional regulation and self-control",
            "Independence and self-help skills",
            "Creative expression and imagination",
            "Social interaction and empathy"
          ],
          recommendations: "Encourage exploration through play, maintain consistent routines, provide plenty of positive reinforcement, and create opportunities for age-appropriate challenges and learning."
        };
        
      case "personalized-tips":
        return {
          tips: [
            {
              category: "Communication",
              tip: "Try using more descriptive praise when acknowledging your child's efforts. Instead of 'good job,' specify what they did well.",
              reason: "This builds their understanding of positive behaviors and encourages repetition of specific actions."
            },
            {
              category: "Routine",
              tip: "Consider implementing a visual schedule for daily activities to increase independence and reduce conflicts.",
              reason: "Visual cues help children anticipate transitions and feel more in control of their day."
            },
            {
              category: "Connection", 
              tip: "Schedule 10 minutes of uninterrupted one-on-one time daily, letting your child choose the activity.",
              reason: "This strengthens your bond and gives them a sense of agency while ensuring quality connection time."
            }
          ]
        };
        
      case "considerations":
        return {
          considerations: [
            {
              concept: "Emotional Co-regulation",
              description: "The practice of helping your child manage their emotions by first managing your own emotional state.",
              importance: "When you remain calm during your child's emotional moments, you provide a secure base that helps them learn to self-regulate over time.",
              relevance: "This builds emotional intelligence and strengthens your parent-child relationship while reducing behavioral challenges."
            },
            {
              concept: "Growth Mindset Modeling",
              description: "Demonstrating how to approach challenges as learning opportunities rather than fixed abilities.",
              importance: "Children who develop a growth mindset are more resilient, creative, and willing to take on challenges throughout their lives.",
              relevance: "Your attitude toward mistakes and learning directly influences how your child will approach difficulties and setbacks."
            },
            {
              concept: "Play-Based Connection",
              description: "Using unstructured play time as a primary method for building relationship and understanding your child.",
              importance: "Play is how children naturally process their experiences, express their feelings, and develop crucial life skills.",
              relevance: "Regular play-based interaction strengthens your bond while giving you insights into your child's inner world and developmental needs."
            }
          ]
        };
        
      default:
        return { error: "Analysis temporarily unavailable. Please try again later." };
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
