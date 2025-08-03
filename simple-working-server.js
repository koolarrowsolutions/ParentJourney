const express = require('express');
const { createServer } = require('http');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ParentJourney server is running', timestamp: new Date().toISOString() });
});

// Basic auth endpoint
app.get('/api/auth/user', (req, res) => {
  res.json({ success: false, message: 'Authentication system ready for configuration' });
});

// Serve a simple working HTML page for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ParentJourney - Working!</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .status {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .endpoint {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
          }
          .endpoint code {
            color: #e83e8c;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌟 ParentJourney</h1>
          <p>AI-Powered Parenting Wellness Application</p>
        </div>
        
        <div class="status">
          ✅ <strong>Server Status:</strong> Running successfully on port ${port}
        </div>
        
        <h2>Server Information</h2>
        <p>The ParentJourney backend server is now operational with the following endpoints:</p>
        
        <div class="endpoint">
          <strong>Health Check:</strong> <code>GET /api/health</code><br>
          <small>Returns server status and timestamp</small>
        </div>
        
        <div class="endpoint">
          <strong>Authentication:</strong> <code>GET /api/auth/user</code><br>
          <small>User authentication endpoint (ready for configuration)</small>
        </div>
        
        <h2>Next Steps</h2>
        <p>The basic server infrastructure is working. The React frontend and additional features can now be properly integrated.</p>
        
        <p><em>Environment: ${process.env.NODE_ENV || 'development'}</em></p>
      </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`Error ${status}: ${message}`);
  res.status(status).json({ message });
});

const server = createServer(app);
const port = parseInt(process.env.PORT || '5000', 10);

server.listen({ port, host: "0.0.0.0" }, () => {
  console.log(`🚀 ParentJourney server running on port ${port}`);
  console.log(`📍 Visit: http://localhost:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Server ready for development`);
});