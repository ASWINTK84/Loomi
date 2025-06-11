import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, isLoggedIn } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartError, setCartError] = useState(null);

  const CART_API_BASE_URL = 'http://localhost:5050/api/v1/cart';

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn || !token) {
      setCartItems([]);
      setCartTotal(0);
      return;
    }

    setLoadingCart(true);
    setCartError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(CART_API_BASE_URL, config);
      if (data.success) {
        setCartItems(data.items);
        setCartTotal(data.total);
        console.log("Cart Data Received from Backend:", data.items);
        data.items.forEach(item => {
            if (item.product) {
                console.log(`Product ID: ${item.product._id}, Image URL: ${item.product.imageUrl}, Size: ${item.size}, Color: ${item.color}`);
            } else {
                console.log(`Cart item _id: ${item._id} has no product data.`);
            }
        });
      } else {
        setCartError(data.message || 'Failed to fetch cart.');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartError(error.response?.data?.message || 'Error fetching cart items.');
    } finally {
      setLoadingCart(false);
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1, size, color) => {
    if (!isLoggedIn) {
      toast.error('Please log in to add items to the cart.');
      return;
    }
    if (!token) {
        setCartError("Authentication token not available. Please log in again.");
        return;
    }

    const itemSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size');
    const itemColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : 'Default Color');

    if (product.sizes && product.sizes.length > 0 && !itemSize) {
        toast.error(`Please select a size for ${product.name}`);
        return;
    }
    if (product.colors && product.colors.length > 0 && !itemColor) {
        toast.error(`Please select a color for ${product.name}`);
        return;
    }
    if (product.colors && product.colors.length > 0 && itemColor === 'Default Color' && !color) {
        toast.error(`Please select a color for ${product.name}`);
        return;
    }

    setLoadingCart(true);
    setCartError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const payload = {
        productId: product._id,
        quantity,
        size: itemSize,
        color: itemColor,
      };
      const { data } = await axios.post(CART_API_BASE_URL, payload, config);

      if (data.success) {
        setCartItems(data.items);
        setCartTotal(data.total);
        toast.success(`${product.name} added to cart!`);
      } else {
        setCartError(data.message || 'Failed to add item to cart.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartError(error.response?.data?.message || 'Error adding item to cart.');
    } finally {
      setLoadingCart(false);
    }
  };

  // --- IMPLEMENTATION FOR removeFromCart ---
  const removeFromCart = async (cartItemId) => {
    if (!isLoggedIn || !token) {
      toast.error('Please log in to modify your cart.');
      return;
    }

    setLoadingCart(true);
    setCartError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Use DELETE method and pass cartItemId as a URL parameter
      const { data } = await axios.delete(`${CART_API_BASE_URL}/${cartItemId}`, config);

      if (data.success) {
        setCartItems(data.items); // Backend sends back updated cart
        setCartTotal(data.total);
        toast.info('Item removed from cart.');
      } else {
        setCartError(data.message || 'Failed to remove item from cart.');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCartError(error.response?.data?.message || 'Error removing item from cart.');
    } finally {
      setLoadingCart(false);
    }
  };

  // --- IMPLEMENTATION FOR updateCartQuantity ---
  const updateCartQuantity = async (cartItemId, newQuantity) => {
    if (!isLoggedIn || !token) {
      toast.error('Please log in to modify your cart.');
      return;
    }
    if (newQuantity < 0) { // Backend handles 0 for removal, but let's prevent negative input
        toast.error('Quantity cannot be negative.');
        return;
    }

    setLoadingCart(true);
    setCartError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const payload = { quantity: newQuantity };
      // Use PUT method and pass cartItemId as a URL parameter, new quantity in body
      const { data } = await axios.put(`${CART_API_BASE_URL}/${cartItemId}`, payload, config);

      if (data.success) {
        setCartItems(data.items); // Backend sends back updated cart
        setCartTotal(data.total);
        toast.success('Cart quantity updated.');
      } else {
        setCartError(data.message || 'Failed to update quantity.');
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      setCartError(error.response?.data?.message || 'Error updating cart quantity.');
    } finally {
      setLoadingCart(false);
    }
  };

  // --- IMPLEMENTATION FOR clearCart ---
  const clearCart = async () => {
    if (!isLoggedIn || !token) {
      toast.error('Please log in to clear your cart.');
      return;
    }

    setLoadingCart(true);
    setCartError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Use DELETE method on the base URL to clear the entire cart
      const { data } = await axios.delete(CART_API_BASE_URL, config); // Backend route for clearCart is usually just /api/v1/cart with a DELETE method

      if (data.success) {
        setCartItems([]); // Cart is empty after clearing
        setCartTotal(0);
        toast.info('Your cart has been cleared.');
      } else {
        setCartError(data.message || 'Failed to clear cart.');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setCartError(error.response?.data?.message || 'Error clearing cart.');
    } finally {
      setLoadingCart(false);
    }
  };

  const contextValue = {
    cartItems,
    cartTotal,
    loadingCart,
    cartError,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    fetchCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};