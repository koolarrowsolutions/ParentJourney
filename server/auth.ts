import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import session from 'express-session';
import type { Express } from 'express';
import { storage } from './storage';

// Configure session middleware
export function configureSession(app: Express) {
  // CORS middleware for session cookies
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: true, // Force session save for iframe compatibility
    saveUninitialized: true, // Create sessions for anonymous users
    cookie: {
      secure: false, // Never use secure in development/iframe
      httpOnly: false, // Allow JavaScript access for iframe environments
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'none' // Required for iframe/cross-origin scenarios
    },
    name: 'parentjourney.sid'
  }));
}

// Configure passport strategies
export function configurePassport() {
  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await storage.getUserByProvider('google', profile.id);
        
        if (!user) {
          // Create new user
          user = await storage.createUser({
            providerId: profile.id,
            provider: 'google',
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName || '',
            avatar: profile.photos?.[0]?.value || '',
            accessToken,
            refreshToken
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'email', 'picture']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByProvider('facebook', profile.id);
        
        if (!user) {
          user = await storage.createUser({
            providerId: profile.id,
            provider: 'facebook',
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName || '',
            avatar: profile.photos?.[0]?.value || '',
            accessToken,
            refreshToken
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByProvider('github', profile.id);
        
        if (!user) {
          user = await storage.createUser({
            providerId: profile.id,
            provider: 'github',
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName || profile.username || '',
            avatar: profile.photos?.[0]?.value || '',
            accessToken,
            refreshToken
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Twitter OAuth Strategy
  if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    passport.use(new TwitterStrategy({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: "/auth/twitter/callback"
    }, async (token, tokenSecret, profile, done) => {
      try {
        let user = await storage.getUserByProvider('twitter', profile.id);
        
        if (!user) {
          user = await storage.createUser({
            providerId: profile.id,
            provider: 'twitter',
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName || profile.username || '',
            avatar: profile.photos?.[0]?.value || '',
            accessToken: token,
            refreshToken: tokenSecret
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }
}

// Setup authentication routes
export function setupAuthRoutes(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth routes
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      // Set signup flag and redirect to home
      req.session.hasJustSignedUp = true;
      res.redirect('/');
    }
  );

  // Facebook OAuth routes
  app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
  );

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    (req, res) => {
      req.session.hasJustSignedUp = true;
      res.redirect('/');
    }
  );

  // GitHub OAuth routes
  app.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
  );

  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
      req.session.hasJustSignedUp = true;
      res.redirect('/');
    }
  );

  // Twitter OAuth routes
  app.get('/auth/twitter',
    passport.authenticate('twitter')
  );

  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/' }),
    (req, res) => {
      req.session.hasJustSignedUp = true;
      res.redirect('/');
    }
  );

  // Logout route
  app.get('/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Session destruction failed' });
        }
        res.redirect('/');
      });
    });
  });

  // Current user route
  app.get('/auth/user', (req, res) => {
    if (req.user) {
      res.json({
        user: req.user,
        hasJustSignedUp: req.session.hasJustSignedUp || false
      });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
}