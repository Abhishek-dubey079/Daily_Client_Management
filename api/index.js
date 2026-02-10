import { app, connectDB } from '../backend/server.js';

// Vercel Serverless Function Entry Point
export default async (req, res) => {
  // 1. Ensure Database Connection
  // We await this to ensure Mongoose is ready before processing the request.
  // In a serverless environment, the connection might be cached from a previous hot lambda.
  try {
    await connectDB();
  } catch (error) {
    console.error('Critical Database connection failure:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }

  // 2. Hand off to Express App
  return app(req, res);
};
