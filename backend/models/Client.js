import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  workDescription: {
    type: String,
    trim: true
  },
  workDate: {
    type: Date,
    default: Date.now
  },
  nextWorkDate: {
    type: Date
  },
  reminderTime: {
    type: String, // Format: "HH:MM" (24-hour format)
    default: '09:00'
  },
  repeatAfterDays: {
    type: Number,
    default: 0 // 0 means no repeat
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  receivedAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Partial', 'Completed'],
    default: 'Pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  history: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['Work', 'Payment', 'Cycle'], default: 'Cycle' },
    amount: { type: Number, default: 0 },
    status: { type: String },
    description: { type: String }
  }]
}, {
  timestamps: true
});

// Calculate remaining amount before saving
clientSchema.pre('save', function(next) {
  this.remainingAmount = this.totalAmount - this.receivedAmount;
  
  // Update status based on payment
  if (this.receivedAmount === 0) {
    this.status = 'Pending';
  } else if (this.receivedAmount < this.totalAmount) {
    this.status = 'Partial';
  } else if (this.receivedAmount >= this.totalAmount) {
    this.status = 'Completed';
  }
  
  next();
});

const Client = mongoose.model('Client', clientSchema);

export default Client;



