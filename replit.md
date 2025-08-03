# ParentJourney - Digital Parenting Journal

## Overview

ParentJourney is a comprehensive full-stack web application designed as a digital journaling platform for parents. It provides an ecosystem for documenting parenting experiences, tracking milestones, analyzing patterns, and receiving AI-powered insights. Key capabilities include photo uploads, mood analytics, milestone tracking, notification systems, and advanced search, all within a user-friendly interface. The business vision is to offer a supportive tool for parents to reflect on their journey, understand their emotional patterns, and gain personalized guidance.

## User Preferences

Preferred communication style: Simple, everyday language.
Supportive messaging: Warm, encouraging greetings with emojis and affirming language that validates parenting efforts.
Authentication preference: Simple username/email + password system without social login complexity.

## System Architecture

The application employs a modern full-stack architecture with clear separation between client and server.

**Core Technologies:**
- **Frontend**: React-based single-page application with TypeScript.
- **Backend**: Express.js server with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.
- **Styling**: Tailwind CSS with shadcn/ui components.
- **AI Integration**: OpenAI GPT-4o for parenting feedback and mood analysis.
- **Build System**: Vite for frontend, esbuild for backend.

**UI/UX Decisions:**
- **Design Philosophy**: Focus on user-friendliness for busy parents, with intuitive navigation and clear visual cues.
- **Animations**: Modern pop/bounce effects (popFadeIn, bounceFadeIn, bounceIn) for smooth transitions, and interactive button effects (hover-scale, button-press, hover-lift).
- **Tooltips**: Professional TooltipWrapper component for user guidance.
- **Navigation**: Multi-page application structure (Home, Analytics, Milestones, Settings, Journal History, Community) with responsive header navigation and contextual elements like back buttons and breadcrumbs.
- **Wellness Features**: Integrated "Calm Reset Tool" with breathing exercises, guided meditations, and positive affirmations, strategically placed for easy access.

**Technical Implementations & Feature Specifications:**
- **Daily Check-In System**: Comprehensive 10-category wellness assessment (energy, patience, parent-child connection, etc.) presented through a gallery-style interface with visual progress, connected to real data analytics.
- **Parent Analytics Dashboard**: Comprehensive trend analysis and visualization of all daily check-in categories with real-time streak calculation and wellness scoring based on actual journal entry data.
- **Enhanced UX Flow**: Reordered home page layout with journal entries displayed first followed by child-specific views, including explanatory text clarifying relationships between sections and visual color-coding system linking journal entries to child profiles.
- **Interactive Entry Previews**: Hover-to-expand functionality for journal entries showing more content on interaction, with clickable entries leading to full journal history.
- **Visual Linking System**: Color-coded dots (blue, purple, pink) matching child profiles to their associated journal entries for clear visual relationship mapping.
- **Authentication**: Streamlined username/email + password system with robust session management, production-ready CORS configuration, environment-based cookie settings (secure/SameSite for production), and dual authentication approach (session + token) for cross-browser compatibility.
- **Family Support**: Multi-parent family management system supporting up to 4 parents with relationship tracking.
- **Community Forum**: Integrated posting and commenting system for parent interaction.
- **Voice Input**: Functionality across all text entry fields with inline microphone elements.
- **Photo Management**: Drag-and-drop photo uploads with gallery display.
- **AI Mood Analysis**: Automatic mood detection and quantification (1-10 scale) for every journal entry using OpenAI GPT-4o, creating emotional journey maps.
- **AI-Powered Insights**: OpenAI GPT-4o generates warm, age-appropriate parenting feedback, structured for validation, suggestions, and growth insights.
- **Milestone Tracking**: Age-appropriate and custom milestone tracking.
- **Notifications**: Cost-free notification system with email notifications via Brevo API (300/day) and browser notifications for desktop users. SMS functionality removed entirely to maintain zero-cost approach.
- **Search**: Advanced multi-filter search by keywords, mood, child, dates, and AI feedback.
- **Weekly Reflections**: Automated summaries with pattern analysis.
- **Developmental Insights**: Age-specific parenting insights based on child development research, personalized by child's selected personality traits.
- **Child Profile Management**: Comprehensive dialog system for managing multiple child profiles, including age calculation and personality trait selection with periodic update options.
- **Journal History**: Dedicated screen for viewing past entries, filterable by child, with AI feedback display.
- **Welcome System**: Complete three-tier welcome messaging system: (1) Static explanatory text about AI personalization, (2) 50 daily rotating insights, and (3) 50 per-login rotating welcome messages in login confirmation modal positioned at top of screen with 5-second auto-close.
- **Payment Processing**: Complete dual payment system supporting Stripe and PayPal Express with flexible pricing configuration, subscription management, and payment intent handling.
- **Admin Dashboard**: Full administrative interface with user management, subscription handling, payment oversight, analytics dashboard, and customer support tools including free access grants and admin notes.

**System Design Choices:**
- **Frontend**: React 18, Wouter for routing, TanStack Query for server state, React Hook Form with Zod for forms, shadcn/ui for components, Tailwind CSS for styling, date-fns for date handling.
- **Backend**: Express.js, PostgreSQL with Drizzle ORM, Zod for shared validation schemas, RESTful API design.
- **Database Schema**: Extended family-centric schema including `families`, `parent_profiles`, `community_posts`, `community_comments`, `child_profiles`, and `journal_entries` tables, designed for relationship tracking and detailed data storage.
- **Payment Integration**: Dual payment system supporting both Stripe and PayPal Express checkout with flexible pricing configuration.
- **Admin Dashboard**: Comprehensive administrative interface for user management, subscription handling, payment processing, and platform analytics.

## External Dependencies

- **Database**: PostgreSQL (specifically, Neon Database serverless PostgreSQL is used).
- **AI Service**: OpenAI API (for GPT-4o model).
- **Component Library**: Radix UI (primitives for accessibility, underlying shadcn/ui).
- **Icons**: Lucide React.
- **Date Handling**: date-fns.
- **Styling**: Tailwind CSS.

## Recent Changes (August 2025)

**Authentication System Overhaul:**
- Fixed critical authentication flow issues preventing proper login completion
- Resolved duplicate authentication routes causing conflicts
- Implemented production-ready CORS configuration with environment-based settings
- Enhanced session management with secure cookie handling for production deployment
- Added dual authentication approach (session + token) for mobile browser compatibility
- Configured proper domain settings for .replit.app deployment
- Enhanced token persistence system - authentication now survives server restarts
- Verified all test accounts work: annie, testuser, testuser2, testuser123, mobile, esanjosechicano (all with password "123456")
- Confirmed data access works properly - all journal entries and child profiles accessible via token authentication
- Production authentication system deployed and fully operational

**Critical Data Isolation Security Fix (August 3, 2025):**
- Identified and resolved major security vulnerability where users could see other users' private data
- Root cause: Multiple users incorrectly linked to the same family in database
- Solution: Created separate families for each user to ensure proper data isolation
- Updated all profile creation endpoints to use new dual authentication system
- Verified family-based data filtering works correctly - users only see their own profiles and data
- Test accounts now properly isolated: esanjosechicano (family: "Bejarano") and yesenia (family: "Yesenia's Family")
- Enhanced DatabaseStorage family management with automatic family creation for new users
- Confirmed all profile management features work securely across multiple user accounts

**Complete User Data Access & Management System (August 3, 2025):**
- Fixed parent profile API routing issue - PUT endpoint now properly returns JSON responses
- Enhanced child profile CRUD operations with family-based security filtering for UPDATE and DELETE
- Verified comprehensive data access for all users including complete family management capabilities
- User "yesenia" confirmed to have full access to manage her children (Miguel, Isabella, Sofia) and parent profile
- All authenticated users can now create, read, update, and delete their own family data with proper isolation
- Child profile operations secure across family boundaries - users cannot modify other families' data
- Profile update system fully functional with PUT, POST, and PATCH endpoints for complete frontend compatibility

**Frontend-Backend API Endpoint Alignment (August 3, 2025):**
- Resolved critical issue where frontend used PATCH method but backend only had PUT endpoint for parent profile updates
- Added missing PATCH /api/parent-profile endpoint to match frontend expectations
- Enhanced error handling for empty update requests to prevent Drizzle "No values to set" errors
- Confirmed all profile update methods work correctly: PUT, PATCH, and POST endpoints all functional
- Users can now successfully update parent profiles without "Update Failed" errors from endpoint mismatches

**Data Connectivity & Integration Fix (August 3, 2025):**
- Resolved journal entry family linking issues causing inaccurate stats and streaks
- Fixed DatabaseStorage getJournalEntries() method to properly filter by family relationships
- Updated all journal entries to have correct family_id values for proper data isolation
- Enhanced query logic to use both direct family filtering and child profile family filtering
- Verified complete data flow: authentication → profiles → journal entries → AI insights → statistics
- Confirmed accurate streak calculations and weekly reflection counts based on real user data
- Validated AI insights now properly connect to actual family profile data and child information
- All user accounts now have seamless application functionality with personalized data integration

**Data Isolation & User Profile Cleanup (August 3, 2025):**
- Identified and resolved child profile data contamination where test data was incorrectly assigned to user families
- Cleaned up Yesenia's family: removed 3 incorrect test children (Sofia, Miguel Rodriguez, Isabella) and associated journal entries
- Properly assigned user Yesenia's actual child "Bengu" to her family for correct data isolation
- Verified family-based filtering now works correctly - users only see their own children and data
- Enhanced data integrity: each family now contains only the children actually created by that family's users
- All test accounts now properly isolated with accurate family-specific child profiles and journal data

**AI Analysis & UX Improvements (August 2025):**
- Replaced circular loading indicators with animated sparkly stars loader for AI analysis, reflecting AI-powered insights
- Enhanced AI analysis prompts to include child-specific insights using actual names and journal examples
- Improved parenting progress analysis to reference specific journal content and real experiences (mentions children by name, references specific journal entries like cooking activities, reading habits, etc.)
- Updated child development patterns to display individual child insights with personalized recommendations using actual user data
- Modified AI analysis structure to show each child individually with age-appropriate developmental guidance based on real journal content
- Added SparklyStarsLoader component with animated floating sparkles for better AI feedback representation
- Enhanced modular structure in child development modal matching parenting progress modal design
- Fixed AI analysis prompts to consistently use actual user data, children's names, and specific journal examples instead of generic responses
- Increased AI token limits and improved JSON response format handling for more detailed personalized insights