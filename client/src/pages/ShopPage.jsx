import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/homepage/needs/ProductCard';
import { useCategory } from '../context/CategoryContext';
import { FaThLarge, FaList, FaFilter, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const ShopPage = () => {
    const { categories: apiCategories } = useCategory();
    const [allProducts, setAllProducts] = useState([]);
    const [loadingInitial, setLoadingInitial] = useState(false);
    const [errorInitial, setErrorInitial] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Filter states
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
    const [sortOption, setSortOption] = useState('latest');
    const [gridView, setGridView] = useState(true);

    // Mobile filter state
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const PRODUCTS_PER_PAGE = 9;

    // Filtered & paginated products to display
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [errorFilters, setErrorFilters] = useState(null);

    // States for dynamically available filter options
    const [availableSizes, setAvailableSizes] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);

    // Effect to fetch all products initially
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingInitial(true);
            setErrorInitial(null);
            try {
                const response = await axios.get('https://loomibackend.onrender.com/api/v1/product/get-product');
                setAllProducts(response.data.products);
            } catch (err) {
                setErrorInitial('Failed to fetch products');
            } finally {
                setLoadingInitial(false);
            }
        };
        fetchProducts();
    }, []);

    // Effect to extract unique sizes and colors from fetched products
    useEffect(() => {
        if (allProducts.length > 0) {
            const sizes = new Set();
            const colors = new Set();
            allProducts.forEach(p => {
                if (p.sizes && Array.isArray(p.sizes)) {
                    p.sizes.forEach(size => sizes.add(size.toUpperCase()));
                }
                if (p.colors && Array.isArray(p.colors)) {
                    p.colors.forEach(color => colors.add(color));
                }
            });
            setAvailableSizes(Array.from(sizes).sort());
            setAvailableColors(Array.from(colors).sort());
        }
    }, [allProducts]);

    // Effect to read URL parameter and set initial category filter ONLY ONCE
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryFromUrl = params.get('category');
        if (categoryFromUrl && apiCategories.length > 0) {
            const matchedCategory = apiCategories.find(cat => cat.name === categoryFromUrl);
            if (matchedCategory) {
                setSelectedCategories(prev => {
                    if (!prev.includes(matchedCategory.name)) {
                        return [matchedCategory.name];
                    }
                    return prev;
                });
            }
        }
    }, [location.search, apiCategories]);

    // Helper to get category count for filters
    const filterCategories = apiCategories.map(cat => ({
        ...cat,
        count: allProducts.filter(p => {
            const categoryId = typeof p.category === 'object' ? p.category._id : p.category;
            const matchingApiCategory = apiCategories.find(apiCat => apiCat._id === categoryId);
            return matchingApiCategory && matchingApiCategory.name === cat.name;
        }).length
    }));

    // Function to apply all filters and sorting - memoized with useCallback
    const applyFilters = useCallback(() => {
        setLoadingFilters(true);
        setErrorFilters(null);
        let filtered = [...allProducts];

        if (selectedCategories.length > 0) {
            const selectedCategoryIds = apiCategories
                .filter(cat => selectedCategories.includes(cat.name))
                .map(cat => cat._id);

            filtered = filtered.filter(p => {
                const categoryId = typeof p.category === 'object' ? p.category._id : p.category;
                return selectedCategoryIds.includes(categoryId);
            });
        }

        if (selectedSizes.length > 0) {
            filtered = filtered.filter(p => p.sizes && p.sizes.some(size => selectedSizes.includes(size.toUpperCase())));
        }

        if (selectedColors.length > 0) {
            filtered = filtered.filter(p => p.colors && p.colors.some(color => selectedColors.includes(color)));
        }

        filtered = filtered.filter(p => {
            const price = Number(p.price);
            return !isNaN(price) && price >= priceRange.min && price <= priceRange.max;
        });

        if (sortOption === 'price-low-high') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-high-low') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'latest') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setDisplayedProducts(filtered);
        setLoadingFilters(false);
        setCurrentPage(1); // Reset to first page when filters change
    }, [allProducts, selectedCategories, selectedSizes, selectedColors, priceRange, sortOption, apiCategories]);

    // Effect to re-apply filters whenever filter dependencies change
    useEffect(() => {
        if (allProducts.length > 0) {
            applyFilters();
        }
    }, [allProducts, selectedCategories, selectedSizes, selectedColors, priceRange, sortOption, applyFilters]);

    // Pagination helpers
    const totalPages = Math.ceil(displayedProducts.length / PRODUCTS_PER_PAGE);

    // Get products for current page
    const paginatedProducts = displayedProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    // Change page handler
    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryCheckboxChange = (catName) => {
        setSelectedCategories(prev => {
            const newCategories = prev.includes(catName)
                ? prev.filter(c => c !== catName)
                : [...prev, catName];

            const params = new URLSearchParams(location.search);
            if (newCategories.length === 1) {
                params.set('category', newCategories[0]);
            } else if (newCategories.length === 0) {
                params.delete('category');
            } else {
                // If multiple categories are selected, remove the single category param
                params.delete('category');
            }
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });

            return newCategories;
        });
    };

    const handleSizeChange = (size) => {
        setSelectedSizes(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };

    const handleColorChange = (color) => {
        setSelectedColors(prev =>
            prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
        );
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setPriceRange(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleClearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedSizes([]);
        setSelectedColors([]);
        setPriceRange({ min: 0, max: 100000 });
        setSortOption('latest');
        setCurrentPage(1);
        navigate('/shop', { replace: true });
        setShowMobileFilters(false); // Close filters on clear
    };

    // Helper to determine text color for contrast on colored buttons
    const isLightColor = (color) => {
        if (!color || typeof color !== 'string') return true; // Default to light if color is invalid

        const namedColors = {
            black: '#000000', white: '#FFFFFF', red: '#FF0000', green: '#008000', blue: '#0000FF',
            yellow: '#FFFF00', cyan: '#00FFFF', magenta: '#FF00FF', gray: '#808080',
            maroon: '#800000', olive: '#808000', purple: '#800080', teal: '#008080',
            navy: '#000080', silver: '#C0C0C0', gold: '#FFD700', orange: '#FFA500',
            pink: '#FFC0CB', brown: '#A52A2A', violet: '#EE82EE', indigo: '#4B0082',
            // Add more named colors if needed
        };

        let hexColor = color.startsWith('#') ? color : namedColors[color.toLowerCase()];

        // Attempt to convert CSS named colors to hex if not already defined
        if (!hexColor) {
            try {
                const testDiv = document.createElement('div');
                testDiv.style.color = color;
                document.body.appendChild(testDiv);
                const computedColor = window.getComputedStyle(testDiv).color;
                document.body.removeChild(testDiv);

                const rgbMatch = computedColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                if (rgbMatch) {
                    hexColor = '#' +
                        ('0' + parseInt(rgbMatch[1], 10).toString(16)).slice(-2) +
                        ('0' + parseInt(rgbMatch[2], 10).toString(16)).slice(-2) +
                        ('0' + parseInt(rgbMatch[3], 10).toString(16)).slice(-2);
                } else {
                    return true; // Fallback to true if cannot determine color
                }
            } catch (e) {
                console.error("Error converting color name to hex:", e);
                return true; // Fallback in case of DOM manipulation errors
            }
        }

        // Convert hex to RGB and calculate YIQ
        let r, g, b;
        if (hexColor.length === 4) { // #RGB shortand
            r = parseInt(hexColor[1] + hexColor[1], 16);
            g = parseInt(hexColor[2] + hexColor[2], 16);
            b = parseInt(hexColor[3] + hexColor[3], 16);
        } else if (hexColor.length === 7) { // #RRGGBB
            r = parseInt(hexColor.substring(1, 3), 16);
            g = parseInt(hexColor.substring(3, 5), 16);
            b = parseInt(hexColor.substring(5, 7), 16);
        } else {
            return true; // Fallback for invalid hex format
        }

        // YIQ value (luminance) calculation for determining text color
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 170); // Return true for light color (suggests dark text), false for dark color (suggests light text)
    };


    const FilterSidebar = () => (
        // Key change here:
        // lg:relative: On large screens, the sidebar becomes relative, flowing with the document.
        // lg:translate-x-0: Ensures it's always visible on large screens.
        // hidden: Initially hidden on small screens.
        // lg:block: Always visible on large screens.
        // fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out: These apply ONLY when showMobileFilters is true (for mobile overlay).
        // ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}: This dynamic class applies only on smaller screens, sliding the sidebar in/out.
        <div className={`
            bg-white z-50 overflow-y-auto
            lg:block lg:relative lg:w-1/4 lg:p-6 lg:rounded-lg lg:shadow-md
            ${showMobileFilters
                ? 'fixed inset-y-0 left-0 w-64 transform translate-x-0 transition-transform duration-300 ease-in-out pt-6'
                : 'hidden lg:translate-x-0' // On smaller screens, it's hidden unless `showMobileFilters` is true. On large screens, it's always block and not translated.
            }
        `}>
            {/* Close button for mobile filters */}
            <div className="lg:hidden flex justify-end p-4">
                <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-600 hover:text-gray-800 focus:outline-none"
                    aria-label="Close filters"
                >
                    <FaTimes size={24} />
                </button>
            </div>

            <div className="p-6 lg:p-0"> {/* Add padding for mobile view content, reset for large */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Filters:</h3>
                    <button onClick={handleClearAllFilters} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Clear All</button>
                </div>

                <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 cursor-pointer flex justify-between items-center">
                        Category <span className="text-gray-400">^</span>
                    </h4>
                    {filterCategories.map(cat => (
                        <label key={cat._id} className="flex items-center mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat.name)}
                                onChange={() => handleCategoryCheckboxChange(cat.name)}
                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                            />
                            <span className="ml-2 text-gray-700">{cat.name} ({cat.count})</span>
                        </label>
                    ))}
                </div>

                {/* Dynamically rendered Size filter */}
                {availableSizes.length > 0 && (
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 cursor-pointer flex justify-between items-center">
                            Size <span className="text-gray-400">^</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {availableSizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => handleSizeChange(size)}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                                        selectedSizes.includes(size) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dynamically rendered Color filter */}
                {availableColors.length > 0 && (
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 cursor-pointer flex justify-between items-center">
                            Colors <span className="text-gray-400">^</span>
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {availableColors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => handleColorChange(color)}
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                                        selectedColors.includes(color) ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    aria-label={`Color ${color}`}
                                >
                                    {selectedColors.includes(color) && ( // Add a checkmark for selected colors
                                        <span className={`text-sm ${isLightColor(color) ? 'text-gray-800' : 'text-white'}`}>✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 cursor-pointer flex justify-between items-center">
                        Price <span className="text-gray-400">^</span>
                    </h4>
                    <div className="flex justify-between items-center mb-4">
                        <input
                            type="number"
                            name="min"
                            value={priceRange.min}
                            onChange={handlePriceChange}
                            placeholder="Min price"
                            className="w-1/2 p-2 border border-gray-300 rounded-md text-center mr-2"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="number"
                            name="max"
                            value={priceRange.max}
                            onChange={handlePriceChange}
                            placeholder="Max price"
                            className="w-1/2 p-2 border border-gray-300 rounded-md text-center ml-2"
                        />
                    </div>
                    <div className="text-sm text-gray-600 text-center">
                        ₹{priceRange.min || 0} - ₹{priceRange.max || 0}
                    </div>
                </div>
            </div>
        </div>
    );

    const Pagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (currentPage <= 3) {
            endPage = Math.min(5, totalPages);
        }
        if (currentPage >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-center mt-8 space-x-2">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 bg-white disabled:opacity-50"
                >
                    Prev
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => goToPage(1)}
                            className={`px-3 py-1 rounded border border-gray-300 bg-white`}
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="px-2 py-1">...</span>}
                    </>
                )}

                {pageNumbers.map(num => (
                    <button
                        key={num}
                        onClick={() => goToPage(num)}
                        className={`px-3 py-1 rounded border ${
                            num === currentPage
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white border-gray-300'
                        }`}
                    >
                        {num}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="px-2 py-1">...</span>}
                        <button
                            onClick={() => goToPage(totalPages)}
                            className={`px-3 py-1 rounded border border-gray-300 bg-white`}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-300 bg-white disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <>
            <section className="bg-white py-6 md:py-8 border-b border-gray-200">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">Explore All Products</h1>
                    <nav className="text-gray-600 text-sm">
                        <a href="/" className="hover:text-blue-600 transition-colors">Home</a> / <a href="/shop" className="hover:text-blue-600 transition-colors">Shop</a> / <span className="text-blue-600">Shop With Sidebar</span>
                    </nav>
                </div>
            </section>

            <section className="py-8 md:py-12 bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8 relative">
                    {/* Filter Sidebar - Now responsive */}
                    <FilterSidebar />

                    {/* Overlay for mobile filters */}
                    {showMobileFilters && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                            onClick={() => setShowMobileFilters(false)} // Close filters when clicking outside
                        ></div>
                    )}

                    <div className="w-full lg:w-3/4">
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            {/* Filter button for mobile */}
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden p-2 rounded-md bg-blue-600 text-white flex items-center gap-2 w-full justify-center sm:w-auto"
                                aria-label="Open filters"
                            >
                                <FaFilter />
                                <span>Filters</span>
                            </button>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                                <span className="text-gray-600 hidden sm:block">Sort by:</span>
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 flex-grow sm:flex-grow-0"
                                >
                                    <option value="latest">Latest</option>
                                    <option value="price-low-high">Price: Low to High</option>
                                    <option value="price-high-low">Price: High to Low</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                                <span className="text-gray-600 text-sm hidden md:block">
                                    Showing {paginatedProducts.length} of {displayedProducts.length} products
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setGridView(true)}
                                        className={`p-2 rounded-md ${gridView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                        aria-label="Grid View"
                                    >
                                        <FaThLarge />
                                    </button>
                                    <button
                                        onClick={() => setGridView(false)}
                                        className={`p-2 rounded-md ${!gridView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                        aria-label="List View"
                                    >
                                        <FaList />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loadingInitial || loadingFilters ? (
                            <div className="text-center text-gray-600 py-10">
                                <div className="mt-4 animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-2">Loading products...</p>
                            </div>
                        ) : errorInitial || errorFilters ? (
                            <div className="text-center text-red-500 py-10">{errorInitial || errorFilters}</div>
                        ) : displayedProducts.length === 0 ? (
                            <div className="text-center text-gray-600 py-10">No products found matching your filters.</div>
                        ) : (
                            <>
                                <div className={`${gridView ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6' : 'flex flex-col gap-4'}`}>
                                    {paginatedProducts.map(product => (
                                        <ProductCard key={product._id} product={product} isListView={!gridView} />
                                    ))}
                                </div>

                                <Pagination />
                            </>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ShopPage;