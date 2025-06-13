import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { FaHeartBroken, FaTrash, FaShoppingCart } from 'react-icons/fa'; // Added FaShoppingCart
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext'; // Import useCart context
import { toast } from 'react-toastify'; // Import toast for notifications

const WishlistPage = () => {
    const { wishlist, removeFromWishlist, loadingWishlist, errorWishlist } = useWishlist();
    const navigate = useNavigate();
    const { offerProducts } = useProducts();
    const { addToCart } = useCart(); // Access addToCart from CartContext

    // Helper function to format price in Indian Rupees (INR)
    const formatPrice = (price) => {
        if (typeof price !== 'number' || isNaN(price)) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(price);
    };

    const handleRemoveClick = (productId) => {
        removeFromWishlist(productId);
        toast.info('Product removed from wishlist!'); // Notification
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handleAddToCart = (product) => {
        // For simplicity, adding with default size/color.
        // In a real app, you might want to open a modal for selection or navigate to product detail.
        const sizeToAdd = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size';
        const colorToAdd = product.colors && product.colors.length > 0 ? product.colors[0] : 'Default Color';

        addToCart(product, 1, sizeToAdd, colorToAdd); // Add product with quantity 1
        toast.success(`${product.name} added to cart!`); // Notification
    };

    // Function to determine which price to display
    const getDisplayPrice = (product) => {
        const productOffer = offerProducts.find(
            (offer) => offer.product?._id === product._id // Use optional chaining for safer access
        );

        if (productOffer) {
            const discountedPrice = product.price - (product.price * (productOffer.offerPercentage / 100));

            return (
                <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                    <span className="text-xl md:text-2xl font-extrabold text-blue-600">
                        {formatPrice(discountedPrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.price)}
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-green-500">
                        ({productOffer.offerPercentage}% off)
                    </span>
                </div>
            );
        }

        return (
            <span className="text-xl md:text-2xl font-extrabold text-blue-600">
                {formatPrice(product.price)}
            </span>
        );
    };

    if (loadingWishlist) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-gray-600">
                <p className="text-lg md:text-xl font-medium">Loading your wishlist...</p>
                <div className="mt-4 animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
        );
    }

    if (errorWishlist) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-red-500">
                <p className="text-lg md:text-xl font-medium">Error loading wishlist:</p>
                <p className="text-base md:text-lg mt-2">{errorWishlist}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-5 py-2.5 md:px-6 md:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Page Header */}
            <section className="bg-white py-6 md:py-8 border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">Your Wishlist</h1>
                    <nav className="text-gray-600 text-sm">
                        <a href="/" className="hover:text-blue-600 transition-colors">
                            Home
                        </a>{' '}
                        / <span className="text-blue-600">Wishlist</span>
                    </nav>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8 md:py-12 bg-gray-100 min-h-screen">
                <div className="container mx-auto px-4">
                    {wishlist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 md:py-20 bg-white rounded-xl shadow-lg text-center">
                            <FaHeartBroken className="text-gray-400 text-6xl md:text-7xl mb-4 md:mb-6" />
                            <p className="text-xl md:text-2xl text-gray-700 font-semibold mb-3 md:mb-4">
                                Your wishlist is empty!
                            </p>
                            <p className="text-gray-600 mb-6 md:mb-8 max-w-xs sm:max-w-md mx-auto text-sm md:text-base">
                                Start Browse and add your favorite products here. They'll be
                                waiting for you.
                            </p>
                            <button
                                onClick={() => navigate('/shop')}
                                className="px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 text-sm md:text-base"
                            >
                                Go to Shop Now
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {wishlist.map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={
                                                product.imageUrl ||
                                                product.images?.[0]?.url || // Prioritize images array if available
                                                'https://via.placeholder.com/400x400?text=No+Image'
                                            }
                                            alt={product.name}
                                            className="w-full h-48 sm:h-56 md:h-64 object-contain bg-white cursor-pointer transition-transform duration-300 hover:scale-105 p-2"
                                            onClick={() => handleProductClick(product._id)}
                                        />

                                        <button
                                            onClick={() => handleRemoveClick(product._id)}
                                            className="absolute top-3 right-3 bg-red-600 text-white rounded-full p-2 text-base md:text-lg opacity-90 hover:opacity-100 hover:bg-red-700 transition-all duration-300 z-10 shadow-md"
                                            aria-label={`Remove ${product.name} from Wishlist`}
                                            title="Remove from Wishlist"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3
                                                onClick={() => handleProductClick(product._id)}
                                                className="text-base sm:text-lg font-semibold text-gray-800 hover:text-blue-600 cursor-pointer line-clamp-2 leading-tight mb-2"
                                                title={product.name}
                                            >
                                                {product.name}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-auto pt-2 gap-2">
                                            {/* --- Price Display Area --- */}
                                            {getDisplayPrice(product)}
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="bg-blue-600 text-white rounded-lg p-2.5 text-sm md:text-base hover:bg-blue-700 transition duration-300 flex items-center justify-center shadow-md w-full sm:w-auto mt-2 sm:mt-0"
                                                aria-label={`Add ${product.name} to cart`}
                                                title="Add to Cart"
                                            >
                                                <FaShoppingCart className="mr-1 sm:mr-2" />
                                                <span className="hidden sm:inline">Add to Cart</span>
                                            </button>
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