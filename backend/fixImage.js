require('dotenv').config();
const mongoose = require('mongoose');

const fixImage = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const newImage = '/uploads/T-shirt/e2f40c8a-5d94-48f9-b07b-cf8138d41361.png';
    const res = await mongoose.connection.collection('products').updateOne(
      { name: 'Oversized T-Shirt 22' },
      { $set: { 'images.0.url': newImage, 'featuredImage': newImage } }
    );
    console.log('Updated:', res.modifiedCount);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
fixImage();
