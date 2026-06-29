const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, required: true },
    link: { type: String, default: '' },
    buttonText: { type: String, default: 'Shop Now' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const shippingRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxOrderAmount: { type: Number, default: 0 }, // 0 = no upper limit
  rate: { type: Number, required: true },
  estimatedDays: { type: String, default: '3-5 business days' },
  isActive: { type: Boolean, default: true },
});

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'THREAD' },
    storeTagline: { type: String, default: 'Premium T-Shirts & Shirts' },
    storeEmail: { type: String, default: '' },
    storePhone: { type: String, default: '' },
    storeAddress: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    taxRate: { type: Number, default: 5 },
    freeShippingThreshold: { type: Number, default: 999 },
    defaultShippingRate: { type: Number, default: 79 },
    lowStockThreshold: { type: Number, default: 10 },
    banners: [bannerSchema],
    shippingRules: [shippingRuleSchema],
    metaTitle: { type: String, default: 'THREAD - Premium T-Shirts & Shirts' },
    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    maintenanceMode: { type: Boolean, default: false },
    allowGuestCheckout: { type: Boolean, default: false },
    orderPrefix: { type: String, default: 'THREAD' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
