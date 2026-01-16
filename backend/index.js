// Libraries
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 8000;

// Database connection
const { connectDB } = require('./database/connection');

// Initialize models with associations
require('./models');

// Routes
const router = require('./routes/router');

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser(""));

// CORS configuration for Vercel deployment
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  credentials: true,
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In production, still allow if not in list (for flexibility)
      // You can make this stricter if needed
      callback(null, true);
    }
  }
}));
app.use('/api', router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Amazon Clone API', 
    status: 'running',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      health: '/health'
    }
  });
});

// For Vercel serverless - connect on first request
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
});

// Export for Vercel serverless functions
module.exports = app;