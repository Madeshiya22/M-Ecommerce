const mongoose = require('mongoose');
const slugify = require('slugify');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: [true, 'Description is required'] },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    images: [{ url: String, alt: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    type: { type: String, enum: ['tshirt', 'shirt'], required: true },
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
    tags: [String],
    fabric: { type: String, default: '' },
    fit: { type: String, enum: ['slim', 'regular', 'oversized', 'relaxed'], default: 'regular' },
    gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'men' },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
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
});

// Virtual discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.discountPrice && this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
