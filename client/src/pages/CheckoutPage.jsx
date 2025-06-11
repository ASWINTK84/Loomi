import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const API_BASE_URL = 'https://loomibackend.onrender.com';

const CheckoutPage = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const [currentStep, setCurrentStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const navigate = useNavigate();

    // console.log(cartItems); // You can keep this for debugging if needed


    const [address, setAddress] = useState({
        name: '',
        phone: '',
        altPhone: '',
        addressLine: '',
        landmark: '',
        city: '',
        pincode: '',
    });

    const [locationDetails, setLocationDetails] = useState(null);
    const [pincodeError, setPincodeError] = useState('');
    const [loadingPincode, setLoadingPincode] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(false);

    useEffect(() => {
        // Only load Razorpay SDK if needed for payment steps
        if (currentStep === 2 || currentStep === 3) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => {
                console.log('Razorpay SDK loaded');
            };
            document.body.appendChild(script);

            return () => {
                // Clean up script on unmount
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
            };
        }
    }, [currentStep]);


    const formatPrice = (amount) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);

    const handlePincodeChange = async (e) => {
        const newPincode = e.target.value;
        setAddress(prevAddress => ({ ...prevAddress, pincode: newPincode }));
        setLocationDetails(null); // Clear previous location details
        setPincodeError(''); // Clear previous error

        if (newPincode.length === 6) {
            setLoadingPincode(true);
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${newPincode}`);
                const data = await response.json();

                if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice.length > 0) {
                    const postOffice = data[0].PostOffice[0];
                    setLocationDetails({
                        area: postOffice.Name,
                        district: postOffice.District,
                        state: postOffice.State,
                    });
                    setAddress(prevAddress => ({
                        ...prevAddress,
                        city: postOffice.District, // Auto-fill city from pincode
                    }));
                } else {
                    setPincodeError('Invalid Pincode or no details found. Please double-check.');
                    setAddress(prevAddress => ({ ...prevAddress, city: '' })); // Clear city if pincode fails
                }
            } catch (error) {
                console.error('Error fetching pincode details:', error);
                setPincodeError('Could not fetch pincode details. Please try again.');
                setAddress(prevAddress => ({ ...prevAddress, city: '' })); // Clear city if API call fails
            } finally {
                setLoadingPincode(false);
            }
        } else if (newPincode.length > 0 && newPincode.length < 6) {
            setPincodeError('Pincode must be 6 digits long.');
            setAddress(prevAddress => ({ ...prevAddress, city: '' })); // Clear city if pincode is incomplete/invalid length
        } else if (newPincode.length === 0) {
            setAddress(prevAddress => ({ ...prevAddress, city: '' })); // Clear city if pincode is cleared
        }
    };

    useEffect(() => {
        // If pincode becomes empty, clear location details and city
        if (address.pincode === '') {
            setLocationDetails(null);
            setPincodeError('');
            setAddress(prevAddress => ({ ...prevAddress, city: '' }));
        }
    }, [address.pincode]);

    const validateAddressStep = () => {
        if (!address.name || !address.phone || !address.addressLine || !address.pincode) {
            toast.error('Please fill in all primary required address details (Name, Phone, Full Address, Pincode).')
            return false;
        }

        if (address.pincode.length === 6) {
            if (pincodeError && !address.city) {
                toast.error('The provided pincode is invalid. Please enter a valid pincode or manually enter your City.')
                return false;
            }
            if (!locationDetails && !pincodeError && !address.city) {
                toast.error('Please provide a valid 6-digit pincode or manually enter your City.')
                return false;
            }
        } else if (address.pincode.length > 0 && address.pincode.length < 6) {
            toast.error('Pincode must be 6 digits long.')
            return false;
        } else if (!address.city) {
            toast.error('Please enter your City.')
            return false;
        }

        return true;
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (validateAddressStep()) {
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            setCurrentStep(3);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prevStep => prevStep - 1);
    };

    // Helper function to call your backend's placeOrder endpoint
    const saveOrderToBackend = async (paymentStatus, paymentInfo = {}) => {
        try {
            const orderDetails = {
                // Remove userId here; backend will get user from token
                items: cartItems.map(item => ({
                    product: {
                        _id: item.product._id,
                        name: item.product.name,
                        image: item.product.imageUrl, // Ensure you use imageUrl here
                        price: item.product.price,
                    },
                    quantity: item.quantity,
                    size: item.size,    // Add size
                    color: item.color,  // Add color
                })),
                totalAmount: cartTotal,
                offerPrice: cartTotal,
                shippingAddress: {
                    name: address.name,
                    phone: address.phone,
                    address: `${address.addressLine}${address.landmark ? ', ' + address.landmark : ''}`,
                    city: locationDetails?.district || address.city,
                    state: locationDetails?.state || '',
                    pincode: address.pincode,
                },
                paymentMethod: paymentStatus,
                paymentInfo: paymentInfo,
            };

            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}/api/orders/place`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderDetails),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(`Order placed successfully! ${paymentStatus === 'ONLINE' ? 'Payment processed.' : 'Cash on Delivery selected.'}`);
                clearCart();
                navigate('/myorders', { state: { orderId: data.order._id, isPaid: data.order.isPaid } });
            } else {
                toast.error(`Failed to place order: ${data.message || data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving order to backend:', error);
            toast.error('An error occurred while saving your order. Please try again.')
        } finally {
            setLoadingOrder(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty. Please add items before placing an order.')
            return;
        }

        setLoadingOrder(true);

        if (paymentMethod === 'cod') {
            await saveOrderToBackend("COD"); // Call with "COD" as payment status
        } else if (paymentMethod === 'online') {
            try {
                // Step 1: Create Razorpay Order on your backend
                const razorpayOrderResponse = await fetch(`${API_BASE_URL}/api/orders/razorpay-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: cartTotal, // Send total amount to your backend
                    }),
                });

                const razorpayOrderData = await razorpayOrderResponse.json();

                if (!razorpayOrderResponse.ok || !razorpayOrderData.success) {
                    throw new Error(razorpayOrderData.error || 'Failed to create Razorpay order on backend.');
                }

                const { order: razorpayOrder } = razorpayOrderData;

                // Step 2: Open Razorpay Checkout popup
                const options = {
                    key: "rzp_test_SM2gVwvabL5PdV", // Replace with your actual Razorpay Key ID
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: 'E-commerce Store',
                    description: 'Order Payment',
                    order_id: razorpayOrder.id,
                    handler: async function (response) {
                        // This callback is triggered when payment is successful
                        await saveOrderToBackend("ONLINE", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                    },
                    prefill: {
                        name: address.name,
                        email: 'customer@example.com', // You might want to get actual user email
                        contact: address.phone,
                    },
                    notes: {
                        addressLine: address.addressLine,
                        landmark: address.landmark,
                        city: locationDetails?.district || address.city,
                        pincode: address.pincode,
                        area: locationDetails?.area,
                        state: locationDetails?.state,
                    },
                    theme: {
                        color: '#4F46E5',
                    },
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.open();

                rzp1.on('payment.failed', function (response) {
                    toast.error('Payment failed: ' + response.error.description + '. Please try again.')
                    console.error('Razorpay Payment Failed:', response.error);
                    setLoadingOrder(false); // Stop loading if payment fails
                });

            } catch (error) {
                console.error('Error during online payment process:', error);
                toast.error(`An error occurred during online payment: ${error.message}`)
                setLoadingOrder(false); // Stop loading if API call fails
            }
        }
    };

    const isNextStep1Disabled = currentStep === 1 && (pincodeError || !address.name || !address.phone || !address.addressLine || !address.pincode || (!locationDetails && !address.city));
    const isPlaceOrderDisabled = cartItems.length === 0 || !address.name || !address.phone || !address.addressLine || !address.pincode || (!locationDetails && !address.city) || (pincodeError && !address.city) || loadingOrder;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden lg:grid lg:grid-cols-3 transform transition-all duration-300 ease-in-out">

                {/* Left Section: Steps & Content */}
                <div className="lg:col-span-2 p-8 md:p-12 border-r border-gray-100">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">Your Order Checkout</h1>

                    {/* Progress Indicator */}
                    <div className="flex justify-between items-center mb-10 relative">
                        <div className="absolute left-0 right-0 h-1.5 bg-gray-200 z-0 mx-4 rounded-full"></div>
                        <div
                            className={`absolute left-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 z-10 transition-all duration-500 ease-in-out rounded-full`}
                            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        ></div>

                        {[1, 2, 3].map((stepNum) => (
                            <div key={stepNum} className="relative z-20 flex flex-col items-center">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all duration-300 ease-in-out transform
                                        ${currentStep >= stepNum ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-300'}
                                        ${currentStep === stepNum ? 'scale-110 ring-4 ring-indigo-200' : ''}
                                    `}
                                >
                                    {stepNum}
                                </div>
                                <p className={`mt-3 text-sm font-semibold ${currentStep >= stepNum ? 'text-indigo-700' : 'text-gray-500'}`}>
                                    {stepNum === 1 && "Delivery Address"}
                                    {stepNum === 2 && "Payment Method"}
                                    {stepNum === 3 && "Order Review"}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="mt-12 animate-fade-in">
                        {/* Step 1: Delivery Address */}
                        {currentStep === 1 && (
                            <div className="space-y-7">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Where should we deliver?</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <input
                                        className="input-field p-3 border border-gray-300 rounded-md "
                                        placeholder="Full Name (Required)"
                                        value={address.name}
                                        onChange={(e) => setAddress({ ...address, name: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="input-field p-3 border border-gray-300 rounded-md "
                                        placeholder="Phone Number (Required)"
                                        value={address.phone}
                                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                        maxLength="10"
                                        required
                                    />
                                    <input
                                        className="input-field p-3 border border-gray-300 rounded-md "
                                        placeholder="Alternate Phone (Optional)"
                                        value={address.altPhone}
                                        onChange={(e) => setAddress({ ...address, altPhone: e.target.value })}
                                        maxLength="10"
                                    />
                                    <input
                                        className="input-field p-3 border border-gray-300 rounded-md "
                                        placeholder="Landmark (e.g., Near City Hospital)"
                                        value={address.landmark}
                                        onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                    />
                                    <input
                                        className="input-field col-span-full p-4 border border-gray-300 rounded-md "
                                        placeholder="Full Address (House No., Building Name, Street, Locality - Required)"
                                        value={address.addressLine}
                                        onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                                        required
                                    />
                                    <div className="relative">
                                        <input
                                            className="input-field pr-10 p-3 border border-gray-300 rounded-md "
                                            placeholder="Pincode (Required)"
                                            value={address.pincode}
                                            onChange={handlePincodeChange}
                                            maxLength="6"
                                            required
                                        />
                                        {loadingPincode && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        className={`input-field ${!!locationDetails && !pincodeError ? 'bg-gray-100 text-gray-700 cursor-not-allowed ' : ''} border border-gray-300 rounded-md p-3`}
                                        placeholder="City (Auto-filled or Manual)"
                                        value={locationDetails?.district || address.city || ''}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        readOnly={!!locationDetails && !pincodeError}
                                        required={!locationDetails}
                                    />
                                </div>
                                {locationDetails && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 font-medium flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <p>
                                            <strong className="text-gray-800">Area:</strong> {locationDetails.area},
                                            <strong className="text-gray-800 ml-2">District:</strong> {locationDetails.district},
                                            <strong className="text-gray-800 ml-2">State:</strong> {locationDetails.state}
                                        </p>
                                    </div>
                                )}
                                {pincodeError && (
                                    <p className="mt-4 text-red-600 text-sm font-medium flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        {pincodeError}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {currentStep === 2 && (
                            <div className="space-y-7">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">How would you like to pay?</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''} border border-gray-300 rounded-lg p-5 flex items-center cursor-pointer transition-all duration-200 ease-in-out hover:border-indigo-500 hover:shadow-md`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                            className="hidden"
                                        />
                                        <div className="flex items-center gap-4">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'}`}>
                                                {paymentMethod === 'cod' && <span className="block w-3 h-3 rounded-full bg-white"></span>}
                                            </span>
                                            <span className="text-lg font-semibold text-gray-800">
                                                <svg className="w-7 h-7 inline-block mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-1.25-3M15 10V5.75L12 4 9 5.75V10m6 0h2c2 0 2 2 0 2H7c-2 0-2-2 0-2h2m6 0c0 2-2 2-2 0H9c0 2-2 2-2 0"></path></svg>
                                                Cash on Delivery
                                            </span>
                                        </div>
                                    </label>
                                    <label className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''} border border-gray-300 rounded-lg p-5 flex items-center cursor-pointer transition-all duration-200 ease-in-out hover:border-indigo-500 hover:shadow-md`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="online"
                                            checked={paymentMethod === 'online'}
                                            onChange={() => setPaymentMethod('online')}
                                            className="hidden"
                                        />
                                        <div className="flex items-center gap-4">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${paymentMethod === 'online' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'}`}>
                                                {paymentMethod === 'online' && <span className="block w-3 h-3 rounded-full bg-white"></span>}
                                            </span>
                                            <span className="text-lg font-semibold text-gray-800">
                                                <svg className="w-7 h-7 inline-block mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 8V4a2 2 0 00-2-2H8a2 2 0 00-2 2v4"></path></svg>
                                                Pay Online (Cards, UPI, Netbanking)
                                            </span>
                                        </div>
                                    </label>
                                </div>
                                {paymentMethod === 'online' && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm font-medium flex items-center gap-2 mt-4">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        You've selected online payment. You will be redirected to Razorpay securely.
                                    </div>
                                )}
                                {paymentMethod === 'cod' && (
                                    <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm font-medium flex items-center gap-2 mt-4">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        You've selected Cash on Delivery. Pay at your doorstep!
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Order Review */}
                        {currentStep === 3 && (
                            <div className="space-y-7">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Final Check of Your Order</h2>

                                {/* Address Details for Review */}
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
                                    <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        Delivery To
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        <strong className="font-medium">Name:</strong> {address.name}<br />
                                        <strong className="font-medium">Phone:</strong> {address.phone}<br />
                                        <strong className="font-medium">Address:</strong> {address.addressLine}, {address.landmark ? `${address.landmark}, ` : ''}
                                        {locationDetails?.area || ''}, {locationDetails?.district || address.city}, {locationDetails?.state || ''} - {address.pincode}
                                    </p>
                                    <p className="text-gray-700 mt-3"><strong className="font-medium">Payment Method:</strong> <span className="font-semibold text-indigo-700">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}</span></p>
                                </div>

                                {/* Cart Items for Review */}
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                    Items in Your Cart
                                </h3>
                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                    {cartItems.length === 0 ? (
                                        <p className="text-gray-600 text-center py-4">Your cart is empty.</p>
                                    ) : (
                                        cartItems.map((item) => (
                                            // Updated key to include size and color for uniqueness
                                            <div key={`${item.product._id}-${item.size || ''}-${item.color || ''}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 object-cover rounded-md border border-gray-200 shadow-sm" />
                                                    <div>
                                                        <p className="font-semibold text-lg text-gray-800">{item.product.name}</p>
                                                        <p className="text-md text-gray-500">Qty: {item.quantity}</p>
                                                        {/* Display Size and Color if available */}
                                                        {(item.size || item.color) && (
                                                            <p className="text-sm text-gray-500">
                                                                {item.size && `Size: ${item.size}`}
                                                                {item.size && item.color && ', '} {/* Add comma only if both exist */}
                                                                {item.color && `Color: ${item.color}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="font-bold text-lg text-gray-900">{formatPrice(item.quantity * item.product.price)}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-12 flex justify-between">
                            {currentStep > 1 && (
                                <button
                                    onClick={handlePrevStep}
                                    className="flex items-center px-6 py-3 rounded-full text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors duration-200 text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                    Previous
                                </button>
                            )}
                            {currentStep < 3 && (
                                <button
                                    onClick={handleNextStep}
                                    className="flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-lg font-medium shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                                    disabled={isNextStep1Disabled}
                                >
                                    Next Step
                                    <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            )}
                            {currentStep === 3 && (
                                <button
                                    onClick={handlePlaceOrder}
                                    className="flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-teal-600 text-white text-lg font-bold shadow-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                                    disabled={isPlaceOrderDisabled}
                                >
                                    {loadingOrder ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    )}
                                    {loadingOrder ? 'Placing Order...' : 'Place Order'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Section: Order Summary (Sticky) */}
                <div className="lg:col-span-1 p-8 md:p-10 bg-gradient-to-b from-indigo-500 to-blue-600 text-white flex flex-col justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold mb-8 border-b border-indigo-400 pb-4 text-center">Order Summary</h2>
                        <div className="space-y-6">
                            {cartItems.length === 0 ? (
                                <p className="text-indigo-100 text-center py-8">Your cart is empty. Add items to see summary.</p>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={`${item.product._id}-summary-${item.size || ''}-${item.color || ''}`} className="flex items-center justify-between border-b border-indigo-400 pb-3">
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg">{item.product.name}</p>
                                            <p className="text-indigo-200 text-sm">Qty: {item.quantity}</p>
                                            {/* Display Size and Color if available in summary */}
                                            {(item.size || item.color) && (
                                                <p className="text-indigo-200 text-xs">
                                                    {item.size && `Size: ${item.size}`}
                                                    {item.size && item.color && ', '}
                                                    {item.color && `Color: ${item.color}`}
                                                </p>
                                            )}
                                        </div>
                                        <p className="font-bold text-lg">{formatPrice(item.quantity * item.product.price)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t-2 border-indigo-400">
                        <div className="flex justify-between items-center text-2xl font-bold mb-4">
                            <span>Total:</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                        <p className="text-indigo-200 text-sm text-center">Shipping calculated at the next stage.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;