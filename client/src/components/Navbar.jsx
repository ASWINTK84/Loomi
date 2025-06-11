import React, { useState, useContext, useEffect, useRef, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed react-icons/fa import and replaced with inline SVGs for compilation
// import {
//     FaShoppingCart,
//     FaUser,
//     FaChevronDown,
//     FaHeart,
//     FaBars,
//     FaTimes,
//     FaPhoneAlt,
// } from 'react-icons/fa';

// --- MOCK CONTEXTS FOR COMPILATION ---
// IMPORTANT: In a real application, these contexts would be in separate files
// (e.g., '../context/CategoryContext', etc.) and would interact with your backend/global state.
// These mock versions are included here to make the Navbar component self-contained and compilable
// within this environment, resolving the "Could not resolve" errors.

// Mock Category Context
const CategoryContext = createContext();
const useCategory = () => useContext(CategoryContext);

// Mock Auth Context
const AuthContext = createContext();

// Mock Cart Context
const CartContext = createContext();
const useCart = () => useContext(CartContext);

// Mock Wishlist Context
const WishlistContext = createContext();
const useWishlist = () => useContext(WishlistContext);


// Mock Provider for all contexts - This would wrap your App component in a real scenario
const MockProviders = ({ children }) => {
    // Mock data for categories
    const categories = [
        { _id: 'cat1', name: 'Electronics' },
        { _id: 'cat2', name: 'Apparel' },
        { _id: 'cat3', name: 'Home Goods' },
        { _id: 'cat4', name: 'Books' },
    ];

    // Mock data for authentication
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to true for testing logged-in state
    const user = { name: 'John Doe', email: 'john.doe@example.com' }; // Mock user data
    const login = () => setIsLoggedIn(true);
    const logout = () => setIsLoggedIn(false);

    // Mock data for cart
    const [cartItems, setCartItems] = useState([
        { id: 1, name: 'Product A', quantity: 1 },
        { id: 2, name: 'Product B', quantity: 2 },
    ]);
    const addToCart = (item) => setCartItems((prev) => [...prev, item]);
    const removeFromCart = (itemId) => setCartItems((prev) => prev.filter(item => item.id !== itemId));

    // Mock data for wishlist
    const [wishlist, setWishlist] = useState([
        { id: 101, name: 'Wishlist Item 1' },
    ]);
    const addToWishlist = (item) => setWishlist((prev) => [...prev, item]);
    const removeFromWishlist = (itemId) => setWishlist((prev) => prev.filter(item => item.id !== itemId));


    return (
        <CategoryContext.Provider value={{ categories }}>
            <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
                <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
                    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
                        {children}
                    </WishlistContext.Provider>
                </CartContext.Provider>
            </AuthContext.Provider>
        </CategoryContext.Provider>
    );
};

// --- END MOCK CONTEXTS ---

export default function Navbar() {
    // State to manage the mobile menu's open/close status
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // State to manage the user dropdown's open/close status
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // State to hold the currently selected category in the dropdown
    const [selectedCategory, setSelectedCategory] = useState('');

    // Accessing context values for cart, categories, authentication, and wishlist
    const { cartItems } = useCart();
    const { categories } = useCategory();
    const { isLoggedIn, user, logout } = useContext(AuthContext);
    const { wishlist } = useWishlist();

    // Hook for programmatic navigation
    const navigate = useNavigate();
    // Ref for the user dropdown to handle clicks outside of it
    const dropdownRef = useRef();

    // Handles category selection from the dropdown
    const handleCategoryChange = (e) => {
        const categoryName = e.target.value;
        setSelectedCategory(categoryName);
        // Navigate to the shop page, optionally filtering by category
        navigate(categoryName ? `/shop?category=${encodeURIComponent(categoryName)}` : '/shop');
        // Close the mobile menu if a category is selected from it
        closeMobileMenu();
    };

    // Effect to handle clicks outside the user dropdown, closing it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        // Add event listener for mousedown
        document.addEventListener('mousedown', handleClickOutside);
        // Cleanup function to remove the event listener on component unmount
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Function to close the mobile menu
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        // The MockProviders component wraps the entire Navbar for local compilation/preview.
        // In your actual application, you would wrap your root App component with your real providers.
        <MockProviders>
            {/* Sticky Top Header Section */}
            {/* This div makes the navbar stick to the top of the viewport */}
            <div className="w-full font-sans sticky top-0 z-50 bg-white shadow-md"> {/* Added shadow-md */}
                <div className="bg-blue-50">
                    {/* Main container for the top header content */}
                    <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:py-6">
                        {/* Logo Section */}
                        <div
                            onClick={() => { navigate('/'); closeMobileMenu(); }}
                            className="flex items-center space-x-2 sm:space-x-3 text-gray-900 hover:opacity-80 cursor-pointer"
                        >
                            <img
                                src="https://avatars.githubusercontent.com/u/68288528?s=200&v=4"
                                alt="LoOmi Logo"
                                className="h-7 sm:h-9"
                                loading="lazy"
                            />
                            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight select-none">LoOmi</span>
                        </div>

                        {/* Desktop Elements (Category Dropdown, User/Auth, Wishlist, Cart) */}
                        <div className="hidden md:flex items-center gap-x-7 w-full md:w-auto md:justify-end">
                            {/* Category Dropdown (Desktop View) */}
                            <div className="relative inline-block w-full max-w-xs md:max-w-[200px]">
                                <select
                                    className="block w-full bg-gray-50 border-b-2 border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md focus:outline-none focus:border-blue-500 transition cursor-pointer text-sm"
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(({ _id, name }) => (
                                        <option key={_id} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    {/* Chevron Down Icon */}
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>

                            {/* User Profile / Sign In/Register Section (Desktop View) */}
                            {isLoggedIn ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                                        className="flex items-center gap-2 text-gray-800 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                                    >
                                        {/* User Icon */}
                                        <svg className="h-5 w-5 text-xl" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium text-base">{user?.name || 'Account'}</span>
                                        {/* Chevron Down Icon */}
                                        <svg className="h-3 w-3 text-sm mt-[2px]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            <button
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/account');
                                                }}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100 text-sm"
                                            >
                                                Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/myorders');
                                                }}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100 text-sm"
                                            >
                                                Orders
                                            </button>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    navigate('/');
                                                }}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100 text-sm"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-gray-800 hover:text-indigo-600 font-semibold text-base"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="text-gray-800 hover:text-indigo-600 font-semibold text-base"
                                    >
                                        Register
                                    </button>
                                </div>
                            )}

                            {/* Wishlist Icon (Desktop View) */}
                            <button
                                onClick={() => navigate('/wishlist')}
                                className="relative flex items-center gap-2 text-gray-700 hover:text-indigo-600"
                            >
                                {/* Heart Icon */}
                                <svg className="h-6 w-6 text-2xl" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.586l1.172-1.172a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                {wishlist?.length > 0 && (
                                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 h-[20px] min-w-[20px] flex items-center justify-center">
                                        {wishlist.length}
                                    </span>
                                )}
                                <span className="font-medium text-sm">Wishlist</span>
                            </button>

                            {/* Cart Icon (Desktop View) */}
                            <button
                                onClick={() => navigate('/cart')}
                                className="relative flex items-center gap-2 text-gray-700 hover:text-indigo-600"
                            >
                                {/* Shopping Cart Icon */}
                                <svg className="h-6 w-6 text-2xl" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.378 4.618a1 1 0 00.957.652h7.957a1 1 0 00.957-.652l1.378-4.618a.997.997 0 00.01-.042L15.78 3H17a1 1 0 100-2H3zm.882 13.682a2 2 0 11-3.374-1.373A2 2 0 013.882 14.682zm10.748 0a2 2 0 11-3.374-1.373A2 2 0 0114.63 14.682z" />
                                </svg>
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 h-[20px] min-w-[20px] flex items-center justify-center">
                                        {cartItems.length}
                                    </span>
                                )}
                                <span className="font-medium text-sm">Cart</span>
                            </button>
                        </div>

                        {/* Mobile Icons and Hamburger Menu Toggle */}
                        <div className="flex md:hidden items-center gap-4">
                            {/* Wishlist Icon (Mobile View - icon only) */}
                            <button
                                onClick={() => { navigate('/wishlist'); closeMobileMenu(); }}
                                className="relative text-gray-700 hover:text-indigo-600"
                            >
                                {/* Heart Icon */}
                                <svg className="h-5 w-5 text-xl" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.586l1.172-1.172a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                {wishlist?.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 h-[18px] min-w-[18px] flex items-center justify-center">
                                        {wishlist.length}
                                    </span>
                                )}
                            </button>

                            {/* Cart Icon (Mobile View - icon only) */}
                            <button
                                onClick={() => { navigate('/cart'); closeMobileMenu(); }}
                                className="relative text-gray-700 hover:text-indigo-600"
                            >
                                {/* Shopping Cart Icon */}
                                <svg className="h-5 w-5 text-xl" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.378 4.618a1 1 0 00.957.652h7.957a1 1 0 00.957-.652l1.378-4.618a.997.997 0 00.01-.042L15.78 3H17a1 1 0 100-2H3zm.882 13.682a2 2 0 11-3.374-1.373A2 2 0 013.882 14.682zm10.748 0a2 2 0 11-3.374-1.373A2 2 0 0114.63 14.682z" />
                                </svg>
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 h-[18px] min-w-[18px] flex items-center justify-center">
                                        {cartItems.length}
                                    </span>
                                )}
                            </button>

                            {/* Hamburger Menu Toggle (Mobile View) */}
                            <button
                                className="text-gray-800 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            >
                                {isMobileMenuOpen ? (
                                    // Times Icon
                                    <svg className="h-6 w-6 text-2xl" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    // Bars Icon
                                    <svg className="h-6 w-6 text-2xl" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Non-sticky Secondary Navigation (Desktop Only) */}
            <nav className="bg-gray-50 border-t border-gray-200 hidden lg:block">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    {/* Main navigation links */}
                    <ul className="flex items-center gap-12 text-gray-800 font-semibold">
                        <li><button onClick={() => navigate('/')} className="hover:text-indigo-600">Home</button></li>
                        <li><button onClick={() => navigate('/shop')} className="hover:text-indigo-600">Shop</button></li>
                        <li><button onClick={() => navigate('/offersalepage')} className="hover:text-indigo-600">Sale</button></li>
                    </ul>
                    {/* 24/7 Support contact info */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        {/* Phone Icon */}
                        <svg className="h-4 w-4 text-base text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 3.097a1 1 0 01-.421 1.13L6.188 10a9.957 9.957 0 004.604 4.604l2.585-1.554a1 1 0 011.13-.421l3.097.74A1 1 0 0118 16.847V19a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
                        </svg>
                        <span>24/7 Support: <strong className="text-gray-900">74920-43477</strong></span>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <nav className={`fixed inset-0 bg-indigo-700 z-[60] flex flex-col items-center py-8 overflow-y-auto transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
                {/* Close button for the mobile menu */}
                <button
                    className="absolute top-4 right-4 text-white hover:text-red-300 text-3xl p-2 rounded-full hover:bg-indigo-600"
                    onClick={closeMobileMenu}
                >
                    {/* Times Icon */}
                    <svg className="h-6 w-6 text-3xl" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                {/* List of navigation links for the mobile menu */}
                <ul className="flex flex-col gap-7 text-2xl font-medium text-white mt-12 w-full text-center">
                    {/* Mobile Category Dropdown (within the mobile menu) */}
                    <li className="px-4 w-full">
                        <div className="relative inline-block w-full max-w-sm mx-auto">
                            <select
                                className="block w-full bg-indigo-600 border-b-2 border-indigo-400 text-white py-3 px-4 pr-8 rounded-md focus:outline-none focus:border-indigo-200 transition cursor-pointer text-base"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="" className="bg-indigo-700">All Categories</option>
                                {categories.map(({ _id, name }) => (
                                    <option key={_id} value={name} className="bg-indigo-700">
                                        {name}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
                                {/* Chevron Down Icon */}
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </li>
                    {/* Iterates over an array of navigation links */}
                    {[
                        ['/', 'Home'],
                        ['/shop', 'Shop'],
                        ['/offersalepage', 'Sale'],
                        ['/new-arrivals', 'New Arrivals'],
                        ['/about', 'About Us'],
                        ['/faq', 'FAQ'],
                        ['/contact', 'Contact Us'],
                        ['/privacy-policy', 'Privacy Policy'],
                    ].map(([link, label]) => (
                        <li key={link}>
                            {/* Button to navigate to the link and close the menu */}
                            <button onClick={() => { navigate(link); closeMobileMenu(); }} className="block w-full py-2 hover:bg-indigo-600 hover:text-white rounded-md">
                                {label}
                            </button>
                        </li>
                    ))}
                    {/* Conditional rendering for authentication links */}
                    {!isLoggedIn ? (
                        <>
                            <li><button onClick={() => { navigate('/login'); closeMobileMenu(); }} className="text-white font-semibold py-2 hover:bg-indigo-600 rounded-md">Sign In</button></li>
                            <li><button onClick={() => { navigate('/register'); closeMobileMenu(); }} className="text-white font-semibold py-2 hover:bg-indigo-600 rounded-md">Register</button></li>
                        </>
                    ) : (
                        <>
                            <li><button onClick={() => { navigate('/account'); closeMobileMenu(); }} className="text-white font-semibold py-2 hover:bg-indigo-600 rounded-md">Profile</button></li>
                            <li><button onClick={() => { navigate('/myorders'); closeMobileMenu(); }} className="text-white font-semibold py-2 hover:bg-indigo-600 rounded-md">Orders</button></li>
                            <li><button onClick={() => { logout(); navigate('/'); closeMobileMenu(); }} className="text-red-300 font-semibold py-2 hover:bg-indigo-600 rounded-md">Logout</button></li>
                        </>
                    )}
                    {/* Mobile Phone Number (within the mobile menu) */}
                    <li className="flex items-center justify-center gap-2 text-base text-indigo-100 mt-4">
                        {/* Phone Icon */}
                        <svg className="h-5 w-5 text-lg text-indigo-100" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 3.097a1 1 0 01-.421 1.13L6.188 10a9.957 9.957 0 004.604 4.604l2.585-1.554a1 1 0 011.13-.421l3.097.74A1 1 0 0118 16.847V19a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
                        </svg>
                        <span>24/7 Support: <strong className="text-white">74920-43477</strong></span>
                    </li>
                </ul>
            </nav>
        </MockProviders>
    );
}

// Optional: You would typically define and export your App component here
// and wrap it with the real context providers from your application.
// For demonstration, here's a minimal App structure to make it runnable in a single file.
export function App() {
    // In a real app, you would have your routing setup here
    // For this example, we just render the Navbar directly.
    return (
        <div>
            <Navbar />
            <div className="p-4 text-center">
                <h1 className="text-2xl font-bold">Welcome to LoOmi!</h1>
                <p>This is a demonstration of the responsive and attractive Navbar component.</p>
                <p>Please note: The context data (categories, cart, user, wishlist) is mocked for compilation purposes.</p>
            </div>
        </div>
    );
}
