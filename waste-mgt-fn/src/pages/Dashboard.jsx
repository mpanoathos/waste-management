import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import SideNav from './SideNav/SideNav';
import { isAuthenticated } from '../utils/auth'; // Import the auth utility
import { FaUser, FaBell } from 'react-icons/fa'; // Import icons from react-icons
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const Dashboard = () => {
  const [binData, setBinData] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false); // State for notifications pop-up
  const [showProfile, setShowProfile] = useState(false); // State for profile pop-up
  const navigate = useNavigate(); // Initialize useNavigate

  // Move fetchBins outside useEffect so you can call it after creating a bin
  const fetchBins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/bin/user-bins', {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      if (!response.ok) throw new Error('Failed to fetch bins');
      const data = await response.json();
      setBinData(
        data.map(bin => ({
          id: bin.id,
          label: `Bin ${bin.id}`,
          level: bin.latestFillLevel,
          type: bin.type,
          location: bin.location,
        }))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

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
        // After getting user data, fetch their bins
        await fetchBins();
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Handler for creating a new bin
  const handleCreateBin = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/bin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}), // send nothing, backend uses defaults
      });
      if (!response.ok) throw new Error('Failed to create bin');
      await fetchBins(); // Refresh bin list
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // Listen for real-time sensor updates
    socket.on('sensorUpdate', (data) => {
      setBinData((prev) =>
        prev.map((bin) =>
          bin.id === data.binId
            ? { ...bin, level: data.fillLevel }
            : bin
        )
      );
    });

    return () => {
      socket.off('sensorUpdate');
    };
  }, []);

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
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
          >
            <span>
              <FaBell className="text-gray-700 text-2xl" />
            </span>
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
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false); // Close notifications when profile is clicked
            }}
          >
            <span>
              <FaUser className="text-gray-700 text-2xl" />
            </span>
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
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">My Bin Dashboard</h2>

        <div className="flex flex-col items-center space-y-8">
          {binData.length === 0 && (
            <div className="text-gray-500 text-lg">No bins found.</div>
          )}
          {binData.map((bin) => (
            <div
              key={bin.id}
              className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center"
            >
              <div className="mb-4 w-full flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Bin #{bin.id}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    bin.level > 75
                      ? 'bg-red-100 text-red-700'
                      : bin.level > 40
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {bin.level}% Full
                </span>
              </div>
              <div className="w-full mb-4">
                <div className="h-4 bg-gray-200 rounded-full">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      bin.level > 75
                        ? 'bg-red-500'
                        : bin.level > 40
                        ? 'bg-yellow-400'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${bin.level}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-full flex flex-col space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Type:</span>
                  <span className="text-gray-800">{bin.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Location:</span>
                  <span className="text-gray-800">{bin.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
