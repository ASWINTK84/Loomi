import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCategory } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { FaChevronLeft, FaTag, FaRulerCombined, FaPalette, FaShoppingCart, FaSpinner, FaHeart, FaStar } from 'react-icons/fa'; // Removed FaExchangeAlt
import { toast } from 'react-toastify';
import { useWishlist } from '../context/WishlistContext';

const API_BASE_URL = 'https://loomibackend.onrender.com/api/v1/product';

const SingleProductPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [mainImage, setMainImage] = useState('');

    const { categories } = useCategory();
    const { offerProducts } = useProducts();
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_BASE_URL}/get-product-by-id/${productId}`);
                const fetchedProduct = response.data.product;
                setProduct(fetchedProduct);

                if (fetchedProduct.images && fetchedProduct.images.length > 0) {
                    setMainImage(fetchedProduct.images[0].url);
                } else if (fetchedProduct.imageUrl) {
                    setMainImage(fetchedProduct.imageUrl);
                } else {
                    setMainImage('/images/default-product.png');
                }

                if (fetchedProduct.sizes && fetchedProduct.sizes.length > 0) {
                    setSelectedSize(fetchedProduct.sizes[0]);
                } else {
                    setSelectedSize('One Size');
                }

                if (fetchedProduct.colors && fetchedProduct.colors.length > 0) {
                    setSelectedColor(fetchedProduct.colors[0]);
                } else {
                    setSelectedColor('Default Color');
                }

            } catch (err) {
                console.error('Failed to fetch product:', err);
                setError('Failed to load product. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    // Helper to determine text color for contrast on colored buttons
    const isLightColor = (color) => {
        if (!color || typeof color !== 'string') return true;
        const namedColors = {
            black: '#000000', white: '#FFFFFF', red: '#FF0000', green: '#008000', blue: '#0000FF',
            yellow: '#FFFF00', cyan: '#00FFFF', magenta: '#FF00FF', gray: '#808080',
            maroon: '#800000', olive: '#808000', purple: '#800080', teal: '#008080',
            navy: '#000080', silver: '#C0C0C0', gold: '#FFD700', orange: '#FFA500',
            pink: '#FFC0CB', brown: '#A52A2A', violet: '#EE82EE', indigo: '#4B0082',
        };

        let hexColor = color.startsWith('#') ? color : namedColors[color.toLowerCase()];

        if (!hexColor) {
            return false;
        }

        if (hexColor.startsWith('#')) {
            let r, g, b;
            if (hexColor.length === 4) {
                r = parseInt(hexColor[1] + hexColor[1], 16);
                g = parseInt(hexColor[2] + hexColor[2], 16);
                b = parseInt(hexColor[3] + hexColor[3], 16);
            } else if (hexColor.length === 7) {
                r = parseInt(hexColor.substring(1, 3), 16);
                g = parseInt(hexColor.substring(3, 5), 16);
                b = parseInt(hexColor.substring(5, 7), 16);
            } else {
                return false;
            }

            const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            return (yiq >= 170);
        }
        return false;
    };


    if (loading)
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-120px)] bg-gray-50">
                <FaSpinner className="animate-spin text-blue-600 text-5xl" />
                <div className="ml-4 text-xl text-gray-700 font-semibold">Loading product details...</div>
            </div>
        );
    if (error)
        return (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-120px)] bg-gray-50 p-4">
                <div className="text-xl text-red-600 font-semibold mb-4">{error}</div>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                    Go to Homepage
                </button>
            </div>
        );
    if (!product)
        return (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-120px)] bg-gray-50 p-4">
                <div className="text-xl text-gray-700 font-semibold mb-4">Product not found.</div>
                <button
                    onClick={() => navigate('/products')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                    View All Products
                </button>
            </div>
        );

    const currentOffer = Array.isArray(offerProducts)
        ? offerProducts.find((offer) => offer.product?._id === product._id)
        : undefined;

    const calculateOfferPrice = (price, percentage) => {
        return price - (price * percentage) / 100;
    };

    const displayPrice = currentOffer
        ? calculateOfferPrice(product.price, currentOffer.offerPercentage)
        : product.price;

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat._id === categoryId);
        return category ? category.name : 'Uncategorized';
    };

    const categoryName =
        typeof product.category === 'string'
            ? getCategoryName(product.category)
            : product.category?.name || 'Uncategorized';

    const handleAddToCart = () => {
        if (product.sizes && product.sizes.length > 0 && selectedSize === 'One Size') {
            toast.error('Please select a size before adding to cart.');
            return;
        }
        if (product.colors && product.colors.length > 0 && selectedColor === 'Default Color') {
            toast.error('Please select a color before adding to cart.');
            return;
        }
        if (quantity <= 0) {
            toast.error('Quantity must be at least 1.');
            return;
        }

        addToCart(product, quantity, selectedSize, selectedColor);
        toast.success(`${product.name} added to cart!`);
    };

    // Placeholder for product rating and review count
    const productRating = product.rating || 4.5; // Example rating
    const reviewCount = product.reviewCount || 120; // Example review count
    
    // Handles Add/Remove from Wishlist
    const handleWishlistClick = (e) => {
        e.stopPropagation(); // Prevent card click event from bubbling up
        e.preventDefault(); // Prevent default link behavior if inside a link

        if (isInWishlist(product._id)) {
            removeFromWishlist(product._id);
            toast.info(`${product.name} removed from wishlist.`);
        } else {
            addToWishlist(product);
            toast.success(`${product.name} added to wishlist!`);
        }
    };

    return (
        <div className="bg-white min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-700 transition transform hover:-translate-x-1 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full px-3 py-1.5 bg-gray-100 shadow-sm"
                >
                    <FaChevronLeft className="mr-1.5 text-blue-500" /> Back to Shop
                </button>

                {/* Main Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Left: Image Gallery */}
                    <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center bg-gray-50">
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full max-h-[500px] object-contain rounded-lg border border-gray-200 shadow-md mb-4"
                        />

                        {product.images && product.images.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-3">
                                {product.images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img.url}
                                        alt={`Thumbnail ${index + 1}`}
                                        onClick={() => setMainImage(img.url)}
                                        className={`w-20 h-20 object-cover rounded-md border-2 cursor-pointer transition-all duration-200
                                            ${mainImage === img.url
                                                ? 'border-blue-600 ring-2 ring-blue-300'
                                                : 'border-gray-200 hover:border-blue-400 opacity-90'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details and Options */}
                    <div className="p-4 md:p-6 lg:p-8 flex flex-col">
                        {/* Product Title */}
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                            {product.name}
                        </h1>

                        {/* Rating and Reviews */}
                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-400">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <FaStar key={i} className={i < Math.floor(productRating) ? '' : 'opacity-30'} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600 ml-2">
                                ({reviewCount} Reviews)
                            </span>
                        </div>

                        {/* Price Display */}
                        <div className="flex items-baseline gap-3 mb-4">
                            {currentOffer ? (
                                <>
                                    <span className="text-3xl font-bold text-green-600">
                                        ₹{displayPrice?.toFixed(2)}
                                    </span>
                                    <span className="line-through text-gray-500 text-xl">
                                        ₹{product.price.toFixed(2)}
                                    </span>
                                    <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                        {currentOffer.offerPercentage}% OFF
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-bold text-gray-900">
                                    ₹{product.price.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Short Description */}
                        <p className="text-gray-700 text-md mb-6 leading-relaxed">
                            {product.description}
                        </p>

                        <hr className="my-4 border-gray-200" />

                        {/* Available Options Section */}
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Options:</h3>

                        {/* Color Selector */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-md font-medium text-gray-700 mb-2">Color:</label>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                                ${selectedColor === color
                                                    ? 'border-blue-600 ring-2 ring-blue-300'
                                                    : 'border-gray-300 hover:border-blue-400'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={color.charAt(0).toUpperCase() + color.slice(1)}
                                        >
                                            {selectedColor === color && (
                                                <span className="text-white text-lg">&#10003;</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selector */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-md font-medium text-gray-700 mb-2">Size:</label>
                                <div className="flex flex-wrap gap-3">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all duration-200
                                                ${selectedSize === size
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

                        {/* Quantity and Add to Cart/Wishlist */}
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mt-auto pt-4 border-t border-gray-100">
                            <div className="flex-1">
                                <label className="block text-md font-medium text-gray-700 mb-2">Quantity:</label>
                                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-32">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full text-center text-lg font-medium border-x border-gray-300 focus:outline-none"
                                        min="1"
                                    />
                                    <button
                                        onClick={() => setQuantity((q) => q + 1)}
                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 flex-1 sm:w-auto">
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold py-3 rounded-md shadow-md transition-colors"
                                >
                                    <FaShoppingCart className="inline-block mr-2" /> Add To Cart
                                </button>
                                {/* Modified Wishlist button */}
                                <button
                                    onClick={handleWishlistClick}
                                    className={`w-full flex items-center justify-center px-4 py-2 border rounded-md text-gray-700 transition-colors
                                        ${isInWishlist(product._id)
                                            ? 'border-red-500 bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'border-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    <FaHeart className={`mr-2 ${isInWishlist(product._id) ? 'text-red-500' : ''}`} />
                                    {isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                </button>
                            </div>
                        </div>

                        {/* Category Information (Availability removed) */}
                        <div className="mt-6 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                            <p><strong>Category:</strong> {categoryName}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleProductPage;