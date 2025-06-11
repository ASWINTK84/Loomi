import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

const CartPage = () => {
  const {
    cartItems,
    cartTotal,
    loadingCart,
    cartError,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);

  const handleQuantity = (id, quantity, type) => {
    const newQty = type === 'increase' ? quantity + 1 : quantity - 1;
    if (newQty < 1) {
      if (window.confirm('Remove this item?')) removeFromCart(id);
    } else {
      updateCartQuantity(id, newQty);
    }
  };

  if (loadingCart)
    return <div className="text-center py-20 text-gray-500">Loading cart...</div>;

  if (cartError)
    return <div className="text-center py-20 text-red-500">Error: {cartError}</div>;

  if (cartItems.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven’t added anything yet.</p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          Go to Shop
        </Link>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-12">Your Shopping Cart</h1>
      <div className="grid md:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-6">
          {cartItems.map(({ _id, product, quantity, size, color, subTotal }) => {
            const hasOffer = product.offerPrice && product.offerPrice < product.price;

            return (
              <div
                key={_id}
                className="bg-white/90 border border-gray-200 shadow-md rounded-xl p-4 flex flex-col md:flex-row gap-6 backdrop-blur"
              >
                <Link
                  to={`/product/${product._id}`}
                  className="w-full md:w-32 h-32 rounded-lg overflow-hidden"
                >
                  <img
                    src={product.imageUrl || '/images/default-product.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/product/${product._id}`}
                      className="text-lg font-semibold text-gray-800 hover:text-blue-600"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">Size: {size}</p>

                    {color && color !== 'Default Color' && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        Color:
                        <span
                          className="ml-2 w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color.charAt(0).toUpperCase() + color.slice(1)}
                        ></span>
                        <span className="ml-2">
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </span>
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3">
                      {hasOffer ? (
                        <>
                          <span className="text-green-600 font-semibold">
                            {formatPrice(product.offerPrice)}
                          </span>
                          <span className="line-through text-gray-400 text-sm">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            {product.appliedOfferPercentage}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-800 font-semibold">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md">
                      <button onClick={() => handleQuantity(_id, quantity, 'decrease')}>
                        <FaMinus size={12} className="text-gray-600" />
                      </button>
                      <span className="px-2">{quantity}</span>
                      <button onClick={() => handleQuantity(_id, quantity, 'increase')}>
                        <FaPlus size={12} className="text-gray-600" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-700">
                        {formatPrice(subTotal)}
                      </span>
                      <button onClick={() => removeFromCart(_id)}>
                        <FaTrash className="text-red-500 hover:text-red-700 transition" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your entire cart?')) {
                clearCart();
              }
            }}
            className="mt-6 w-full max-w-md flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition"
          >
            <FaTrashAlt />
            Clear Entire Cart
          </button>
        </div>

        {/* Summary */}
        <div className="sticky top-8 h-fit bg-white/90 border border-gray-200 p-6 rounded-xl shadow-md backdrop-blur">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between border-t pt-4 font-bold text-lg text-gray-800">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="mt-6 w-full bg-black text-white py-3 rounded-md hover:bg-gray-900 transition"
          >
            Proceed to Checkout
          </button>
          <Link
            to="/shop"
            className="mt-4 block text-center text-blue-600 hover:underline text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
