import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaEye, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { FaHeart as FarHeart } from 'react-icons/fa'; 
import { FaHeart as FasHeart } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';
import { useProducts } from '../../../context/ProductContext';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product, isListView = false }) => {
    // If product data is not available, don't render anything
    if (!product) return null;

    // Destructure context functions
    const { offerProducts } = useProducts();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    // State for managing Quick View modal visibility
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // States for selected size and color on the main card (grid/list view)
    const [selectedCardSize, setSelectedCardSize] = useState('');
    const [selectedCardColor, setSelectedCardColor] = useState('');

    // States for selected size and color in the Quick View modal
    const [selectedQuickViewSize, setSelectedQuickViewSize] = useState('');
    const [selectedQuickViewColor, setSelectedQuickViewColor] = useState('');

    useEffect(() => {
        // Initialize for the main card selectors
        if (product.sizes && product.sizes.length > 0) {
            setSelectedCardSize(product.sizes[0]);
        } else {
            setSelectedCardSize('One Size'); // Fallback for products without specific sizes
        }

        if (product.colors && product.colors.length > 0) {
            setSelectedCardColor(product.colors[0]);
        } else {
            setSelectedCardColor('Default Color'); 
        }

        // Initialize for Quick View modal selectors (will be re-initialized when modal opens too, for redundancy)
        if (product.sizes && product.sizes.length > 0) {
            setSelectedQuickViewSize(product.sizes[0]);
        } else {
            setSelectedQuickViewSize('One Size');
        }

        if (product.colors && product.colors.length > 0) {
            setSelectedQuickViewColor(product.colors[0]);
        } else {
            setSelectedQuickViewColor('Default Color');
        }
    }, [product]);

    useEffect(() => {
        if (isQuickViewOpen) {
            // Re-initialize Quick View selections when modal opens to ensure they match the first available option
            if (product.sizes && product.sizes.length > 0) {
                setSelectedQuickViewSize(product.sizes[0]);
            } else {
                setSelectedQuickViewSize('One Size');
            }
            if (product.colors && product.colors.length > 0) {
                setSelectedQuickViewColor(product.colors[0]);
            } else {
                setSelectedQuickViewColor('Default Color');
            }
        }
    }, [isQuickViewOpen, product.sizes, product.colors]); 

    // Find if there's an active offer for this product
    const currentOffer = Array.isArray(offerProducts)
        ? offerProducts.find((offer) => offer.product?._id === product._id)
        : undefined;

    // Helper function to calculate price with offer discount
    const calculateOfferPrice = (price, offerPercentage) => {
        if (typeof price !== 'number' || isNaN(price)) return 0;
        return price - (price * offerPercentage) / 100;
    };

    // Determine the price to display (original or discounted)
    const displayPrice = currentOffer
        ? calculateOfferPrice(product.price, currentOffer.offerPercentage)
        : product.price;

    // Determine the product image URL, with a fallback to a default image
    const imageUrl = product.imageUrl || product.images?.[0]?.url || '/images/default-product.png';

    // Helper function to format price in Indian Rupees
    const formatPrice = (price) => {
        if (typeof price !== 'number' || isNaN(price)) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(price);
    };

    // Calculate star ratings for display
    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);

    // Helper to determine text color for contrast on colored buttons (for checkmark)
    const isLightColor = (color) => {
        if (!color || typeof color !== 'string') return true; 

        let hexColor = color.toLowerCase().trim();

        // Standardize common color names to hex 
        const namedColors = {
            black: '#000000', white: '#FFFFFF', red: '#FF0000', green: '#008000', blue: '#0000FF',
            yellow: '#FFFF00', cyan: '#00FFFF', magenta: '#FF00FF', gray: '#808080',
            maroon: '#800000', olive: '#808000', purple: '#800080', teal: '#008080',
            navy: '#000080', silver: '#C0C0C0', gold: '#FFD700', orange: '#FFA500',
            pink: '#FFC0CB', brown: '#A52A2A', violet: '#EE82EE', indigo: '#4B0082',
            lime: '#00FF00', aqua: '#00FFFF', fuchsia: '#FF00FF',
            darkgray: '#A9A9A9', lightgray: '#D3D3D3', darkgrey: '#A9A9A9', lightgrey: '#D3D3D3'
        };

        if (namedColors[hexColor]) {
            hexColor = namedColors[hexColor];
        } else if (hexColor.startsWith('rgb')) {
            const rgbValues = hexColor.match(/\d+/g)?.map(Number);
            if (rgbValues && rgbValues.length >= 3) {
                
                hexColor = '#' + rgbValues.slice(0, 3).map(c => ('0' + c.toString(16)).slice(-2)).join('');
            } else {
                return false; 
            }
        }

        if (!hexColor.startsWith('#') || (hexColor.length !== 4 && hexColor.length !== 7)) {
          
            console.warn(`isLightColor: Could not parse color "${color}". Assuming dark for safety.`);
            return false;
        }

        let r, g, b;
        if (hexColor.length === 4) { 
            r = parseInt(hexColor[1] + hexColor[1], 16);
            g = parseInt(hexColor[2] + hexColor[2], 16);
            b = parseInt(hexColor[3] + hexColor[3], 16);
        } else { 
            r = parseInt(hexColor.substring(1, 3), 16);
            g = parseInt(hexColor.substring(3, 5), 16);
            b = parseInt(hexColor.substring(5, 7), 16);
        }

        // Calculate Luma (perceived brightness)
        // A more accurate formula than YIQ for determining perceived brightness
        const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        return luma >= 0.5; 
    };

    // Handles Add to Cart action from the main ProductCard (uses selectedCardSize/Color)
    const handleAddToCartFromCard = (e) => {
        e.stopPropagation(); 
        e.preventDefault(); 

        let sizeToAddToCart = selectedCardSize;
        let colorToAddToCart = selectedCardColor;

        //  validation for selections if product has sizes/colors
        if (product.sizes && product.sizes.length > 0 && (!sizeToAddToCart || sizeToAddToCart === 'One Size')) {
            toast.error('Please select a size before adding to cart.');
            return;
        }
        if (product.colors && product.colors.length > 0 && (!colorToAddToCart || colorToAddToCart === 'Default Color')) {
            toast.error('Please select a color before adding to cart.');
            return;
        }

        addToCart(product, 1, sizeToAddToCart, colorToAddToCart);
    };

    // Handles Add to Cart action from the Quick View Modal (uses selectedQuickViewSize/Color)
    const handleAddToCartFromQuickView = () => {
        let sizeToAddToCart = selectedQuickViewSize;
        let colorToAddToCart = selectedQuickViewColor;

        // Basic validation for selections in Quick View
        if (product.sizes && product.sizes.length > 0 && (!sizeToAddToCart || sizeToAddToCart === 'One Size')) {
            toast.error('Please select a size before adding to cart.');
            return;
        }
        if (product.colors && product.colors.length > 0 && (!colorToAddToCart || colorToAddToCart === 'Default Color')) {
            toast.error('Please select a color before adding to cart.');
            return;
        }

        addToCart(product, 1, sizeToAddToCart, colorToAddToCart);
        setIsQuickViewOpen(false); 
    };

    // Handles Add/Remove from Wishlist
    const handleWishlistClick = (e) => {
        e.stopPropagation(); 
        e.preventDefault(); 

        if (isInWishlist(product._id)) {
            removeFromWishlist(product._id);
            toast.info(`${product.name} removed from wishlist.`);
        } else {
            addToWishlist(product);
            toast.success(`${product.name} added to wishlist!`);
        }
    };

    return (
        <>
            {/* Product Card Container */}
            <div
                className={`group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden
                            ${isListView ? 'flex flex-col md:flex-row items-stretch p-4 gap-4' : 'flex flex-col p-4'}`}
            >
                {/* Product Image and Offer Badge */}
                <Link to={`/product/${product._id}`} className={`${isListView ? 'w-full md:w-1/3 flex-shrink-0' : 'block'}`}>
                    <div className={`${isListView ? 'w-full h-48 md:h-32' : 'h-48'} mb-4 flex items-center justify-center relative`}>
                        <img
                            src={imageUrl}
                            alt={product.name || 'Product image'}
                            className={`${isListView ? 'max-w-full max-h-full object-contain' : 'max-w-full max-h-full object-contain'}`}
                            loading="lazy"
                            draggable={false} 
                        />
                        {currentOffer && (
                            <span className="absolute top-0 left-0 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-br-lg rounded-tl-lg shadow-md">
                                {currentOffer.offerPercentage}% OFF
                            </span>
                        )}
                    </div>
                </Link>

                {/* Info & Details Section */}
                <div className={`${isListView ? 'flex-1 flex flex-col justify-between' : 'w-full text-center'}`}>
                    {/* Link to product detail page */}
                    <Link to={`/product/${product._id}`}>
                        <h3 className={`font-semibold text-gray-800 hover:text-blue-700 transition-colors ${isListView ? 'text-lg mb-1' : 'text-xl mb-2 line-clamp-2'}`}>
                            {product.name}
                        </h3>
                    </Link>

                    {/* Rating Stars */}
                    <div className={`flex items-center ${isListView ? 'justify-start' : 'justify-center'} mb-2`}>
                        {[...Array(fullStars)].map((_, i) => (
                            <FaStar key={`full-${i}`} className="text-sm text-yellow-400" />
                        ))}
                        {hasHalfStar && <FaStarHalfAlt key="half" className="text-sm text-yellow-400" />}
                        {[...Array(emptyStars)].map((_, i) => (
                            <FaStar key={`empty-${i}`} className="text-sm text-gray-300" />
                        ))}
                        <span className="text-gray-500 text-xs ml-1">({product.ratingCount || 0})</span>
                    </div>

                    {/* Price Display */}
                    <div className={`flex items-baseline ${isListView ? 'justify-start' : 'justify-center'} gap-2 mb-3`}>
                        <span className="text-blue-600 font-bold text-xl">
                            {formatPrice(displayPrice)}
                        </span>
                        {currentOffer && product.price > displayPrice && (
                            <span className="text-gray-500 line-through text-sm">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>

                    {/* Description (only for list view) */}
                    {isListView && (
                        <p className="text-gray-600 text-sm mt-2 line-clamp-3 mb-3">
                            {product.description || 'No description available.'}
                        </p>
                    )}

                    {/* Interactive Color Selector on Card */}
                    {product.colors && product.colors.length > 0 && (
                        <div className={`mt-2 ${isListView ? 'text-left' : 'text-center'} mb-3`}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color:</label>
                            <div className={`flex flex-wrap gap-2 ${isListView ? 'justify-start' : 'justify-center'}`}>
                                {product.colors.map((color, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedCardColor(color); }}
                                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                                    ${selectedCardColor === color
                                                        ? 'border-blue-600 ring-2 ring-blue-300'
                                                        : 'border-gray-300 hover:border-blue-400'
                                                    }`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    >
                                        {selectedCardColor === color && (
                                            <span className={`${isLightColor(color) ? 'text-gray-800' : 'text-white'} text-xs font-bold`}>&#10003;</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interactive Size Selector on Card */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className={`mt-2 ${isListView ? 'text-left' : 'text-center'} mb-4`}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Size:</label>
                            <div className={`flex flex-wrap gap-2 ${isListView ? 'justify-start' : 'justify-center'}`}>
                                {product.sizes.map((size, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedCardSize(size); }}
                                        className={`px-3 py-1 rounded-md border-2 text-xs font-medium transition-all duration-200
                                                    ${selectedCardSize === size
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                    >
                                        {size.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    
                    <button
                        onClick={handleAddToCartFromCard}
                        className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-base font-semibold flex items-center justify-center"
                        aria-label="Add to cart"
                        title="Add to Cart"
                    >
                        <FaShoppingCart className="mr-2" /> Add to Cart
                    </button>
                </div>

                {/* Top-Right Action Buttons (Wishlist, Quick View) */}
                
                <div className={`absolute top-4 right-4 z-20 flex flex-col space-y-2 transition-opacity duration-300
                                 ${isListView 
                                    ? 'relative top-auto right-auto mt-4 md:mt-0' 
                                    : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100' 
                                 }`}
                >
                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlistClick}
                        className={`p-2 rounded-full shadow-md transition-all duration-200
                                    ${isInWishlist(product._id) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        aria-label={isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        title={isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                        {isInWishlist(product._id) ? <FasHeart className="w-5 h-5" /> : <FarHeart className="w-5 h-5" />}
                    </button>

                    {/* Quick View Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); 
                            e.preventDefault(); 
                            setIsQuickViewOpen(true); 
                        }}
                        className="bg-gray-100 text-gray-600 p-2 rounded-full shadow-md hover:bg-gray-200 transition-colors duration-200"
                        aria-label="Quick view"
                        title="Quick View"
                    >
                        <FaEye className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Quick View Modal */}
            {isQuickViewOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn"
                    onClick={() => setIsQuickViewOpen(false)} 
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="bg-white rounded-xl p-6 shadow-2xl max-w-sm sm:max-w-lg w-full relative max-h-[95vh] overflow-y-auto transform scale-95 animate-scaleIn"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        {/* Close button for the modal */}
                        <button
                            onClick={() => setIsQuickViewOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl transition-colors"
                            aria-label="Close quick view"
                            title="Close"
                        >
                            <FaTimes />
                        </button>

                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{product.name}</h2>

                        {/* Price Display in Modal */}
                        <div className="flex items-baseline gap-2 sm:gap-3 mb-4">
                            {currentOffer ? (
                                <>
                                    <span className="text-2xl sm:text-3xl font-bold text-green-600">
                                        {formatPrice(displayPrice)}
                                    </span>
                                    <span className="line-through text-gray-500 text-base sm:text-xl">
                                        {formatPrice(product.price)}
                                    </span>
                                    <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {currentOffer.offerPercentage}% OFF
                                    </span>
                                </>
                            ) : (
                                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {formatPrice(product.price)}
                                </span>
                            )}
                        </div>

                        {/* Product Image in Modal */}
                        <img
                            src={imageUrl}
                            alt={product.name || 'Product image'}
                            className="mb-4 max-h-48 sm:max-h-64 mx-auto object-contain w-full rounded-lg border border-gray-200 shadow-sm"
                        />
                        {/* Product Description in Modal */}
                        <p className="mb-5 text-gray-700 leading-relaxed text-sm sm:text-base">{product.description || 'No description available.'}</p>

                        {/* Interactive Color Selector in Modal */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-5">
                                <label className="block text-sm sm:text-md font-medium text-gray-800 mb-2">Select Color:</label>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {product.colors.map((color, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedQuickViewColor(color)}
                                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm
                                                        ${selectedQuickViewColor === color
                                                            ? 'border-blue-600 ring-2 ring-blue-300'
                                                            : 'border-gray-300 hover:border-blue-400'
                                                        }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        >
                                            {selectedQuickViewColor === color && (
                                                <span className={`${isLightColor(color) ? 'text-gray-800' : 'text-white'} text-base sm:text-lg`}>&#10003;</span> // Checkmark
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Interactive Size Selector in Modal */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm sm:text-md font-medium text-gray-800 mb-2">Select Size:</label>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {product.sizes.map((size, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedQuickViewSize(size)}
                                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md border-2 text-sm font-medium transition-all duration-200 shadow-sm
                                                        ${selectedQuickViewSize === size
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                        >
                                            {size.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons  */}
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={handleAddToCartFromQuickView}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 sm:py-3 rounded-lg shadow-md transition-colors duration-200 w-full text-base sm:text-lg font-semibold flex items-center justify-center"
                            >
                                <FaShoppingCart className="mr-2" /> Add to Cart
                            </button>
                            <Link
                                to={`/product/${product._id}`}
                                className="text-center text-blue-700 border border-blue-700 px-4 py-2 sm:py-2.5 rounded-lg hover:bg-blue-50 transition-colors duration-200 block w-full text-sm sm:text-md font-medium"
                                onClick={() => setIsQuickViewOpen(false)} 
                            >
                                View Full Details
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductCard;