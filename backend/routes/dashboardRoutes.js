const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/authMiddleware');

router.get('/stats', auth, async (req, res) => {
  try {
    const customers = await Customer.find();
    
    const totalCustomers = customers.length;
    let totalMoneyGiven = 0;
    let totalMoneyToCollect = 0;
    let totalCollectedAmount = 0;
    
    let activeCustomers = 0;
    let completedCustomers = 0;

    customers.forEach(c => {
      totalMoneyGiven += c.amountGiven;
      totalMoneyToCollect += c.totalAmountToReceive;
      totalCollectedAmount += c.amountPaidTillNow;
      
      if (c.status === 'active') activeCustomers++;
      if (c.status === 'completed') completedCustomers++;
    });

    const pendingAmount = totalMoneyToCollect - totalCollectedAmount;
    const totalExpectedProfit = totalMoneyToCollect - totalMoneyGiven;
    const currentProfit = totalCollectedAmount - totalMoneyGiven; // Realized profit

    // Get today's collections
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayTransactions = await Transaction.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const todayCollection = todayTransactions.reduce((acc, t) => acc + t.amount, 0);

    // Get last 7 days of collections for the chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      const dayTransactions = await Transaction.find({
        createdAt: { $gte: start, $lte: end }
      });
      const amount = dayTransactions.reduce((acc, t) => acc + t.amount, 0);
      last7Days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: amount,
        fullDate: d.toISOString().split('T')[0]
      });
    }

    res.json({
      totalCustomers,
      activeCustomers,
      completedCustomers,
      totalMoneyGiven,
      totalMoneyToCollect,
      totalCollectedAmount,
      pendingAmount,
      totalExpectedProfit,
      currentProfit,
      todayCollection,
      dailyHistory: last7Days
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
