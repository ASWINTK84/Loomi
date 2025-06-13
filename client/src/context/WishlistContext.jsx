import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Import AuthContext

const WishlistContext = createContext();

export const useWishlist = () => {
    return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(true);
    const [errorWishlist, setErrorWishlist] = useState(null);

    // Get isLoggedIn and token from AuthContext
    const { isLoggedIn, token } = useContext(AuthContext); // Use token from AuthContext

    // Modified getAuthToken to use the token from AuthContext
    const getAuthToken = () => {
        return token; // Now returns the token from AuthContext state
    };

    // Fetch wishlist from backend
    useEffect(() => {
        const fetchWishlist = async () => {
            setLoadingWishlist(true);
            setErrorWishlist(null);
            const currentToken = getAuthToken(); // Get the current token

            if (!currentToken) { // Use currentToken instead of isLoggedIn for clarity on "no token" logic
                setWishlist([]); // No token, no authenticated wishlist
                setLoadingWishlist(false);
                return;
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                    },
                };
                const response = await axios.get('https://loomibackend.onrender.com/api/v1/wishlist', config);
                setWishlist(response.data.wishlist.products || []); // Assuming products array is returned
            } catch (err) {
                console.error('Failed to fetch wishlist from backend:', err);
                // If it's an unauthorized error (e.g., token expired), you might want to log out the user
                if (err.response && err.response.status === 401) {
                    setErrorWishlist('Please log in again. Your session may have expired.');
                    // Optionally, trigger logout here if you have a logout function in AuthContext
                    // logout(); // Uncomment if you want to automatically log out on 401 for wishlist
                } else {
                    setErrorWishlist('Failed to load wishlist. Please try again.');
                }
                setWishlist([]); // Clear wishlist on error
            } finally {
                setLoadingWishlist(false);
            }
        };

        // This effect now runs whenever `isLoggedIn` or `token` changes
        // This ensures the wishlist is refetched after login/logout
        fetchWishlist();
    }, [isLoggedIn, token]); // ADDED isLoggedIn and token to dependencies

    const addToWishlist = async (product) => {
        const currentToken = getAuthToken();
        if (!currentToken) {
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
                    Authorization: `Bearer ${currentToken}`,
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
        const currentToken = getAuthToken();
        if (!currentToken) {
            alert('Please log in to manage your wishlist.');
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${currentToken}`,
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