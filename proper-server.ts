import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Basic auth endpoint stub
app.get('/api/auth/user', (req, res) => {
  res.json({ success: false, message: 'Authentication not yet configured' });
});

// Initialize server and setup Vite in development
const server = createServer(app);

async function setupViteInDev() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: path.resolve(process.cwd(), 'client'),
        configFile: false,  // Skip config file
        plugins: []  // Minimal plugins
      });
      
      app.use(vite.middlewares);
      
      // Handle all non-API routes with Vite
      app.use('*', async (req, res, next) => {
        if (req.originalUrl.startsWith('/api')) {
          return next();
        }
        
        try {
          const url = req.originalUrl;
          const template = await vite.transformIndexHtml(url, `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>ParentJourney</title>
              </head>
              <body>
                <div id="root"></div>
                <script type="module" src="/src/main.tsx"></script>
              </body>
            </html>
          `);
          
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
      
      console.log('Vite development server initialized (minimal config)');
    } catch (error) {
      console.error('Failed to initialize Vite:', error);
      // Fallback to basic static serving
      setupBasicServer();
    }
  } else {
    setupBasicServer();
  }
}

function setupBasicServer() {
  console.log('Setting up basic static file server...');
  app.use(express.static(path.resolve(process.cwd(), 'client')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(process.cwd(), 'client', 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`Error ${status}: ${message}`);
  res.status(status).json({ message });
});

const port = parseInt(process.env.PORT || '5000', 10);

// Start the server with Vite setup
setupViteInDev().then(() => {
  server.listen({ port, host: "0.0.0.0" }, () => {
    console.log(`ParentJourney server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Visit: http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});