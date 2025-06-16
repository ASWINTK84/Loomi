import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaCcVisa, FaCcMastercard, FaCcAmex, FaPaypal } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] text-gray-400 py-8 text-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">

          
          <div>
            <h3 className="text-white text-lg font-bold mb-3">LoOmi</h3>
            <p className="mb-3 text-xs leading-relaxed">
              Trendy and high-quality fashion for everyone. Stay stylish with LoOmi.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="hover:text-white"><FaFacebookF /></a>
              <a href="#" className="hover:text-white"><FaTwitter /></a>
              <a href="#" className="hover:text-white"><FaInstagram /></a>
              <a href="#" className="hover:text-white"><FaLinkedinIn /></a>
              <a href="#" className="hover:text-white"><FaYoutube /></a>
            </div>
          </div>

          
          <div>
            <h3 className="text-white text-md font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/shop" className="hover:text-white">Shop All</a></li>
              <li><a href="/new-arrivals" className="hover:text-white">New Arrivals</a></li>
              <li><a href="/sale" className="hover:text-white">Sale</a></li>
              <li><a href="/blog" className="hover:text-white">Blog</a></li>
              <li><a href="/about" className="hover:text-white">About Us</a></li>
            </ul>
          </div>

          
          <div>
            <h3 className="text-white text-md font-semibold mb-3">Customer Care</h3>
            <ul className="space-y-2">
              <li><a href="/faq" className="hover:text-white">FAQ</a></li>
              <li><a href="/returns" className="hover:text-white">Returns</a></li>
              <li><a href="/shipping" className="hover:text-white">Shipping</a></li>
              <li><a href="/size-guide" className="hover:text-white">Size Guide</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

         
          <div>
            <h3 className="text-white text-md font-semibold mb-3">Subscribe</h3>
            <p className="text-xs mb-3">
              Join our mailing list for updates and offers.
            </p>
            <form className="flex rounded overflow-hidden border border-gray-600">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-2 py-1 bg-transparent text-white text-xs focus:outline-none"
              />
              <button type="submit" className="bg-blue-600 px-3 text-xs text-white hover:bg-blue-700">
                Join
              </button>
            </form>
            <p className="text-xs mt-3">
              Email: <a href="mailto:support@loomi.com" className="hover:text-white">support@loomi.com</a>
            </p>
          </div>
        </div>

       
        <div className="border-t border-gray-700 pt-4 flex flex-col md:flex-row items-center justify-between">
          <p className="mb-3 md:mb-0">&copy; {currentYear} LoOmi. All rights reserved.</p>
          <div className="flex space-x-3 text-lg">
            <FaCcVisa />
            <FaCcMastercard />
            <FaCcAmex />
            <FaPaypal />
          </div>
        </div>
      </div>
    </footer>
  );
}
