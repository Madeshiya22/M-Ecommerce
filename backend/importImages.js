require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get categories for fallback
    const shirtCat = await Category.findOne({ type: 'shirt' });
    const tshirtCat = await Category.findOne({ type: 'tshirt' });

    if (!shirtCat || !tshirtCat) {
      console.log('❌ Categories not found. Please create at least one shirt and one tshirt category first.');
      process.exit(1);
    }

    const processFolder = async (folderName, type, categoryId, namePrefix, price, discountPrice) => {
      const folderPath = path.join(__dirname, 'uploads', folderName);
      if (!fs.existsSync(folderPath)) return;

      const files = fs.readdirSync(folderPath);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) continue;

        const url = `/uploads/${folderName}/${file}`;
        
        // Check if product already exists with this image to avoid duplicates
        const existing = await Product.findOne({ 'images.url': url });
        if (existing) continue;

        const product = new Product({
          name: `${namePrefix} ${i + 1}`,
          description: `Premium ${namePrefix.toLowerCase()} with high-quality material.`,
          price,
          discountPrice,
          category: categoryId,
          type,
          stock: 50,
          sizes: ['S', 'M', 'L', 'XL'],
          images: [{ url, alt: `${namePrefix} ${i + 1}` }],
          isFeatured: i < 3,
          isNewArrival: i < 5
        });

        await product.save();
        console.log(`✅ Created ${namePrefix} product with image ${file}`);
      }
    };

    console.log('Importing Shirts...');
    await processFolder('shirt', 'shirt', shirtCat._id, 'Premium Shirt', 1299, 999);
    
    console.log('Importing T-Shirts...');
    await processFolder('T-shirt', 'tshirt', tshirtCat._id, 'Oversized T-Shirt', 999, 759);

    console.log('🎉 Import completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();
