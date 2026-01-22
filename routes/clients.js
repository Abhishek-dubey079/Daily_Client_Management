import express from 'express';
import Client from '../models/Client.js';
import Payment from '../models/Payment.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all clients for the logged-in user
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new client
router.post('/', async (req, res) => {
  try {
    const {
      name,
      mobile,
      address,
      workDescription,
      workDate,
      nextWorkDate,
      reminderTime,
      repeatAfterDays,
      totalAmount
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const client = new Client({
      userId: req.user._id,
      name,
      mobile: mobile || '',
      address: address || '',
      workDescription: workDescription || '',
      workDate: workDate ? new Date(workDate) : new Date(),
      nextWorkDate: nextWorkDate ? new Date(nextWorkDate) : null,
      reminderTime: reminderTime || '09:00',
      repeatAfterDays: repeatAfterDays || 0,
      totalAmount: totalAmount || 0,
      receivedAmount: 0,
      remainingAmount: totalAmount || 0,
      status: 'Pending'
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      mobile,
      address,
      workDescription,
      workDate,
      nextWorkDate,
      reminderTime,
      repeatAfterDays,
      totalAmount
    } = req.body;

    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Update fields
    if (name !== undefined) client.name = name;
    if (mobile !== undefined) client.mobile = mobile;
    if (address !== undefined) client.address = address;
    if (workDescription !== undefined) client.workDescription = workDescription;
    if (workDate !== undefined) client.workDate = new Date(workDate);
    if (nextWorkDate !== undefined) client.nextWorkDate = nextWorkDate ? new Date(nextWorkDate) : null;
    if (reminderTime !== undefined) client.reminderTime = reminderTime;
    if (repeatAfterDays !== undefined) client.repeatAfterDays = repeatAfterDays;
    if (totalAmount !== undefined) client.totalAmount = totalAmount;

    await client.save();
    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete client (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.isActive = false;
    await client.save();

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get upcoming reminders (for reminder system)
router.get('/reminders/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const clients = await Client.find({
      userId: req.user._id,
      isActive: true,
      nextWorkDate: {
        $gte: now,
        $lte: tomorrow
      },
      reminderTime: { $exists: true, $ne: null }
    }).sort({ nextWorkDate: 1 });

    res.json(clients);
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add payment to client
router.post('/:id/payment', async (req, res) => {
  try {
    const { amount, notes, isFullPayment } = req.body;

    if (!amount && !isFullPayment) {
      return res.status(400).json({ message: 'Amount is required or mark as full payment' });
    }

    // Verify client belongs to user
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Calculate payment amount
    const paymentAmount = isFullPayment ? client.remainingAmount : parseFloat(amount);

    if (paymentAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than 0' });
    }

    if (paymentAmount > client.remainingAmount) {
      return res.status(400).json({ message: 'Payment amount exceeds remaining amount' });
    }

    // Create payment record
    const payment = new Payment({
      userId: req.user._id,
      clientId: client._id,
      amount: paymentAmount,
      paymentDate: new Date(),
      notes: notes || ''
    });

    await payment.save();

    // Update client payment info
    client.receivedAmount = (client.receivedAmount || 0) + paymentAmount;
    
    if (client.receivedAmount >= client.totalAmount) {
      client.receivedAmount = client.totalAmount;
      client.status = 'Completed';
    } else if (client.receivedAmount > 0) {
      client.status = 'Partial';
    }

    client.remainingAmount = client.totalAmount - client.receivedAmount;
    await client.save();

    res.status(201).json({
      payment,
      client
    });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark client as complete
router.put('/:id/complete', async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Mark as completed
    client.status = 'Completed';
    client.receivedAmount = client.totalAmount;
    client.remainingAmount = 0;

    await client.save();

    res.json({
      message: 'Client marked as completed',
      client
    });
  } catch (error) {
    console.error('Complete client error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

