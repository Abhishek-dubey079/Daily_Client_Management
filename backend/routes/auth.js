import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    console.log('=== REGISTER ATTEMPT ===');
    console.log('Received email:', email);
    console.log('Password provided:', password ? 'Yes' : 'No');
    console.log('Name provided:', name || 'Not provided');

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Normalized email:', normalizedEmail);

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user (password will be hashed by pre-save hook)
    console.log('Creating new user...');
    const user = new User({
      email: normalizedEmail,
      password, // Will be hashed by pre-save hook
      name: name || 'Chachu'
    });

    // Save user and verify password was hashed
    try {
      await user.save();
      console.log('✅ User saved successfully');
      console.log('   User ID:', user._id);
      console.log('   Password hashed:', user.password ? 'Yes' : 'No');
      console.log('   Password hash length:', user.password ? user.password.length : 0);
      
      // Verify password was actually hashed
      if (!user.password || user.password.length < 10) {
        throw new Error('Password was not hashed correctly during save');
      }
      
      // Verify it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
      if (!user.password.startsWith('$2')) {
        throw new Error('Password hash format is invalid');
      }
      
      console.log('✅ Password hash verified');
    } catch (saveError) {
      console.error('❌ Error saving user:', saveError);
      throw saveError;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('JWT token generated successfully');
    console.log('=== REGISTER SUCCESS ===');

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('=== REGISTER ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    // Handle duplicate key error (MongoDB)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  let user = null;
  
  try {
    // Extract and validate request body
    const { email, password } = req.body || {};

    // Validate input
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required and must be a valid string' 
      });
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Password is required and must be a valid string' 
      });
    }

    // Normalize email to lowercase for case-insensitive matching
    const normalizedEmail = email.toLowerCase().trim();

    // Verify JWT_SECRET is loaded
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length === 0) {
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error. Please contact administrator.' 
      });
    }

    // Verify MongoDB connection
    const connectionState = mongoose.connection.readyState;
    if (connectionState !== 1) {
      return res.status(500).json({ 
        success: false,
        message: 'Database connection error. Please try again later.' 
      });
    }

    // Find user with null checks
    try {
      // Use findOne without lean() so we can update the document
      const userDoc = await User.findOne({ email: normalizedEmail });
      
      if (!userDoc) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      }

      // Convert to object for logging (but keep userDoc for updates)
      user = userDoc.toObject();
      
      // TEMPORARY LOG: User found
      console.log('✅ User found');
      // TEMPORARY LOG: Password format
      console.log('   Password format:', user.password ? (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') ? 'Hashed' : 'Plain-text') : 'Missing');
      
      // ENFORCE PASSWORD INTEGRITY: Auto-hash plain-text passwords
      const isPlainText = user.password && typeof user.password === 'string' && 
                         !user.password.startsWith('$2a$') && 
                         !user.password.startsWith('$2b$') &&
                         user.password.length < 60;
      
      if (isPlainText) {
        console.log('⚠️ Plain-text password detected - auto-hashing...');
        
        try {
          // Hash the plain-text password
          const hashedPassword = await bcrypt.hash(user.password, 10);
          
          if (!hashedPassword || (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$'))) {
            throw new Error('Password hashing failed');
          }
          
          // Update user record in MongoDB
          userDoc.password = hashedPassword;
          await userDoc.save();
          
          // Update user object for comparison
          user.password = hashedPassword;
          
          console.log('✅ Password hashed and saved');
        } catch (hashError) {
          console.error('❌ Error hashing plain-text password:', hashError.message);
          return res.status(500).json({ 
            success: false,
            message: 'Password security update failed. Please try again.' 
          });
        }
      }
      
      // Verify password exists and is valid hash
      if (!user.password || typeof user.password !== 'string') {
        return res.status(500).json({ 
          success: false,
          message: 'User account error. Please contact administrator.' 
        });
      }

      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        return res.status(500).json({ 
          success: false,
          message: 'User account error. Please contact administrator.' 
        });
      }

    } catch (dbError) {
      console.error('--- Database Error ---');
      console.error('❌ Database error while finding user');
      console.error('   Error type:', dbError.constructor.name);
      console.error('   Error name:', dbError.name);
      console.error('   Error message:', dbError.message);
      console.error('   Error code:', dbError.code);
      console.error('   Error stack:', dbError.stack);
      return res.status(500).json({ 
        success: false,
        message: 'Database error. Please try again later.' 
      });
    }

    // Compare password with comprehensive error handling
    let isMatch = false;
    try {
      // Validate inputs before comparison
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid password format' 
        });
      }
      
      if (!user.password || typeof user.password !== 'string' || 
          (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$'))) {
        return res.status(500).json({ 
          success: false,
          message: 'Password verification error. Please try again.' 
        });
      }
      
      // TEMPORARY LOG: Password comparison
      console.log('🔐 Comparing password...');
      
      // Use bcrypt.compare directly with error handling
      isMatch = await bcrypt.compare(password, user.password);
      
      // TEMPORARY LOG: Password comparison result
      console.log('   Comparison result:', isMatch ? 'Match' : 'No match');

    } catch (bcryptError) {
      console.error('❌ Bcrypt comparison error:', bcryptError.message);
      return res.status(500).json({ 
        success: false,
        message: 'Password verification error. Please try again.' 
      });
    }

    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token with error handling
    let token = null;
    try {
      // Verify user ID exists
      if (!user._id) {
        throw new Error('User ID is missing');
      }
      
      const userIdString = user._id.toString();
      
      // Verify JWT_SECRET
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length === 0) {
        throw new Error('JWT_SECRET is not configured');
      }
      
      const jwtSecret = process.env.JWT_SECRET;
      
      token = jwt.sign(
        { userId: userIdString },
        jwtSecret,
        { expiresIn: '30d' }
      );

      if (!token || typeof token !== 'string' || token.length === 0) {
        throw new Error('Token generation failed');
      }

    } catch (jwtError) {
      return res.status(500).json({ 
        success: false,
        message: 'Token generation error. Please try again.' 
      });
    }

    // Prepare response data
    const responseData = {
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || 'Chachu'
      }
    };
    
    // Final validation before sending
    if (!responseData.token || !responseData.user || !responseData.user.id) {
      return res.status(500).json({ 
        success: false,
        message: 'Login response error. Please try again.' 
      });
    }

    // Send successful response
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Login error:', error.message);
    return res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

export default router;

