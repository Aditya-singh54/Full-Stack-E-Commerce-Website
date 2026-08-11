const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete shipping details'
      });
    }

    // Step 1: Double-check stock availability for all items
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} not found in catalog`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}. Only ${product.stock} units left.`
        });
      }
    }

    // Step 2: Create and save the order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      totalAmount
    });

    const createdOrder = await order.save();

    // Step 3: Deduct stock from products
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    // Step 4: Clear user's shopping cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { products: [] } }
    );

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: createdOrder
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership or admin access
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Order not found (Invalid ID format)'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrderById
};
