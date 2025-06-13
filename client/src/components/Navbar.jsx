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
    FaList,
    FaSignInAlt,
    FaUserPlus,
    FaUserCircle,
    FaClipboardList,
    FaSignOutAlt,
    FaFilter // Added for a potential filter/category toggle icon
} from 'react-icons/fa';
import { useCategory } from '../context/CategoryContext';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSecondaryMobileNavOpen, setIsSecondaryMobileNavOpen] = useState(false); // New state for secondary mobile nav
    const [selectedCategory, setSelectedCategory] = useState('');

    const { cartItems } = useCart();
    const { categories } = useCategory();
    const { isLoggedIn, user, logout } = useContext(AuthContext);
    const { wishlist } = useWishlist();

    const navigate = useNavigate();
    const dropdownRef = useRef(); // For desktop user dropdown
    // mobileMenuRef is for the main drawer, secondaryMobileNavRef for the new one
    const secondaryMobileNavRef = useRef();

    const handleCategoryChange = (e) => {
        const categoryName = e.target.value;
        setSelectedCategory(categoryName);
        navigate(categoryName ? `/shop?category=${encodeURIComponent(categoryName)}` : '/shop');

        // Close all mobile menus if a category is selected
        if (isMobileMenuOpen) {
            closeMobileMenu();
        }
        if (isSecondaryMobileNavOpen) {
            closeSecondaryMobileNav();
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

    // Close secondary mobile nav when clicking outside
    useEffect(() => {
        const handleClickOutsideSecondaryNav = (event) => {
            if (secondaryMobileNavRef.current && !secondaryMobileNavRef.current.contains(event.target)) {
                setIsSecondaryMobileNavOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideSecondaryNav);
        return () => document.removeEventListener('mousedown', handleClickOutsideSecondaryNav);
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
    const closeSecondaryMobileNav = () => setIsSecondaryMobileNavOpen(false);

    return (
        <>
            {/* Sticky Top Header */}
            <div className="w-full font-sans sticky top-0 z-50 bg-white shadow-sm">
                <div className="bg-blue-50">
                    <div className="container mx-auto flex items-center justify-between px-3 py-5 lg:px-4 lg:py-6">
                        {/* Logo */}
                        <div
                            onClick={() => navigate('/')}
                            className="flex items-center space-x-1 sm:space-x-2 text-gray-900 hover:opacity-80 cursor-pointer"
                        >
                            <img
                                src="https://avatars.githubusercontent.com/u/68288528?s=200&v=4"
                                alt="LoOmi Logo"
                                className="h-5 sm:h-8 lg:h-9"
                                loading="lazy"
                            />
                            <span className="text-base sm:text-2xl lg:text-3xl font-extrabold tracking-tight select-none">LoOmi</span>
                        </div>

                        {/* Category Dropdown - Hidden on small screens, shown on md and up */}
                        <div className="relative hidden md:inline-block w-full max-w-xs md:max-w-sm lg:max-w-md">
                            <select
                                className="block w-full bg-gray-50 border-b-2 border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-md focus:outline-none focus:border-blue-500 transition cursor-pointer appearance-none"
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

                        {/* Icons & Auth */}
                        <div className="flex items-center gap-3 sm:gap-4 lg:gap-7">
                            {/* Desktop User Dropdown */}
                            {isLoggedIn ? (
                                <div className="relative hidden md:block" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                                        className="flex items-center gap-2 text-gray-800 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                                    >
                                        <FaUser className="text-xl" />
                                        <span className="font-medium text-sm hidden lg:inline-block max-w-[100px] truncate">{user?.name || 'Account'}</span>
                                        <FaChevronDown className="text-sm mt-[2px]" />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            <button
                                                onClick={() => { setIsDropdownOpen(false); navigate('/account'); }}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100"
                                            >
                                                Profile
                                            </button>
                                            <button
                                                onClick={() => { setIsDropdownOpen(false); navigate('/myorders'); }}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100"
                                            >
                                                Orders
                                            </button>
                                            <button
                                                onClick={() => { setIsDropdownOpen(false); logout(); navigate('/'); }}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Sign In/Register buttons */}
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="hidden lg:inline-block text-gray-800 hover:text-indigo-600 font-semibold text-base mr-4"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="hidden lg:inline-block text-gray-800 hover:text-indigo-600 font-semibold text-base"
                                    >
                                        Register
                                    </button>
                                </>
                            )}

                            {/* Wishlist Icon */}
                            <button
                                onClick={() => navigate('/wishlist')}
                                className="relative flex items-center gap-2 text-gray-700 hover:text-indigo-600"
                            >
                                <FaHeart className="text-2xl" />
                                {wishlist?.length > 0 && (
                                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 h-[20px] min-w-[20px] flex items-center justify-center">
                                        {wishlist.length}
                                    </span>
                                )}
                                <span className="hidden sm:inline font-medium text-sm">Wishlist</span>
                            </button>

                            {/* Cart Icon */}
                            <button
                                onClick={() => navigate('/cart')}
                                className="relative flex items-center gap-2 text-gray-700 hover:text-indigo-600"
                            >
                                <FaShoppingCart className="text-2xl" />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 h-[20px] min-w-[20px] flex items-center justify-center">
                                        {cartItems.length}
                                    </span>
                                )}
                                <span className="hidden sm:inline font-medium text-sm">Cart</span>
                            </button>

                            {/* Mobile Secondary Nav Toggle Button */}
                            {/* This button will open the new "Shop Home Sale" bar */}
                            <button
                                className="lg:hidden text-gray-800 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-2"
                                onClick={() => {
                                    setIsSecondaryMobileNavOpen((prev) => !prev);
                                    closeMobileMenu(); // Ensure main menu is closed
                                }}
                                aria-label={isSecondaryMobileNavOpen ? "Hide quick links" : "Show quick links"}
                            >
                                <FaFilter className="text-2xl" /> {/* Using FaFilter or similar for quick links */}
                            </button>

                            {/* Main Mobile Menu Toggle Button (Hamburger / Close Icon) */}
                            <button
                                className="lg:hidden text-gray-800 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-2"
                                onClick={() => {
                                    setIsMobileMenuOpen((prev) => !prev);
                                    closeSecondaryMobileNav(); // Ensure secondary menu is closed
                                }}
                                aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                            >
                                {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Non-sticky Secondary Nav (Desktop Only) */}
            <nav className="bg-gray-50 border-t border-gray-200 hidden lg:block">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 text-gray-800 font-semibold">
                        <li><button onClick={() => navigate('/')} className="hover:text-indigo-600">Home</button></li>
                        <li><button onClick={() => navigate('/shop')} className="hover:text-indigo-600">Shop</button></li>
                        <li><button onClick={() => navigate('/offersalepage')} className="hover:text-indigo-600">Sale</button></li>
                    </ul>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FaPhoneAlt className="text-base text-gray-600" />
                        <span>24/7 Support: <strong className="text-gray-900">74920-43477</strong></span>
                    </div>
                </div>
            </nav>

            {/* New: Secondary Mobile Navigation (Shop, Home, Sale) */}
            {isSecondaryMobileNavOpen && (
                <div
                    ref={secondaryMobileNavRef}
                    className="fixed top-[--navbar-height] left-0 right-0 z-40 bg-white shadow-md lg:hidden"
                    style={{ '--navbar-height': 'calc(var(--tw-h-16) + var(--tw-py-5))' }} /* Adjust based on actual header height */
                >
                    <ul className="flex justify-around items-center py-3 border-b border-gray-200">
                        <li>
                            <button
                                onClick={() => { navigate('/'); closeSecondaryMobileNav(); }}
                                className="flex flex-col items-center text-gray-700 hover:text-indigo-600 text-sm font-medium"
                            >
                                <FaHome className="text-xl mb-1" /> Home
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { navigate('/shop'); closeSecondaryMobileNav(); }}
                                className="flex flex-col items-center text-gray-700 hover:text-indigo-600 text-sm font-medium"
                            >
                                <FaStore className="text-xl mb-1" /> Shop
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { navigate('/offersalepage'); closeSecondaryMobileNav(); }}
                                className="flex flex-col items-center text-gray-700 hover:text-indigo-600 text-sm font-medium"
                            >
                                <FaTag className="text-xl mb-1" /> Sale
                            </button>
                        </li>
                    </ul>
                </div>
            )}


            {/* Main Mobile Menu Drawer */}
            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={closeMobileMenu}
                ></div>
            )}

            {/* Mobile Menu Drawer Content */}
            <nav
                className={`
                    fixed inset-y-0 right-0 z-40 bg-white shadow-lg
                    transform transition-transform ease-in-out duration-300
                    ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                    w-3/4 max-w-xs sm:max-w-sm lg:hidden
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

                {/* Mobile Menu Items - Grouped for clarity */}
                <ul className="flex flex-col gap-6 text-xl font-medium text-gray-800 mt-12 w-full">
                    {/* Main Navigation (These are now the same as the secondary nav for consistency, but kept here for fallback) */}
                    <li>
                        <h3 className="text-lg font-semibold text-gray-500 mb-2 border-b border-gray-200 pb-2">Main Navigation</h3>
                        <ul>
                            <li><button onClick={() => { navigate('/'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3"><FaHome className="text-lg" /> Home</button></li>
                            <li><button onClick={() => { navigate('/shop'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3"><FaStore className="text-lg" /> Shop</button></li>
                            <li><button onClick={() => { navigate('/offersalepage'); closeMobileMenu(); }} className="block w-full py-2 text-left hover:text-indigo-600 transition-colors flex items-center gap-3"><FaTag className="text-lg" /> Sale</button></li>
                        </ul>
                    </li>

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

                    {/* Support Contact */}
                    <li className="mt-4 border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-semibold text-gray-500 mb-2">Need Help?</h3>
                        <div className="flex items-center gap-2 text-base text-gray-700">
                            <FaPhoneAlt className="text-base text-gray-600" />
                            <span>Call Us: <strong className="text-gray-900">95396-97664</strong></span>
                        </div>
                    </li>
                </ul>
            </nav>
            {/* END: Mobile Menu Drawer */}
        </>
    );
}