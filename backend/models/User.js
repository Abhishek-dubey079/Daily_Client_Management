import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    default: 'Chachu'
  }
}, {
  timestamps: true
});

// Hash password before saving with validation
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Validate password before hashing
    if (!this.password || typeof this.password !== 'string') {
      return next(new Error('Password must be a non-empty string'));
    }

    if (this.password.length < 6) {
      return next(new Error('Password must be at least 6 characters'));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(this.password, 10);
    
    // Verify hash was created
    if (!hashedPassword || hashedPassword.length < 10) {
      return next(new Error('Password hashing failed'));
    }

    // Verify it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (!hashedPassword.startsWith('$2')) {
      return next(new Error('Invalid password hash format'));
    }

    this.password = hashedPassword;
    next();
  } catch (error) {
    console.error('[User Model] Password hashing error:', error);
    next(error);
  }
});

// Compare password method with error handling
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Validate inputs
    if (!candidatePassword || typeof candidatePassword !== 'string') {
      console.error('[comparePassword] Invalid candidate password');
      return false;
    }
    
    if (!this.password || typeof this.password !== 'string') {
      console.error('[comparePassword] User password hash is missing or invalid');
      return false;
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error('[comparePassword] Error during password comparison:', error);
    return false;
  }
};

const User = mongoose.model('User', userSchema);

export default User;

