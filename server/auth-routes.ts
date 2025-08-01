import type { Express } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { generateAuthToken, validateAuthToken, revokeAuthToken, extractToken } from "./auth-token";

export function setupAuthRoutes(app: Express) {
  // Check auth status - supports both session and token auth with mobile browser compatibility
  app.get('/auth/user', async (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    console.log('Auth check - session userId:', req.session?.userId, 'User-Agent:', userAgent.substring(0, 100));
    
    // Try session-based auth first
    if (req.session?.userId) {
      const user = await storage.getUserById(req.session.userId);
      if (user) {
        console.log('Session auth successful for user:', user.username);
        
        // Ensure session is properly saved for mobile browsers
        req.session.save((err) => {
          if (err) console.error('Session save error:', err);
        });
        
        return res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            username: user.username,
            name: user.name, 
            email: user.email 
          },
          hasJustSignedUp: req.session.hasJustSignedUp || false
        });
      } else {
        // Clean up invalid session
        req.session.destroy((err) => {
          if (err) console.error('Session destroy error:', err);
        });
      }
    }
    
    // Try token-based auth for iframe environments and mobile browser fallback
    const token = extractToken(req);
    console.log('Checking token auth, token present:', !!token);
    
    if (token) {
      const tokenData = validateAuthToken(token);
      if (tokenData) {
        console.log('Token auth successful for user:', tokenData.username);
        return res.json({
          success: true,
          user: {
            id: tokenData.userId,
            username: tokenData.username,
            name: tokenData.name,
            email: tokenData.email
          },
          hasJustSignedUp: tokenData.hasJustSignedUp,
          authToken: token // Return token for client persistence
        });
      }
    }
    
    console.log('Auth check failed - no valid session or token');
    res.json({ success: false, user: null });
  });

  // Signup route
  app.post('/auth/signup', async (req, res) => {
    try {
      const { username, name, email, password } = req.body;
      
      if (!username || !name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmailOrUsername(email) || await storage.getUserByEmailOrUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email or username' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create new user
      const newUser = await storage.createUser({
        username,
        name,
        email,
        passwordHash,
        familyId: null
      });

      // Set session
      req.session.hasJustSignedUp = true;
      req.session.userId = newUser.id;
      
      res.json({ 
        success: true, 
        message: 'Account created successfully',
        user: { id: newUser.id, username: newUser.username, name: newUser.name, email: newUser.email }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  });

  // Login route with enhanced mobile browser support
  app.post('/auth/login', async (req, res) => {
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
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }
      
      // Set session with mobile browser compatibility
      req.session.userId = user.id;
      req.session.hasJustSignedUp = false;
      
      // Force session save for mobile browsers (especially Firefox and Edge)
      if (isMobileBrowser) {
        await new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error('Session save error for mobile browser:', err);
              reject(err);
            } else {
              console.log('Session saved successfully for mobile browser:', userAgent.substring(0, 50));
              resolve(true);
            }
          });
        });
      }
      
      // Generate auth token (for iframe environments and mobile browser fallback)
      const authToken = generateAuthToken({
        userId: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        hasJustSignedUp: false
      });
      
      console.log('Login successful for user:', user.username, 'Mobile browser:', isMobileBrowser);
      
      // Set mobile-specific headers for better compatibility
      if (isMobileBrowser) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
        res.header('Set-Cookie', `parentjourney.sid=${req.sessionID}; Path=/; HttpOnly=false; SameSite=none`);
      }
      
      res.json({ 
        success: true, 
        message: 'Logged in successfully',
        user: { id: user.id, username: user.username, name: user.name, email: user.email },
        authToken: authToken, // Include token for iframe compatibility
        sessionId: req.sessionID, // Include session ID for debugging
        mobileBrowser: isMobileBrowser
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

  // Change password route
  app.post('/auth/change-password', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long' });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await storage.updateUserPassword(user.id, newPasswordHash);
      
      res.json({ 
        success: true, 
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

  // Get current user route
  app.get('/api/auth/user', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ success: false, user: null });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ success: false, user: null });
      }

      res.json({ 
        success: true, 
        user: { id: user.id, username: user.username, name: user.name, email: user.email },
        hasJustSignedUp: req.session.hasJustSignedUp || false
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ success: false, user: null });
    }
  });

  // Change email route
  app.post('/auth/change-email', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { newEmail, password } = req.body;
      
      if (!newEmail || !password) {
        return res.status(400).json({ error: 'New email and password are required' });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Password is incorrect' });
      }

      // Check if email is already taken
      const existingUser = await storage.getUserByEmail(newEmail);
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ error: 'Email is already taken' });
      }

      // Update email
      const updatedUser = await storage.updateUserEmail(user.id, newEmail);
      
      res.json({ 
        success: true, 
        message: 'Email updated successfully',
        user: { id: updatedUser!.id, username: updatedUser!.username, name: updatedUser!.name, email: updatedUser!.email }
      });
    } catch (error) {
      console.error('Change email error:', error);
      res.status(500).json({ error: 'Failed to change email' });
    }
  });
}