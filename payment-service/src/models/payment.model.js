const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    status: { type: String, enum: ['succeeded', 'failed'], required: true },
    provider: { type: String, default: 'mock' },
    providerReference: { type: String, default: '' },
    failureReason: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Payment', paymentSchema);
