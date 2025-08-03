const express = require('express');
const { createServer } = require('http');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Simple static file serving for client
app.use(express.static('client'));

const server = createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

server.listen({ port, host: "0.0.0.0" }, () => {
  console.log(`Simple server running on port ${port}`);
});