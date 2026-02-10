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

// MongoDB Connection (Serverless qualified)
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected (Cached)');
    return cachedDb;
  }

  console.log('Connecting to MongoDB...');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set!');
    throw new Error('MONGODB_URI is not set');
  }

  try {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering to fail fast if not connected
      serverSelectionTimeoutMS: 5000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, opts);

    cachedDb = conn;
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

// Ensure connection helper
const ensureConnection = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to ensure database connection:', error.message);
    // Do NOT exit process in serverless; let the request fail gracefully or retry
    throw error;
  }
};

// Routes - Using /api prefix to match Vercel routing
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    console.log('--- Health Check Starting ---');
    console.log('MONGODB_URI is', process.env.MONGODB_URI ? 'SET' : 'MISSING');
    console.log('JWT_SECRET is', process.env.JWT_SECRET ? 'SET' : 'MISSING');

    // Attempt connection but don't fail the request if it fails
    let dbStatus = 'disconnected';
    try {
      if (mongoose.connection.readyState === 1) {
        dbStatus = 'connected';
      } else {
        await connectDB(); // Try to connect
        dbStatus = 'connected';
      }
    } catch (e) {
      dbStatus = 'error: ' + e.message;
      console.error('Health check DB connection failed:', e.message);
    }

    res.json({
      status: 'OK',
      message: 'API is running',
      db_status: dbStatus,
      env: {
        mongodb_set: !!process.env.MONGODB_URI,
        jwt_set: !!process.env.JWT_SECRET,
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
  // Simple diagnostic check before ANY logic
  if (req.url === '/api/simple-check' || req.url === '/api/simple-check/') {
    return res.json({
      status: 'simple-check-ok',
      time: new Date().toISOString(),
      url: req.url
    });
  }

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

