import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Verify environment variables
console.log('=== SERVER STARTUP ===');
console.log('PORT:', process.env.PORT || 5000);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'NOT SET');

// ENFORCE JWT_SECRET at startup - throw error if missing
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length === 0) {
  console.error('❌ FATAL ERROR: JWT_SECRET is not set or empty!');
  console.error('   Authentication will fail without JWT_SECRET.');
  console.error('   Please set JWT_SECRET in your .env file.');
  process.exit(1);
}

const app = express();

// CORS Configuration - Allow requests from frontend (local and Vercel)
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://daily-client-management.vercel.app',
    /\.vercel\.app$/
  ],
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

// Serve static files from React app (frontend/dist)
// Handle both local development and Vercel deployment paths
const frontendDistPath = path.join(__dirname, '../frontend/dist');

// Check if dist folder exists, log for debugging
if (existsSync(frontendDistPath)) {
  console.log('✅ Frontend dist folder found at:', frontendDistPath);
  app.use(express.static(frontendDistPath));
} else {
  console.warn('⚠️ Frontend dist folder not found at:', frontendDistPath);
  console.warn('   Make sure to run "npm run build" in the frontend folder');
}

// Catch-all handler: send back React's index.html file for any non-API routes
// This allows React Router to handle client-side routing
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  
  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('ERROR: MONGODB_URI is not set in environment variables!');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ API health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ CORS enabled for: http://localhost:3000`);
});

