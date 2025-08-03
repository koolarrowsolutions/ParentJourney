import type { Express } from "express";
import express from "express";
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
import { randomUUID } from "crypto";
import { db } from "./db";
import { 
  wellnessSuggestions, 
  userWellnessProgress, 
  journalEntries, 
  childProfiles, 
  parentProfiles,
  users
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { extractToken, validateAuthToken } from "./auth-token";

// Configure session with enhanced mobile browser compatibility
function configureSession(app: Express) {
  // Add CORS headers for mobile browsers
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const userAgent = req.headers['user-agent'] || '';
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Allow credentials for all mobile browsers
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Set origin based on environment
    if (isProduction) {
      // Allow deployed domain and any replit.app domains
      const allowedOrigins = [
        'https://parentapp.replit.app',
        req.headers.origin // Allow the actual origin for replit apps
      ].filter(Boolean);
      
      if (origin && (origin.includes('.replit.app') || allowedOrigins.includes(origin))) {
        res.header('Access-Control-Allow-Origin', origin);
      }
    } else {
      // Development mode - allow all origins
      res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5000');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, Set-Cookie');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  });

  const isProduction = process.env.NODE_ENV === 'production';
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-for-parenting-journal',
    resave: true, // Force save for mobile browser compatibility
    saveUninitialized: true, // Allow anonymous sessions
    cookie: { 
      secure: isProduction, // Use secure cookies in production for HTTPS
      httpOnly: false, // Allow JavaScript access for mobile compatibility
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: isProduction ? 'none' : 'lax', // Use 'none' for production HTTPS, 'lax' for dev
      domain: undefined // Remove domain restriction for better compatibility
    },
    name: 'parentjourney.sid', // Use consistent session name across environments
    // Force session store to handle mobile browser quirks
    rolling: true // Refresh session on each request
  }));
}

import { setupAuthRoutes } from "./auth-routes";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { generateAuthToken, validateAuthToken, revokeAuthToken, extractToken } from './auth-token';

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
        username: 'google_user_' + Date.now(),
        passwordHash: 'google_oauth_user',
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
        username: 'facebook_user_' + Date.now(),
        passwordHash: 'facebook_oauth_user',
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
        username: 'github_user_' + Date.now(),
        passwordHash: 'github_oauth_user',
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
        username: 'twitter_user_' + Date.now(),
        passwordHash: 'twitter_oauth_user',
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


}



// Authentication middleware - supports both session and token auth
function requireAuth(req: any, res: any, next: any) {
  const userAgent = req.headers['user-agent'] || '';
  console.log('Auth check - session userId:', req.session?.userId, 'User-Agent:', userAgent.substring(0, 100));
  
  // Try session-based auth first
  if (req.session?.userId) {
    // Set user context for storage isolation
    storage.setCurrentUser(req.session.userId);
    req.user = { id: req.session.userId }; // Set req.user for compatibility
    return next();
  }
  
  // Try token-based auth for iframe environments
  const token = extractToken(req);
  console.log('Checking token auth, token present:', !!token);
  
  if (token) {
    const tokenData = validateAuthToken(token);
    if (tokenData) {
      // Set req.user for compatibility with existing code
      req.user = { id: tokenData.userId };
      // Set user context for storage isolation
      storage.setCurrentUser(tokenData.userId);
      return next();
    }
  }
  
  console.log('Auth check failed - no valid session or token');
  return res.status(401).json({ message: 'Authentication required' });
}

// Authentication helper function for wellness endpoints
async function authenticateRequest(req: any): Promise<{ success: boolean; userId?: string }> {
  // Try session-based auth first
  if (req.session?.userId) {
    return { success: true, userId: req.session.userId };
  }
  
  // Try token-based auth for iframe environments
  const token = extractToken(req);
  if (token) {
    const tokenData = validateAuthToken(token);
    if (tokenData) {
      return { success: true, userId: tokenData.userId };
    }
  }
  
  return { success: false };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // CRITICAL: Health check routes must be first to ensure deployment health checks work
  // These routes handle deployment monitoring and must respond quickly with 200 status
  // Note: Root route (/) is handled by frontend serving, not health checks

  // Secondary health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'parenting-wellness-app'
    });
  });

  // Readiness probe for advanced deployment monitoring
  app.get('/ready', (req, res) => {
    res.status(200).json({ 
      status: 'ready', 
      timestamp: new Date().toISOString(),
      service: 'parenting-wellness-app'
    });
  });

  // Liveness probe for Kubernetes-style deployments
  app.get('/live', (req, res) => {
    res.status(200).json({ 
      status: 'alive', 
      timestamp: new Date().toISOString(),
      service: 'parenting-wellness-app'
    });
  });

  // Simple status endpoint that bypasses all middleware
  app.get('/status', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"status":"ok"}');
  });

  // CORS is now handled in configureSession function above

  // Configure session and OAuth
  configureSession(app);
  
  // Setup auth routes with /api prefix mapping
  const authApp = express();
  setupAuthRoutes(authApp);
  app.use('/api', authApp);

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { identifier, password } = req.body; // identifier can be username or email
      const userAgent = req.headers['user-agent'] || '';
      const isMobileBrowser = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isFirefoxMobile = /Firefox.*Mobile/i.test(userAgent);
      const isEdgeMobile = /Edge.*Mobile/i.test(userAgent);
      
      console.log('Login attempt - Mobile:', isMobileBrowser, 'Firefox:', isFirefoxMobile, 'Edge:', isEdgeMobile);
      
      if (!identifier || !password) {
        return res.status(400).json({ error: 'Username/email and password are required' });
      }

      // Find user by email or username
      const user = await storage.getUserByEmailOrUsername(identifier);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate auth token for iframe and mobile browser environments
      const authToken = generateAuthToken({
        userId: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        hasJustSignedUp: false
      });
      console.log('Generated auth token for user:', user.username);

      // Set session
      req.session.userId = user.id;
      req.session.hasJustSignedUp = false;
      
      // Enhanced session saving for mobile browsers with fallback
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error during login:', saveErr);
        }
        
        console.log('Login successful for user:', user.username, 'Mobile browser:', isMobileBrowser);
        
        res.json({ 
          success: true, 
          message: 'Login successful',
          user: { id: user.id, username: user.username, name: user.name, email: user.email },
          authToken: authToken // Include token for iframe/mobile fallback
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    console.log('Logout request - session userId:', req.session?.userId);
    
    // Revoke auth token if present
    const token = extractToken(req);
    if (token) {
      revokeAuthToken(token);
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      console.log('Logout successful - session destroyed');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // Add a test route to verify auth is working
  app.get('/api/test-auth', (req, res) => {
    res.json({ session: req.session, userId: req.session?.userId });
  });
  
  // Get journal entries (PROTECTED)
  app.get("/api/journal-entries", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string;
      const childId = req.query.childId as string;
      const entries = await storage.getJournalEntries(limit, search, childId);
      res.json(entries);
    } catch (error) {
      console.error("Journal entries error:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  // Get a single journal entry (PROTECTED)
  app.get("/api/journal-entries/:id", requireAuth, async (req, res) => {
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

  // Create a new journal entry (PROTECTED)
  app.post("/api/journal-entries", requireAuth, async (req, res) => {
    try {
      const validatedData = journalEntryWithAiSchema.parse(req.body);
      const { requestAiFeedback, ...entryData } = validatedData;

      // Get the current user's family ID
      const currentUser = await storage.getUserById(req.user.id);
      if (!currentUser) {
        return res.status(401).json({ message: "User not found" });
      }

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
        familyId: currentUser.familyId, // Use the authenticated user's family ID
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

  // Get journal statistics (PROTECTED)
  app.get("/api/journal-stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getJournalStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal statistics" });
    }
  });

  // Get mood analytics (PROTECTED)
  app.get("/api/mood-analytics", requireAuth, async (req, res) => {
    try {
      const analytics = await storage.getMoodAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mood analytics" });
    }
  });

  // Update journal entry (PROTECTED)
  app.patch("/api/journal-entries/:id", requireAuth, async (req, res) => {
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

  // Delete journal entry (PROTECTED)
  app.delete("/api/journal-entries/:id", requireAuth, async (req, res) => {
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

  // Child profile routes (PROTECTED)
  app.get("/api/child-profiles", async (req, res) => {
    try {
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
      const profiles = await storage.getChildProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch child profiles" });
    }
  });

  app.get("/api/child-profiles/:id", async (req, res) => {
    try {
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
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
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      console.log("Creating child profile for user:", authResult.userId);
      console.log("Child profile data:", JSON.stringify(req.body, null, 2));
      
      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
      // Get or create a family for this user first
      let familyId = null;
      
      // Check if user already has a family by looking at existing parent profile
      const existingParentProfile = await storage.getParentProfile();
      if (existingParentProfile && existingParentProfile.familyId) {
        familyId = existingParentProfile.familyId;
        console.log("Using existing family from parent profile:", familyId);
      } else {
        // Create a new family for this user
        const user = await storage.getUserById(authResult.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        const newFamily = await storage.createFamily({
          name: `${user.name}'s Family`
        });
        familyId = newFamily.id;
        console.log("Created new family for child:", familyId);
        
        // Update existing parent profile if one exists to use this family
        if (existingParentProfile) {
          await storage.updateParentProfile({ familyId: familyId });
          console.log("Updated parent profile with family ID:", familyId);
        }
      }
      
      // Add family ID to the child profile data
      const childData = {
        ...req.body,
        familyId: familyId
      };
      
      const validatedData = insertChildProfileSchema.parse(childData);
      const profile = await storage.createChildProfile(validatedData);
      console.log("Created child profile:", JSON.stringify(profile, null, 2));
      
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
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
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
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
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

  // Family routes (PROTECTED)
  app.post("/api/families", requireAuth, async (req, res) => {
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

  app.get("/api/families/:id", requireAuth, async (req, res) => {
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

  // Parent profile routes (PROTECTED)
  app.get("/api/parent-profiles", requireAuth, async (req, res) => {
    try {
      const familyId = req.query.familyId as string;
      const profiles = await storage.getParentProfiles(familyId);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parent profiles" });
    }
  });

  app.post("/api/parent-profiles", requireAuth, async (req, res) => {
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

  // Single parent profile routes (used by frontend)
  app.get("/api/parent-profile", async (req, res) => {
    try {
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
      const profile = await storage.getParentProfile();
      if (!profile) {
        return res.status(404).json({ message: "Parent profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching parent profile:", error);
      res.status(500).json({ message: "Failed to fetch parent profile" });
    }
  });

  app.post("/api/parent-profile", async (req, res) => {
    try {
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
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

  app.put("/api/parent-profile", async (req, res) => {
    try {
      console.log("PUT /api/parent-profile called with body:", JSON.stringify(req.body));
      
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        console.log("Authentication failed for PUT parent profile");
        return res.status(401).json({ message: "Authentication required" });
      }

      console.log("Authentication successful for user:", authResult.userId);
      
      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
      const validatedData = insertParentProfileSchema.partial().parse(req.body);
      console.log("Validated data:", validatedData);
      
      const profile = await storage.updateParentProfile(validatedData);
      if (!profile) {
        console.log("Profile not found for update");
        return res.status(404).json({ message: "Parent profile not found" });
      }
      
      console.log("Profile updated successfully:", profile.id);
      res.json(profile);
    } catch (error) {
      console.error("Error in PUT parent profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error updating parent profile:", error);
        res.status(500).json({ message: "Failed to update parent profile" });
      }
    }
  });

  // PATCH endpoint for profile updates (used by frontend)
  app.patch("/api/parent-profile", async (req, res) => {
    try {
      console.log("PATCH /api/parent-profile called with body:", JSON.stringify(req.body));
      
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        console.log("Authentication failed for PATCH parent profile");
        return res.status(401).json({ message: "Authentication required" });
      }

      console.log("Authentication successful for user:", authResult.userId);
      
      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
      const validatedData = insertParentProfileSchema.partial().parse(req.body);
      console.log("Validated data:", validatedData);
      
      // Check if there's any data to update
      if (Object.keys(validatedData).length === 0) {
        console.log("No data to update");
        return res.status(400).json({ message: "No data provided for update" });
      }
      
      const profile = await storage.updateParentProfile(validatedData);
      if (!profile) {
        console.log("Profile not found for update");
        return res.status(404).json({ message: "Parent profile not found" });
      }
      
      console.log("Profile updated successfully:", profile.id);
      res.json(profile);
    } catch (error) {
      console.error("Error in PATCH parent profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error updating parent profile:", error);
        res.status(500).json({ message: "Failed to update parent profile" });
      }
    }
  });

  // Alternative POST endpoint for profile updates
  app.post("/api/parent-profile/update", async (req, res) => {
    try {
      console.log("POST /api/parent-profile/update called with body:", JSON.stringify(req.body));
      
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
      const validatedData = insertParentProfileSchema.partial().parse(req.body);
      
      // Check if there's any data to update
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ message: "No data provided for update" });
      }
      
      const profile = await storage.updateParentProfile(validatedData);
      if (!profile) {
        return res.status(404).json({ message: "Parent profile not found" });
      }
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error updating parent profile:", error);
        res.status(500).json({ message: "Failed to update parent profile" });
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
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: "system",
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
        role: "user",
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

  // Daily Check-In endpoint
  app.post("/api/daily-checkin", requireAuth, async (req, res) => {
    try {
      const checkinData = req.body;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Convert check-in data to journal entry with AI analysis
      const content = `Daily Wellness Check-In:
      
Energy Level: ${checkinData.energyLevel}
Patience Level: ${checkinData.patienceLevel}
Parent-Child Connection: ${checkinData.parentChildConnection}
Parenting Confidence: ${checkinData.parentingConfidence}
Self-Care: ${checkinData.parentSelfCare}
Support System Contact: ${checkinData.supportSystemContact}
Arguments/Tension: ${checkinData.argumentsOrTension}
Emotional Regulation: ${checkinData.emotionalRegulation}
Discipline Style: ${checkinData.disciplineStyle}
Wins of the Day: ${checkinData.winsOfTheDay}`;

      // Calculate overall mood from check-in data for analytics
      const moodMapping = {
        'completely_drained': 1, 'exhausted': 2, 'very_tired': 3, 'tired': 4,
        'explosive': 1, 'very_short_fuse': 2, 'short_fuse': 3, 'impatient': 4,
        'completely_disconnected': 1, 'very_distant': 2, 'distant': 3, 'strained': 4,
        'completely_lost': 1, 'very_doubting': 2, 'doubting': 3, 'unsure': 4,
        'completely_neglected': 1, 'very_neglected': 2, 'neglected': 3, 'minimal': 4,
        'completely_isolated': 1, 'very_isolated': 2, 'isolated': 3, 'limited': 4,
        'constant_conflict': 1, 'frequent_arguments': 2, 'some_tension': 3, 'occasional_disagreements': 4,
        'completely_overwhelmed': 1, 'very_overwhelmed': 2, 'overwhelmed': 3, 'struggled': 4,
        'very_harsh': 1, 'too_harsh': 2, 'harsh': 3, 'strict': 4,
        'very_rough_day': 1, 'rough_day': 2, 'challenging_day': 3, 'few_bright_spots': 4,
        'okay': 5, 'neutral': 5, 'managed': 5, 'some_wins': 5,
        'good': 6, 'mostly_patient': 6, 'somewhat_confident': 6, 'good_moments': 6,
        'energetic': 7, 'patient': 7, 'close': 7, 'confident': 7, 'great_moments': 7,
        'vibrant': 8, 'zen': 8, 'deeply_bonded': 8, 'very_empowered': 8, 'absolutely_amazing': 8,
        'firm_but_fair': 6, 'gentle': 7, 'kind': 7, 'loving_guide': 8,
        'adequate': 5, 'some_self_care': 6, 'good_self_care': 7, 'prioritized_myself': 8,
        'some_connection': 5, 'regular_contact': 6, 'good_support': 7, 'strong_network': 8,
        'handled_well': 6, 'balanced': 7, 'completely_centered': 8
      };

      const scores = Object.values(checkinData).map(value => moodMapping[value as keyof typeof moodMapping] || 5);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      // Map average score to mood
      let mood = 'neutral';
      if (averageScore >= 7.5) mood = 'joyful';
      else if (averageScore >= 6.5) mood = 'content';
      else if (averageScore >= 5.5) mood = 'hopeful';
      else if (averageScore >= 4.5) mood = 'neutral';
      else if (averageScore >= 3.5) mood = 'tired';
      else if (averageScore >= 2.5) mood = 'stressed';
      else if (averageScore >= 1.5) mood = 'frustrated';
      else mood = 'overwhelmed';

      // Create journal entry
      const entryData = {
        title: `Daily Check-In - ${new Date().toLocaleDateString()}`,
        content,
        mood,
        aiAnalyzedMood: mood,
        userId
      };

      const entry = await storage.createJournalEntry(entryData);
      res.status(201).json({ 
        message: "Daily check-in saved successfully",
        entry,
        mood,
        averageScore: Math.round(averageScore * 10) / 10
      });
    } catch (error) {
      console.error("Error saving daily check-in:", error);
      res.status(500).json({ message: "Failed to save daily check-in" });
    }
  });

  // AI Analysis endpoints
  app.post("/api/ai-analysis/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const { entries, childProfiles, parentProfile } = req.body;

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured. Please provide your OpenAI API key to enable AI analysis features."
        });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      let systemPrompt = "";
      let analysisPrompt = "";

      if (type === "parenting-progress") {
        // Get child ages for the prompt
        const childAges = (childProfiles || []).map(child => ({ 
          name: child.name, 
          age: `${child.age} years old` 
        }));

        systemPrompt = `You are an expert parenting coach and child development specialist. You must provide deeply personalized analysis based on the specific user data provided. Always mention children by name and reference specific journal entries.`;

        analysisPrompt = `Analyze parenting progress using specific examples from the user's actual data:
        
        Parent: ${JSON.stringify(parentProfile || {})}
        Children: ${childAges.map(child => `${child.name} (${child.age})`).join(', ')}
        Journal Entries: ${(entries || []).length} total entries
        Recent Entries: ${JSON.stringify((entries || []).slice(0, 20).map(e => ({ content: e.content, mood: e.mood, createdAt: e.createdAt })))}
        
        CRITICAL REQUIREMENTS:
        1. You MUST mention each child by name (${childAges.map(c => c.name).join(', ')}) in your analysis
        2. Include specific examples or quotes from the journal entries when possible - use exact phrases or situations described
        3. Reference actual situations, challenges, or victories the parent has written about
        4. Make observations about the parent's relationship with each individual child based on their entries
        5. Use specific details from their journal entries to illustrate points (e.g., "In your entry where you mentioned...", "When you wrote about...")
        
        EXAMPLE FORMAT for incorporating journal content:
        - "Based on your recent entry where you mentioned [specific content], this shows..."
        - "In your reflection about [specific situation with child's name], you demonstrated..."
        - "Your journal entry describing [specific challenge/success] with [child's name] reveals..."

        Provide your analysis in this exact JSON format:
        {
          "progressOverview": "Assessment mentioning the parent's growth with each child by name, referencing specific journal content with examples like 'In your entry where you wrote about [specific content]' and showing awareness of their actual parenting experiences",
          "strengths": ["Specific strength illustrated by direct journal examples such as 'When you described [specific situation] with ${childAges[0]?.name || 'child'}'", "Strength with ${childAges[1]?.name || 'family'} shown through specific entries like '[quote or situation]'", "Overall parenting strength demonstrated through specific examples from their writing"],
          "growthAreas": ["Development area with ${childAges[0]?.name || 'child'} based on patterns like '[specific journal content or pattern]'", "Growth opportunity with ${childAges[1]?.name || 'family'} from their reflections such as '[specific example]'"],
          "nextSteps": "Actionable recommendations mentioning each child by name with strategies based directly on what they've shared, such as 'Building on your experience with [specific situation they wrote about]'"
        }
        
        Use the parent's own words and experiences to create truly personalized insights.`;
      } else if (type === "child-development") {
        // Get child ages for the prompt
        const childAges = (childProfiles || []).map(child => ({ 
          name: child.name, 
          age: `${child.age} years old` 
        }));

        systemPrompt = `You are a child development expert. You must provide deeply personalized analysis based on specific user data. Always mention children by name and reference specific journal entries that show their development.`;

        analysisPrompt = `Analyze child development patterns with specific insights for each child by name, using examples from the parent's journal entries:
        
        Children: ${childAges.map(child => `${child.name} (${child.age})`).join(', ')}
        Parent Observations: ${(entries || []).length} journal entries
        All Recent Entries: ${JSON.stringify((entries || []).slice(0, 20).map(e => ({ content: e.content, mood: e.mood, childProfileId: e.childProfileId, createdAt: e.createdAt })))}
        Child Profiles: ${JSON.stringify(childProfiles)}
        
        MANDATORY REQUIREMENTS:
        1. Mention each child individually by name: ${childAges.map(c => c.name).join(', ')}
        2. Reference specific examples from journal entries that show each child's behavior or development
        3. Use the child's personality traits and characteristics if mentioned in entries
        4. Provide age-appropriate developmental insights for each child's current stage
        5. Connect observations to real examples from the parent's writing
        
        Please provide a JSON response in this exact format. Create one object in the childrenInsights array for each child mentioned:
        {
          "developmentOverview": "Assessment mentioning each child by name with specific examples from journal entries",
          "childrenInsights": [
            {
              "childName": "Sofia",
              "age": "7 years old",
              "milestones": ["Specific milestone based on journal entries"],
              "focusAreas": ["Development focus with journal examples"],
              "recommendations": "Personalized recommendations based on observations"
            },
            {
              "childName": "David", 
              "age": "5 years old",
              "milestones": ["Specific milestone based on journal entries"],
              "focusAreas": ["Development focus with journal examples"],
              "recommendations": "Personalized recommendations based on observations"
            }
          ],
          "familyDynamics": "Family interactions mentioned in journal entries"
        }
        
        Make each child's section deeply personalized using actual journal content and their individual characteristics.`;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.7,
      });

      const result = completion.choices[0]?.message?.content;
      
      try {
        const parsedResult = JSON.parse(result || "{}");
        console.log(`AI Analysis successful for ${type}:`, parsedResult);
        res.json(parsedResult);
      } catch (parseError) {
        console.error(`JSON parsing failed for ${type}:`, parseError);
        console.error(`Raw AI response:`, result);
        
        // Return appropriate fallback based on type
        if (type === "child-development") {
          res.json({
            developmentOverview: "Unable to generate personalized child development analysis at this time.",
            childrenInsights: [],
            familyDynamics: "Please try again later for detailed family dynamics analysis."
          });
        } else {
          res.json({
            progressOverview: "Based on your journal entries, you're showing consistent growth in your parenting journey with thoughtful reflection and care for your children's well-being.",
            strengths: ["Consistent journaling and reflection", "Emotional awareness and growth", "Commitment to child's development"],
            growthAreas: ["Continue building patience during challenging moments", "Explore new positive reinforcement strategies"],
            nextSteps: "Keep documenting your experiences, celebrate small wins, and consider trying new approaches that align with your family values."
          });
        }
      }

    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ 
        error: "Failed to generate analysis",
        fallback: {
          progressOverview: "Your consistent journaling shows dedication to growth and reflection in your parenting journey.",
          strengths: ["Regular self-reflection", "Care for child's well-being", "Growth mindset"],
          growthAreas: ["Continue current positive practices", "Explore new strategies"],
          nextSteps: "Keep documenting your journey and celebrating progress along the way."
        }
      });
    }
  });

  // Parent profile endpoints
  app.get("/api/parent-profile", async (req, res) => {
    try {
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
      const profile = await storage.getParentProfile();
      res.json(profile);
    } catch (error) {
      console.error("Failed to fetch parent profile:", error);
      res.status(500).json({ message: "Failed to fetch parent profile" });
    }
  });

  app.post("/api/parent-profile", async (req, res) => {
    try {
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      console.log("Creating parent profile for user:", authResult.userId);
      console.log("Profile data:", JSON.stringify(req.body, null, 2));
      
      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
      // Get or create a family for this user first
      let familyId = null;
      
      // Check if user already has a family by looking at existing profiles
      const existingProfile = await storage.getParentProfile();
      if (existingProfile && existingProfile.familyId) {
        familyId = existingProfile.familyId;
        console.log("Using existing family:", familyId);
      } else {
        // Create a new family for this user
        const user = await storage.getUserById(authResult.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        const newFamily = await storage.createFamily({
          name: `${user.name}'s Family`
        });
        familyId = newFamily.id;
        console.log("Created new family:", familyId);
      }
      
      // Add family ID to the profile data
      const profileData = {
        ...req.body,
        familyId: familyId
      };
      
      const validatedData = insertParentProfileSchema.parse(profileData);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));
      
      const profile = await storage.createParentProfile(validatedData);
      console.log("Created profile:", JSON.stringify(profile, null, 2));
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Failed to create parent profile:", error);
      res.status(500).json({ message: "Failed to create parent profile" });
    }
  });

  // Object storage endpoints for profile photos
  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/profile-photos", requireAuth, async (req, res) => {
    if (!req.body.photoURL) {
      return res.status(400).json({ error: "photoURL is required" });
    }

    const userId = req.session.userId;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.photoURL,
        {
          owner: userId || 'anonymous',
          visibility: "public", // Profile photos are public
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting profile photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Object storage endpoints
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const { ObjectStorageService } = await import("./objectStorage");
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/profile-images", async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.imageURL,
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting profile image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/parent-profile", async (req, res) => {
    try {
      // Check authentication (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success || !authResult.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Set current user context in storage
      storage.setCurrentUser(authResult.userId);
      
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

  // AI Analysis routes for comprehensive insights - authentication required
  app.post("/api/ai-analysis/:type", async (req, res) => {
    try {
      // Check authentication first (session or token)
      const authResult = await authenticateRequest(req);
      if (!authResult.success) {
        console.log('AI Analysis: Authentication required');
        return res.status(401).json({ error: "Authentication required for AI analysis" });
      }

      const { type } = req.params;
      const { entries, childProfiles, parentProfile } = req.body;

      if (!["parenting-progress", "child-development", "personalized-tips", "considerations"].includes(type)) {
        return res.status(400).json({ error: "Invalid analysis type" });
      }

      console.log(`✅ REAL AI ANALYSIS: Processing authenticated user data for ${type}`);
      console.log(`📊 Input data - entries: ${entries?.length || 0}, childProfiles: ${childProfiles?.length || 0}, parentProfile: ${parentProfile ? 'present' : 'missing'}`);
      console.log(`👶 CHILD PROFILES DEBUG:`, JSON.stringify(childProfiles, null, 2));
      console.log(`👨‍👩‍👧‍👦 PARENT PROFILE DEBUG:`, JSON.stringify(parentProfile, null, 2));
      
      // Use real user data to generate personalized AI insights
      const analysis = await generateAIAnalysis(type, entries || [], childProfiles || [], parentProfile);
      console.log(`🎯 Generated REAL AI analysis for ${type}:`, Object.keys(analysis));
      
      res.json(analysis);
    } catch (error) {
      console.error("❌ AI Analysis error:", error);
      // Only use fallback if there's a critical error
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

    console.log(`🔍 CONTEXT DATA DEBUG for ${type}:`, JSON.stringify(contextData, null, 2));

    const prompts = {
      "parenting-progress": `
        Analyze this parent's journey and provide comprehensive progress insights with specific mention of each child by name. Use real examples from their journal entries wherever possible:
        
        Parent Profile: ${JSON.stringify(parentProfile || {})}
        Children: ${contextData.childAges.map(child => `${child.name} (${child.age} years old)`).join(', ')}
        Journal Entries: ${contextData.entriesCount} total entries
        Recent Entries: ${JSON.stringify(contextData.recentEntries.map(e => ({ content: e.content, mood: e.mood, createdAt: e.createdAt })))}
        
        CRITICAL REQUIREMENTS:
        1. You MUST mention each child by name (${contextData.childAges.map(c => c.name).join(', ')}) in your analysis
        2. Include specific examples or quotes from the journal entries when possible - use exact phrases or situations described
        3. Reference actual situations, challenges, or victories the parent has written about
        4. Make observations about the parent's relationship with each individual child based on their entries
        5. Use specific details from their journal entries to illustrate points (e.g., "In your entry where you mentioned...", "When you wrote about...")
        
        EXAMPLE FORMAT for incorporating journal content:
        - "Based on your recent entry where you mentioned [specific content], this shows..."
        - "In your reflection about [specific situation with child's name], you demonstrated..."
        - "Your journal entry describing [specific challenge/success] with [child's name] reveals..."
        
        Please provide a JSON response with exactly this structure:
        {
          "progressOverview": "Assessment mentioning the parent's growth with each child by name, referencing specific journal content with examples like 'In your entry where you wrote about [specific content]' and showing awareness of their actual parenting experiences",
          "strengths": ["Specific strength illustrated by direct journal examples such as 'When you described [specific situation] with ${contextData.childAges[0]?.name || 'child'}'", "Strength with ${contextData.childAges[1]?.name || 'family'} shown through specific entries like '[quote or situation]'", "Overall parenting strength demonstrated through specific examples from their writing"],
          "growthAreas": ["Development area with ${contextData.childAges[0]?.name || 'child'} based on patterns like '[specific journal content or pattern]'", "Growth opportunity with ${contextData.childAges[1]?.name || 'family'} from their reflections such as '[specific example]'"],
          "nextSteps": "Actionable recommendations mentioning each child by name with strategies based directly on what they've shared, such as 'Building on your experience with [specific situation they wrote about]'"
        }
        
        Use the parent's own words and experiences to create truly personalized insights.
      `,
      
      "child-development": `
        Analyze child development patterns with specific insights for each child by name, using examples from the parent's journal entries:
        
        Children: ${contextData.childAges.map(child => `${child.name} (${child.age} years old)`).join(', ')}
        Parent Observations: ${contextData.entriesCount} journal entries
        All Recent Entries: ${JSON.stringify(contextData.recentEntries.map(e => ({ content: e.content, mood: e.mood, childProfileId: e.childProfileId, createdAt: e.createdAt })))}
        Child Profiles: ${JSON.stringify(childProfiles)}
        
        MANDATORY REQUIREMENTS:
        1. ALWAYS mention each child individually by their EXACT name: ${contextData.childAges.map(c => c.name).join(', ')}
        2. NEVER use generic names like "Emily", "Ava", "Lily" or placeholder names
        3. Reference specific examples from journal entries that show each child's behavior or development
        4. Use the child's personality traits and characteristics if mentioned in entries
        5. Provide age-appropriate developmental insights for each child's current stage
        6. Connect observations to real examples from the parent's writing
        
        CRITICAL: The children's names are ${contextData.childAges.map(c => c.name).join(' and ')} - use these EXACTLY.
        
        Please provide a JSON response with exactly this structure:
        {
          "developmentOverview": "Assessment of each child's development mentioning ${contextData.childAges.map(c => `${c.name} (${c.age} years)`).join(' and ')} with specific examples from journal entries showing their unique personalities and growth",
          "childrenInsights": [
            ${contextData.childAges.map((child, index) => `{
              "childName": "${child.name}",
              "age": "${child.age} years old",
              "milestones": ["Specific milestone for ${child.name} based on their age and journal mentions"],
              "focusAreas": ["Development focus area for ${child.name} with examples from journal entries"],
              "recommendations": "Personalized recommendations for ${child.name} based on parent observations"
            }`).join(',')}
          ],
          "familyDynamics": "How ${contextData.childAges.map(c => c.name).join(' and ')} interact and how family dynamics show in the journal entries, mentioning each child by their exact name"
        }
        
        Make each child's section deeply personalized using actual journal content and their individual characteristics.
      `,
      
      "personalized-tips": `
        Generate personalized parenting tips specifically for ${parentProfile?.name || 'this parent'} based on their family profile and specific journal content:
        
        Parent: ${parentProfile?.name || 'Parent'} (${JSON.stringify(parentProfile || {})})
        Children: ${contextData.childAges.map(child => `${child.name} (${child.age} years old)`).join(', ')}
        Journal Entries: ${contextData.entriesCount} total entries
        Recent Challenges/Successes: ${JSON.stringify(contextData.recentEntries.map(e => ({ content: e.content, mood: e.mood, createdAt: e.createdAt })))}
        
        CRITICAL REQUIREMENTS:
        1. Address ${parentProfile?.name || 'the parent'} directly in your tips 
        2. Mention each child by name (${contextData.childAges.map(c => c.name).join(', ')}) in relevant tips 
        3. Reference specific situations or challenges from ${parentProfile?.name || 'the parent'}'s journal entries
        4. Use actual examples from their parenting experiences with ${contextData.childAges.map(c => c.name).join(' and ')}
        5. Connect tips directly to patterns observed in their entries
        
        Provide 3-4 specific, actionable tips that include:
        1. Category (Communication, Routine, Connection, Discipline, etc.)
        2. Specific tip/strategy referencing their actual experiences
        3. Reason why this tip is relevant to their specific situation with examples
        4. How to implement this with their specific children by name
        
        EXAMPLE FORMAT:
        - "Based on your entry where you mentioned [specific situation] with [child's name]..."
        - "When you described [specific challenge], this suggests..."
        - "Your observation about [child's name]'s [specific behavior] indicates..."
        
        Please provide a JSON response in this exact format:
        {
          "personalizedTips": [
            {
              "category": "Communication/Routine/Connection/etc",
              "tip": "Specific actionable tip referencing their journal entries and child's name",
              "reasoning": "Why this is relevant based on their documented experiences with examples like 'Based on your entry where you mentioned...'",
              "implementation": "How to implement this specifically with [child's name] and/or [other child's name]"
            }
          ]
        }
        
        Make tips practical, evidence-based, and deeply tailored to their actual family dynamics and documented experiences.
      `,
      
      "considerations": `
        Suggest important parenting concepts specifically for ${parentProfile?.name || 'this parent'} based on their family's unique situation:
        
        Parent: ${parentProfile?.name || 'Parent'} (${JSON.stringify(parentProfile || {})})
        Children: ${contextData.childAges.map(child => `${child.name} (${child.age} years old)`).join(', ')}
        Journal Context: ${JSON.stringify(contextData.recentEntries.map(e => ({ content: e.content, mood: e.mood, createdAt: e.createdAt })))}
        
        CRITICAL REQUIREMENTS:
        1. Address ${parentProfile?.name || 'the parent'} directly in your suggestions 
        2. Base suggestions on their specific journal entries and family dynamics with ${contextData.childAges.map(c => c.name).join(' and ')}
        3. Reference their actual parenting experiences when relevant, using phrases like "Based on your entry where you mentioned..." or "Given your experience with ${contextData.childAges[0]?.name || 'your child'}..."
        4. Connect concepts to patterns observed in their journal entries
        5. Make suggestions personal to ${parentProfile?.name || 'this parent'}'s specific situation with ${contextData.childAges.map(c => c.name).join(' and ')}
        
        Provide thoughtful, evidence-based concepts that could enhance ${parentProfile?.name || 'this parent'}'s specific family situation.
        
        Please provide a JSON response with exactly this structure:
        {
          "considerations": [
            {
              "concept": "Concept Name",
              "description": "Clear description of the concept (1-2 sentences)",
              "importance": "Why this concept matters for parenting effectiveness (1-2 sentences)"
            },
            {
              "concept": "Concept Name 2", 
              "description": "Clear description (1-2 sentences)",
              "importance": "Why it matters (1-2 sentences)"
            }
          ]
        }
        
        Focus on evidence-based parenting concepts that could enhance their family dynamics.
        Make suggestions thought-provoking and developmentally supportive.
      `
    };

    // Generate real AI analysis based on user data
    try {
      const prompt = prompts[type as keyof typeof prompts];
      if (!prompt) {
        throw new Error(`No prompt defined for analysis type: ${type}`);
      }

      console.log(`Generating AI analysis for ${type} with ${contextData.entriesCount} entries and ${contextData.childrenCount} children`);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert parenting coach and child development specialist. Provide personalized, evidence-based insights in the exact JSON format requested."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const aiAnalysis = JSON.parse(response.choices[0].message.content || "{}");
      
      // Validate structure and return
      if (validateAnalysisStructure(aiAnalysis, type)) {
        console.log(`Successfully generated ${type} analysis with AI`);
        return aiAnalysis;
      } else {
        console.warn(`AI analysis structure invalid for ${type}, using fallback`);
        return getFallbackAnalysis(type);
      }
    } catch (error) {
      console.error(`Error generating AI analysis for ${type}:`, error);
      // Return fallback with user context when AI fails
      const fallback = getFallbackAnalysis(type);
      
      // Enhance fallback with some user context
      if (type === "parenting-progress" && contextData.entriesCount > 0) {
        fallback.progressOverview = `Based on your ${contextData.entriesCount} journal entries, you're showing consistent engagement in your parenting journey. Your willingness to reflect and document experiences demonstrates strong parental self-awareness.`;
      }
      
      return fallback;
    }
  }

  function validateAnalysisStructure(data: any, type: string): boolean {
    switch (type) {
      case "parenting-progress":
        return data && typeof data.progressOverview === 'string' && Array.isArray(data.strengths) && Array.isArray(data.growthAreas);
      case "child-development":
        return data && typeof data.developmentOverview === 'string' && Array.isArray(data.childrenInsights);
      case "personalized-tips":
        return data && Array.isArray(data.tips) && data.tips.every((tip: any) => tip.category && tip.tip && tip.reason);
      case "considerations":
        return data && Array.isArray(data.considerations) && data.considerations.every((c: any) => c.concept && c.description && c.importance);
      default:
        return false;
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

  // Parenting chatbot API endpoint
  app.post("/api/parenting-chat", async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get user context data
      const parentProfile = await storage.getParentProfile() || null;
      const childProfiles = await storage.getChildProfiles() || [];
      const recentEntries = await storage.getJournalEntries(5) || [];

      const contextPrompt = `
        You are a warm, expert parenting assistant providing supportive guidance.
        
        Parent Context: ${parentProfile ? JSON.stringify({
          name: parentProfile.name,
          parentingStyle: parentProfile.parentingStyle,
          personalityTraits: parentProfile.personalityTraits,
          parentingGoals: parentProfile.parentingGoals
        }) : "No parent profile available"}
        
        Children: ${childProfiles.map((child: any) => ({
          name: child.name,
          age: Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
          personality: child.personalityTraits
        }))}
        
        Recent Journal Context: ${recentEntries.slice(0, 3).map(entry => entry.content.substring(0, 200))}
        
        Conversation History: ${conversationHistory?.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') || 'None'}
        
        User Question: ${message}
        
        Provide a warm, personalized response that:
        1. Acknowledges their specific family context when relevant
        2. Offers practical, evidence-based advice
        3. Is supportive and non-judgmental
        4. References their parenting journey when appropriate
        5. Keeps responses conversational and under 150 words
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a caring parenting expert providing personalized guidance. Be warm, supportive, and practical."
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      const reply = response.choices[0]?.message?.content || "I'm here to help with any parenting questions you have!";
      
      res.json({ reply });
    } catch (error) {
      console.error("Parenting chat error:", error);
      res.status(500).json({ 
        error: "Failed to generate response",
        reply: "I'm having trouble responding right now, but I'm here when you need parenting support!"
      });
    }
  });

  // Notification Settings Routes
  app.get("/api/notification-settings", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const settings = await storage.getUserNotificationSettings(userId);
      if (!settings) {
        // Return default settings if none exist
        const defaultSettings = {
          dailyReminder: "false",
          weeklyProgress: "false",
          reminderTime: "20:00",
          notificationEmail: "",
          browserNotifications: "false",
          emailVerified: "false"
        };
        res.json(defaultSettings);
      } else {
        res.json(settings);
      }
    } catch (error) {
      console.error("Failed to fetch notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.post("/api/notification-settings", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Filter out timestamp fields from request body to avoid type errors
      const { createdAt, updatedAt, id, ...cleanData } = req.body;
      
      const settingsData = {
        userId: userId,
        ...cleanData
      };
      
      // Check if settings already exist
      const existingSettings = await storage.getUserNotificationSettings(userId);
      
      let settings;
      if (existingSettings) {
        settings = await storage.updateUserNotificationSettings(userId, cleanData);
      } else {
        settings = await storage.createUserNotificationSettings(settingsData);
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      res.status(500).json({ message: "Failed to save notification settings" });
    }
  });

  app.post("/api/validate-email", requireAuth, async (req, res) => {
    try {
      const { email } = req.body;
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          valid: false, 
          message: "Please enter a valid email address" 
        });
      }
      
      // In a real app, you might send a verification email here
      // For now, we'll just mark it as valid
      res.json({ 
        valid: true, 
        message: "Email format is valid" 
      });
    } catch (error) {
      console.error("Email validation error:", error);
      res.status(500).json({ message: "Failed to validate email" });
    }
  });



  app.post("/api/test-notification", requireAuth, async (req, res) => {
    try {
      const { type, recipient } = req.body;
      
      let result = { success: false, message: "" };
      
      switch (type) {
        case 'browser':
          result = { success: true, message: "Browser notification test completed - check your browser for the notification popup" };
          break;
          
        case 'email':
          if (!recipient || !recipient.includes('@')) {
            result = { success: false, message: "Please enter a valid email address first" };
            break;
          }
          
          // Use Brevo (SendinBlue) for free email notifications
          const brevoApiKey = process.env.BREVO_API_KEY;
          
          if (!brevoApiKey) {
            result = { 
              success: false, 
              message: "Email service not configured. Get your free BREVO_API_KEY from brevo.com (300 emails/day free). Visit https://brevo.com to get your free API key."
            };
            break;
          }

          try {
            // Send real email via Brevo API
            const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': brevoApiKey
              },
              body: JSON.stringify({
                sender: {
                  name: "ParentJourney",
                  email: "koolarrowsolutions@gmail.com"
                },
                to: [{
                  email: recipient,
                  name: "Parent"
                }],
                subject: "ParentJourney Test Notification",
                textContent: "This is a test notification from your ParentJourney app. If you're seeing this, your email notifications are working perfectly! Email notifications are now active and you'll receive gentle reminders and updates about your parenting journey. Keep up the great work documenting your parenting journey! - The ParentJourney Team",
                htmlContent: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Test Email Successful!</h2>
                    <p>Hello!</p>
                    <p>This is a test notification from your ParentJourney app. If you're seeing this, your email notifications are working perfectly!</p>
                    <div style="background-color: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #0C4A6E;"><strong>Email notifications are now active</strong></p>
                      <p style="margin: 10px 0 0 0; color: #0C4A6E;">You'll receive gentle reminders and updates about your parenting journey.</p>
                    </div>
                    <p>Keep up the great work documenting your parenting journey!</p>
                    <p style="color: #6B7280; font-size: 14px;">- The ParentJourney Team</p>
                  </div>
                `
              })
            });

            if (emailResponse.ok) {
              const responseData = await emailResponse.json();
              result = { 
                success: true, 
                message: `✅ Real test email sent successfully to ${recipient} via Brevo (Message ID: ${responseData.messageId})`
              };
            } else {
              const errorText = await emailResponse.text();
              console.error("Brevo API error details:", errorText);
              result = { 
                success: false, 
                message: `Failed to send email: ${errorText}`
              };
            }
          } catch (emailError) {
            console.error("Brevo email error:", emailError);
            result = { 
              success: false, 
              message: `Email service error: ${(emailError as Error).message}`
            };
          }
          break;
          

          
        default:
          result = { success: false, message: "Invalid notification type" };
      }
      
      res.json(result);
    } catch (error) {
      console.error("Test notification error:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ 
          message: "Stripe not configured. Please set STRIPE_SECRET_KEY environment variable." 
        });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-07-30.basil",
      });

      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round((amount || 9.99) * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // PayPal routes
  const { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } = await import("./paypal");

  app.get("/paypal/setup", async (req, res) => {
      await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Admin middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // For now, let's make the existing user an admin for testing
    // In production, you'd check the user's role from the database
    if (req.session.userId === 'bf67f7b6-1143-4fb3-bbef-662f1fe83d50') {
      return next();
    }
    
    return res.status(403).json({ message: "Admin access required" });
  };

  // Admin routes
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const searchTerm = req.query.search as string;
      const users = await storage.getAllUsers(searchTerm);
      
      // Add total entries count for each user
      const usersWithStats = await Promise.all(users.map(async (user) => {
        storage.setCurrentUser(user.id);
        const stats = await storage.getJournalStats();
        return {
          ...user,
          totalEntries: stats.totalEntries
        };
      }));
      
      res.json(usersWithStats);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/grant-access", requireAdmin, async (req, res) => {
    try {
      const { userId, months } = req.body;
      if (!userId || !months) {
        return res.status(400).json({ message: "userId and months are required" });
      }
      
      const user = await storage.grantFreeAccess(userId, months);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Free access granted successfully", user });
    } catch (error) {
      console.error("Error granting free access:", error);
      res.status(500).json({ message: "Failed to grant free access" });
    }
  });

  app.post("/api/admin/add-note", requireAdmin, async (req, res) => {
    try {
      const { userId, note } = req.body;
      if (!userId || !note) {
        return res.status(400).json({ message: "userId and note are required" });
      }
      
      const user = await storage.addAdminNote(userId, note);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Note added successfully", user });
    } catch (error) {
      console.error("Error adding admin note:", error);
      res.status(500).json({ message: "Failed to add admin note" });
    }
  });

  // Wellness Suggestion endpoints
  app.get('/api/wellness/suggestions', async (req, res) => {
    try {
      const authResult = await authenticateRequest(req);
      if (!authResult.success) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = authResult.userId;
      const { status, limit } = req.query;
      
      // Get suggestions from database
      const suggestions = await db
        .select()
        .from(wellnessSuggestions)
        .where(and(
          eq(wellnessSuggestions.userId, userId),
          status ? eq(wellnessSuggestions.status, status as string) : sql`1=1`
        ))
        .limit(limit ? parseInt(limit as string) : 10)
        .orderBy(desc(wellnessSuggestions.createdAt));

      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching wellness suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch wellness suggestions' });
    }
  });

  app.post('/api/wellness/suggestions', async (req, res) => {
    try {
      const authResult = await authenticateRequest(req);
      if (!authResult.success) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = authResult.userId;
      const suggestionData = req.body;
      
      const newSuggestion = await db
        .insert(wellnessSuggestions)
        .values({
          ...suggestionData,
          userId,
          id: randomUUID()
        })
        .returning();

      res.json(newSuggestion[0]);
    } catch (error) {
      console.error('Error creating wellness suggestion:', error);
      res.status(500).json({ error: 'Failed to create wellness suggestion' });
    }
  });

  app.patch('/api/wellness/suggestions/:id/complete', async (req, res) => {
    try {
      const authResult = await authenticateRequest(req);
      if (!authResult.success) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = authResult.userId;
      const { id } = req.params;
      const { pointsAwarded, badgeAwarded } = req.body;
      
      const updatedSuggestion = await db
        .update(wellnessSuggestions)
        .set({
          status: 'completed',
          completedAt: new Date(),
          pointsAwarded,
          badgeAwarded,
          updatedAt: new Date()
        })
        .where(and(eq(wellnessSuggestions.id, id), eq(wellnessSuggestions.userId, userId)))
        .returning();

      if (updatedSuggestion.length === 0) {
        return res.status(404).json({ error: 'Suggestion not found' });
      }

      // Update user wellness progress
      await updateUserWellnessPoints(userId, pointsAwarded, badgeAwarded);

      res.json(updatedSuggestion[0]);
    } catch (error) {
      console.error('Error completing wellness suggestion:', error);
      res.status(500).json({ error: 'Failed to complete wellness suggestion' });
    }
  });

  app.patch('/api/wellness/suggestions/:id/dismiss', async (req, res) => {
    try {
      const authResult = await authenticateRequest(req);
      if (!authResult.success) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = authResult.userId;
      const { id } = req.params;
      
      const updatedSuggestion = await db
        .update(wellnessSuggestions)
        .set({
          status: 'dismissed',
          dismissedAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(eq(wellnessSuggestions.id, id), eq(wellnessSuggestions.userId, userId)))
        .returning();

      if (updatedSuggestion.length === 0) {
        return res.status(404).json({ error: 'Suggestion not found' });
      }

      res.json(updatedSuggestion[0]);
    } catch (error) {
      console.error('Error dismissing wellness suggestion:', error);
      res.status(500).json({ error: 'Failed to dismiss wellness suggestion' });
    }
  });

  app.get('/api/wellness/progress', async (req, res) => {
    try {
      const authResult = await authenticateRequest(req);
      if (!authResult.success) {
        return res.status(401).json({ message: 'Authentication required' });  
      }

      const userId = authResult.userId;
      
      let progress = await db
        .select()
        .from(userWellnessProgress)
        .where(eq(userWellnessProgress.userId, userId))
        .limit(1);

      if (progress.length === 0) {
        // Create initial progress record
        const newProgress = await db
          .insert(userWellnessProgress)
          .values({
            userId: userId,
            totalPoints: 0,
            currentStreak: 0,
            longestStreak: 0,
            badges: [],
            completedSuggestions: [],
            preferences: {
              frequencyPreference: 'occasional',
              preferredTimes: ['evening'],
              enableGamification: true,
              maxSuggestionsPerDay: 2
            }
          })
          .returning();
        
        progress = newProgress;
      }

      res.json(progress[0]);
    } catch (error) {
      console.error('Error fetching wellness progress:', error);
      res.status(500).json({ error: 'Failed to fetch wellness progress' });
    }
  });

  app.post('/api/wellness/generate-suggestions', async (req, res) => {
    try {
      const authResult = await authenticateRequest(req);
      if (!authResult.success) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = authResult.userId;
      
      // Get the user's family ID first - using users table since parentProfiles doesn't have userId
      const user = await db
        .select({ familyId: users.familyId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      const familyId = user[0]?.familyId;
      
      // Get user context for personalization using the family ID
      const recentEntries = familyId ? await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.familyId, familyId))
        .orderBy(desc(journalEntries.createdAt))
        .limit(5) : [];
      
      const childProfilesData = familyId ? await db
        .select()
        .from(childProfiles)
        .where(eq(childProfiles.familyId, familyId))
        .limit(5) : [];

      const parentProfile = familyId ? await db
        .select()
        .from(parentProfiles)
        .where(eq(parentProfiles.familyId, familyId))
        .limit(1) : [];

      // Build context for wellness engine
      const context = {
        recentMoodScores: recentEntries.map(e => {
          // Use aiAnalyzedMood if available, otherwise default to 5
          const moodNum = e.aiAnalyzedMood ? parseInt(e.aiAnalyzedMood) : 5;
          return isNaN(moodNum) ? 5 : moodNum;
        }).filter(Boolean),
        recentEntryKeywords: recentEntries.flatMap(e => e.content.split(' ').slice(0, 10)),
        stressPatterns: recentEntries.filter(e => {
          const moodNum = e.aiAnalyzedMood ? parseInt(e.aiAnalyzedMood) : 5;
          return !isNaN(moodNum) && moodNum < 6;
        }).map(e => e.content.slice(0, 100)),
        successPatterns: recentEntries.filter(e => {
          const moodNum = e.aiAnalyzedMood ? parseInt(e.aiAnalyzedMood) : 5;
          return !isNaN(moodNum) && moodNum >= 7;
        }).map(e => e.content.slice(0, 100)),
        familyDynamics: {
          childAges: childProfilesData.map(c => ({
            name: c.name,
            age: new Date().getFullYear() - new Date(c.dateOfBirth).getFullYear()
          })),
          recentChallenges: recentEntries.filter(e => {
            const moodNum = e.aiAnalyzedMood ? parseInt(e.aiAnalyzedMood) : 5;
            return !isNaN(moodNum) && moodNum < 6;
          }).map(e => e.title || '').slice(0, 3),
          parentName: parentProfile[0]?.name || 'Parent'
        },
        timeOfDay: (new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening') as 'morning' | 'afternoon' | 'evening',
        daysSinceLastSuggestion: 1
      };

      // Generate personalized suggestions using wellness engine
      const { wellnessEngine } = await import('../server/wellness-engine.js');
      const suggestions = await wellnessEngine.generatePersonalizedSuggestions(context, {
        maxSuggestionsPerDay: 2,
        frequencyPreference: 'occasional',
        enableGamification: true
      });

      // Check for existing suggestions to prevent duplicates
      const existingSuggestions = await db
        .select({ suggestionId: wellnessSuggestions.suggestionId })
        .from(wellnessSuggestions)
        .where(and(
          eq(wellnessSuggestions.userId, userId),
          eq(wellnessSuggestions.status, 'suggested')
        ));
      
      const existingSuggestionIds = new Set(existingSuggestions.map(s => s.suggestionId));

      // Store only new suggestions in database
      const storedSuggestions = [];
      for (const suggestion of suggestions) {
        // Skip if this suggestion already exists for the user
        if (existingSuggestionIds.has(suggestion.id)) {
          console.log(`Skipping duplicate suggestion: ${suggestion.id} for user: ${userId}`);
          continue;
        }

        const stored = await db
          .insert(wellnessSuggestions)
          .values({
            userId: userId,
            id: randomUUID(),
            suggestionId: suggestion.id,
            title: suggestion.title,
            description: suggestion.description,
            type: suggestion.type,
            category: suggestion.category,
            status: 'suggested'
          })
          .returning();
        
        storedSuggestions.push(stored[0]);
      }

      res.json(storedSuggestions);
    } catch (error) {
      console.error('Error generating wellness suggestions:', error);
      res.status(500).json({ error: 'Failed to generate wellness suggestions' });
    }
  });

  // Helper function to update user wellness points
  async function updateUserWellnessPoints(userId: string, points: number, badge?: string) {
    const existingProgress = await db
      .select()
      .from(userWellnessProgress)
      .where(eq(userWellnessProgress.userId, userId))
      .limit(1);

    if (existingProgress.length === 0) {
      // Create new progress record
      await db
        .insert(userWellnessProgress)
        .values({
          userId,
          totalPoints: points,
          currentStreak: 1,
          longestStreak: 1,
          badges: badge ? [badge] : [],
          completedSuggestions: [],
          preferences: {}
        });
    } else {
      // Update existing progress
      const current = existingProgress[0];
      const newBadges = badge && !current.badges.includes(badge) 
        ? [...current.badges, badge] 
        : current.badges;
      
      await db
        .update(userWellnessProgress)
        .set({
          totalPoints: current.totalPoints + points,
          badges: newBadges,
          lastActivityDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(userWellnessProgress.userId, userId));
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
