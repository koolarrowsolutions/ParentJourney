# ParentJourney - Digital Parenting Journal

A comprehensive AI-powered parenting wellness web application that supports mental health, emotional intelligence, and holistic family well-being through innovative digital tools and personalized experiences.

## 🚀 Live Demo

Visit the deployed application: [Your Vercel URL Here]

## 📁 Project Structure

```
ParentJourney/
├── client/              # React frontend application
│   ├── src/            # Source code
│   ├── index.html      # HTML template
│   └── package.json    # Frontend dependencies
├── server/             # Express.js backend (for local development)
├── shared/             # Shared types and utilities
├── dist/               # Built application (auto-generated)
│   └── public/         # Static files for deployment
├── vercel.json         # Vercel deployment configuration
└── package.json        # Root dependencies and scripts
```

## 🛠️ Tech Stack

### Frontend
- **React.js** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Wouter** for routing
- **TanStack Query** for state management
- **Framer Motion** for animations

### Backend (Development)
- **Node.js/Express** server
- **PostgreSQL** with Drizzle ORM
- **OpenAI API** for AI insights
- **Stripe & PayPal** for payments

## 📦 Installation & Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ParentJourney
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy and configure your environment variables
   cp .env.example .env
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🚀 Deployment to Vercel

### Prerequisites
- GitHub repository with your code
- Vercel account connected to GitHub

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Verify Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Your app will be available at `your-project.vercel.app`

### Vercel Configuration

The `vercel.json` file is already configured for optimal deployment:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🔧 Features

- **AI-Powered Insights**: Personalized parenting guidance using OpenAI
- **Mood Tracking**: Daily emotional wellness monitoring
- **Child Profiles**: Multi-child family management
- **Journal Entries**: Digital reflection and growth tracking
- **Analytics Dashboard**: Wellness trends and progress visualization
- **Community Forum**: Parent support and connection
- **Milestone Tracking**: Developmental progress monitoring
- **Dark/Light Theme**: Responsive design for all devices

## 🔐 Environment Variables

For local development, you'll need:

```env
# Database
DATABASE_URL=your_postgresql_url

# AI Services
OPENAI_API_KEY=your_openai_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_key
PAYPAL_CLIENT_ID=your_paypal_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# Email Service
BREVO_API_KEY=your_brevo_key
```

**Note**: The frontend deployment doesn't require these environment variables as it's a static site.

## 📱 Responsive Design

- Mobile-first responsive design
- Touch-friendly interactions
- Progressive Web App features
- Cross-browser compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Deployment Issues

**1. Vercel shows backend code instead of frontend**
- Ensure `vercel.json` points to correct output directory
- Verify build completes successfully
- Check that `dist/public/index.html` exists after build

**2. Build fails on Vercel**
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Review build logs for specific errors

**3. Routing issues in production**
- Ensure rewrites configuration in `vercel.json`
- Check that all routes are properly configured in `App.tsx`

### Getting Help

- Check the [Issues](../../issues) page
- Review build logs in Vercel dashboard
- Ensure all required files are committed to GitHub

---

Built with ❤️ for parents everywhere