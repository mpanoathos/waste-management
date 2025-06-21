import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import SideNav from './SideNav/SideNav';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaFilter, FaTrash, FaCheckCircle, FaExclamationTriangle, FaRoute, FaMapMarkerAlt } from 'react-icons/fa';
import CompanySideNav from './SideNav/CompanySideNav';
import { fetchMyRoutes } from '../utils/api';

// Custom SVG icons for bin statuses
const binIcons = {
  FULL: new L.Icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="%23ff0000" stroke="black" stroke-width="3"/><text x="24" y="32" font-size="21" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">F</text></svg>',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
  }),
  HALF_FULL: new L.Icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="%23ffcc00" stroke="black" stroke-width="3"/><text x="24" y="32" font-size="21" text-anchor="middle" fill="black" font-family="Arial" font-weight="bold">H</text></svg>',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
  }),
  EMPTY: new L.Icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="%2300cc44" stroke="black" stroke-width="3"/><text x="24" y="32" font-size="21" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">E</text></svg>',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
  }),
  COLLECTED: new L.Icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="%23cccccc" stroke="black" stroke-width="3"/><text x="24" y="32" font-size="21" text-anchor="middle" fill="black" font-family="Arial" font-weight="bold">C</text></svg>',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
  })
};

// Add a special icon for the current user's bins
const userBinIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54"><circle cx="27" cy="27" r="24" fill="%23007bff" stroke="black" stroke-width="3"/><text x="27" y="36" font-size="24" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">*</text></svg>',
  iconSize: [54, 54],
  iconAnchor: [27, 54],
  popupAnchor: [0, -54]
});

// Helper to normalize status
const getStatusKey = (status) => {
  if (!status) return '';
  const s = status.toUpperCase();
  if (s === 'PARTIAL' || s === 'HALF_FULL' || s === 'HALF') return 'HALF_FULL';
  if (s === 'FULL') return 'FULL';
  if (s === 'EMPTY') return 'EMPTY';
  if (s === 'COLLECTED') return 'COLLECTED';
  return s;
};

const MapView = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [bins, setBins] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBin, setSelectedBin] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [filters, setFilters] = useState({
    status: 'ALL',
    lastCollected: 'ALL'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  // Default center (Kigali, Rwanda)
  const defaultCenter = {
    lat: -1.9441,
    lng: 30.0619
  };

  // Get current user ID from localStorage
  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }

    // Check if backend is running first
    checkBackendHealth().then(() => {
      fetchBinsAndRoutes();
    }).catch(() => {
      setError('Backend server is not running. Please start the server and try again.');
      setLoading(false);
    });

    const interval = setInterval(fetchBinsAndRoutes, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      await axios.get('http://localhost:5000/health', { timeout: 5000 });
    } catch (error) {
      throw new Error('Backend server is not responding');
    }
  };

  const fetchBinsAndRoutes = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Checking authentication...');
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }
      
      setLoadingMessage('Fetching bin data...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      // Fetch bins and routes in parallel for better performance
      const [binsResponse, routesResponse] = await Promise.allSettled([
        Promise.race([
          axios.get('http://localhost:5000/bin', {
            headers: {  
              Authorization: `Bearer ${token}`
            }
          }),
          timeoutPromise
        ]),
        Promise.race([
          fetchMyRoutes(token).catch(err => {
            console.log('Routes not available:', err.message);
            return { data: { routes: [] } };
          }),
          timeoutPromise
        ])
      ]);
      
      setLoadingMessage('Processing data...');
      
      // Handle bins response
      if (binsResponse.status === 'fulfilled') {
        setBins(binsResponse.value.data.bins || []);
      } else {
        console.error('Error fetching bins:', binsResponse.reason);
        setError('Failed to fetch bins data: ' + (binsResponse.reason.message || 'Unknown error'));
      }
      
      // Handle routes response
      if (routesResponse.status === 'fulfilled') {
        setRoutes(routesResponse.value.data.routes || []);
      } else {
        console.log('Routes not available:', routesResponse.reason.message);
        setRoutes([]);
      }
      
    } catch (error) {
      console.error('Error fetching map data:', error);
      setError('Failed to fetch map data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setLoadingMessage('Initializing...');
    }
  };

  const handleBinClick = (bin) => {
    setSelectedBin(bin);
  };

  const filteredBins = useMemo(() => {
    return bins.filter(bin => {
      const normalizedBinStatus = getStatusKey(bin.status);
      if (filters.status !== 'ALL' && normalizedBinStatus !== filters.status) return false;
      if (filters.lastCollected !== 'ALL') {
        const lastCollected = new Date(bin.lastCollected);
        const now = new Date();
        const daysDiff = Math.floor((now - lastCollected) / (1000 * 60 * 60 * 24));
        if (filters.lastCollected === 'TODAY' && daysDiff > 0) return false;
        if (filters.lastCollected === 'WEEK' && daysDiff > 7) return false;
        if (filters.lastCollected === 'MONTH' && daysDiff > 30) return false;
      }
      return true;
    });
  }, [bins, filters]);

  const statusCounts = useMemo(() => {
    return bins.reduce((acc, bin) => {
      const key = getStatusKey(bin.status);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [bins]);

  // Autofix handler for missing coordinates
  const handleAutoFixBins = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Use the new backend endpoint to update coordinates
      const response = await fetch('http://localhost:5000/bin/update-coordinates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to update coordinates');
      }
      
      const result = await response.json();
      toast.success(result.message);
      
      // Refresh bins after updating coordinates
      fetchBinsAndRoutes();
    } catch (error) {
      toast.error(`Error updating coordinates: ${error.message}`);
      console.error('Error updating coordinates:', error);
    }
  };

  const handleUpdateCoordinates = () => {
    toast.info('Coordinate fixing process started. This might take a moment.');
    handleAutoFixBins();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <CompanySideNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Bin Monitoring Dashboard</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRoutes(!showRoutes)}
                className={`flex items-center px-4 py-2 rounded-lg transition ${
                  showRoutes 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                <FaRoute className="mr-2" />
                {showRoutes ? 'Hide Routes' : 'Show Routes'}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaFilter className="mr-2" />
                Filters
              </button>
              <button
                onClick={handleUpdateCoordinates}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <FaMapMarkerAlt className="mr-2" />
                Fix Coordinates
              </button>
            </div>
          </div>
          {/* Status Summary */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-600 mr-2" />
                <span className="font-semibold">Full Bins:</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{statusCounts.FULL || 0}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-yellow-600 mr-2" />
                <span className="font-semibold">Half Full:</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.HALF_FULL || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-600 mr-2" />
                <span className="font-semibold">Empty:</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{statusCounts.EMPTY || 0}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center">
                <FaTrash className="text-gray-600 mr-2" />
                <span className="font-semibold">Total Bins:</span>
              </div>
              <p className="text-2xl font-bold text-gray-600">{bins.length}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
              <div className="text-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-600">{loadingMessage}</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
              <div className="text-center bg-white p-6 rounded-lg shadow-lg max-w-md">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Map</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchBinsAndRoutes}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <MapContainer
              center={[defaultCenter.lat, defaultCenter.lng]}
              zoom={13}
              style={{ width: '100%', height: 'calc(100vh - 200px)' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {/* Bin Markers */}
              {filteredBins
                .filter(bin => !isNaN(Number(bin.latitude)) && !isNaN(Number(bin.longitude)))
                .map((bin) => {
                  const statusKey = getStatusKey(bin.status);
                  const icon = bin.userId === currentUserId ? userBinIcon : (binIcons[statusKey] || binIcons.EMPTY);
                  
                  return (
                    <Marker
                      key={bin.id}
                      position={[Number(bin.latitude), Number(bin.longitude)]}
                      icon={icon}
                      eventHandlers={{ click: () => handleBinClick(bin) }}
                    >
                      <Popup>
                        <div>
                          <strong>Status:</strong> {getStatusKey(bin.status)}<br />
                          <strong>Last Collected:</strong> {bin.lastCollected ? new Date(bin.lastCollected).toLocaleDateString() : 'N/A'}<br />
                          <strong>Location:</strong> {bin.address || bin.location}<br />
                          {bin.userId === currentUserId && <span style={{color: '#007bff', fontWeight: 'bold'}}>Your Bin</span>}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              
              {/* Route Polylines */}
              {showRoutes && routes.map((route, index) => (
                <Polyline
                  key={route.id}
                  positions={route.coordinates.map(coord => [coord.lat, coord.lng])}
                  color={`hsl(${index * 60}, 70%, 50%)`}
                  weight={4}
                  opacity={0.8}
                >
                  <Popup>
                    <div>
                      <strong>Route:</strong> {route.name}<br />
                      <strong>Points:</strong> {route.coordinates.length}<br />
                      <strong>Created:</strong> {new Date(route.createdAt).toLocaleDateString()}
                    </div>
                  </Popup>
                </Polyline>
              ))}
            </MapContainer>
          )}
          {/* Filters Panel */}
          {showFilters && (
            <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Filter Bins</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="FULL">Full</option>
                    <option value="HALF_FULL">Half Full</option>
                    <option value="EMPTY">Empty</option>
                    <option value="COLLECTED">Collected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Collected
                  </label>
                  <select
                    value={filters.lastCollected}
                    onChange={(e) => setFilters({ ...filters, lastCollected: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Time</option>
                    <option value="TODAY">Today</option>
                    <option value="WEEK">This Week</option>
                    <option value="MONTH">This Month</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {/* Bin Details Sidebar */}
          {selectedBin && (
            <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Bin Details</h3>
                <button
                  onClick={() => setSelectedBin(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium">ID:</span> {selectedBin.id}</p>
                <p><span className="font-medium">Status:</span> {selectedBin.status}</p>
                <p><span className="font-medium">Last Collection:</span> {selectedBin.lastCollected ? new Date(selectedBin.lastCollected).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-medium">Location:</span> {selectedBin.address || selectedBin.location}</p>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      toast.info('Collection request sent');
                    }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Schedule Collection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
