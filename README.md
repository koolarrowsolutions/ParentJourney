# ParentJourney - Digital Parenting Wellness Platform

A comprehensive AI-powered parenting wellness web application that supports mental health, emotional intelligence, and holistic family well-being through innovative digital tools and personalized experiences.

## 🌟 Features

### Core Functionality
- **AI-Powered Journaling**: Interactive journal entries with OpenAI GPT-4o analysis and mood tracking
- **Wellness Dashboard**: Daily check-ins across 10 wellness categories with trend visualization
- **Family Management**: Support for multiple children with personality trait tracking
- **Milestone Tracking**: Age-appropriate developmental milestone monitoring
- **Community Forum**: Integrated posting and commenting system for parent support

### Advanced Features
- **Voice Input**: Speech-to-text functionality across all text entry fields
- **Photo Management**: Drag-and-drop photo uploads with gallery display
- **AI Mood Analysis**: Automatic mood detection and quantification (1-10 scale)
- **Smart Search**: Advanced multi-filter search by keywords, mood, child, dates, and AI feedback
- **Streak Tracking**: Motivational streak system with progressive emoji rewards
- **Export/Import**: PDF export for favorite entries and JSON backup/restore

### Admin & Management
- **Live Admin Dashboard**: Real-time user management with PostgreSQL integration
- **Payment Processing**: Dual payment system (Stripe & PayPal Express)
- **Automated Notifications**: Email reminders and weekly progress reports
- **User Analytics**: Comprehensive statistics and engagement tracking

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management
- **shadcn/ui** + **Radix UI** for accessible component library
- **Tailwind CSS** for modern responsive styling
- **Framer Motion** for smooth animations

### Backend
- **Node.js** with **Express.js** server
- **PostgreSQL** with **Drizzle ORM** for database management
- **OpenAI API** integration for AI-powered insights
- **Passport.js** for authentication
- **Express Session** with PostgreSQL store
- **Node-cron** for scheduled notifications

### Deployment & Infrastructure
- **Vercel** for serverless deployment
- **Neon Database** for managed PostgreSQL
- **Environment-based configuration** for secure secrets management

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (local or managed)
- OpenAI API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd parentjourney
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration values
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Application will be available at `http://localhost:5000`

### Production Deployment

#### Vercel Deployment

1. **Connect to Vercel**
   - Import your repository to Vercel
   - Configure environment variables in Vercel dashboard

2. **Required Environment Variables**
   ```
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   SESSION_SECRET=your_random_session_secret
   NODE_ENV=production
   ```

3. **Optional Environment Variables**
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   BREVO_API_KEY=your_brevo_api_key
   BREVO_EMAIL=your_sender_email
   ```

4. **Deploy**
   ```bash
   # Automatic deployment on git push to main branch
   git push origin main
   ```

## 🔐 Security Features

- **Secure Authentication**: Session-based auth with PostgreSQL session store
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Environment-based CORS configuration
- **Input Validation**: Zod schemas for all API endpoints
- **Admin Access Control**: Role-based admin dashboard access

## 📊 Database Schema

### Core Tables
- `families` - Family group management
- `parent_profiles` - Parent user accounts and preferences
- `child_profiles` - Child information and personality traits
- `journal_entries` - Interactive journal entries with AI analysis
- `community_posts` - Forum posts and interactions
- `community_comments` - Forum comment system

## 🤖 AI Integration

### OpenAI GPT-4o Features
- **Mood Analysis**: Automatic emotional state detection from journal entries
- **Personalized Insights**: Age-appropriate parenting feedback and suggestions
- **Developmental Guidance**: Child-specific insights based on personality traits
- **Weekly Summaries**: Automated pattern analysis and recommendations

## 📱 Mobile Responsiveness

- Fully responsive design optimized for mobile devices
- Touch-friendly interface with gesture support
- Progressive Web App (PWA) capabilities
- Offline-first approach for core features

## 🎨 Design System

### Theme & Styling
- Modern, parent-friendly design language
- Dark/light mode support with system preference detection
- Consistent color coding for child profiles throughout the application
- Smooth animations and micro-interactions for enhanced UX

### Accessibility
- WCAG 2.1 compliant components via Radix UI
- Keyboard navigation support
- Screen reader optimized
- High contrast mode compatibility

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes to database

# Type Checking
npm run check        # Run TypeScript type checking
```

## 📈 Analytics & Monitoring

- User engagement tracking
- Journal entry analytics
- Mood trend analysis
- Admin dashboard with real-time statistics
- Error logging and performance monitoring

## 🤝 Contributing

This is a private project. For support or questions, please contact the development team.

## 📄 License

Private proprietary software. All rights reserved.

---

**ParentJourney** - Empowering parents through technology, fostering deeper connections with children and self-awareness in the parenting journey.