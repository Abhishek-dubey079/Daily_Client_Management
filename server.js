// Traditional server entry point (for local development)
// For Vercel deployment, use api/index.js instead

import app from './app.js';
import mongoose from 'mongoose';

// Only start listening if not in Vercel environment
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  
  // Connect to MongoDB before starting server (for traditional server)
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
      
      // Start the server after MongoDB connection
      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`✅ Health check: http://localhost:${PORT}/health`);
        console.log(`✅ API health check: http://localhost:${PORT}/api/health`);
        console.log(`✅ CORS enabled for: http://localhost:3000`);
      });
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      process.exit(1);
    }
  };
  
  connectDB();
}

export default app;
