import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
// Import your useAuth hook from your AuthContext file
import { useAuth } from './AuthContext'; // <--- IMPORTANT: Adjust this import path if needed

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [errorWishlist, setErrorWishlist] = useState(null);

  // Get the token directly from your AuthContext
  // This `token` state variable will automatically update when AuthContext's token changes
  const { token } = useAuth(); // <--- This is the key change!

  // Memoize the fetchWishlist function using useCallback.
  // It will only re-create if `token` changes.
  const fetchWishlist = useCallback(async () => {
    setLoadingWishlist(true);
    setErrorWishlist(null);

    // If there's no token, it means no user is logged in or they logged out.
    // So, clear the wishlist and stop.
    if (!token) {
      setWishlist([]); // Clear previous user's wishlist
      setLoadingWishlist(false);
      console.log("No token available, clearing wishlist."); // For debugging
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
      console.log("Wishlist fetched successfully for token:", token); // For debugging
    } catch (err) {
      console.error('Failed to fetch wishlist from backend:', err);
      // Clear wishlist on error to prevent showing stale data if token becomes invalid
      setErrorWishlist('Failed to load wishlist. Please log in or refresh.');
      setWishlist([]);
    } finally {
      setLoadingWishlist(false);
    }
  }, [token]); // <--- Dependency array: fetchWishlist re-creates when `token` changes

  // useEffect hook to call fetchWishlist.
  // It now depends on `fetchWishlist` itself.
  // Because `fetchWishlist` is memoized with `token` as its dependency,
  // this useEffect will effectively re-run whenever the `token` changes.
  useEffect(() => {
    console.log("WishlistContext useEffect triggered."); // For debugging
    fetchWishlist();
  }, [fetchWishlist]); // <--- Dependency array: re-run when `fetchWishlist` (and thus `token`) changes

  // Removed getAuthToken function as it's no longer needed
  // All functions below now use the `token` from `useAuth()` directly.

  const addToWishlist = async (product) => {
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
      setWishlist(response.data.wishlist.products);
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
    refetchWishlist: fetchWishlist, // Exposed for manual refresh if needed elsewhere
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};