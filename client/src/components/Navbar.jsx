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

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Sticky Top Header */}
      <div className="w-full font-sans sticky top-0 z-50 bg-white shadow-sm">
        <div className="bg-blue-50">
          <div className="container mx-auto flex items-center justify-between px-4 py-5 lg:py-6">
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 text-gray-900 hover:opacity-80 cursor-pointer"
            >
              <img
                src="https://avatars.githubusercontent.com/u/68288528?s=200&v=4"
                alt="LoOmi Logo"
                className="h-9"
                loading="lazy"
              />
              <span className="text-3xl font-extrabold tracking-tight select-none">LoOmi</span>
            </div>

            {/* Category Dropdown */}
            <div className="relative inline-block w-full max-w-xs">
              <select
                className="block w-full bg-gray-50 border-b-2 border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-md focus:outline-none focus:border-blue-500 transition cursor-pointer"
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
            <div className="flex items-center gap-7">
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
                        Profiles
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
                    className="text-gray-800 hover:text-indigo-600 font-semibold text-base mr-4"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="text-gray-800 hover:text-indigo-600 font-semibold text-base"
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

              <button
                className="lg:hidden text-gray-800 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              >
                {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Non-sticky Secondary Nav */}
      <nav className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <ul className="hidden lg:flex items-center gap-12 text-gray-800 font-semibold">
            <li><button onClick={() => navigate('/')} className="hover:text-indigo-600">Home</button></li>
            <li><button onClick={() => navigate('/shop')} className="hover:text-indigo-600">Shop</button></li>
            <li><button onClick={() => navigate('/offersalepage')} className="hover:text-indigo-600">Sale</button></li>
          </ul>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-700">
            <FaPhoneAlt className="text-base text-gray-600" />
            <span>24/7 Support: <strong className="text-gray-900">74920-43477</strong></span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden fixed inset-0 bg-white bg-opacity-95 z-40 flex flex-col items-center py-8">
          <button
            className="absolute top-4 right-4 text-gray-800 hover:text-indigo-600 text-3xl"
            onClick={closeMobileMenu}
          >
            <FaTimes />
          </button>
          <ul className="flex flex-col gap-7 text-2xl font-medium text-gray-800 mt-12 w-full text-center">
            {[
              ['/', 'Home'],
              ['/shop', 'Shop'],
             
              ['/offersalepage', 'Sale'],
             
            ].map(([link, label]) => (
              <li key={link}>
                <button onClick={() => { navigate(link); closeMobileMenu(); }} className="block w-full py-2 hover:text-indigo-600">
                  {label}
                </button>
              </li>
            ))}
            {!isLoggedIn ? (
              <>
                <li><button onClick={() => { navigate('/login'); closeMobileMenu(); }} className="text-indigo-600 font-semibold py-2">Sign In</button></li>
                <li><button onClick={() => { navigate('/register'); closeMobileMenu(); }} className="text-indigo-600 font-semibold py-2">Register</button></li>
              </>
            ) : (
              <>
                <li><button onClick={() => { navigate('/account'); closeMobileMenu(); }} className="text-indigo-600 font-semibold py-2">Profile</button></li>
                <li><button onClick={() => { navigate('/myorders'); closeMobileMenu(); }} className="text-indigo-600 font-semibold py-2">Orders</button></li>
              </>
            )}
          </ul>
        </nav>
      )}
    </>
  );
}
