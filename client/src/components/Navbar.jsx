<div className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center py-4">
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <img
          src="https://avatars.githubusercontent.com/u/68288528?s=200&v=4"
          alt="LoOmi Logo"
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-xl font-bold tracking-tight text-gray-800">LoOmi</span>
      </div>

      {/* Icons (desktop) */}
      <div className="hidden md:flex items-center gap-5 text-gray-700">
        {/* Wishlist */}
        <button onClick={() => navigate('/wishlist')} className="relative">
          <FaHeart className="text-xl hover:text-indigo-600" />
          {wishlist.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </button>

        {/* Cart */}
        <button onClick={() => navigate('/cart')} className="relative">
          <FaShoppingCart className="text-xl hover:text-indigo-600" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:text-indigo-600"
          >
            <FaUser className="text-xl" />
            <FaChevronDown className="text-sm" />
          </button>

          {isDropdownOpen && isLoggedIn && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
              <button onClick={() => navigate('/account')} className="w-full px-4 py-2 hover:bg-gray-100 text-left">Profile</button>
              <button onClick={() => navigate('/myorders')} className="w-full px-4 py-2 hover:bg-gray-100 text-left">Orders</button>
              <button onClick={() => { logout(); navigate('/'); }} className="w-full px-4 py-2 hover:bg-gray-100 text-left text-red-600">Logout</button>
            </div>
          )}

          {!isLoggedIn && isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
              <button onClick={() => navigate('/login')} className="w-full px-4 py-2 hover:bg-gray-100 text-left">Sign In</button>
              <button onClick={() => navigate('/register')} className="w-full px-4 py-2 hover:bg-gray-100 text-left">Register</button>
            </div>
          )}
        </div>
      </div>

      {/* Hamburger (mobile) */}
      <button
        className="md:hidden text-gray-700 text-2xl"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <FaBars />
      </button>
    </div>
  </div>

  {/* Category Selector (Desktop Only) */}
  <div className="hidden md:block border-t border-gray-200 bg-white">
    <div className="max-w-7xl mx-auto px-4 py-2">
      <select
        className="w-full max-w-sm bg-gray-100 rounded-md border-none px-4 py-2 text-gray-800 focus:outline-none"
        value={selectedCategory}
        onChange={handleCategoryChange}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat.name}>{cat.name}</option>
        ))}
      </select>
    </div>
  </div>

  {/* Mobile Drawer */}
  {isMobileMenuOpen && (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={closeMobileMenu}></div>
      <div className="fixed top-0 right-0 w-3/4 max-w-xs h-full bg-white z-50 shadow-lg p-6">
        <button className="text-2xl text-gray-700 mb-6" onClick={closeMobileMenu}>
          <FaTimes />
        </button>

        <ul className="space-y-4">
          <li><button onClick={() => navigate('/')} className="text-gray-800 hover:text-indigo-600">Home</button></li>
          <li><button onClick={() => navigate('/shop')} className="text-gray-800 hover:text-indigo-600">Shop</button></li>
          <li><button onClick={() => navigate('/offersalepage')} className="text-gray-800 hover:text-indigo-600">Sale</button></li>
          <li><hr className="my-2" /></li>

          {isLoggedIn ? (
            <>
              <li><button onClick={() => navigate('/account')} className="text-gray-800 hover:text-indigo-600">My Profile</button></li>
              <li><button onClick={() => navigate('/myorders')} className="text-gray-800 hover:text-indigo-600">Orders</button></li>
              <li><button onClick={() => { logout(); navigate('/'); }} className="text-red-600 hover:underline">Logout</button></li>
            </>
          ) : (
            <>
              <li><button onClick={() => navigate('/login')} className="text-gray-800 hover:text-indigo-600">Login</button></li>
              <li><button onClick={() => navigate('/register')} className="text-gray-800 hover:text-indigo-600">Register</button></li>
            </>
          )}
        </ul>
      </div>
    </>
  )}
</div>
