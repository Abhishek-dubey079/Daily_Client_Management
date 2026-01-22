// Express app configuration (without server.listen)
// This can be used both for traditional servers and Vercel serverless functions

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';

dotenv.config();

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

// MongoDB Connection - Serverless-friendly
let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse the connection
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      console.error('ERROR: MONGODB_URI is not set in environment variables!');
      throw new Error('MONGODB_URI is not set');
    }
    
    // If connection exists but is disconnected, close it first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      // Serverless-friendly options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    isConnected = false;
    throw error;
  }
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
    if (!isConnected || mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('MongoDB connection middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Database connection error. Please try again later.' 
    });
  }
});

export default app;

