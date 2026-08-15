const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/authMiddleware');

// Get all customers
router.get('/', auth, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get customer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a customer
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // First delete all transactions related to this customer
    await Transaction.deleteMany({ customerId: customer._id });
    
    // Then delete the customer
    await Customer.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new customer
router.post('/', auth, async (req, res) => {
  try {
    const {
      name, phone, address,
      amountGiven, totalAmountToReceive, dailyPaymentAmount,
      startDate, endDate, notes
    } = req.body;

    // Initialize 100 day tracker
    const paymentTracker = [];
    for (let i = 1; i <= 100; i++) {
      paymentTracker.push({ dayIndex: i, status: 'pending' });
    }

    const customer = new Customer({
      name, phone, address,
      amountGiven, totalAmountToReceive, dailyPaymentAmount,
      startDate, endDate, notes, paymentTracker
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a payment day status
router.post('/:id/update-day', auth, async (req, res) => {
  try {
    const { dayIndex, status, paymentMode, notes } = req.body;
    
    if (!['pending', 'paid', 'missed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const day = customer.paymentTracker.find(d => d.dayIndex == dayIndex);
    if (!day) {
      console.log('Day not found for index:', dayIndex);
      return res.status(400).json({ message: 'Invalid day index' });
    }

    const oldStatus = day.status || (day.isPaid ? 'paid' : 'pending');
    console.log(`Updating Day ${dayIndex}: ${oldStatus} -> ${status}`);
    
    if (oldStatus === status) {
      return res.json(customer);
    }

    // Update financial stats if moving to/from 'paid'
    if (status === 'paid') {
      customer.amountPaidTillNow += customer.dailyPaymentAmount;
      day.paidDate = new Date();
      
      // Log transaction
      const transaction = new Transaction({
        customerId: customer._id,
        amount: customer.dailyPaymentAmount,
        paymentMode: paymentMode || 'Cash',
        notes: notes || `Payment for Day ${dayIndex}`,
        dayIndex
      });
      await transaction.save();
    } else if (oldStatus === 'paid') {
      customer.amountPaidTillNow -= customer.dailyPaymentAmount;
      day.paidDate = null;
    }

    day.status = status;

    // Check if fully paid
    if (customer.amountPaidTillNow >= customer.totalAmountToReceive) {
      customer.status = 'completed';
    } else if (customer.status === 'completed') {
      customer.status = 'active';
    }

    await customer.save();
    res.json(customer);
  } catch (error) {
    console.error('Error in update-day:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

// Early settlement
router.post('/:id/settle', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.status = 'completed';
    await customer.save();
    res.json(customer);
  } catch (error) {
    console.error('Error in settle:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Circle Account (Restart cycle)
router.post('/:id/circle', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Calculate new amounts based on the formula
    const remainingAmount = customer.totalAmountToReceive - customer.amountPaidTillNow;
    const newAmountGiven = customer.amountGiven - remainingAmount;

    // Reset tracker
    const paymentTracker = [];
    for (let i = 1; i <= 100; i++) {
      paymentTracker.push({ dayIndex: i, status: 'pending' });
    }

    // Update customer fields
    customer.amountGiven = newAmountGiven;
    customer.amountPaidTillNow = 0;
    customer.paymentTracker = paymentTracker;
    
    // Set new dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 100);
    
    customer.startDate = startDate;
    customer.endDate = endDate;
    customer.status = 'active';

    await customer.save();
    res.json(customer);
  } catch (error) {
    console.error('Error in circle:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transactions for a customer
router.get('/:id/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ customerId: req.params.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
