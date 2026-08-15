const mongoose = require('mongoose');

const paymentDaySchema = new mongoose.Schema({
  dayIndex: { type: Number, required: true }, // 1 to 100
  status: { type: String, enum: ['pending', 'paid', 'missed'], default: 'pending' },
  paidDate: { type: Date, default: null }
});

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  
  amountGiven: { type: Number, required: true },
  totalAmountToReceive: { type: Number, required: true },
  amountPaidTillNow: { type: Number, default: 0 },
  dailyPaymentAmount: { type: Number, required: true },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  paymentTracker: [paymentDaySchema], // Array of 100 boxes
  
  notes: { type: String },
  status: { type: String, enum: ['active', 'completed', 'overdue'], default: 'active' }
}, { timestamps: true });

// Virtual to calculate remaining amount
customerSchema.virtual('remainingAmount').get(function() {
  return this.totalAmountToReceive - this.amountPaidTillNow;
});

// Virtual to calculate profit
customerSchema.virtual('profit').get(function() {
  return this.totalAmountToReceive - this.amountGiven;
});

// Virtual to get total paid days
customerSchema.virtual('paidDaysCount').get(function() {
  return this.paymentTracker.filter(day => day.status === 'paid').length;
});

customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);
