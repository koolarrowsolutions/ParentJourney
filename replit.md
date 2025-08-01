# ParentJourney - Digital Parenting Journal

## Overview

ParentJourney is a comprehensive full-stack web application designed as a digital journaling platform for parents. The application provides a complete ecosystem for documenting parenting experiences, tracking milestones, analyzing patterns, and receiving AI-powered insights. With features like photo uploads, mood analytics, milestone tracking, notification systems, and advanced search capabilities, it's designed to be extremely user-friendly for busy parents.

## User Preferences

Preferred communication style: Simple, everyday language.
Supportive messaging: Warm, encouraging greetings with emojis and affirming language that validates parenting efforts.
Authentication preference: Simple username/email + password system without social login complexity.

## Important Notes

**Authentication Usage**: Due to browser security restrictions, the authentication system works correctly in new tabs but may not function properly in the preview iframe. Users should click "Open in new tab" for login/signup functionality.

## System Architecture

The application follows a modern full-stack architecture with a clear separation between client and server:

- **Frontend**: React-based single-page application with TypeScript
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Integration**: OpenAI GPT-4o for parenting feedback
- **Build System**: Vite for frontend, esbuild for backend

## New Features Added

### Recent Updates (August 2025)
- **📋 Daily Check-In System**: Transformed simple mood tracking into comprehensive 10-category wellness assessment including energy levels, patience, parent-child connection, parenting confidence, self-care, support system contact, arguments/tension, emotional regulation, discipline style, and daily wins
- **🎯 Gallery-Style Interface**: Implemented step-by-step check-in flow with visual progress indicators, preventing user overwhelm while collecting detailed wellness data
- **📊 Parent Analytics Dashboard**: Replaced "Mood Analytics" with comprehensive "Parent Analytics" incorporating all daily check-in categories with trend analysis, insights, and wellness pattern visualization
- **🔐 Simplified Authentication System**: Replaced complex social login with streamlined username/email + password authentication for better user experience
- **📊 PostgreSQL Database Migration**: Successfully migrated from MemStorage to PostgreSQL with Drizzle ORM for persistent data storage
- **🔑 Session Management**: Implemented robust session handling with proper cookie configuration and cross-tab authentication support
- **🚀 Production-Ready Authentication**: Fixed session persistence issues and confirmed authentication works correctly in new tabs (iframe restrictions prevent preview window login)
- **👨‍👩‍👧‍👦 Multi-Parent Family Support**: Added comprehensive family management system supporting up to 4 parents per family with relationship tracking and role definitions
- **🗣️ Community Forum Integration**: Built community posting and commenting system for parent interaction and support
- **🎙️ Voice Input Integration**: Added voice input functionality across all text entry fields with inline microphone elements
- **✨ Enhanced Animation System**: Replaced all slide-in animations with modern pop/bounce effects using popFadeIn, bounceFadeIn, and bounceIn keyframes with cubic-bezier timing
- **🎯 Interactive Button Effects**: Added industry-standard hover effects including hover-scale, button-press, and hover-lift animations for professional user experience
- **💬 Improved Tooltip System**: Implemented TooltipWrapper component providing professional popup boxes for better user guidance
- **🏥 Deployment Health Checks**: Implemented comprehensive health check system with multiple endpoints (/, /health, /ready, /live, /status) for reliable deployment monitoring and production stability

### Comprehensive Feature Set
- **📸 Photo Upload**: Drag-and-drop photo uploads with gallery display and image management
- **📊 Analytics Dashboard**: Advanced search, weekly reflection summaries, and comprehensive mood analytics
- **🤖 AI Mood Analysis**: Automatic mood detection for every journal entry using OpenAI GPT-4o
- **📈 Mood Trends Visualization**: Interactive Chart.js graphs showing emotional patterns over time
- **🎯 Milestone Tracking**: Age-appropriate developmental milestone tracking with custom milestone creation
- **🔔 Smart Notifications**: Browser notifications for journaling reminders and milestone celebrations
- **⚡ Quick Entry Templates**: Pre-built templates for common parenting situations and guided prompts
- **🎨 Smooth Animations**: Fade-in, scale, hover effects, and gentle bounce animations throughout the app
- **🔍 Advanced Search**: Multi-filter search by keywords, mood, child, date ranges, and AI feedback
- **📈 Weekly Reflections**: Automated weekly summaries with pattern analysis and insights
- **💕 Mood Analytics**: Visual mood tracking with trends, streaks, and distribution charts
- **🧠 AI-Powered Insights**: OpenAI integration providing warm, age-appropriate parenting feedback
- **⚙️ Settings Dashboard**: Notification preferences and customization options
- **📚 Journal History**: Complete history view with child-specific filtering and AI feedback display

### Navigation Enhancement
- **Multi-page Application**: Home, Analytics, Milestones, Settings, Journal History, and Community pages with header navigation
- **Responsive Navigation**: Mobile-optimized header with icon-based navigation including Community forum access
- **Contextual Navigation**: Back buttons and breadcrumbs for better user experience
- **Journal History Screen**: Dedicated page for viewing past entries organized by child
- **Community Access**: Full community forum integration with posting, commenting, and interaction features

### Mental Health & Wellness Features
- **🌿 Calm Reset Tool**: Easily accessible breathing exercises, guided meditations, and self-compassion practices
- **💆‍♀️ Multiple Breathing Techniques**: 4-7-8 breathing, box breathing, and calm breathing with visual progress indicators
- **🧘‍♀️ Guided Mindfulness**: Self-compassion exercises, present moment grounding, and quick energy reset techniques
- **💝 Positive Affirmations**: Curated affirmations specifically for parenting challenges
- **🎯 Strategic Placement**: Prominently featured in sidebar and inline access during journal writing
- **⏱️ Timed Exercises**: Visual progress tracking with multiple cycles for effective stress relief

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing with multi-page navigation (Analytics, Milestones, Settings, Journal History)
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and smooth animations
- **Child Profile Management**: Comprehensive dialog system for managing multiple child profiles
- **Photo Management**: Drag-and-drop photo upload with gallery display
- **Analytics Dashboard**: Advanced search, weekly reflections, and mood analytics
- **Notification System**: Browser notifications for journaling reminders and milestone alerts
- **Journal History**: Child-specific entry browsing with AI feedback visualization

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between client and server
- **Storage**: Database-backed storage with full CRUD operations
- **API Design**: RESTful endpoints for journal entries and child profiles
- **Developmental Insights**: Age-based parenting insights system

### Database Schema
The application uses an extended family-centric schema with multiple tables:

**Families (`families`)**:
- `id`: Primary key (UUID)
- `name`: Family name (required)
- `created_at`: Timestamp for family creation

**Parent Profiles (`parent_profiles`)**:
- `id`: Primary key (UUID) 
- `name`: Parent's name (required)
- `age`: Optional age field
- `relationship`: Role in family ("Primary", "Partner", "Co-Parent", "Guardian")
- `family_id`: Foreign key to families table
- `parenting_style`: Optional parenting approach
- `parenting_philosophy`: Optional parenting beliefs
- `personality_traits`: Array of selected personality trait keys
- `parenting_goals`: Optional text field for goals
- `stressors`: Array of stress factors
- `support_systems`: Optional support network description
- `notes`: Optional additional notes
- `created_at`, `updated_at`: Timestamps

**Community Posts (`community_posts`)**:
- `id`: Primary key (UUID)
- `title`: Post title (required)
- `content`: Post content (required)
- `author_name`: Author display name (required)
- `likes`: Array of user IDs who liked the post
- `created_at`: Timestamp for post creation

**Community Comments (`community_comments`)**:
- `id`: Primary key (UUID)
- `post_id`: Foreign key to community_posts
- `content`: Comment content (required)
- `author_name`: Comment author display name (required)
- `created_at`: Timestamp for comment creation

**Child Profiles (`child_profiles`)**:
- `id`: Primary key (UUID)
- `name`: Child's name (required)
- `date_of_birth`: Date of birth (required)
- `gender`: Optional gender field ("male", "female", "other", or null)
- `notes`: Optional notes about the child
- `personality_traits`: Array of selected personality trait keys (up to 7)
- `created_at`: Timestamp for profile creation

**Journal Entries (`journal_entries`)**:
- `id`: Primary key (UUID)
- `title`: Optional entry title
- `content`: Required entry content
- `mood`: Optional mood tracking with emoji (user-selected)
- `ai_analyzed_mood`: AI-detected mood for trend analysis (automated)
- `emotion_tags`: Array of user-selected emotion tags
- `child_profile_id`: Foreign key to child_profiles (optional)
- `ai_feedback`: Optional AI-generated parenting feedback
- `developmental_insight`: Age-specific developmental insights
- `has_ai_feedback`: Flag indicating if AI feedback was requested/generated
- `photos`: Array of base64-encoded photos attached to entry
- `created_at`: Timestamp for entry creation

## Data Flow

1. **Journal Entry Creation**:
   - User fills out form with title, content, mood, and AI feedback preference
   - Client validates data using Zod schema
   - Server creates entry and optionally generates AI feedback
   - Client updates UI with new entry and feedback

2. **Child Profile Management**:
   - Users can create, edit, and delete child profiles
   - Each profile stores name, date of birth, gender (optional), notes, and personality traits
   - Age calculation from date of birth for developmental insights
   - Personality trait selection (up to 7) with age-appropriate traits shown
   - Separate trait update dialog for easy periodic updates as children grow
   - Child selection when creating journal entries

3. **AI Feedback Generation**:
   - Uses OpenAI GPT-4o model for generating parenting insights
   - Structured prompt provides validation, suggestions, growth insights, and summary
   - JSON response format ensures consistent feedback structure

4. **AI Mood Analysis**:
   - Automatic mood detection for every journal entry using OpenAI GPT-4o
   - Analyzes emotional tone and categorizes into 10 mood types (joyful, hopeful, content, neutral, etc.)
   - Creates quantified mood scoring system (1-10) for trend visualization
   - Builds comprehensive emotional journey maps for parents

5. **Developmental Insights**:
   - Age-specific parenting insights based on child development research
   - Automatically generated when a child profile is selected
   - Covers all developmental stages from infancy to young adulthood
   - Personalized based on selected personality traits for the child

6. **Data Retrieval**:
   - Client fetches journal entries with optional limit parameter
   - Server returns entries sorted by creation date (newest first)
   - Child profiles linked to journal entries for context
   - Client caches responses using TanStack Query

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL (configured via `DATABASE_URL` environment variable)
- **AI Service**: OpenAI API (requires `OPENAI_API_KEY` environment variable)
- **Cloud Database**: Neon Database serverless PostgreSQL

### UI/UX Dependencies
- **Component Library**: Radix UI primitives for accessibility
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date formatting and manipulation
- **Styling**: Tailwind CSS with custom color scheme

### Development Dependencies
- **Build Tools**: Vite for frontend, esbuild for backend bundling
- **Type Safety**: TypeScript with strict configuration
- **Database Migrations**: Drizzle Kit for schema management
- **Development Experience**: Replit-specific plugins for enhanced development

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with hot reload
- **Database**: Drizzle migrations via `db:push` command

### Production Build
- **Frontend**: Static build output to `dist/public`
- **Backend**: Bundled ESM output to `dist/index.js`
- **Database**: PostgreSQL connection via connection string

### Environment Configuration
- `NODE_ENV`: Environment detection (development/production)
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication

The application is structured for easy deployment on platforms like Replit, with appropriate build scripts and environment variable handling for both development and production environments.