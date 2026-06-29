/**
 * THREAD E-Commerce — Database Seed Script
 * Creates: admin user, test user, root categories, all 16 subcategories, sample products, coupons
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
const Coupon = require('./src/models/Coupon');
const Settings = require('./src/models/Settings');

// ─── Root categories ──────────────────────────────────────────────────────────
const ROOT_CATEGORIES = [
  { name: 'T-Shirts', type: 'tshirt', description: 'Premium T-Shirts for every style', sortOrder: 1 },
  { name: 'Shirts', type: 'shirt', description: 'Premium Shirts for every occasion', sortOrder: 2 },
];

// ─── T-Shirt subcategories (8) ────────────────────────────────────────────────
const TSHIRT_SUBCATEGORIES = [
  { name: 'Oversized', type: 'tshirt', description: 'Relaxed, oversized fit — streetwear staples', sortOrder: 1 },
  { name: 'Graphic', type: 'tshirt', description: 'Bold print and artwork statement tees', sortOrder: 2 },
  { name: 'Acid Wash', type: 'tshirt', description: 'Distressed vintage retro look tees', sortOrder: 3 },
  { name: 'Polo', type: 'tshirt', description: 'Collared semi-formal casual polo tees', sortOrder: 4 },
  { name: 'Sleeveless', type: 'tshirt', description: 'Cut-off and tank styles for gym or summer', sortOrder: 5 },
  { name: 'Tie-Dye', type: 'tshirt', description: 'Colorful festival and boho-style tees', sortOrder: 6 },
  { name: 'Solids', type: 'tshirt', description: 'Minimal, solid-color everyday essentials', sortOrder: 7 },
  { name: 'Crop', type: 'tshirt', description: 'Cropped silhouette for a modern streetwear edge', sortOrder: 8 },
];

// ─── Shirt subcategories (8) ──────────────────────────────────────────────────
const SHIRT_SUBCATEGORIES = [
  { name: 'Linen', type: 'shirt', description: 'Breathable linen shirts for warm weather', sortOrder: 1 },
  { name: 'Oxford', type: 'shirt', description: 'Classic Oxford weave — smart-casual perfection', sortOrder: 2 },
  { name: 'Hawaiian', type: 'shirt', description: 'Tropical prints for resort and vacation vibes', sortOrder: 3 },
  { name: 'Denim', type: 'shirt', description: 'Rugged denim shirts perfect for layering', sortOrder: 4 },
  { name: 'Flannel', type: 'shirt', description: 'Cozy check flannel shirts for autumn and winter', sortOrder: 5 },
  { name: 'Formal', type: 'shirt', description: 'Crisp formal shirts for office and events', sortOrder: 6 },
  { name: 'Half-sleeve', type: 'shirt', description: 'Half-sleeve shirts for casual summer outings', sortOrder: 7 },
  { name: 'Mandarin', type: 'shirt', description: 'Mandarin collar shirts for a refined minimalist look', sortOrder: 8 },
];

// ─── Sample product builder ───────────────────────────────────────────────────
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const TSHIRT_COLORS = [
  { name: 'Black', hex: '#1a1a1a', stock: 20 },
  { name: 'White', hex: '#f5f5f5', stock: 15 },
  { name: 'Navy', hex: '#1B2A4A', stock: 10 },
  { name: 'Charcoal', hex: '#36454F', stock: 12 },
];

const SHIRT_COLORS = [
  { name: 'White', hex: '#f5f5f5', stock: 20 },
  { name: 'Sky Blue', hex: '#87CEEB', stock: 15 },
  { name: 'Light Grey', hex: '#D3D3D3', stock: 10 },
  { name: 'Off-White', hex: '#FAF0E6', stock: 12 },
];

// T-shirt attribute presets per subcategory
const TSHIRT_ATTRS = {
  Oversized:   { fabric: '280GSM Heavy Cotton', fit: 'oversized', pattern: 'solid', sleeveType: 'full-sleeve' },
  Graphic:     { fabric: '100% Ring-Spun Cotton', fit: 'regular', pattern: 'graphic print', sleeveType: 'full-sleeve' },
  'Acid Wash': { fabric: '100% Cotton (Acid Treated)', fit: 'regular', pattern: 'acid wash', sleeveType: 'full-sleeve' },
  Polo:        { fabric: 'Pique Cotton', fit: 'slim', pattern: 'solid', sleeveType: 'half-sleeve' },
  Sleeveless:  { fabric: '100% Cotton', fit: 'regular', pattern: 'solid', sleeveType: 'sleeveless' },
  'Tie-Dye':   { fabric: '100% Cotton', fit: 'relaxed', pattern: 'tie-dye', sleeveType: 'full-sleeve' },
  Solids:      { fabric: '180GSM Bio-Wash Cotton', fit: 'regular', pattern: 'solid', sleeveType: 'full-sleeve' },
  Crop:        { fabric: '100% Cotton', fit: 'oversized', pattern: 'solid', sleeveType: 'full-sleeve' },
};

// Shirt attribute presets per subcategory
const SHIRT_ATTRS = {
  Linen:        { fabric: '100% Pure Linen', fit: 'relaxed', pattern: 'solid', sleeveType: 'full-sleeve' },
  Oxford:       { fabric: 'Oxford Weave Cotton', fit: 'regular', pattern: 'solid', sleeveType: 'full-sleeve' },
  Hawaiian:     { fabric: '100% Rayon', fit: 'relaxed', pattern: 'floral print', sleeveType: 'half-sleeve' },
  Denim:        { fabric: '100% Denim Cotton', fit: 'regular', pattern: 'solid', sleeveType: 'full-sleeve' },
  Flannel:      { fabric: '100% Flannel', fit: 'regular', pattern: 'check', sleeveType: 'full-sleeve' },
  Formal:       { fabric: 'Giza Cotton', fit: 'slim', pattern: 'solid', sleeveType: 'full-sleeve' },
  'Half-sleeve':{ fabric: '100% Cotton', fit: 'regular', pattern: 'solid', sleeveType: 'half-sleeve' },
  Mandarin:     { fabric: 'Premium Cotton Blend', fit: 'slim', pattern: 'solid', sleeveType: 'full-sleeve' },
};

function buildProducts(subcategories, isShirt) {
  const products = [];
  const attrsMap = isShirt ? SHIRT_ATTRS : TSHIRT_ATTRS;
  const colors = isShirt ? SHIRT_COLORS : TSHIRT_COLORS;
  const productType = isShirt ? 'shirt' : 'tshirt';
  const basePrice = isShirt ? 1799 : 1099;

  subcategories.forEach((cat, i) => {
    const attrs = attrsMap[cat.name] || {};
    const price1 = basePrice + i * 200;
    const price2 = price1 + 400;

    // Product 1 — Essential
    products.push({
      name: `${cat.name} ${isShirt ? 'Shirt' : 'Tee'} — Essential`,
      description: `Our signature ${cat.name.toLowerCase()} ${productType}. ${attrs.fabric ? `Crafted from ${attrs.fabric}` : 'Premium quality fabric'} for all-day comfort and effortless style. ${attrs.fit ? `${attrs.fit.charAt(0).toUpperCase() + attrs.fit.slice(1)} fit` : ''} silhouette designed for the modern wardrobe.`,
      shortDescription: `Premium ${cat.name.toLowerCase()} ${productType} in classic colorways`,
      brand: 'THREAD',
      price: price1,
      discountPrice: Math.round(price1 * 0.8),
      category: cat._id,
      type: productType,
      sizes: SIZES,
      colors: colors.slice(0, 3),
      stock: 50,
      fabric: attrs.fabric || '100% Cotton',
      fit: attrs.fit || 'regular',
      pattern: attrs.pattern || 'solid',
      sleeveType: attrs.sleeveType || 'full-sleeve',
      gender: 'men',
      isFeatured: i === 0,
      isNewArrival: i < 3,
      isBestSeller: i === 1,
      tags: [cat.name.toLowerCase(), productType, attrs.pattern || 'casual'],
      seoTitle: `${cat.name} ${isShirt ? 'Shirt' : 'T-Shirt'} | THREAD`,
      seoDescription: `Buy premium ${cat.name.toLowerCase()} ${productType}s at THREAD. Free shipping above ₹999.`,
      seoKeywords: [cat.name.toLowerCase(), productType, 'premium', 'THREAD'],
    });

    // Product 2 — Pro
    products.push({
      name: `${cat.name} ${isShirt ? 'Shirt' : 'Tee'} — Pro Edition`,
      description: `The elevated version of our ${cat.name.toLowerCase()} ${productType}. ${attrs.fabric ? `Made with ${attrs.fabric}` : 'Premium quality'}, featuring refined detailing and superior construction. Perfect for both everyday wear and special occasions.`,
      shortDescription: `Elevated ${cat.name.toLowerCase()} ${productType} with premium detailing`,
      brand: 'THREAD',
      price: price2,
      discountPrice: 0,
      category: cat._id,
      type: productType,
      sizes: SIZES,
      colors: colors.slice(1, 4),
      stock: 40,
      fabric: attrs.fabric || '100% Cotton',
      fit: attrs.fit || 'regular',
      pattern: attrs.pattern || 'solid',
      sleeveType: attrs.sleeveType || 'full-sleeve',
      gender: i % 2 === 0 ? 'men' : 'unisex',
      isFeatured: false,
      isNewArrival: i >= 3,
      isBestSeller: i === 3,
      tags: [cat.name.toLowerCase(), productType, 'premium', 'limited'],
      seoTitle: `${cat.name} ${isShirt ? 'Shirt' : 'T-Shirt'} Pro | THREAD`,
      seoDescription: `Shop the premium ${cat.name.toLowerCase()} ${productType} Pro Edition at THREAD.`,
      seoKeywords: [cat.name.toLowerCase(), productType, 'pro', 'premium'],
    });
  });

  return products;
}

// ─── Main seed function ───────────────────────────────────────────────────────
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Category.deleteMany(),
      Product.deleteMany(),
      User.deleteMany(),
      Coupon.deleteMany(),
      Settings.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Users ──
    await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
    });
    await User.create({
      name: 'Test User',
      email: 'user@thread.com',
      password: 'User@123',
      role: 'user',
    });
    console.log(`👤 Admin:   ${process.env.ADMIN_EMAIL}  /  ${process.env.ADMIN_PASSWORD}`);
    console.log('👤 User:    user@thread.com   /  User@123');

    // ── Root categories ──
    const rootDocs = await Category.create(ROOT_CATEGORIES);
    const tshirtRoot = rootDocs.find((c) => c.type === 'tshirt');
    const shirtRoot = rootDocs.find((c) => c.type === 'shirt');

    // ── Subcategories ──
    const tshirtSubDocs = await Category.create(
      TSHIRT_SUBCATEGORIES.map((s) => ({ ...s, parentCategory: tshirtRoot._id }))
    );
    const shirtSubDocs = await Category.create(
      SHIRT_SUBCATEGORIES.map((s) => ({ ...s, parentCategory: shirtRoot._id }))
    );

    console.log(`✅ Root categories  : ${rootDocs.map((c) => c.name).join(', ')}`);
    console.log(`✅ T-Shirt subs (${tshirtSubDocs.length}) : ${tshirtSubDocs.map((c) => c.name).join(', ')}`);
    console.log(`✅ Shirt subs   (${shirtSubDocs.length}) : ${shirtSubDocs.map((c) => c.name).join(', ')}`);

    // ── Products ──
    const tshirtProducts = buildProducts(tshirtSubDocs, false);
    const shirtProducts = buildProducts(shirtSubDocs, true);
    const createdProducts = await Product.create([...tshirtProducts, ...shirtProducts]);
    console.log(`✅ Products (${createdProducts.length}) : ${tshirtProducts.length} T-Shirts + ${shirtProducts.length} Shirts`);

    // ── Coupons ──
    const coupons = await Coupon.create([
      {
        code: 'WELCOME10',
        description: '10% off — no minimum order',
        type: 'percentage',
        value: 10,
        minOrderAmount: 0,
        maxDiscount: 200,
        usageLimit: 0,
        isActive: true,
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'FLAT150',
        description: '₹150 flat discount on orders above ₹1499',
        type: 'fixed',
        value: 150,
        minOrderAmount: 1499,
        usageLimit: 0,
        isActive: true,
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'THREAD20',
        description: '20% off (max ₹500) on orders above ₹999',
        type: 'percentage',
        value: 20,
        minOrderAmount: 999,
        maxDiscount: 500,
        usageLimit: 500,
        isActive: true,
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`🎟️  Coupons (${coupons.length}) : ${coupons.map((c) => c.code).join(', ')}`);

    // ── Store settings ──
    await Settings.create({
      storeName: 'THREAD',
      storeTagline: 'Premium T-Shirts & Shirts',
      storeEmail: 'hello@thread.com',
      taxRate: 5,
      freeShippingThreshold: 999,
      defaultShippingRate: 79,
      lowStockThreshold: 10,
      metaTitle: 'THREAD — Premium T-Shirts & Shirts',
      metaDescription: 'Shop premium quality T-Shirts and Shirts. Free shipping on orders above ₹999.',
      shippingRules: [
        { name: 'Free Shipping', minOrderAmount: 999, maxOrderAmount: 0, rate: 0, estimatedDays: '3-5 business days', isActive: true },
        { name: 'Standard Shipping', minOrderAmount: 0, maxOrderAmount: 998, rate: 79, estimatedDays: '3-5 business days', isActive: true },
      ],
    });
    console.log('⚙️  Store settings initialized');

    console.log('\n═══════════════════════════════════════════════');
    console.log('  ✅  THREAD Database Seeded Successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log(`  Admin  : ${process.env.ADMIN_EMAIL}  /  ${process.env.ADMIN_PASSWORD}`);
    console.log('  User   : user@thread.com   /  User@123');
    console.log('  Coupons: WELCOME10 | FLAT150 | THREAD20');
    console.log('═══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();

