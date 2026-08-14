import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Totals calculations
  const [cartCount, setCartCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/cart');
      if (res.data.success) {
        setCartItems(res.data.data.products || []);
      }
    } catch (err) {
      console.error('Error fetching cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sync cart when user logs in/out
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  // Recalculate totals whenever cartItems change
  useEffect(() => {
    let count = 0;
    let sub = 0;
    let disc = 0;

    cartItems.forEach((item) => {
      if (item.product) {
        const qty = item.quantity;
        const price = item.product.price;
        const discountPct = item.product.discount || 0;

        count += qty;
        sub += price * qty;
        disc += price * (discountPct / 100) * qty;
      }
    });

    const netTotalBeforeShipping = sub - disc;
    // Free shipping above ₹100, otherwise $10 flat rate (if cart is not empty)
    const ship = netTotalBeforeShipping > 100 || count === 0 ? 0 : 10;

    setCartCount(count);
    setSubtotal(sub);
    setDiscountAmount(disc);
    setShippingFee(ship);
    setGrandTotal(netTotalBeforeShipping + ship);
  }, [cartItems]);

  const addToCart = async (productId, quantity) => {
    if (!user) {
      return { success: false, message: 'Please log in to add items to cart.' };
    }
    try {
      const res = await axios.post('/api/cart', { productId, quantity });
      if (res.data.success) {
        setCartItems(res.data.data.products || []);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add item to cart.';
      return { success: false, message };
    }
  };

  const updateQty = async (productId, quantity) => {
    try {
      const res = await axios.put(`/api/cart/${productId}`, { quantity });
      if (res.data.success) {
        setCartItems(res.data.data.products || []);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update quantity.';
      return { success: false, message };
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await axios.delete(`/api/cart/${productId}`);
      if (res.data.success) {
        setCartItems(res.data.data.products || []);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove item from cart.';
      return { success: false, message };
    }
  };

  const clearCartOnCheckout = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        cartCount,
        subtotal,
        discountAmount,
        shippingFee,
        grandTotal,
        fetchCart,
        addToCart,
        updateQty,
        removeItem,
        clearCartOnCheckout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
