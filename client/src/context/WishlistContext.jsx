import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
// Assuming you have an AuthContext that provides the token
// Adjust the import path based on your project structure
import { useAuth } from './AuthContext'; // <--- IMPORTANT: Adjust this path

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [errorWishlist, setErrorWishlist] = useState(null);

  // Get the authentication token from your AuthContext
  const { token } = useAuth(); // <--- Get token from AuthContext

  // useCallback to memoize fetchWishlist to prevent unnecessary re-creations
  const fetchWishlist = useCallback(async () => {
    setLoadingWishlist(true);
    setErrorWishlist(null);

    // If no token is present (e.g., after logout), clear the wishlist
    if (!token) {
      setWishlist([]);
      setLoadingWishlist(false);
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Use your deployed backend URL
      const response = await axios.get('https://loomibackend.onrender.com/api/v1/wishlist', config);
      setWishlist(response.data.wishlist.products || []); // Assuming products array is returned
    } catch (err) {
      console.error('Failed to fetch wishlist from backend:', err);
      // More specific error handling could be added here based on err.response.status
      setErrorWishlist('Failed to load wishlist. Please log in or refresh.');
      setWishlist([]); // Clear wishlist on error to avoid showing stale data
    } finally {
      setLoadingWishlist(false);
    }
  }, [token]); // Dependency array: Re-run when 'token' changes

  // Fetch wishlist on component mount and whenever the token changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]); // Dependency array: depends on the memoized fetchWishlist function

  const addToWishlist = async (product) => {
    if (!token) {
      alert('Please log in to add items to your wishlist.');
      return false;
    }

    if (wishlist.some(item => item._id === product._id)) {
      console.log(`${product.name} is already in the wishlist.`);
      return false; // Already in wishlist, no action needed
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
      setWishlist(response.data.wishlist.products); 
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
    refetchWishlist: fetchWishlist 
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};