const Product = require('../models/productModel');
const Order = require('../models/orderModel');

// @desc    Fetch all products with filters, search, sort, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // Search Query (Regex on Product Name)
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i'
          }
        }
      : {};

    // Category Filter
    const category = req.query.category && req.query.category !== 'All'
      ? { category: req.query.category }
      : {};

    // Price Bounds Filter
    const priceFilter = {};
    if (req.query.minPrice) {
      priceFilter.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      priceFilter.$lte = Number(req.query.maxPrice);
    }
    const price = Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {};

    // Combine All Query Criteria
    const queryCriteria = { ...keyword, ...category, ...price };

    // Sorting options
    let sortCriteria = { createdAt: -1 }; // Default: Newest first
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-asc':
          sortCriteria = { price: 1 };
          break;
        case 'price-desc':
          sortCriteria = { price: -1 };
          break;
        case 'rating':
          sortCriteria = { rating: -1 };
          break;
        case 'newest':
        default:
          sortCriteria = { createdAt: -1 };
          break;
      }
    }

    const count = await Product.countDocuments(queryCriteria);
    const products = await Product.find(queryCriteria)
      .sort(sortCriteria)
      .limit(limit)
      .skip(skip);

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: {
        products,
        page,
        pages: Math.ceil(count / limit),
        total: count
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      return res.status(200).json({
        success: true,
        message: 'Product details fetched successfully',
        data: product
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found (Invalid ID format)'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, image, stock, discount } = req.body;

    if (!name || !price || !description || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    const product = new Product({
      name,
      price,
      description,
      category,
      image,
      stock: stock || 0,
      discount: discount || 0,
      rating: 0,
      numReviews: 0
    });

    const createdProduct = await product.save();
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: createdProduct
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, image, stock, discount } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price === undefined ? product.price : price;
      product.description = description || product.description;
      product.category = category || product.category;
      product.image = image || product.image;
      product.stock = stock === undefined ? product.stock : stock;
      product.discount = discount === undefined ? product.discount : discount;

      const updatedProduct = await product.save();
      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found (Invalid ID format)'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found (Invalid ID format)'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Natural Language Search for Products
// @route   GET /api/products/natural-search
// @access  Public
const getProductsByNaturalQuery = async (req, res) => {
  try {
    const q = req.query.query || '';
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const normalized = q.toLowerCase();
    
    // Natural intent extraction
    const categoryKeywords = {
      Electronics: ['electronic', 'headphone', 'headphones', 'watch', 'watches', 'speaker', 'speakers', 'keyboard', 'keyboards', 'mouse', 'gadget', 'gadgets', 'wireless', 'earbud', 'earbuds'],
      Clothing: ['cloth', 'clothes', 'clothing', 'hoodie', 'hoodies', 'jean', 'jeans', 't-shirt', 'tshirt', 'tshirts', 'jacket', 'jackets', 'sweater', 'sweaters', 'shirt', 'shirts'],
      Shoes: ['shoe', 'shoes', 'boot', 'boots', 'sneaker', 'sneakers', 'loafer', 'loafers', 'walker', 'walkers', 'sprint', 'trainer', 'trainers'],
      Accessories: ['accessory', 'accessories', 'backpack', 'backpacks', 'wallet', 'wallets', 'flask', 'sunglasses', 'sunglass', 'belt', 'belts'],
      Home: ['home', 'lamp', 'lamps', 'mug', 'mugs', 'candle', 'candles', 'pillow', 'pillows', 'planter', 'planters']
    };

    let category = '';
    for (const [cat, words] of Object.entries(categoryKeywords)) {
      if (words.some(word => normalized.includes(word))) {
        category = cat;
        break;
      }
    }

    // Match numbers like "under 3000", "under $3000", "under ₹3000"
    const maxPriceRegex = /(?:under|below|less\s+than|max|maximum|up\s+to|within|₹|\$)\s*(\d+)/i;
    const minPriceRegex = /(?:above|over|greater\s+than|more\s+than|min|minimum)\s*(\d+)/i;

    let maxPrice = null;
    let minPrice = null;

    const maxMatch = normalized.match(maxPriceRegex);
    if (maxMatch) maxPrice = Number(maxMatch[1]);

    const minMatch = normalized.match(minPriceRegex);
    if (minMatch) minPrice = Number(minMatch[1]);

    // Rating check
    let ratingGte = null;
    if (normalized.includes('best') || normalized.includes('top rated') || normalized.includes('high rated') || normalized.includes('popular')) {
      ratingGte = 4.4;
    }

    // Sort check
    let sortCriteria = { rating: -1 }; // Default to sorting by top rated first for natural search
    if (normalized.includes('cheap') || normalized.includes('budget') || normalized.includes('affordable')) {
      sortCriteria = { price: 1 };
    }

    // Extract search keywords, removing common stop words
    const stopWords = ['i', 'need', 'want', 'buy', 'find', 'showing', 'show', 'search', 'get', 'for', 'under', 'below', 'above', 'over', 'cheap', 'best', 'top', 'rated', 'high', 'products', 'product', 'items', 'item', 'with', 'in', 'and', 'the', 'a', 'to', 'for', 'college', 'running', 'casual'];
    const words = normalized.split(/\s+/);
    const keywords = [];
    words.forEach(w => {
      const clean = w.replace(/[^a-zA-Z]/g, '');
      if (clean.length > 2 && !stopWords.includes(clean)) {
        keywords.push(clean);
      }
    });

    // Construct Mongoose query filter
    const query = {};

    if (category) {
      query.category = category;
    }

    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      if (minPrice !== null) query.price.$gte = minPrice;
      if (maxPrice !== null) query.price.$lte = maxPrice;
    }

    if (ratingGte !== null) {
      query.rating = { $gte: ratingGte };
    }

    if (keywords.length > 0) {
      const kwQueries = keywords.map(kw => ({
        $or: [
          { name: { $regex: kw, $options: 'i' } },
          { description: { $regex: kw, $options: 'i' } }
        ]
      }));
      query.$and = kwQueries;
    }

    // Run the search query
    let products = await Product.find(query).sort(sortCriteria).limit(10);
    let message = '';
    let isFallback = false;

    if (products.length > 0) {
      // Build descriptive intent feedback message
      let msg = 'Showing ';
      if (ratingGte) msg += 'top-rated ';
      if (sortCriteria.price === 1) msg += 'budget ';
      if (category) msg += `${category} `;
      if (keywords.length > 0 && !category) {
        msg += `"${keywords.join(' ')}" products `;
      }
      if (maxPrice !== null) msg += `under $${maxPrice} `;
      if (minPrice !== null) msg += `above $${minPrice} `;
      
      message = msg.trim();
    } else {
      // FALLBACK ALTERNATIVE MODE: No direct matches found
      isFallback = true;
      if (category) {
        // Find top rated products in the same category
        products = await Product.find({ category, stock: { $gt: 0 } }).sort({ rating: -1 }).limit(6);
        message = `No direct matches for your query. Showing popular alternatives in "${category}".`;
      } else {
        // General top rated items
        products = await Product.find({ stock: { $gt: 0 } }).sort({ rating: -1 }).limit(6);
        message = 'No direct matches found. Showing some of our popular products.';
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Natural search processed successfully',
      data: {
        products,
        message,
        isFallback,
        extractedIntent: {
          category,
          minPrice,
          maxPrice,
          ratingGte,
          keywords
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Create new product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const score = Number(rating);

    if (!score || score < 1 || score > 5 || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating (1-5) and a comment'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Verified Buyer Check: Customer must have purchased this product
    const hasPurchased = await Order.exists({
      user: req.user._id,
      'orderItems.product': req.params.id
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'Only verified buyers who purchased this product can leave a review.'
      });
    }

    const review = {
      name: req.user.name,
      rating: score,
      comment,
      user: req.user._id
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    
    // Average rating update
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const reviewExists = product.reviews.find(
      (r) => r._id.toString() === req.params.reviewId.toString()
    );

    if (!reviewExists) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== req.params.reviewId.toString()
    );

    product.numReviews = product.reviews.length;

    // Recalculate average rating
    if (product.reviews.length > 0) {
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
    } else {
      product.rating = 0;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByNaturalQuery,
  createProductReview,
  deleteProductReview
};
