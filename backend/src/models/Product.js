const mongoose = require('mongoose');
const slugify = require('slugify');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Variant schema: each size × color combination with its own stock and SKU
const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: { type: String, default: '#000000' },
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, default: '' },
  additionalPrice: { type: Number, default: 0 }, // Extra cost above base price
});

const productSchema = new mongoose.Schema(
  {
    // Core
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: [true, 'Description is required'] },
    shortDescription: { type: String, default: '' },
    brand: { type: String, default: 'THREAD' },

    // Pricing
    price: { type: Number, required: [true, 'Price is required'], min: 0 },  // MRP
    discountPrice: { type: Number, default: 0, min: 0 },                      // Sale Price

    // Media
    images: [{ url: String, alt: String }],
    featuredImage: { type: String, default: '' }, // Primary display image URL

    // Classification
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    type: { type: String, enum: ['tshirt', 'shirt'], required: true },

    // Attributes
    fabric: { type: String, default: '' },
    fit: { type: String, enum: ['slim', 'regular', 'oversized', 'relaxed'], default: 'regular' },
    pattern: { type: String, default: '' }, // solid, striped, floral, graphic, etc.
    sleeveType: { type: String, default: '' }, // full-sleeve, half-sleeve, sleeveless, etc.
    gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'men' },

    // Legacy inventory (kept for backward compat)
    sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] }],
    colors: [
      {
        name: String,
        hex: String,
        stock: { type: Number, default: 0 },
      },
    ],
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },

    // Variants (granular size × color × stock × sku matrix)
    variants: [variantSchema],

    // Meta
    tags: [String],
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: [String],

    // Flags
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },

    // Reviews & stats
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name + '-' + Date.now(), { lower: true, strict: true });
  }
  // Auto-set featuredImage from first image if not set
  if (!this.featuredImage && this.images && this.images.length > 0) {
    this.featuredImage = this.images[0].url;
  }
});

// Virtual: discount percentage (MRP vs sale price)
productSchema.virtual('discountPercentage').get(function () {
  if (this.discountPrice && this.price && this.discountPrice < this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual: effective price (use discountPrice if set, else price)
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice > 0 ? this.discountPrice : this.price;
});

// Virtual: total variant stock
productSchema.virtual('variantStock').get(function () {
  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  }
  return this.stock;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', tags: 'text', seoKeywords: 'text' });
productSchema.index({ category: 1, type: 1 });
productSchema.index({ isActive: 1, status: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
