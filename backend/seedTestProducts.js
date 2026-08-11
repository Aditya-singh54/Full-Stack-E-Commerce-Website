const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/productModel');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Sample test products
const testProducts = [
  {
    name: 'Shopsphere Quantum Wireless Headphones',
    description: 'Experience crystal-clear sound and deep bass with our premium wireless headphones. Features active noise cancellation (ANC), 40 hours of battery life, and ultra-comfortable ear cushions.',
    price: 199.99,
    discount: 15,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
    stock: 12,
    rating: 4.8,
    numReviews: 24
  },
  {
    name: 'Apex Comfort Running Shoes',
    description: 'Designed for runners seeking maximum shock absorption and arch support. Highly breathable knit upper with an energetic rebound foam midsole to keep you moving.',
    price: 120.00,
    discount: 0,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60',
    stock: 8,
    rating: 4.5,
    numReviews: 18
  },
  {
    name: 'Minimalist Leather Smart Watch',
    description: 'An elegant smartwatch with a genuine leather band and a sleek AMOLED touchscreen. Monitors heart rate, tracks workouts, displays phone alerts, and lasts up to 7 days on a single charge.',
    price: 249.99,
    discount: 20,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
    stock: 5,
    rating: 4.6,
    numReviews: 10
  },
  {
    name: 'Aerodynamic Cotton Bomber Jacket',
    description: 'A light, windproof bomber jacket crafted from 100% premium organic cotton. Features strong front zippers, double side-pockets, and structured elastic cuffs.',
    price: 85.00,
    discount: 10,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=60',
    stock: 15,
    rating: 4.2,
    numReviews: 32
  },
  {
    name: 'Minimalist Ceramic Coffee Mug',
    description: 'A handmade matte ceramic mug designed to keep your coffee or tea at the ideal temperature. Features a textured ergonomic handle and holds up to 450ml.',
    price: 24.99,
    discount: 0,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=60',
    stock: 20,
    rating: 4.7,
    numReviews: 15
  },
  {
    name: 'Ultra-thin Mechanical Keyboard',
    description: 'Low-profile mechanical switches housed in an aircraft-grade aluminum frame. Vibrant RGB backlighting, dual wireless/wired connection, and customizable hot-swap keys.',
    price: 159.99,
    discount: 5,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60',
    stock: 0, // Out of Stock test
    rating: 4.9,
    numReviews: 45
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared!');

    // Insert test products
    await Product.insertMany(testProducts);
    console.log('Sample test products seeded successfully!');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
