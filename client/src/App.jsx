import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import { ToastContainer } from 'react-toastify';  
import 'react-toastify/dist/ReactToastify.css';  

import Footer from './components/Footer'; 
import Home from './pages/Home';
import ShopPage from './pages/ShopPage';
import Navbar from './components/Navbar';
import SingleProductPage from './components/SingleProductPage';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import MyOrdersPage from './pages/MyOrder';
import ContactPage from './pages/ContactPage';
import OfferSalesPage from './components/OfferSalesPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShopPage />} /> 
        <Route path="/product/:productId" element={<SingleProductPage />} />    
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} /> 
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/myorders" element={<MyOrdersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/offersalepage" element={<OfferSalesPage />} />
      </Routes>
      
      <Footer />
      
     
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;
