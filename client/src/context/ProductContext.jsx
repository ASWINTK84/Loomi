// src/context/ProductContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [offerProducts, setOfferProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Offer Products
      const offerResponse = await axios.get('https://loomibackend.onrender.com/api/offer-products/getoffer-products');
     
      setOfferProducts(offerResponse.data.offerProducts || offerResponse.data || []);

      // Fetch All Products
      const allProductsResponse = await axios.get('https://loomibackend.onrender.com/api/v1/product/get-product');
   
      if (allProductsResponse.data && Array.isArray(allProductsResponse.data.products)) {
        setAllProducts(allProductsResponse.data.products);
      } else {
        console.error("API response for all products did not contain a 'products' array:", allProductsResponse.data);
        setAllProducts([]);
        setError("Invalid product data format from server.");
      }

    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const contextValue = {
    offerProducts,
    allProducts,
    loading,
    error,
    refetchProducts: fetchProducts // Expose refetch function if needed
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};