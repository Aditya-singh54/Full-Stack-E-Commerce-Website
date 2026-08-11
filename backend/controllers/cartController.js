const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Helper to populate cart items with product details
const getPopulatedCart = async (userId) => {
  return await Cart.findOne({ user: userId }).populate({
    path: 'products.product',
    select: 'name price discount category image stock rating'
  });
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await getPopulatedCart(req.user._id);

    // If no cart, return empty products list
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty',
        data: { products: [] }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Verify product and check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: req.user._id,
        products: [{ product: productId, quantity: qty }]
      });
    } else {
      // Check if product is already in cart
      const itemIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Update quantity and check combined stock
        const currentQty = cart.products[itemIndex].quantity;
        const newQty = currentQty + qty;

        if (product.stock < newQty) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more. Maximum available stock is ${product.stock}. (You already have ${currentQty} in cart)`
          });
        }

        cart.products[itemIndex].quantity = newQty;
      } else {
        // Add new item
        cart.products.push({ product: productId, quantity: qty });
      }
    }

    await cart.save();
    const populatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      data: populatedCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Verify product stock limits
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find the item index
    const itemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.products[itemIndex].quantity = qty;
      await cart.save();
      
      const populatedCart = await getPopulatedCart(req.user._id);
      return res.status(200).json({
        success: true,
        message: 'Cart item quantity updated',
        data: populatedCart
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove the product from the array
    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    const populatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully',
      data: populatedCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};
