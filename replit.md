# ParentJourney - Digital Parenting Journal

## Overview

ParentJourney is a comprehensive full-stack web application designed as a digital journaling platform for parents. The application provides a complete ecosystem for documenting parenting experiences, tracking milestones, analyzing patterns, and receiving AI-powered insights. With features like photo uploads, mood analytics, milestone tracking, notification systems, and advanced search capabilities, it's designed to be extremely user-friendly for busy parents.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with a clear separation between client and server:

- **Frontend**: React-based single-page application with TypeScript
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Integration**: OpenAI GPT-4o for parenting feedback
- **Build System**: Vite for frontend, esbuild for backend

## New Features Added

### Comprehensive Feature Set
- **📸 Photo Upload**: Drag-and-drop photo uploads with gallery display and image management
- **📊 Analytics Dashboard**: Advanced search, weekly reflection summaries, and mood analytics with visual charts
- **🎯 Milestone Tracking**: Age-appropriate developmental milestone tracking with custom milestone creation
- **🔔 Smart Notifications**: Browser notifications for journaling reminders and milestone celebrations
- **⚡ Quick Entry Templates**: Pre-built templates for common parenting situations and guided prompts
- **🎨 Smooth Animations**: Fade-in, scale, hover effects, and gentle bounce animations throughout the app
- **🔍 Advanced Search**: Multi-filter search by keywords, mood, child, date ranges, and AI feedback
- **📈 Weekly Reflections**: Automated weekly summaries with pattern analysis and insights
- **💕 Mood Analytics**: Visual mood tracking with trends, streaks, and distribution charts
- **⚙️ Settings Dashboard**: Notification preferences and customization options
- **📚 Journal History**: Complete history view with child-specific filtering and AI feedback display

### Navigation Enhancement
- **Multi-page Application**: Home, Analytics, Milestones, Settings, and Journal History pages with header navigation
- **Responsive Navigation**: Mobile-optimized header with icon-based navigation
- **Contextual Navigation**: Back buttons and breadcrumbs for better user experience
- **Journal History Screen**: Dedicated page for viewing past entries organized by child

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
The application uses two main tables:

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
- `mood`: Optional mood tracking with emoji
- `child_profile_id`: Foreign key to child_profiles (optional)
- `ai_feedback`: Optional AI-generated feedback
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

4. **Developmental Insights**:
   - Age-specific parenting insights based on child development research
   - Automatically generated when a child profile is selected
   - Covers all developmental stages from infancy to young adulthood
   - Personalized based on selected personality traits for the child

5. **Data Retrieval**:
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