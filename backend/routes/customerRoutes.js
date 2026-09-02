const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/authMiddleware');

function formatCustomer(c) {
  if (!c) return null;
  const amountGiven = Number(c.amount_given || 0);
  const totalAmountToReceive = Number(c.total_amount_to_receive || 0);
  const amountPaidTillNow = Number(c.amount_paid_till_now || 0);
  const dailyPaymentAmount = Number(c.daily_payment_amount || 0);
  const tracker = Array.isArray(c.payment_tracker) ? c.payment_tracker : [];
  const paidDaysCount = tracker.filter(d => d.status === 'paid').length;

  return {
    _id: c.id,
    id: c.id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    amountGiven,
    totalAmountToReceive,
    amountPaidTillNow,
    dailyPaymentAmount,
    remainingAmount: totalAmountToReceive - amountPaidTillNow,
    profit: totalAmountToReceive - amountGiven,
    paidDaysCount,
    startDate: c.start_date,
    endDate: c.end_date,
    paymentTracker: tracker,
    notes: c.notes,
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  };
}

// Get all customers
router.get('/', auth, async (req, res) => {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((customers || []).map(formatCustomer));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get customer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(formatCustomer(customer));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a customer
router.delete('/:id', auth, async (req, res) => {
  try {
    // Delete customer (transactions cascade deleted via Foreign Key ON DELETE CASCADE)
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
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

    const { data: customer, error } = await supabase
      .from('customers')
      .insert([
        {
          name,
          phone,
          address,
          amount_given: amountGiven,
          total_amount_to_receive: totalAmountToReceive,
          daily_payment_amount: dailyPaymentAmount,
          start_date: startDate,
          end_date: endDate,
          notes,
          payment_tracker: paymentTracker,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(formatCustomer(customer));
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

    const { data: customer, error: fetchErr } = await supabase
      .from('customers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const tracker = Array.isArray(customer.payment_tracker) ? customer.payment_tracker : [];
    const day = tracker.find(d => d.dayIndex == dayIndex);
    if (!day) {
      return res.status(400).json({ message: 'Invalid day index' });
    }

    const oldStatus = day.status || (day.isPaid ? 'paid' : 'pending');
    if (oldStatus === status) {
      return res.json(formatCustomer(customer));
    }

    let amountPaidTillNow = Number(customer.amount_paid_till_now || 0);
    const dailyAmount = Number(customer.daily_payment_amount || 0);

    // Update financial stats if moving to/from 'paid'
    if (status === 'paid') {
      amountPaidTillNow += dailyAmount;
      day.paidDate = new Date().toISOString();
      
      // Log transaction in Supabase
      await supabase.from('transactions').insert([
        {
          customer_id: customer.id,
          amount: dailyAmount,
          payment_mode: paymentMode || 'Cash',
          notes: notes || `Payment for Day ${dayIndex}`,
          day_index: dayIndex
        }
      ]);
    } else if (oldStatus === 'paid') {
      amountPaidTillNow -= dailyAmount;
      day.paidDate = null;
    }

    day.status = status;

    let customerStatus = customer.status;
    if (amountPaidTillNow >= Number(customer.total_amount_to_receive)) {
      customerStatus = 'completed';
    } else if (customerStatus === 'completed') {
      customerStatus = 'active';
    }

    // Save updated customer record to Supabase
    const { data: updated, error: updateErr } = await supabase
      .from('customers')
      .update({
        amount_paid_till_now: amountPaidTillNow,
        payment_tracker: tracker,
        status: customerStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    res.json(formatCustomer(updated));
  } catch (error) {
    console.error('Error in update-day:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Early settlement
router.post('/:id/settle', auth, async (req, res) => {
  try {
    const { data: updated, error } = await supabase
      .from('customers')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !updated) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(formatCustomer(updated));
  } catch (error) {
    console.error('Error in settle:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Circle Account (Restart cycle)
router.post('/:id/circle', auth, async (req, res) => {
  try {
    const { data: customer, error: fetchErr } = await supabase
      .from('customers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const totalToReceive = Number(customer.total_amount_to_receive || 0);
    const amountPaid = Number(customer.amount_paid_till_now || 0);
    const amountGiven = Number(customer.amount_given || 0);

    const remainingAmount = totalToReceive - amountPaid;
    const newAmountGiven = amountGiven - remainingAmount;

    // Reset tracker
    const paymentTracker = [];
    for (let i = 1; i <= 100; i++) {
      paymentTracker.push({ dayIndex: i, status: 'pending' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 100);

    const { data: updated, error: updateErr } = await supabase
      .from('customers')
      .update({
        amount_given: newAmountGiven,
        amount_paid_till_now: 0,
        payment_tracker: paymentTracker,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    res.json(formatCustomer(updated));
  } catch (error) {
    console.error('Error in circle:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transactions for a customer
router.get('/:id/transactions', auth, async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('customer_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (transactions || []).map(t => ({
      _id: t.id,
      id: t.id,
      customerId: t.customer_id,
      amount: Number(t.amount),
      paymentMode: t.payment_mode,
      notes: t.notes,
      dayIndex: t.day_index,
      createdAt: t.created_at
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
