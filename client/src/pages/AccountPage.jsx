import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Account() {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const updatedFields = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      const res = await fetch('https://loomibackend.onrender.com/api/v1/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      const updatedUser = { ...user, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditMode(false);
      
      toast.success('Profile updated!')
    } catch (err) {
      
      toast.error('Error: ' + err.message)
    }
  };

  if (!user) {
    return <div className="text-center mt-10 text-lg font-medium">Loading user...</div>;
  }

  return (
   <div className="max-w-6xl mx-auto mt-20 px-4 sm:px-6 lg:px-8 pb-15">

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar/Profile Info */}
        <div className="bg-gray-50 p-6 md:w-1/3 flex flex-col items-center text-center border-r">
          <img
            src="https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
            alt="Avatar"
            className="w-28 h-28 rounded-full border mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="mt-6 text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Profile Details</h3>
            <button
              onClick={() => (editMode ? handleSave() : setEditMode(true))}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {editMode ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                />
              ) : (
                <p className="text-gray-800">{user.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              {editMode ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                />
              ) : (
                <p className="text-gray-800">{user.phone || 'N/A'}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              {editMode ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                />
              ) : (
                <p className="text-gray-800 whitespace-pre-line">{user.address || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
