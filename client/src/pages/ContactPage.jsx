import React, { useState } from 'react';
import axios from 'axios';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const { data } = await axios.post('https://loomibackend.onrender.com/api/contact', form);
      setSuccess(data.message);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const whatsappNumber = '919539697664'; 

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f8ff] px-4 py-10">
      <div className="max-w-5xl w-full bg-white shadow-lg rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        <div className="h-96 md:h-auto">
          <img
            src="https://i.mdel.net/i/db/2023/3/1912109/1912109-800w.jpg"
            alt="Contact"
            className="w-full h-full object-cover"
          />
        </div>

       
        <div className="p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Contact Us</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 py-2 focus:outline-none bg-transparent placeholder:text-gray-500 text-sm"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 py-2 focus:outline-none bg-transparent placeholder:text-gray-500 text-sm"
              />
              <textarea
                name="message"
                placeholder="Message"
                value={form.message}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 py-2 h-24 focus:outline-none bg-transparent placeholder:text-gray-500 text-sm resize-none"
              ></textarea>

              {success && <p className="text-green-600 text-sm">{success}</p>}
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {/* {success && toast.success("Thank you for contacting us")} */}

              <button
                type="submit"
                className="mt-2 bg-blue-100 text-black px-6 py-2 text-sm rounded hover:bg-blue-200 transition"
                onClick={toast.success("Thank you for contacting us")}
              >
                Contact Us
              </button>
            </form>
          </div>

       
          <div className="mt-8">
            <p className="text-xs text-gray-500 mb-1"><span className="font-semibold">Contact</span> — hiloomi@gmail.com</p>
            <p className="text-xs text-gray-500 mb-4"><span className="font-semibold">Based in</span> — Calicut, Kerala</p>

            <div className="flex items-center gap-4">
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="text-green-500 text-xl hover:scale-110 transition" />
              </a>
            </div>
          </div>
        </div>
      </div>

      
      <div className="fixed bottom-4 right-4 z-30">
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition"
        >
          <FaWhatsapp className="text-white text-2xl" />
        </a>
      </div>
    </div>
  );
};

export default ContactPage;
