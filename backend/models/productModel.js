const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a product description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price'],
    default: 0
  },
  discount: {
    type: Number,
    default: 0 // Discount percentage (e.g., 10 for 10% off)
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock count'],
    default: 0
  },
  rating: {
    type: Number,
    required: true,
    default: 0
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0
  },
  specifications: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],
  reviews: [reviewSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate Value Score dynamically out of 100 points
productSchema.virtual('valueScore').get(function() {
  // 1. Rating contribution: 0-45 points (item.rating / 5) * 45
  const ratingContribution = (this.rating / 5) * 45;

  // 2. Reviews validation: 0-15 points (cap at 100 reviews)
  const reviewsContribution = Math.min(15, (this.numReviews / 100) * 15);

  // 3. Discount contribution: 0-20 points
  const discountContribution = Math.min(20, (this.discount / 100) * 60);

  // 4. Price competitiveness: 0-20 points
  let priceContribution = 5;
  if (this.price < 50) priceContribution = 20;
  else if (this.price < 100) priceContribution = 15;
  else if (this.price < 200) priceContribution = 10;

  const score = Math.round(ratingContribution + reviewsContribution + discountContribution + priceContribution);
  return Math.min(100, Math.max(0, score));
});

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
