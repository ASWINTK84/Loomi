import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaShoppingCart,
    FaUser,
    FaChevronDown,
    FaHeart,
    FaBars,
    FaTimes,
    FaPhoneAlt,
    FaHome,
    FaStore,
    FaTag,
    FaSignInAlt,
    FaUserPlus,
    FaUserCircle,
    FaClipboardList,
    FaSignOutAlt,
    FaSearch // Added for potential search bar
} from 'react-icons/fa';
import { useCategory } from '../context/CategoryContext';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');

    const { cartItems } = useCart();
    const { categories } = useCategory();
    const { isLoggedIn, user, logout } = useContext(AuthContext);
    const { wishlist } = useWishlist();

    const navigate = useNavigate();
    const dropdownRef = useRef();

    const handleCategoryChange = (e) => {
        const categoryName = e.target.value;
        setSelectedCategory(categoryName);
        navigate(categoryName ? `/shop?category=${encodeURIComponent(categoryName)}` : '/shop');

        // Close main mobile menu if a category is selected
        if (isMobileMenuOpen) {
            closeMobileMenu();
        }
    };

    // Close desktop user dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent body scrolling when main mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            {/* Top Announcement/Contact Bar (Optional, but adds polish) */}
            <div className="bg-gray-100 text-gray-700 text-xs py-2 hidden sm:block">
                <div className="container mx-auto flex justify-end px-4">
                    <span className="flex items-center gap-1">
                        <FaPhoneAlt className="text-sm" /> 24/7 Support: <strong className="ml-1">95396-97664</strong>
                    </span>
                </div>
            </div>

            {/* Main Header (Logo, Search, Core Icons) */}
            <div className="w-full font-sans sticky top-0 z-50 bg-white shadow-md">
                <div className="container mx-auto flex items-center justify-between px-4 py-4 lg:py-5">

                    {/* LoOmi Logo */}
                    <div
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-gray-900 cursor-pointer"
                    >
                        <img
                            src="https://avatars.githubusercontent.com/u/68288528?s=200&v=4"
                            alt="LoOmi Logo"
                            className="h-7 lg:h-9"
                            loading="lazy"
                        />
                        <span className="text-3xl lg:text-4xl font-extrabold tracking-tight select-none text-indigo-700">LoOmi</span>
                    </div>

                    {/* Search Bar (Optional, uncomment and implement search functionality if needed) */}
                    {/*
                    <div className="hidden md:flex flex-grow max-w-md mx-8">
                        <input
                            type="text"
                            placeholder="Search for products..."
                            className="flex-grow border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                        <button className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700 transition-colors">
                            <FaSearch />
                        </button>
                    </div>
                    */}

                    {/* Icons & Auth */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        {/* User/Auth Dropdown */}
                        {isLoggedIn ? (
                            <div className="relative hidden md:block" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                                    className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-2"
                                    aria-label="User Account Menu"
                                >
                                    <FaUserCircle className="text-2xl" />
                                    <span className="font-medium text-sm hidden lg:inline-block max-w-[100px] truncate">{user?.name || 'Account'}</span>
                                    <FaChevronDown className="text-xs ml-1" />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                        <button
                                            onClick={() => { setIsDropdownOpen(false); navigate('/account'); }}
                                            className="w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                                        >
                                            <FaUserCircle /> Profile
                                        </button>
                                        <button
                                            onClick={() => { setIsDropdownOpen(false); navigate('/myorders'); }}
                                            className="w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                                        >
                                            <FaClipboardList /> Orders
                                        </button>
                                        <button
                                            onClick={() => { setIsDropdownOpen(false); logout(); navigate('/'); }}
                                            className="w-full text-left px-4 py-3 text-red-600 font-semibold hover:bg-red-50 flex items-center gap-3 transition-colors"
                                        >
                                            <FaSignOutAlt /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-gray-700 hover:text-indigo-600 font-semibold text-sm px-3 py-2 rounded-md transition-colors"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Register
                                </button>
                            </div>
                        )}

                        {/* Wishlist Icon */}
                        <button
                            onClick={() => navigate('/wishlist')}
                            className="relative flex items-center text-gray-700 hover:text-indigo-600 p-2"
                            aria-label={`Wishlist with ${wishlist?.length} items`}
                        >
                            <FaHeart className="text-2xl" />
                            {wishlist?.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] h-[20px] flex items-center justify-center font-bold">
                                    {wishlist.length}
                                </span>
                            )}
                        </button>

                        {/* Cart Icon */}
                        <button
                            onClick={() => navigate('/cart')}
                            className="relative flex items-center text-gray-700 hover:text-indigo-600 p-2"
                            aria-label={`Shopping Cart with ${cartItems.length} items`}
                        >
                            <FaShoppingCart className="text-2xl" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] h-[20px] flex items-center justify-center font-bold">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Toggle Button (Hamburger / Close Icon) */}
                        <button
                            className="md:hidden text-gray-700 hover:text-indigo-600 focus:outline-none p-2"
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                        >
                            {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Navigation Bar (Main Links & Categories) */}
            <nav className="bg-gray-50 border-t border-b border-gray-200 hidden md:block shadow-sm">
                <div className="container mx-auto flex items-center justify-start px-4 py-3">
                    <ul className="flex items-center gap-x-8 text-gray-800 font-semibold">
                        <li><button onClick={() => navigate('/')} className="hover:text-indigo-600 transition-colors px-3 py-2 rounded-md">Home</button></li>
                        <li><button onClick={() => navigate('/shop')} className="hover:text-indigo-600 transition-colors px-3 py-2 rounded-md">Shop</button></li>
                        <li><button onClick={() => navigate('/offersalepage')} className="hover:text-indigo-600 transition-colors px-3 py-2 rounded-md">Sale</button></li>
                        {/* Category Dropdown in Nav Bar for Desktop */}
                        <li className="relative">
                            <select
                                className="block bg-transparent text-gray-800 py-2 px-3 rounded-md focus:outline-none focus:ring-0 cursor-pointer appearance-none font-semibold hover:text-indigo-600 transition-colors"
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
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <FaChevronDown className="h-3 w-3" />
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Main Mobile Menu Drawer */}
            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={closeMobileMenu}
                ></div>
            )}

            {/* Mobile Menu Drawer Content */}
            <nav
                className={`
                    fixed inset-y-0 right-0 z-40 bg-white shadow-lg
                    transform transition-transform ease-in-out duration-300
                    ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                    w-3/4 max-w-xs sm:max-w-sm md:hidden
                    flex flex-col py-8 px-6 overflow-y-auto
                `}
            >
                <button
                    className="absolute top-4 right-4 text-gray-700 hover:text-indigo-600 text-3xl p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                    aria-label="Close Mobile Menu"
                >
                    <FaTimes />
                </button>

                <ul className="flex flex-col gap-6 text-xl font-medium text-gray-800 mt-12 w-full">
                    {/* Main Nav Links for Mobile */}
                    <li><button onClick={() => { navigate('/'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3"><FaHome className="text-lg" /> Home</button></li>
                    <li><button onClick={() => { navigate('/shop'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3"><FaStore className="text-lg" /> Shop</button></li>
                    <li><button onClick={() => { navigate('/offersalepage'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3"><FaTag className="text-lg" /> Sale</button></li>

                    {/* Shop by Category */}
                    <li className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-500 mb-2 border-b border-gray-200 pb-2">Shop by Category</h3>
                        <div className="relative w-full">
                            <select
                                className="block w-full bg-gray-50 border-b-2 border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-md focus:outline-none focus:border-blue-500 transition cursor-pointer appearance-none text-base"
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
                                <FaChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </li>

                    {/* Account and Utilities */}
                    <li className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-500 mb-2 border-b border-gray-200 pb-2">Account</h3>
                        <ul>
                            {isLoggedIn ? (
                                <>
                                    <li><button onClick={() => { navigate('/account'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3"><FaUserCircle className="text-lg" /> Profile</button></li>
                                    <li><button onClick={() => { navigate('/myorders'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3"><FaClipboardList className="text-lg" /> Orders</button></li>
                                    <li><button onClick={() => { navigate('/wishlist'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3 relative"><FaHeart className="text-lg" /> Wishlist {wishlist?.length > 0 && <span className="ml-1 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">{wishlist.length}</span>}</button></li>
                                    <li><button onClick={() => { logout(); closeMobileMenu(); navigate('/'); }} className="block w-full py-2 text-left text-red-600 font-semibold hover:underline flex items-center gap-3"><FaSignOutAlt className="text-lg" /> Logout</button></li>
                                </>
                            ) : (
                                <>
                                    <li><button onClick={() => { navigate('/login'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3"><FaSignInAlt className="text-lg" /> Sign In</button></li>
                                    <li><button onClick={() => { navigate('/register'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3"><FaUserPlus className="text-lg" /> Register</button></li>
                                </>
                            )}
                            <li><button onClick={() => { navigate('/cart'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3 relative"><FaShoppingCart className="text-lg" /> Cart {cartItems.length > 0 && <span className="ml-1 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">{cartItems.length}</span>}</button></li>
                        </ul>
                    </li>

                    <li className="mt-4 border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-semibold text-gray-500 mb-2">Need Help?</h3>
                        <div className="flex items-center gap-2 text-base text-gray-700">
                            <FaPhoneAlt className="text-base text-gray-600" />
                            <span>Call Us: <strong className="text-gray-900">95396-97664</strong></span>
                        </div>
                    </li>
                </ul>
            </nav>
        </>
    );
}