import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../backend/routes/auth.js';
import clientRoutes from '../backend/routes/clients.js';

dotenv.config();

const app = express();

// CORS Configuration - Allow requests from frontend (Vercel and localhost)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.VITE_APP_URL || null
    ].filter(Boolean);

    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection (reuse connection if exists)
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      console.error('ERROR: MONGODB_URI is not set in environment variables!');
      throw new Error('MONGODB_URI is not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    isConnected = false;
    throw error;
  }
};

// Connect to MongoDB on first request
let connectionPromise = null;
const ensureConnection = async () => {
  if (!connectionPromise) {
    connectionPromise = connectDB();
  }
  try {
    await connectionPromise;
  } catch (error) {
    // Reset promise on error so we can retry
    connectionPromise = null;
    throw error;
  }
};

// Routes - Using /api prefix
app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    console.log('--- Health Check Starting ---');
    console.log('MONGODB_URI is', process.env.MONGODB_URI ? 'SET' : 'MISSING');
    console.log('JWT_SECRET is', process.env.JWT_SECRET ? 'SET' : 'MISSING');

    await ensureConnection();
    res.json({
      status: 'OK',
      message: 'API is running',
      connected: isConnected,
      env: {
        mongodb: !!process.env.MONGODB_URI,
        jwt: !!process.env.JWT_SECRET,
        node_env: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Health Check Error:', error.message);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Export as serverless function
export default async (req, res) => {
  try {
    // Add request logging for Vercel
    console.log(`[Vercel Function] Request received: ${req.method} ${req.url}`);

    // Ensure MongoDB connection
    await ensureConnection();

    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error during initialization',
        error: error.message
      });
    }
  }
};

