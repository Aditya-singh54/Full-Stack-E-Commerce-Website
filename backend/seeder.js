const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/productModel');

// Load environment variables
dotenv.config();

const sampleProducts = [
  // 1. ELECTRONICS (5 items)
  {
    name: 'AcousticMax Noise Cancelling Headphones',
    description: 'Immerse yourself in pure audio bliss with active noise cancellation, 40-hour battery life, and plush memory foam earcups.',
    price: 199.99,
    discount: 15,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    stock: 25,
    rating: 4.8,
    numReviews: 42
  },
  {
    name: 'Chronos Smart Watch Series 5',
    description: 'Track your health, receive notifications, and control music from your wrist. Features a 1.78-inch AMOLED display and a 7-day battery.',
    price: 249.99,
    discount: 10,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    stock: 35,
    rating: 4.6,
    numReviews: 28
  },
  {
    name: 'GigaSound Portable Bluetooth Speaker',
    description: 'Take your music anywhere with IPX7 waterproof rating, 360-degree sound distribution, and 12-hour continuous playtime.',
    price: 79.99,
    discount: 20,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
    stock: 50,
    rating: 4.5,
    numReviews: 19
  },
  {
    name: 'TactilePro Mechanical Keyboard',
    description: 'Enhance your typing speed and gaming performance. Features clicky blue mechanical switches, RGB backlighting, and a premium aluminum frame.',
    price: 129.99,
    discount: 0,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80',
    stock: 15,
    rating: 4.7,
    numReviews: 31
  },
  {
    name: 'AeroGlide Wireless Gaming Mouse',
    description: 'Precision tracking with a 16,000 DPI optical sensor, ultra-lightweight design, and 6 programmable buttons for customizable controls.',
    price: 59.99,
    discount: 5,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
    stock: 40,
    rating: 4.4,
    numReviews: 12
  },

  // 2. CLOTHING (5 items)
  {
    name: 'UrbanFit Premium Cotton Hoodie',
    description: 'Stay warm and stylish. Made from 100% organic heavy-weight cotton, featuring a soft fleece lining and a spacious kangaroo pocket.',
    price: 49.99,
    discount: 10,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    stock: 60,
    rating: 4.6,
    numReviews: 54
  },
  {
    name: 'Metro Denim Trucker Jacket',
    description: 'A classic silhouette constructed from premium non-stretch denim. Features double button chest pockets and adjustable waist tabs.',
    price: 79.99,
    discount: 15,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
    stock: 20,
    rating: 4.5,
    numReviews: 23
  },
  {
    name: 'FlexFit Slim Indigo Jeans',
    description: 'The perfect balance of comfort and style. Engineered with a stretch denim blend for flexible movements and a clean, slim-fit silhouette.',
    price: 64.99,
    discount: 0,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    stock: 45,
    rating: 4.3,
    numReviews: 37
  },
  {
    name: 'AirThread Organic Cotton T-Shirt Pack',
    description: 'Pack of three basic crewneck t-shirts in grey, black, and white. Super breathable fabric, pre-shrunk for an enduring classic fit.',
    price: 34.99,
    discount: 10,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    stock: 80,
    rating: 4.7,
    numReviews: 88
  },
  {
    name: 'CozyKnit Wool Crewneck Sweater',
    description: 'Soft wool blend knit designed to keep cold breezes away. Styled with ribbed necklines, cuffs, and hem for a traditional winter style.',
    price: 69.99,
    discount: 20,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    stock: 30,
    rating: 4.4,
    numReviews: 17
  },

  // 3. SHOES (5 items)
  {
    name: 'ApexGlide Running Sneakers',
    description: 'Experience lightweight cushions for daily jogs. Styled with custom engineered mesh and a high-grip rubber outsole.',
    price: 119.99,
    discount: 15,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    stock: 30,
    rating: 4.8,
    numReviews: 61
  },
  {
    name: 'Heritage Handcrafted Leather Boots',
    description: 'Premium full-grain leather boots built for durability and long hours of walking. Features a Goodyear welt and custom padded insoles.',
    price: 179.99,
    discount: 0,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80',
    stock: 12,
    rating: 4.9,
    numReviews: 35
  },
  {
    name: 'UrbanWalker Slip-on Canvas Shoes',
    description: 'Casual, flexible canvas shoes ideal for quick errands or everyday strolls. Includes orthotic arch supports and easy pull tabs.',
    price: 44.99,
    discount: 10,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
    stock: 55,
    rating: 4.2,
    numReviews: 40
  },
  {
    name: 'SprintTrainer Athletic Sports Shoes',
    description: 'Built for intense cross-training and gym sessions. Engineered with stability wings and shock absorption heel locks.',
    price: 99.99,
    discount: 25,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
    stock: 22,
    rating: 4.5,
    numReviews: 18
  },
  {
    name: 'Classic Leather Casual Loafers',
    description: 'Slip into timeless style. Hand-stitched premium loafers that look excellent with both formal suits and casual summer shorts.',
    price: 109.99,
    discount: 10,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80',
    stock: 18,
    rating: 4.6,
    numReviews: 22
  },

  // 4. ACCESSORIES (5 items)
  {
    name: 'Voyager Anti-Theft Backpack',
    description: 'Travel safely. Features hidden zippers, cut-proof canvas fabric, integrated USB charge ports, and a padded 15.6-inch laptop pocket.',
    price: 89.99,
    discount: 15,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    stock: 28,
    rating: 4.7,
    numReviews: 47
  },
  {
    name: 'Classic Fold-Over Leather Wallet',
    description: 'Handcrafted from genuine cowhide leather. Includes 8 card slots, dual bill chambers, and integrated RFID blocking security sheets.',
    price: 39.99,
    discount: 0,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1627124718185-60f1b4da9dbf?w=800&q=80',
    stock: 65,
    rating: 4.6,
    numReviews: 53
  },
  {
    name: 'AeroShade Polarized Sunglasses',
    description: 'Protect your vision in style. UV400 lenses housed in a flexible titanium pilot frame, reducing glares and eye strains.',
    price: 49.99,
    discount: 20,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    stock: 45,
    rating: 4.4,
    numReviews: 29
  },
  {
    name: 'Summit Sport Stainless Steel Flask',
    description: 'Double-walled vacuum insulated bottle keeping beverages piping hot for 12 hours or ice-cold for 24 hours. Includes dual lids.',
    price: 29.99,
    discount: 10,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    stock: 75,
    rating: 4.8,
    numReviews: 94
  },
  {
    name: 'Metro Suede Minimalist Belt',
    description: 'Add a subtle touch of elegance. Fitted with a solid steel buckle and made from ultra-soft dark brown suede leather.',
    price: 34.99,
    discount: 0,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
    stock: 35,
    rating: 4.3,
    numReviews: 14
  },

  // 5. HOME (5 items)
  {
    name: 'Lumina Arch Minimalist Desk Lamp',
    description: 'Modern workspace lamp with adjustable light angles, 3 color temperatures, step-less dimming, and an integrated wireless charger base.',
    price: 54.99,
    discount: 10,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 20,
    rating: 4.7,
    numReviews: 38
  },
  {
    name: 'Ceramic Artisan Mug (Set of 2)',
    description: 'Individually glazed earthy ceramic mugs designed for cozy mornings. Dishwasher and microwave safe with standard 12oz capacities.',
    price: 24.99,
    discount: 0,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    stock: 40,
    rating: 4.8,
    numReviews: 72
  },
  {
    name: 'TranquilScents Lavender Candle Set',
    description: 'Three slow-burning soy wax candles infused with organic lavender oils. Features a crackling wooden wick for peaceful vibes.',
    price: 19.99,
    discount: 15,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80',
    stock: 90,
    rating: 4.5,
    numReviews: 48
  },
  {
    name: 'Geometric Wool Throw Pillows (Pair)',
    description: 'Upgrade your sofa decor. Thick jacquard knit cover featuring Scandinavian patterns, stuffed with soft feather fills.',
    price: 39.99,
    discount: 5,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
    stock: 32,
    rating: 4.6,
    numReviews: 19
  },
  {
    name: 'Artisan Glass Succulent Planter Set',
    description: 'Three micro glass terrariums with bamboo drainage bases. Compact size perfect for shelves, windowsills, or workstations.',
    price: 29.99,
    discount: 10,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800&q=80',
    stock: 50,
    rating: 4.4,
    numReviews: 24
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear product catalogs
    await Product.deleteMany({});
    console.log('Database cleared: Product collection emptied.');

    if (process.argv[2] === '-d') {
      console.log('Seeder ran in Destroy Mode (-d). Database cleared.');
      mongoose.connection.close();
      process.exit(0);
    }

    // Insert new sample records
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Success: Seeded ${createdProducts.length} products inside Mongoose!`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding database failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
