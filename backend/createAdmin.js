const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const args = process.argv.slice(2);
const email = args[0] || 'admin@shopsphere.com';
const password = args[1] || 'admin123';

if (!email || !password) {
  console.log('Usage: node createAdmin.js <email> <password>');
  process.exit(1);
}

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      userExists.role = 'admin';
      // If the user wants to update the password as well
      if (args[1]) {
        userExists.password = password;
      }
      await userExists.save();
      console.log(`Success: User with email "${email}" has been upgraded to ADMIN role!`);
    } else {
      // Create new Admin user
      const adminUser = new User({
        name: 'ShopSphere Administrator',
        email,
        password,
        role: 'admin'
      });
      await adminUser.save();
      console.log(`Success: New ADMIN account created!`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error creating admin account: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
