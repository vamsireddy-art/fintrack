const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer'],
    default: 'Cash'
  },
  notes: {
    type: String
  },
  dayIndex: {
    type: Number // the 1-100 day index this payment was for
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
