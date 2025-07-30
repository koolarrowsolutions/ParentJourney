# ParentJourney - Digital Parenting Journal

## Overview

ParentJourney is a full-stack web application designed as a digital journaling platform for parents. The application allows parents to document their parenting experiences, reflect on their journey, and receive AI-powered feedback and insights to support their growth as parents.

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

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Child Profile Management**: Comprehensive dialog system for managing multiple child profiles

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