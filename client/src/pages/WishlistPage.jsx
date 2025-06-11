import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { FaHeartBroken, FaTrash } from 'react-icons/fa'; // Removed FaShoppingCart as it's not used
import { useProducts } from '../context/ProductContext';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, loadingWishlist, errorWishlist } = useWishlist();
  const navigate = useNavigate();
  const { offerProducts } = useProducts();

  // console.log(offerProducts); // You can keep this for debugging if needed

  const handleRemoveClick = (productId) => {
    removeFromWishlist(productId);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Function to determine which price to display
  const getDisplayPrice = (product) => {
    // Find if the current product has an active offer
    const productOffer = offerProducts.find(
      (offer) => offer.product._id === product._id
    );

    if (productOffer) {
      // Calculate the discounted price
      const discountAmount = product.price * (productOffer.offerPercentage / 100);
      const discountedPrice = product.price - discountAmount;

      return (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-blue-600">
            ${discountedPrice.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 line-through">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-green-500">
            ({productOffer.offerPercentage}% off)
          </span>
        </div>
      );
    }

    // If no offer, display the regular price
    return (
      <span className="text-2xl font-extrabold text-blue-600">
        ${product.price.toFixed(2)}
      </span>
    );
  };

  if (loadingWishlist) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-gray-600">
        <p className="text-xl font-medium">Loading your wishlist...</p>
        <div className="mt-4 animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  if (errorWishlist) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-red-500">
        <p className="text-xl font-medium">Error loading wishlist:</p>
        <p className="text-lg mt-2">{errorWishlist}</p>
        <button
          onClick={() => window.location.reload()} // Simple reload to retry
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <section className="bg-white py-8 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
          <nav className="text-gray-600 text-sm">
            <a href="/" className="hover:text-blue-600 transition-colors">
              Home
            </a>{' '}
            / <span className="text-blue-600">Wishlist</span>
          </nav>
        </div>
      </section>
      {/* Main Content */}
      <section className="py-12 md:py-16 bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4">
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-lg">
              <FaHeartBroken className="text-gray-400 text-7xl mb-6" />
              <p className="text-2xl text-gray-700 font-semibold mb-4">
                Your wishlist is empty!
              </p>
              <p className="text-gray-600 mb-8 max-w-md text-center">
                Start Browse and add your favorite products here. They'll be
                waiting for you.
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
              >
                Go to Shop Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlist.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative overflow-hidden">
                    <img
  src={
    product.imageUrl ||
    'https://via.placeholder.com/400x400?text=No+Image'
  }
  alt={product.name}
  className="w-full h-64 object-contain bg-white cursor-pointer transition-transform duration-300 hover:scale-105"
  onClick={() => handleProductClick(product._id)}
/>

                    <button
                      onClick={() => handleRemoveClick(product._id)}
                      className="absolute top-4 right-4 bg-red-600 text-white rounded-full p-2.5 opacity-90 hover:opacity-100 hover:bg-red-700 transition-all duration-300 z-10"
                      aria-label={`Remove ${product.name} from Wishlist`}
                      title="Remove from Wishlist"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => handleProductClick(product._id)}
                        className="text-lg font-semibold text-gray-800 hover:text-blue-600 cursor-pointer line-clamp-2 leading-tight mb-1"
                        title={product.name}
                      >
                        {product.name}
                      </h3>
                     
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-2">
                      {/* --- Price Display Area --- */}
                      {getDisplayPrice(product)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default WishlistPage;