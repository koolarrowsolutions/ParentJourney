// Vercel serverless function entry point
const express = require('express');
const path = require('path');

// Import your built server routes
const { registerRoutes } = require('../dist/routes.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let routesInitialized = false;

module.exports = async (req, res) => {
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }
  
  app(req, res);
};