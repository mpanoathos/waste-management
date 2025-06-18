import React, { useState, useEffect } from 'react';
import CompanySideNav from './SideNav/CompanySideNav';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { FaUser, FaBell, FaTrash, FaHistory, FaCreditCard, FaExclamationTriangle, FaChartLine, FaChartBar, FaChartPie, FaMapMarkerAlt, FaTruck } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const CompanyDashboard = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    dailyCollections: [],
    binStatus: {},
    collectionEfficiency: 0,
    totalWasteCollected: 0,
    averageCollectionTime: 0,
    routeEfficiency: [],
    activeDrivers: 0,
    totalBins: 0,
    collectionRate: 0,
  });
  const navigate = useNavigate();

  // Fetch company profile
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
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/analytics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

    fetchProfile();
    fetchAnalyticsData();
  }, [navigate]);

  // Chart configurations
  const dailyCollectionsData = {
    labels: analyticsData.dailyCollections.map(item => item.date),
    datasets: [
      {
        label: 'Collections per Day',
        data: analyticsData.dailyCollections.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const binStatusData = {
    labels: ['Empty', 'Partial', 'Full'],
    datasets: [
      {
        data: [
          analyticsData.binStatus.empty || 0,
          analyticsData.binStatus.partial || 0,
          analyticsData.binStatus.full || 0,
        ],
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
      },
    ],
  };

  const routeEfficiencyData = {
    labels: analyticsData.routeEfficiency.map(item => item.route),
    datasets: [
      {
        label: 'Route Efficiency',
        data: analyticsData.routeEfficiency.map(item => item.efficiency),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  return (
    <div className="flex h-screen">
      <CompanySideNav />
      <div className="flex-1 p-6 bg-gray-100 relative overflow-auto">
        {/* Top Layer Icons */}
        <div className="absolute top-4 right-6 flex space-x-4">
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

          <div
            className="relative cursor-pointer"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
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
                    localStorage.removeItem('token');
                    navigate('/');
                  }}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name || 'Company'}!</h1>
          <p className="text-gray-600">Here's your company's waste management overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bins</p>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.totalBins}</p>
              </div>
              <FaTrash className="text-blue-600 text-2xl" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold text-green-600">{analyticsData.activeDrivers}</p>
              </div>
              <FaTruck className="text-green-600 text-2xl" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-yellow-600">{analyticsData.collectionRate}%</p>
              </div>
              <FaHistory className="text-yellow-600 text-2xl" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Waste Collected</p>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.totalWasteCollected} tons</p>
              </div>
              <FaMapMarkerAlt className="text-purple-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Collection Trends</h2>
              <FaChartLine className="text-blue-600 text-xl" />
            </div>
            <Line data={dailyCollectionsData} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Bin Status Distribution</h2>
              <FaChartPie className="text-blue-600 text-xl" />
            </div>
            <Pie data={binStatusData} />
          </div>
        </div>

        {/* Route Efficiency Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Route Efficiency</h2>
            <FaChartBar className="text-blue-600 text-xl" />
          </div>
          <Bar data={routeEfficiencyData} />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Collection Efficiency</h2>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600">{analyticsData.collectionEfficiency}%</span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-blue-600"
                    strokeWidth="10"
                    strokeDasharray={`${analyticsData.collectionEfficiency * 2.51} 251.2`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Average Collection Time</h2>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl font-bold text-green-600">{analyticsData.averageCollectionTime}</span>
                <p className="text-gray-600 mt-2">minutes per collection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/company-collection-history')}
              className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <FaDownload className="text-blue-600 text-xl mr-3" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Download Collection History</p>
                <p className="text-sm text-gray-600">Get PDF report of all collections</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/map-view')}
              className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200"
            >
              <FaMapMarkerAlt className="text-green-600 text-xl mr-3" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">View Map</p>
                <p className="text-sm text-gray-600">See bin locations and routes</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/bin-management')}
              className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
            >
              <FaTrash className="text-purple-600 text-xl mr-3" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Manage Bins</p>
                <p className="text-sm text-gray-600">Update bin status and details</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;