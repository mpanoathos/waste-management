import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth'; // Utility to check authentication
import SideNav from './SideNav/SideNav';

const Profile = () => {
  const [user, setUser] = useState(null); // State to store user data
  const [error, setError] = useState('');
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
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, [navigate]);

  // if (error) {
  //   return <div className="text-red-500 text-center mt-4">{error}</div>;
  // }

  // if (!user) {
  //   return <div className="text-center mt-4">Loading...</div>;
  // }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <SideNav />
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">User Profile</h2>
        <p className="text-gray-700">
          <strong>Name:</strong> Mpano
        </p>
        <p className="text-gray-700">
          <strong>Email:</strong> M
        </p>
        <p className="text-gray-700">
          <strong>Role:</strong> A
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('token'); // Clear token
            navigate('/'); // Redirect to login
          }}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;