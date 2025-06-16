
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';


const PaymentCompletePage = () => {
    const { state } = useLocation(); 
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { token } = useContext(AuthContext); 

    const orderId = state?.orderId;
    const paymentMethod = state?.paymentMethod;
    const totalAmount = state?.totalAmount; 

    useEffect(() => {
        
        if (!orderId) {
            navigate('/');
            return;
        }

        if (paymentMethod === 'Online Payment') {
            const confirmOnlinePayment = async () => {
                try {
                  
                   
                    const response = await axios.post(`https://loomibackend.onrender.com/api/v1/order/confirm-payment/${orderId}`, {
                        paymentStatus: 'Paid',
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.data.success) {
                        console.log(`Order ${orderId} status updated to Paid.`);
                       
                    } else {
                        console.error('Failed to confirm online payment on backend:', response.data.message);
                        
                        toast.error('There was an issue confirming your payment. Please contact support.')
                    }
                } catch (error) {
                    console.error('Error confirming online payment:', error);
                    
                    toast.error('An error occurred while confirming your payment. Please contact support.')
                }
            };
            confirmOnlinePayment();
        }

      
        clearCart();

    }, [orderId, paymentMethod, navigate, clearCart, token]); 


    if (!orderId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg text-gray-700">Invalid access. Redirecting...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
                <svg
                    className="mx-auto h-16 w-16 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <h1 className="mt-4 text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
                {paymentMethod === 'Cash on Delivery' && (
                    <p className="mt-2 text-lg text-gray-600">
                        Thank you for your order. Your payment of {' '}
                        <span className="font-semibold">₹{totalAmount?.toFixed(2) || subtotalAmount.toFixed(2) + deliveryCharge.toFixed(2)}</span>
                        {' '} will be collected at the time of delivery.
                    </p>
                )}
                {paymentMethod === 'Online Payment' && (
                    <p className="mt-2 text-lg text-gray-600">
                        Your online payment for {' '}
                        <span className="font-semibold">₹{totalAmount?.toFixed(2)}</span>
                        {' '} has been successfully processed.
                    </p>
                )}
                <p className="mt-4 text-sm text-gray-500">
                    Your order ID is: <span className="font-mono text-gray-700">{orderId}</span>
                </p>
                <p className="mt-6 text-sm text-gray-500">
                    You will receive an email confirmation shortly.
                </p>
                <div className="mt-8">
                    <button
                        onClick={() => navigate('/my-orders')}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4"
                    >
                        View My Orders
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCompletePage;