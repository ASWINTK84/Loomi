import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [errorWishlist, setErrorWishlist] = useState(null);

  // You would typically get the user token from authentication context
  // For demonstration, let's assume you have a way to get the token
  const getAuthToken = () => {
    // Replace with your actual logic to get the auth token (e.g., from localStorage, AuthContext)
    return localStorage.getItem('token'); // Example: get token from localStorage
  };

  // Fetch wishlist from backend
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoadingWishlist(true);
      setErrorWishlist(null);
      const token = getAuthToken();
      if (!token) {
        setWishlist([]); // No token, no authenticated wishlist
        setLoadingWishlist(false);
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get('https://loomibackend.onrender.com/api/v1/wishlist', config);
        setWishlist(response.data.wishlist.products || []); // Assuming products array is returned
      } catch (err) {
        console.error('Failed to fetch wishlist from backend:', err);
        setErrorWishlist('Failed to load wishlist. Please log in.');
        setWishlist([]); // Clear wishlist on error
      } finally {
        setLoadingWishlist(false);
      }
    };
    fetchWishlist();
  }, []); // Re-fetch when user token changes or on mount

  const addToWishlist = async (product) => {
    const token = getAuthToken();
    if (!token) {
      alert('Please log in to add items to your wishlist.');
      return false;
    }

    if (wishlist.some(item => item._id === product._id)) {
      console.log(`${product.name} is already in the wishlist.`);
      return false;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post('https://loomibackend.onrender.com/api/v1/wishlist', { productId: product._id }, config);
      setWishlist(response.data.wishlist.products); // Update state with the new wishlist from backend
      console.log(`${product.name} added to wishlist.`);
      return true;
    } catch (err) {
      console.error('Failed to add product to wishlist:', err);
      alert('Failed to add product to wishlist. Please try again.');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    const token = getAuthToken();
    if (!token) {
      alert('Please log in to manage your wishlist.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(`https://loomibackend.onrender.com/api/v1/wishlist/${productId}`, config);
      setWishlist(response.data.wishlist.products); // Update state with the new wishlist from backend
      console.log(`Product with ID ${productId} removed from wishlist.`);
    } catch (err) {
      console.error('Failed to remove product from wishlist:', err);
      alert('Failed to remove product from wishlist. Please try again.');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loadingWishlist,
    errorWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};