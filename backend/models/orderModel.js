const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true }, // Frozen price at purchase time
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'Cash on Delivery'
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0.0
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
orderSchema.index({ user: 1 });

module.exports = Order;
