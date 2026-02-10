import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Route imports
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- CORS Configuration ---
// Unified configuration for both Local and Vercel
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.VITE_APP_URL || null
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, curl) or if origin is in allowed list
    if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      // In production, we might want to be stricter, but for now allow to avoid CORS issues
      // You can toggle this to `callback(new Error('Not allowed by CORS'))` for strict mode
      console.log('CORS: Origin not explicitly allowed, but proceeding:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// --- Request Logging ---
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);

// --- Health Check (DB Independent) ---
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: 'OK',
    message: 'API is running',
    db_status: statusMap[dbState] || 'unknown',
    env: {
      node_env: process.env.NODE_ENV,
      mongo_set: !!process.env.MONGODB_URI
    }
  });
});

// --- MongoDB Connection (Cached for Serverless) ---
let cachedDb = null;

const connectDB = async () => {
  // If already connected, return cached connection
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected (Cached)');
    return cachedDb;
  }

  // Prevent multiple simultaneous connection attempts
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected (Mongoose state)');
    cachedDb = mongoose;
    return cachedDb;
  }

  console.log('Connecting to MongoDB...');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set!');
    throw new Error('MONGODB_URI is not set');
  }

  try {
    const opts = {
      bufferCommands: false, // Fail fast if not connected
      serverSelectionTimeoutMS: 5000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, opts);
    cachedDb = conn;
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

// --- Server Startup (Local Only) ---
// Only start the server if this file is run directly (not imported)
if (process.argv[1] === __filename) {
  // Check JWT_SECRET locally
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET is not set! Auth will fail.');
  }

  const PORT = process.env.PORT || 5000;

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running locally on port ${PORT}`);
      console.log(`✅ API Health: http://localhost:${PORT}/api/health`);
    });
  }).catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

// Export app and connectDB for Vercel (api/index.js)
export { app, connectDB };
export default app;
