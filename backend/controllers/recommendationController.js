const User = require('../models/userModel');
const Product = require('../models/productModel');

// @desc    Track a product view for user recommendations
// @route   POST /api/recommendations/view
// @access  Private
const trackProductView = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove if already exists in history to bring it to the front
    user.recentlyViewed = user.recentlyViewed.filter(
      (id) => id.toString() !== productId.toString()
    );

    // Add to the beginning of recentlyViewed array
    user.recentlyViewed.unshift(productId);

    // Limit recentlyViewed array size to 10
    if (user.recentlyViewed.length > 10) {
      user.recentlyViewed = user.recentlyViewed.slice(0, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product view tracked successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get smart product recommendations for logged-in or guest users
// @route   GET /api/recommendations
// @access  Public (Optional auth header check)
const getRecommendations = async (req, res) => {
  try {
    let recommendations = [];
    let recentlyViewedIds = [];

    // Check if user is authenticated (req.user is set by optional/regular protect middleware)
    if (req.user) {
      const user = await User.findById(req.user._id).populate('recentlyViewed');
      if (user && user.recentlyViewed && user.recentlyViewed.length > 0) {
        recentlyViewedIds = user.recentlyViewed.map(p => p._id.toString());
        
        // Find category preferences based on viewing history
        const categoryCounts = {};
        user.recentlyViewed.forEach((prod) => {
          if (prod && prod.category) {
            categoryCounts[prod.category] = (categoryCounts[prod.category] || 0) + 1;
          }
        });

        // Sort categories by most frequently viewed
        const preferredCategories = Object.keys(categoryCounts).sort(
          (a, b) => categoryCounts[b] - categoryCounts[a]
        );

        // Fetch products from preferred categories
        // Exclude products that are already in recently viewed and out-of-stock items
        recommendations = await Product.find({
          category: { $in: preferredCategories },
          _id: { $nin: recentlyViewedIds },
          stock: { $gt: 0 }
        })
        .sort({ rating: -1 })
        .limit(6);
      }
    }

    // Fallback: If not logged in, empty history, or recommendations are fewer than 4 items,
    // fill it up with top-rated in-stock products from the general catalog
    if (recommendations.length < 4) {
      const remainingLimit = 6 - recommendations.length;
      const excludeIds = [...recentlyViewedIds, ...recommendations.map(p => p._id.toString())];

      const fallbackProducts = await Product.find({
        _id: { $nin: excludeIds },
        stock: { $gt: 0 }
      })
      .sort({ rating: -1 })
      .limit(remainingLimit);

      recommendations = [...recommendations, ...fallbackProducts];
    }

    return res.status(200).json({
      success: true,
      message: 'Recommendations fetched successfully',
      data: recommendations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  trackProductView,
  getRecommendations
};
