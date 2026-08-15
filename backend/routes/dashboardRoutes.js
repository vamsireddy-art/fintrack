const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/authMiddleware');

router.get('/stats', auth, async (req, res) => {
  try {
    const { data: customers, error: custErr } = await supabase
      .from('customers')
      .select('*');

    if (custErr) throw custErr;

    const totalCustomers = (customers || []).length;
    let totalMoneyGiven = 0;
    let totalMoneyToCollect = 0;
    let totalCollectedAmount = 0;
    
    let activeCustomers = 0;
    let completedCustomers = 0;

    (customers || []).forEach(c => {
      totalMoneyGiven += Number(c.amount_given || 0);
      totalMoneyToCollect += Number(c.total_amount_to_receive || 0);
      totalCollectedAmount += Number(c.amount_paid_till_now || 0);
      
      if (c.status === 'active') activeCustomers++;
      if (c.status === 'completed') completedCustomers++;
    });

    const pendingAmount = totalMoneyToCollect - totalCollectedAmount;
    const totalExpectedProfit = totalMoneyToCollect - totalMoneyGiven;
    const currentProfit = totalCollectedAmount - totalMoneyGiven;

    // Get today's collections
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data: todayTransactions } = await supabase
      .from('transactions')
      .select('amount')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    const todayCollection = (todayTransactions || []).reduce((acc, t) => acc + Number(t.amount || 0), 0);

    // Get last 7 days of collections for chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      const { data: dayTx } = await supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      const amount = (dayTx || []).reduce((acc, t) => acc + Number(t.amount || 0), 0);
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
