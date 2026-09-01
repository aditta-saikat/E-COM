const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    // price is stored in minor currency units (e.g. paisa), never a float, to avoid rounding drift once totals are computed across services
    price: { type: Number, required: true, min: 0, validate: Number.isInteger },
    currency: { type: String, default: 'BDT' },
    sku: { type: String, required: true, unique: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, default: 'uncategorized', trim: true },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Product', productSchema);
