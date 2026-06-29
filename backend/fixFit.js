require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await mongoose.connection.collection('products').updateMany(
    { name: /Oversized T-Shirt/i },
    { $set: { fit: 'oversized' } }
  );
  console.log('✅ Updated T-Shirts to oversized fit!');
  process.exit(0);
});
