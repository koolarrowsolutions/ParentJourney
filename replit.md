# ParentJourney - Digital Parenting Journal

## Overview

ParentJourney is a comprehensive full-stack web application designed as a digital journaling platform for parents. It provides an ecosystem for documenting parenting experiences, tracking milestones, analyzing patterns, and receiving AI-powered insights. Key capabilities include photo uploads, mood analytics, milestone tracking, notification systems, and advanced search, all within a user-friendly interface. The business vision is to offer a supportive tool for parents to reflect on their journey, understand their emotional patterns, and gain personalized guidance.

## User Preferences

Preferred communication style: Simple, everyday language.
Supportive messaging: Warm, encouraging greetings with emojis and affirming language that validates parenting efforts.
Authentication preference: Simple username/email + password system without social login complexity.

## System Architecture

The application employs a modern full-stack architecture with clear separation between client and server.

## Recent Changes (August 2025)

**Authentication System Resolution:**
- Fixed critical authentication token inconsistencies between api-client.ts and queryClient.ts
- Standardized token name to 'parentjourney_token' across all client-side authentication functions
- Updated DailyReflection component to use proper authentication headers for journal saving
- Resolved journal entry saving failures for authenticated users
- Successfully tested with user "Ernesto A. Bejarano" - authentication and journal saving now working properly

**Core Technologies:**
- **Frontend**: React-based single-page application with TypeScript, Vite, Wouter (routing), TanStack Query (server state), React Hook Form with Zod (forms), shadcn/ui and Radix UI (components), Tailwind CSS (styling), date-fns (date handling).
- **Backend**: Express.js server with TypeScript, esbuild, PostgreSQL with Drizzle ORM, Zod (validation schemas), RESTful API design.
- **AI Integration**: OpenAI GPT-4o for parenting feedback and mood analysis.

**UI/UX Decisions:**
- **Design Philosophy**: User-friendliness for busy parents, intuitive navigation, and clear visual cues.
- **Animations**: Modern pop/bounce effects (popFadeIn, bounceFadeIn, bounceIn) for smooth transitions, and interactive button effects (hover-scale, button-press, hover-lift).
- **Tooltips**: Professional TooltipWrapper component for user guidance.
- **Navigation**: Multi-page application structure (Home, Analytics, Milestones, Settings, Journal History, Community) with responsive header navigation, back buttons, and breadcrumbs.
- **Wellness Features**: Integrated "Calm Reset Tool" with breathing exercises, guided meditations, and positive affirmations.

**Technical Implementations & Feature Specifications:**
- **Daily Check-In System**: 10-category wellness assessment with visual progress and data analytics.
- **Parent Analytics Dashboard**: Trend analysis and visualization of daily check-in categories, streak calculation, and wellness scoring.
- **Enhanced UX Flow**: Reordered home page with journal entries first, child-specific views, explanatory text, and color-coding linking entries to child profiles.
- **Interactive Entry Previews**: Hover-to-expand functionality for journal entries, with clickable entries leading to full history.
- **Visual Linking System**: Color-coded dots (blue, purple, pink) matching child profiles to associated journal entries.
- **Authentication**: Streamlined username/email + password system with robust session management, production-ready CORS, environment-based cookie settings, and dual authentication (session + token).
- **Family Support**: Multi-parent family management supporting up to 4 parents with relationship tracking.
- **Community Forum**: Integrated posting and commenting system.
- **Voice Input**: Functionality across all text entry fields.
- **Photo Management**: Drag-and-drop photo uploads with gallery display.
- **AI Mood Analysis**: Automatic mood detection and quantification (1-10 scale) using OpenAI GPT-4o, creating emotional journey maps.
- **AI-Powered Insights**: OpenAI GPT-4o generates warm, age-appropriate parenting feedback, structured for validation, suggestions, and growth insights.
- **Milestone Tracking**: Age-appropriate and custom milestone tracking.
- **Notifications**: Cost-free email notifications via Brevo API and browser notifications.
- **Search**: Advanced multi-filter search by keywords, mood, child, dates, and AI feedback.
- **Weekly Reflections**: Automated summaries with pattern analysis.
- **Developmental Insights**: Age-specific parenting insights personalized by child's selected personality traits.
- **Child Profile Management**: Comprehensive dialog system for managing multiple child profiles, including age calculation and personality trait selection.
- **Journal History**: Dedicated screen for viewing past entries, filterable by child, with AI feedback display.
- **Welcome System**: Three-tier welcome messaging system with static explanatory text, rotating daily insights, and per-login rotating messages.
- **Payment Processing**: Dual payment system supporting Stripe and PayPal Express with flexible pricing and subscription management.
- **Admin Dashboard**: Full administrative interface with user management, subscription handling, payment oversight, and customer support tools.

**System Design Choices:**
- **Database Schema**: Extended family-centric schema including `families`, `parent_profiles`, `community_posts`, `community_comments`, `child_profiles`, and `journal_entries` tables, designed for relationship tracking and detailed data storage.

## External Dependencies

- **Database**: PostgreSQL (specifically, Neon Database serverless PostgreSQL).
- **AI Service**: OpenAI API (for GPT-4o model).
- **Email Service**: Brevo API.
- **Component Library Primitives**: Radix UI.
- **Icons**: Lucide React.