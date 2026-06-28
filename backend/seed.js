require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

const categories = [
  // T-Shirt Categories
  { name: 'Oversized Tees', type: 'tshirt', description: 'Baggy streetwear style tees for a bold look', sortOrder: 1 },
  { name: 'Polo T-Shirts', type: 'tshirt', description: 'Collared semi-formal casual tees', sortOrder: 2 },
  { name: 'Graphic Tees', type: 'tshirt', description: 'Printed artwork and statement tees', sortOrder: 3 },
  { name: 'Solid Tees', type: 'tshirt', description: 'Plain minimal colored tees for everyday wear', sortOrder: 4 },
  { name: 'Acid Wash Tees', type: 'tshirt', description: 'Distressed vintage retro look tees', sortOrder: 5 },
  { name: 'Tie-Dye Tees', type: 'tshirt', description: 'Colorful festival style tees', sortOrder: 6 },
  // Shirt Categories
  { name: 'Casual Shirts', type: 'shirt', description: 'Linen and cotton relaxed fit shirts', sortOrder: 7 },
  { name: 'Formal Shirts', type: 'shirt', description: 'Office wear crisp formal shirts', sortOrder: 8 },
  { name: 'Denim Shirts', type: 'shirt', description: 'Rugged layering denim shirts', sortOrder: 9 },
  { name: 'Printed Shirts', type: 'shirt', description: 'Floral and holiday resort style shirts', sortOrder: 10 },
  { name: 'Flannel Shirts', type: 'shirt', description: 'Autumn and winter check flannel shirts', sortOrder: 11 },
  { name: 'Oversized Shirts', type: 'shirt', description: 'Streetwear meets formal oversized shirts', sortOrder: 12 },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@mecommerce.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('👤 Admin created: admin@mecommerce.com / Admin@123');

    // Create test user
    await User.create({
      name: 'Test User',
      email: 'user@mecommerce.com',
      password: 'User@123',
      role: 'user',
    });
    console.log('👤 Test user created: user@mecommerce.com / User@123');

    // Create categories
    const createdCategories = await Category.create(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create sample products for each category
    const sampleProducts = [];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const tshirtColors = [
      { name: 'Black', hex: '#000000', stock: 20 },
      { name: 'White', hex: '#FFFFFF', stock: 15 },
      { name: 'Navy', hex: '#1B2A4A', stock: 10 },
    ];
    const shirtColors = [
      { name: 'White', hex: '#FFFFFF', stock: 20 },
      { name: 'Sky Blue', hex: '#87CEEB', stock: 15 },
      { name: 'Light Grey', hex: '#D3D3D3', stock: 10 },
    ];

    const tshirtCategories = createdCategories.filter(c => c.type === 'tshirt');
    const shirtCategories = createdCategories.filter(c => c.type === 'shirt');

    tshirtCategories.forEach((cat, i) => {
      sampleProducts.push({
        name: `${cat.name} Essential - Urban Black`,
        description: `Premium ${cat.name.toLowerCase()} crafted from 100% organic cotton. Features a relaxed silhouette perfect for everyday streetwear. Unisex fit with dropped shoulders for that authentic oversized aesthetic.`,
        shortDescription: `Premium ${cat.name.toLowerCase()} in classic black`,
        price: 1299 + i * 200,
        discountPrice: 899 + i * 150,
        category: cat._id,
        type: 'tshirt',
        sizes,
        colors: tshirtColors,
        stock: 50,
        fabric: '100% Organic Cotton',
        fit: cat.name.includes('Oversized') ? 'oversized' : 'regular',
        gender: 'men',
        isFeatured: i === 0,
        isNewArrival: i === 1,
        isBestSeller: i === 2,
        tags: ['casual', 'streetwear', 'cotton'],
      });
      sampleProducts.push({
        name: `${cat.name} Pro - Graphic Edition`,
        description: `Statement ${cat.name.toLowerCase()} with bold graphic print. Made from premium ring-spun cotton for ultimate comfort. Perfect for making a style statement.`,
        shortDescription: `Bold graphic ${cat.name.toLowerCase()}`,
        price: 1499 + i * 200,
        discountPrice: 999 + i * 150,
        category: cat._id,
        type: 'tshirt',
        sizes,
        colors: [
          { name: 'Charcoal', hex: '#36454F', stock: 25 },
          { name: 'Olive', hex: '#556B2F', stock: 20 },
        ],
        stock: 45,
        fabric: '100% Ring-Spun Cotton',
        fit: 'regular',
        gender: 'unisex',
        isFeatured: false,
        isNewArrival: true,
        tags: ['graphic', 'trendy', 'statement'],
      });
    });

    shirtCategories.forEach((cat, i) => {
      sampleProducts.push({
        name: `${cat.name} Classic - Premium White`,
        description: `Elegant ${cat.name.toLowerCase()} crafted from high-quality fabric. Features superior stitching and a tailored fit that works seamlessly from office to weekend.`,
        shortDescription: `Elegant ${cat.name.toLowerCase()} for every occasion`,
        price: 1899 + i * 300,
        discountPrice: 1399 + i * 200,
        category: cat._id,
        type: 'shirt',
        sizes,
        colors: shirtColors,
        stock: 40,
        fabric: cat.name.includes('Denim') ? '100% Denim Cotton' : '100% Premium Cotton',
        fit: cat.name.includes('Oversized') ? 'oversized' : cat.name.includes('Formal') ? 'slim' : 'regular',
        gender: 'men',
        isFeatured: i === 0,
        isNewArrival: i === 2,
        isBestSeller: i === 1,
        tags: ['premium', 'classic', 'versatile'],
      });
      sampleProducts.push({
        name: `${cat.name} Elite - Summer Edition`,
        description: `Breathable ${cat.name.toLowerCase()} perfect for warm weather. Light fabric with moisture-wicking properties ensures all-day comfort without compromising on style.`,
        shortDescription: `Breathable summer ${cat.name.toLowerCase()}`,
        price: 2199 + i * 300,
        discountPrice: 0,
        category: cat._id,
        type: 'shirt',
        sizes,
        colors: [
          { name: 'Pastel Blue', hex: '#AEC6CF', stock: 20 },
          { name: 'Mint Green', hex: '#98FF98', stock: 15 },
        ],
        stock: 35,
        fabric: cat.name.includes('Flannel') ? '100% Flannel' : '60% Cotton 40% Linen',
        fit: 'relaxed',
        gender: 'men',
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        tags: ['summer', 'breathable', 'comfort'],
      });
    });

    const createdProducts = await Product.create(sampleProducts);
    console.log(`✅ Created ${createdProducts.length} sample products`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('📧 Admin: admin@mecommerce.com | 🔑 Password: Admin@123');
    console.log('📧 User:  user@mecommerce.com  | 🔑 Password: User@123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
