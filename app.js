// Express app configuration (without server.listen)
// This can be used both for traditional servers and Vercel serverless functions

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';

// Only load dotenv in development (not in Vercel production)
// Vercel provides environment variables via process.env automatically
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  // Dynamic import to avoid bundling dotenv in production
  import('dotenv').then((dotenv) => {
    dotenv.default.config();
  }).catch(() => {
    // dotenv is optional, continue without it
  });
}

const app = express();

// CORS Configuration - Dynamic origin for Vercel deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    // Also allow any Vercel preview deployments
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes - Using /api prefix to match frontend proxy
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// MongoDB Connection - Serverless-friendly with globalThis caching
// Use globalThis to cache connection across serverless function invocations
// Cache connection in globalThis (persists across function invocations in Vercel)
if (!globalThis.mongooseConnection) {
  globalThis.mongooseConnection = null;
  globalThis.mongooseConnectionPromise = null;
}

const connectDB = async () => {
  // If already connected and ready, reuse the connection
  if (globalThis.mongooseConnection && mongoose.connection.readyState === 1) {
    return;
  }

  // If connection is in progress, wait for it
  if (globalThis.mongooseConnectionPromise) {
    return globalThis.mongooseConnectionPromise;
  }

  // Create new connection promise
  globalThis.mongooseConnectionPromise = (async () => {
    try {
      if (!process.env.MONGODB_URI) {
        console.error('ERROR: MONGODB_URI is not set in environment variables!');
        throw new Error('MONGODB_URI is not set');
      }
      
      // If connection exists but is disconnected, close it first
      if (mongoose.connection.readyState !== 0) {
        try {
          await mongoose.connection.close();
        } catch (closeError) {
          // Ignore close errors
        }
      }
      
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI, {
        // Serverless-friendly options
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 1, // Single connection for serverless
        minPoolSize: 0,
      });
      
      globalThis.mongooseConnection = mongoose.connection;
      console.log('✅ MongoDB connected successfully');
      console.log('Database:', mongoose.connection.name);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        globalThis.mongooseConnection = null;
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        globalThis.mongooseConnection = null;
      });
      
      return mongoose.connection;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      globalThis.mongooseConnection = null;
      globalThis.mongooseConnectionPromise = null;
      throw error;
    }
  })();

  return globalThis.mongooseConnectionPromise;
};

// Connect to MongoDB on first request (lazy connection for serverless)
// This middleware ensures MongoDB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    // Skip connection check for health endpoints
    if (req.path === '/health' || req.path === '/api/health') {
      return next();
    }
    
    // Check if we need to connect
    if (!globalThis.mongooseConnection || mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('MongoDB connection middleware error:', error.message);
    return res.status(500).json({ 
      success: false,
      message: 'Database connection error. Please try again later.' 
    });
  }
});

export default app;

