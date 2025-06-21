import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth'; // Utility to check authentication
import SideNav from './SideNav/SideNav';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Geocode address using OpenStreetMap Nominatim
async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'waste-mgt-app/1.0' } });
  const data = await res.json();
  if (data.length === 0) {
    throw new Error("Address doesn't exist");
  }
  return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
}

const Profile = () => {
  const [user, setUser] = useState(null); // State to store user data
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [street, setStreet] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Kigali");
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/user/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setUser(data.user); // Set user data
        setEditedUser(data.user);
        if (data.user && data.user.address) {
          const parts = data.user.address.split(',').map(s => s.trim());
          setStreet(parts[0] || "");
          setNeighborhood(parts[1] || "");
          setCity(parts[2] || "Kigali");
        }
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load profile');
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const combinedAddress = `${street}, ${neighborhood}, ${city}`;
      let coords;
      try {
        coords = await geocodeAddress(combinedAddress);
      } catch (err) {
        toast.error(err.message);
        return;
      }
      const token = localStorage.getItem('token');
      const updateData = {
        name: editedUser.name,
        email: editedUser.email,
        phoneNumber: editedUser.phoneNumber,
        companyName: editedUser.companyName,
        companyType: editedUser.companyType,
        address: combinedAddress,
        latitude: coords.latitude,
        longitude: coords.longitude
      };
      const response = await fetch('http://localhost:5000/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUser(data.user);
      setEditedUser(data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (error) {
    return (
      <div className="flex h-screen">
        <SideNav />
        <div className="flex-1 p-8">
          <div className="text-red-500 text-center mt-4">{error}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen">
        <SideNav />
        <div className="flex-1 p-8">
          <div className="text-center mt-4">Loading...</div>
        </div>
      </div>
    );
  }

  // Show alert if user has address but no coordinates
  const needsGeocoding = user.address && (user.latitude == null || user.longitude == null);

  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Alert for missing coordinates */}
            {needsGeocoding && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 flex items-center justify-between">
                <p><strong>Notice:</strong> Please update and save your address to enable map features.</p>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    Update Now
                  </button>
                )}
              </div>
            )}
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <FaUser className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-blue-100">{user.role}</p>
                  </div>
                </div>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaEdit />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaSave />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaTimes />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="text-gray-400" />
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editedUser.email}
                          onChange={handleChange}
                          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <span className="text-gray-600">{user.email}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaPhone className="text-gray-400" />
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={editedUser.phoneNumber}
                          onChange={handleChange}
                          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <span className="text-gray-600">{user.phoneNumber}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Address Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaMapMarkerAlt className="text-gray-400" />
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            placeholder="Street (e.g., KK 290 St)"
                            value={street}
                            onChange={e => setStreet(e.target.value)}
                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                          />
                          <input
                            type="text"
                            placeholder="Neighborhood (e.g., Kicukiro)"
                            value={neighborhood}
                            onChange={e => setNeighborhood(e.target.value)}
                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                          />
                          <input
                            type="text"
                            placeholder="City (e.g., Kigali)"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </>
                      ) : (
                        <span className="text-gray-600">{user.address}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Information (if applicable) */}
                {user.role === 'COMPANY' && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Company Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <FaBuilding className="text-gray-400" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="companyName"
                            value={editedUser.companyName}
                            onChange={handleChange}
                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-600">{user.companyName}</span>
                        )}
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="companyType"
                          value={editedUser.companyType}
                          onChange={handleChange}
                          placeholder="Company Type"
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <span className="text-gray-600">{user.companyType}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;