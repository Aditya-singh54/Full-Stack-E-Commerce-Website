const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });

    // Out of Stock and Low Stock counts
    const outOfStockCount = await Product.countDocuments({ stock: 0 });
    const lowStockCount = await Product.countDocuments({ stock: { $gt: 0, $lt: 5 } });

    // Aggregate revenue from non-cancelled orders
    const revenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenue[0] ? Number(revenue[0].totalSales.toFixed(2)) : 0;

    // Aggregate sales by category
    const salesByCategory = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          sales: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
        }
      },
      { $project: { category: '$_id', sales: 1, _id: 0 } }
    ]);

    // Aggregate sales trend (group by day for the last 14 days)
    const salesTrend = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
      { $project: { date: '$_id', revenue: 1, ordersCount: 1, _id: 0 } }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Statistics fetched successfully',
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        outOfStockCount,
        lowStockCount,
        salesByCategory,
        salesTrend
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Users list retrieved successfully',
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'All orders retrieved successfully',
      data: orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status value'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = status;
    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
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
  getStats,
  getUsers,
  getOrders,
  updateOrderStatus
};
