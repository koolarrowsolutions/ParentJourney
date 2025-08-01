# ParentJourney - Project Transfer Guide

## Overview
This guide contains all the information needed to recreate your ParentJourney application in a new Replit account.

## 🔧 **Technical Stack & Configuration**

### Core Technologies
- **Frontend**: React 18.3.1 with TypeScript
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL (Neon Database serverless)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tools**: Vite (frontend), esbuild (backend)
- **State Management**: TanStack Query v5
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation

### Key Dependencies (package.json)
```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

## 🗄️ **Database Schema**

### Current Database Tables
- `families` - Family information
- `parent_profiles` - Parent user profiles with parenting styles
- `child_profiles` - Child information and developmental stages
- `users` - Authentication and user management
- `user_notification_settings` - Notification preferences
- `journal_entries` - Daily journaling entries with AI analysis
- `community_posts` - Community forum posts
- `community_comments` - Community forum comments
- `oauth_users` - OAuth authentication (if used)

### Database Structure (schema.ts)
Key tables with relationships:
- **Users** → **Families** (many-to-one)
- **Families** → **Parent Profiles** (one-to-many)
- **Families** → **Child Profiles** (one-to-many)
- **Parent Profiles** → **Journal Entries** (one-to-many)
- **Parent Profiles** → **Community Posts** (one-to-many)

## 🔐 **Required Environment Variables & Secrets**

### Database
- `DATABASE_URL` - PostgreSQL connection string (automatically provided by Replit)

### AI Integration (Optional - for journal insights)
- `OPENAI_API_KEY` - OpenAI GPT-4 API key for AI-powered insights

### Email Notifications (FREE via Brevo)
- `BREVO_API_KEY` - Brevo (SendinBlue) API key for FREE email delivery (300 emails/day free)
  - Sign up at: https://brevo.com
  - Navigate to Settings → API Keys → Create API Key
  - Free tier provides 300 emails per day

### SMS Notifications (Replaced with Browser Notifications)
- **Recommendation**: Use browser notifications instead of SMS for free instant alerts
- SMS services (Twilio, etc.) require paid subscriptions
- Browser notifications work perfectly on desktop devices at no cost

## 📁 **Project Structure**

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components (shadcn/ui)
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── App.tsx        # Main app component
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── auth-routes.ts    # Authentication routes
│   ├── db-storage.ts     # Database operations
│   └── auth-token.ts     # Token management
├── shared/               # Shared between client/server
│   └── schema.ts         # Database schema (Drizzle)
├── package.json          # Dependencies
├── drizzle.config.ts     # Database configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🚀 **Setup Steps for New Account**

### 1. Create New Replit
1. Create new Replit with Node.js template
2. Upload all project files (download from current project)

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
1. Enable PostgreSQL database in Replit
2. Run database migrations:
```bash
npm run db:push
```

### 4. Configure Environment Variables
Set up the required secrets in Replit's environment variables panel.

### 5. Start Development Server
```bash
npm run dev
```

## 🎨 **Key Features Implemented**

### Authentication System
- Username/email + password authentication
- Session management with secure cookies
- Token-based authentication for API requests
- Logout functionality with session cleanup

### User Management
- Family-based user system (up to 4 parents per family)
- Parent profiles with parenting styles and philosophies
- Child profiles with developmental tracking

### Journaling System
- Daily journal entries with photo uploads
- AI-powered mood analysis (requires OpenAI API)
- Search and filtering capabilities
- Journal history with date range filtering

### Analytics Dashboard
- Parent wellness tracking (10 categories)
- Visual charts and trend analysis
- Weekly progress summaries

### Community Features
- Community forum for parent discussions
- Post creation and commenting system
- User interaction and engagement

### Notification System
- Email notifications (requires SendGrid)
- SMS notifications (requires Twilio)
- Browser notifications
- Daily reminder settings
- Weekly progress notifications

### Mobile Optimization
- Responsive design for all screen sizes
- Mobile-specific UI adaptations
- Touch-friendly interface elements

## 🔧 **Configuration Files**

### Drizzle Configuration (drizzle.config.ts)
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

### Vite Configuration
The project uses a custom Vite setup that serves both frontend and backend on the same port.

## 📊 **Sample Data Export**

### For Database Migration
Before transferring, you can export your current data:

1. **Export Users Data**:
```sql
SELECT * FROM users;
```

2. **Export Journal Entries**:
```sql
SELECT * FROM journal_entries;
```

3. **Export Child Profiles**:
```sql
SELECT * FROM child_profiles;
```

4. **Export Parent Profiles**:
```sql
SELECT * FROM parent_profiles;
```

## 🎯 **Testing Checklist**

After setting up in new account:
- [ ] User registration/login works
- [ ] Journal entry creation works
- [ ] Photo uploads function (if object storage enabled)
- [ ] Analytics dashboard displays correctly
- [ ] Community posts and comments work
- [ ] Notification settings save properly
- [ ] Email/SMS test notifications work (with proper API keys)
- [ ] Mobile responsive design functions
- [ ] Database operations complete successfully

## 📝 **Notes**

### Current Status
- All core features are implemented and functional
- FREE email notification system working via Brevo API (verified working)
- Browser notifications implemented as SMS alternative
- AI insights require OpenAI API key
- Database schema is stable and tested

### Known Requirements
- Must set up PostgreSQL database in new Replit
- Must configure all environment variables/secrets
- Must install all npm dependencies
- Mobile notifications have limited browser support (documented in UI)

This documentation should provide everything needed to successfully recreate your ParentJourney application in your new Replit account.