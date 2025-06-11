// src/pages/OfferSalesPage.jsx
import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { BsGridFill, BsList } from 'react-icons/bs';
import ProductCard from './homepage/needs/ProductCard';
import Pagination from './Pagination';

const PRODUCTS_PER_PAGE = 9;

const OfferSalesPage = () => {
  const { offerProducts, loading, error } = useProducts();
  const [gridView, setGridView] = useState(true); // Default to grid view
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(offerProducts.length / PRODUCTS_PER_PAGE);

  // Get products for the current page
  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const paginatedProducts = offerProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
  };

  // Reset to first page if offerProducts change (e.g., after filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [offerProducts]);

  if (loading) {
    return (
      <div className="offer-sales-page-container flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading amazing offers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="offer-sales-page-container text-center py-10">
        <p className="error-message text-red-600 font-bold text-lg">Error: {error}</p>
        <p className="text-gray-600">Please try refreshing the page or check back later.</p>
      </div>
    );
  }

  if (!offerProducts || offerProducts.length === 0) {
    return (
      <div className="offer-sales-page-container text-center py-20">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">No Offers Available Right Now!</h1>
        <p className="text-lg text-gray-600">Stay tuned for exciting deals coming soon.</p>
      </div>
    );
  }

  return (
    <div className="offer-sales-page-container">
      {/* Hero Section */}
      <section className="hero-section text-center py-16 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg shadow-lg mb-10">
        <h1 className="text-5xl font-extrabold mb-4 animate-pulse">⚡️ Limited Time Offers! ⚡️</h1>
        <p className="text-xl font-medium">Grab incredible deals before they're gone!</p>
      </section>

      <hr className="my-8 border-gray-300" />

      {/* Product Grid/List and View Toggles */}
      <section className="product-list-section">
        <div className="flex justify-between items-center mb-6 px-4 sm:px-0"> {/* Added padding for small screens */}
          <h2 className="text-3xl font-bold text-gray-800">Our Exclusive Deals</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setGridView(true)}
              className={`p-2 rounded-md transition-colors duration-200 ${gridView ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              aria-label="Toggle Grid View"
            >
              <BsGridFill className="text-xl" />
            </button>
            <button
              onClick={() => setGridView(false)}
              className={`p-2 rounded-md transition-colors duration-200 ${!gridView ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              aria-label="Toggle List View"
            >
              <BsList className="text-xl" />
            </button>
          </div>
        </div>

        {/* Product Display Area */}
        <div className={`${gridView ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}`}>
          {paginatedProducts.map(product => (
            // Ensure you pass the correct product object structure to ProductCard
            // Based on your ProductContext, 'offerProducts' is already an array of products.
            // If your API returns { _id, product: { name, price, ... } } then use product.product.
            // If it returns { _id, name, price, ... } directly, just use product.
            <ProductCard key={product._id} product={product.product} isListView={!gridView} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </section>

      <hr className="my-8 border-gray-300" />

      {/* Call to Action / Urgency Section */}
      <section className="cta-section text-center py-12 bg-blue-100 rounded-lg shadow-md mb-10">
        <h2 className="text-4xl font-bold text-blue-800 mb-4">Don't Miss Out!</h2>
        <p className="text-lg text-gray-700 mb-6">These amazing offers won't last forever. Secure your favorites now!</p>
        <button className="shop-all-offers-button bg-orange-600 text-white font-semibold py-3 px-8 rounded-full text-lg hover:bg-orange-700 transition-colors duration-300 transform hover:scale-105 shadow-lg">
          Shop All Offers Now!
        </button>
      </section>
    </div>
  );
};

export default OfferSalesPage;