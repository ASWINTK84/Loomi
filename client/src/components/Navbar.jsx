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

    if (isMobileMenuOpen) {
      closeMobileMenu();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    } else {
      document.body.style.overflow = ''; // Allow scrolling
    }
    return () => {
      document.body.style.overflow = ''; // Clean up on unmount
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Sticky Top Header */}
      <div className="w-full font-sans sticky top-0 z-50 bg-white shadow-sm">
        <div className="bg-blue-50">
          {/* Adjusted padding for smaller screens */}
          <div className="container mx-auto flex items-center justify-between px-3 py-5 lg:px-4 lg:py-6">
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              // Adjusted space-x for closer elements on smaller screens
              className="flex items-center space-x-1 sm:space-x-2 text-gray-900 hover:opacity-80 cursor-pointer"
            >
              <img
                src="https://avatars.githubusercontent.com/u/68288528?s=200&v=4"
                alt="LoOmi Logo"
                className="h-7 sm:h-8 lg:h-9" // Smaller logo on xs, sm screens
                loading="lazy"
              />
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight select-none">LoOmi</span> {/* Smaller text on xs, sm screens */}
            </div>

            {/* Category Dropdown */}
            <div className="relative inline-block w-full max-w-[150px] xs:max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md"> {/* More granular width control */}
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
            {/* Adjusted gap for closer icons on smaller screens */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-7">
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 text-gray-800 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                  >
                    <FaUser className="text-xl" />
                    <span className="hidden sm:block font-medium text-base">{user?.name || 'Account'}</span>
                    <FaChevronDown className="text-sm mt-[2px]" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/account');
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/myorders');
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100"
                      >
                        Orders
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
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

              {/* Mobile Menu Toggle Button (Hamburger / Close Icon) */}
              <button
                className="lg:hidden text-gray-800 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-2"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
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
          <ul className="flex items-center gap-12 text-gray-800 font-semibold">
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

      {/* START: Mobile Menu Drawer (New Design) */}
      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Mobile Menu Drawer Content */}
      <nav className={`
        fixed inset-y-0 right-0 z-40 bg-white shadow-lg
        transform transition-transform ease-in-out duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        w-3/4 max-w-xs sm:max-w-sm lg:hidden
        flex flex-col py-8 px-6 overflow-y-auto
      `}>
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-indigo-600 text-3xl p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={closeMobileMenu}
          aria-label="Close Mobile Menu"
        >
          <FaTimes />
        </button>

        <ul className="flex flex-col gap-6 text-xl font-medium text-gray-800 mt-12 w-full">
          {/* Main Navigation Links */}
          {[
            ['/', 'Home'],
            ['/shop', 'Shop'],
            ['/offersalepage', 'Sale'],
            // Add other main navigation links here if needed
          ].map(([link, label]) => (
            <li key={link}>
              <button
                onClick={() => { navigate(link); closeMobileMenu(); }}
                className="block w-full py-2 text-left hover:text-indigo-600 transition-colors"
              >
                {label}
              </button>
            </li>
          ))}

          {/* Conditional links for logged in/out users */}
          <li className="border-t border-gray-200 mt-4 pt-4"></li>
          {!isLoggedIn ? (
            <>
              <li>
                <button
                  onClick={() => { navigate('/login'); closeMobileMenu(); }}
                  className="block w-full py-2 text-left text-indigo-600 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => { navigate('/register'); closeMobileMenu(); }}
                  className="block w-full py-2 text-left text-indigo-600 font-semibold hover:underline"
                >
                  Register
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button
                  onClick={() => { navigate('/account'); closeMobileMenu(); }}
                  className="block w-full py-2 text-left text-indigo-600 font-semibold hover:underline"
                >
                  Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => { navigate('/myorders'); closeMobileMenu(); }}
                  className="block w-full py-2 text-left text-indigo-600 font-semibold hover:underline"
                >
                  Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                    navigate('/');
                  }}
                  className="block w-full py-2 text-left text-red-600 font-semibold hover:underline"
                >
                  Logout
                </button>
              </li>
            </>
          )}

          {/* Cart & Wishlist for mobile menu */}
          <li className="border-t border-gray-200 mt-4 pt-4"></li>
          <li>
            <button
              onClick={() => { navigate('/cart'); closeMobileMenu(); }}
              className="block w-full py-2 text-left flex items-center gap-2 text-gray-800 hover:text-indigo-600"
            >
              <FaShoppingCart className="text-xl" />
              Cart {cartItems.length > 0 && <span className="ml-1 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">{cartItems.length}</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => { navigate('/wishlist'); closeMobileMenu(); }}
              className="block w-full py-2 text-left flex items-center gap-2 text-gray-800 hover:text-indigo-600"
            >
              <FaHeart className="text-xl" />
              Wishlist {wishlist?.length > 0 && <span className="ml-1 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">{wishlist.length}</span>}
            </button>
          </li>
        </ul>
      </nav>
      {/* END: Mobile Menu Drawer */}
    </>
  );
}