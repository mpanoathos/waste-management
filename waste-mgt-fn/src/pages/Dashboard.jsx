import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import SideNav from './SideNav/SideNav';
import { isAuthenticated } from '../utils/auth'; // Import the auth utility
import { FaUser, FaBell, FaTrash, FaHistory, FaCreditCard, FaExclamationTriangle, FaChartLine, FaChartBar, FaChartPie } from 'react-icons/fa'; // Import icons from react-icons
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
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

const socket = io('http://localhost:5000');

const Dashboard = () => {
  const [binData, setBinData] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false); // State for notifications pop-up
  const [showProfile, setShowProfile] = useState(false); // State for profile pop-up
  const [recentCollections, setRecentCollections] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    dailyCollections: [],
    binStatus: {},
    collectionEfficiency: 0,
    totalWasteCollected: 0,
    averageCollectionTime: 0,
    routeEfficiency: [],
  });
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
      if (!response.ok) {
        let errorMsg = `Failed to fetch bins (status ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMsg = errorData.message + ` (status ${response.status})`;
        } catch {}
        throw new Error(errorMsg);
      }
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
      console.error('Bins fetch error:', err);
      setError(err.message);
      toast.error(err.message);
    }
  };

  // Fetch recent collections
  const fetchRecentCollections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/collection/recent', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        let errorMsg = `Failed to fetch collections (status ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMsg = errorData.message + ` (status ${response.status})`;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setRecentCollections(data);
    } catch (err) {
      console.error('Collections fetch error:', err);
      setError(err.message);
      toast.error(err.message);
    }
  };

  // Fetch upcoming payments
  const fetchUpcomingPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/payment/upcoming', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        let errorMsg = `Failed to fetch payments (status ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMsg = errorData.message + ` (status ${response.status})`;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setUpcomingPayments(data);
    } catch (err) {
      console.error('Payments fetch error:', err);
      setError(err.message);
      toast.error(err.message);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching analytics with token:', token ? 'Token present' : 'No token');
      
      const response = await fetch('http://localhost:5000/api/analytics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Analytics response status:', response.status);
      
      if (!response.ok) {
        let errorMsg = `Failed to fetch analytics (status ${response.status})`;
        try {
          const errorData = await response.json();
          console.log('Analytics error response:', errorData);
          if (errorData && errorData.message) errorMsg = errorData.message + ` (status ${response.status})`;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      console.log('Analytics data received:', data);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
      // Show toast with the real error
      toast.error(err.message);
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
        await fetchRecentCollections();
        await fetchUpcomingPayments();
        await fetchAnalyticsData();
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

  // Calculate key metrics
  const totalBins = binData.length;
  const fullBins = binData.filter(bin => bin.level > 75).length;
  const needsCollection = binData.filter(bin => bin.level > 90).length;

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
          binData.filter(bin => bin.level < 40).length,
          binData.filter(bin => bin.level >= 40 && bin.level <= 75).length,
          binData.filter(bin => bin.level > 75).length,
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
    <div className="flex h-screen bg-gray-100">
      <SideNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Section */}
        <div className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name || 'User'}!</h1>
              <p className="text-gray-600">Here's an overview of your waste management system</p>
            </div>
            <div className="flex space-x-4">
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
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4 z-10">
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
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4 z-10">
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
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bins</p>
                  <p className="text-2xl font-bold text-gray-800">{totalBins}</p>
                </div>
                <FaTrash className="text-gray-800 text-2xl" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Full Bins</p>
                  <p className="text-2xl font-bold text-yellow-600">{fullBins}</p>
                </div>
                <FaExclamationTriangle className="text-yellow-600 text-2xl" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Needs Collection</p>
                  <p className="text-2xl font-bold text-red-600">{needsCollection}</p>
                </div>
                <FaHistory className="text-red-600 text-2xl" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Payments</p>
                  <p className="text-2xl font-bold text-green-600">{upcomingPayments.length}</p>
                </div>
                <FaCreditCard className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Collection Trends</h2>
                <FaChartLine className="text-gray-800 text-xl" />
              </div>
              <Line data={dailyCollectionsData} />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Bin Status Distribution</h2>
                <FaChartPie className="text-gray-800 text-xl" />
              </div>
              <Pie data={binStatusData} />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bin Status Section */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Bin Status</h2>
              <div className="space-y-4">
                {binData.length === 0 ? (
                  <p className="text-gray-500">No bins found.</p>
                ) : (
                  binData.map((bin) => (
                    <div
                      key={bin.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-700">{bin.label}</span>
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
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            bin.level > 75
                              ? 'bg-red-500'
                              : bin.level > 40
                              ? 'bg-yellow-400'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${bin.level}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Type: {bin.type}</p>
                        <p>Location: {bin.location}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="space-y-4">
              {/* Recent Collections */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Collections</h2>
                {recentCollections.length === 0 ? (
                  <p className="text-gray-500">No recent collections.</p>
                ) : (
                  <div className="space-y-4">
                    {recentCollections.map((collection) => (
                      <div key={collection.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">Bin #{collection.binId}</p>
                            <p className="text-sm text-gray-600">{new Date(collection.collectedAt).toLocaleDateString()}</p>
                          </div>
                          <span className="text-sm text-green-600">Collected</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Payments */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Payments</h2>
                {upcomingPayments.length === 0 ? (
                  <p className="text-gray-500">No upcoming payments.</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingPayments.map((payment) => (
                      <div key={payment.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">Payment #{payment.id}</p>
                            <p className="text-sm text-gray-600">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                          </div>
                          <span className="text-sm text-gray-800">RWF {payment.amount}</span>
                        </div>
                      </div>
                    ))}
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

export default Dashboard;
