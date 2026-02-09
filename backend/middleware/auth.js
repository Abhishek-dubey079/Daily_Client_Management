import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    // Check JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('[Auth Middleware] JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Extract token from header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header, access denied' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token || token.length === 0) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify token
    let decoded = null;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('[Auth Middleware] JWT verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Token is not valid or expired' });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.error('[Auth Middleware] User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Unexpected error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

