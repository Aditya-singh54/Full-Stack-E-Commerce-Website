const mongoose = require('mongoose');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // 1. Auto-create Admin account if not exists in MongoDB Atlas/Production
    const adminEmail = 'admin@shopsphere.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'ShopSphere Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Auto-Seed: Admin account created successfully!');
    }

    // 2. Auto-seed catalog products if database is empty (e.g. fresh MongoDB Atlas deployment)
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = require('../seeder');
      await Product.insertMany(sampleProducts);
      console.log(`Auto-Seed: Seeded ${sampleProducts.length} products successfully!`);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure code
  }
};

module.exports = connectDB;
