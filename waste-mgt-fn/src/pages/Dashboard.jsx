import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import SideNav from './SideNav';
import { isAuthenticated } from '../utils/auth'; // Import the auth utility
import {FaUser,FaBell} from 'react-icons/fa'; // Import icons from react-icons

const Dashboard = () => {
  const [binData, setBinData] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false); // State for notifications pop-up
  const [showProfile, setShowProfile] = useState(false); // State for profile pop-up
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Check if the user is authenticated
    if (!isAuthenticated()) {
      navigate('/'); 
    }

    // Fetch bin fill level data from backend (mock for now)
    setBinData([
      { id: 'Bin 1', level: 75 },
      { id: 'Bin 2', level: 40 },
    ]);

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/user/profile', {
          method: 'GET',
          headers: {
            Authorization: token, // Pass token in Authorization header
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
    fetchProfile()

  }, [navigate]);
  
  return (
    <div className="flex h-screen">
      {/* Sidebar Section */}
      <SideNav />

      {/* Main Content Section */}
      <div className="flex-1 p-6 bg-gray-100 relative">
        {/* Top Layer Icons */}
        <div className="absolute top-4 right-6 flex space-x-4">
          {/* Notifications Icon */}
          <div
            className="relative cursor-pointer"
            onClick={() => {setShowNotifications(!showNotifications);
              setShowProfile(false); 
            }}
          >
            <span><FaBell className="text-gray-700 text-2xl"/></span>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4">
                <h4 className="font-bold mb-2">Notifications</h4>
                <ul>
                  <li className="text-gray-700">No new notifications</li>
                </ul>
              </div>
            )}
          </div>

          {/* Profile Icon */}
          <div
            className="relative cursor-pointer"
            onClick={() => {setShowProfile(!showProfile);
            setShowNotifications(false); // Close notifications when profile is clicked
            }}
          >
            <span><FaUser className="text-gray-700 text-2xl" /></span>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4">
                <h4 className="font-bold mb-2">Profile</h4>
                {user ? (
                  <>
                    <p className="text-gray-700">Name: {user.name}</p>
                    <p className="text-gray-700">Email: {user.email}</p>
                  </>
                ) : (
                  <p className="text-gray-700">Loading...</p>
                )}
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
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <h2 className="text-2xl font-bold mb-6 text-center">Dashboard</h2>
        <h3 className="text-xl font-semibold mb-4">Bin Status</h3>
        <div className="grid grid-cols-2 gap-6">
          {binData.map((bin) => (
            <div key={bin.id} className="bg-white p-6 rounded-lg shadow-lg">
              <h4 className="font-bold text-lg">{bin.id}</h4>
              <p className="text-gray-700">Fill Level: {bin.level}%</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                <div
                  className={`h-4 rounded-full ${
                    bin.level > 75 ? 'bg-red-500' : 'bg-green-600'
                  }`}
                  style={{ width: `${bin.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
