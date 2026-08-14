const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config({ path: '../.env' });

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas.');
    
    const user = await User.findOne({ email: 'admin@shopsphere.com' });
    if (!user) {
      console.log('Error: admin@shopsphere.com does not exist in database.');
      process.exit(1);
    }
    
    console.log('Found Admin User:', user.name, `[Role: ${user.role}]`);
    
    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log('Password "admin123" match status:', isMatch ? 'MATCH' : 'FAILED');
    
    if (!isMatch) {
      console.log('Resetting admin password to "admin123"...');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash('admin123', salt);
      user.role = 'admin';
      await user.save();
      console.log('Admin password successfully reset and hashed.');
    }
    
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkAdmin();
