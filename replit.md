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
- **Daily Check-In System**: Comprehensive 10-category wellness assessment (energy, patience, parent-child connection, etc.) presented through a gallery-style interface with visual progress.
- **Parent Analytics Dashboard**: Comprehensive trend analysis and visualization of all daily check-in categories, replacing previous "Mood Analytics."
- **Authentication**: Streamlined username/email + password system with robust session management and cookie configuration.
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