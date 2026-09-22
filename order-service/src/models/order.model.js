const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    shopId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'payment_failed', 'failed_stock', 'cancelled'],
      default: 'pending_payment',
    },
    paymentId: { type: String, default: '' },
    shippingAddress: { type: shippingAddressSchema, default: () => ({}) },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', orderSchema);
