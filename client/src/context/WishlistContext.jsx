// src/context/WishlistContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
// Import useAuth from your AuthContext file. Make sure the path is correct!
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [errorWishlist, setErrorWishlist] = useState(null);

  // Get the token from AuthContext. This `token` will change when login/logout happens in AuthContext.
  const { token } = useAuth(); // <--- Key change: Get token from useAuth()

  // Console log to observe the token value as it changes in WishlistContext
  console.log('WishlistContext Render: Token observed from AuthContext:', token ? 'present' : 'null');

  // Memoize the fetchWishlist function. It will only be re-created if `token` changes.
  const fetchWishlist = useCallback(async () => {
    setLoadingWishlist(true);
    setErrorWishlist(null);
    console.log('fetchWishlist function called. Token value used for API:', token ? 'present' : 'null');

    // If there's no token, clear the wishlist and stop. This handles logout.
    if (!token) {
      setWishlist([]); // Clear the wishlist state
      setLoadingWishlist(false);
      console.log("No token in fetchWishlist. Wishlist cleared.");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('https://loomibackend.onrender.com/api/v1/wishlist', config);
      setWishlist(response.data.wishlist.products || []);
      console.log("Wishlist successfully fetched.");
    } catch (err) {
      console.error('Failed to fetch wishlist from backend:', err);
      setErrorWishlist('Failed to load wishlist. Please log in or refresh.');
      setWishlist([]); // Clear wishlist on error to avoid showing stale data
    } finally {
      setLoadingWishlist(false);
    }
  }, [token]); // <--- Dependency array: `fetchWishlist` re-creates if `token` changes

  // useEffect to trigger `fetchWishlist`.
  // It depends on the memoized `fetchWishlist` function itself.
  // Because `fetchWishlist` re-creates when `token` changes, this `useEffect` will also re-run.
  useEffect(() => {
    console.log('WishlistContext useEffect triggered.');
    fetchWishlist();
  }, [fetchWishlist]); // <--- Dependency array: re-run when `fetchWishlist` (and thus `token`) changes

  // All other functions (addToWishlist, removeFromWishlist) will now use the `token`
  // from `useAuth()` directly, which is reactive.
  const addToWishlist = async (product) => {
    if (!token) { // Use the reactive `token`
      alert('Please log in to add items to your wishlist.');
      return false;
    }
    if (wishlist.some(item => item._id === product._id)) {
      console.log(`${product.name} is already in the wishlist.`);
      return false;
    }
    try {
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
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
    if (!token) { // Use the reactive `token`
      alert('Please log in to manage your wishlist.');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
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
    refetchWishlist: fetchWishlist, // Expose for manual refresh if needed
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};