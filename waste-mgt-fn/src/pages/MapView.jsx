import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import SideNav from './SideNav/SideNav';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaFilter, FaTrash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import CompanySideNav from './SideNav/CompanySideNav';

// Get API key from environment variable
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const MapView = () => {
  const [loading, setLoading] = useState(true);
  const [bins, setBins] = useState([]);
  const [selectedBin, setSelectedBin] = useState(null);
  const [collectionRoutes, setCollectionRoutes] = useState([]);
  const [filters, setFilters] = useState({
    status: 'ALL',
    lastCollected: 'ALL'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Default center (Kigali, Rwanda)
  const defaultCenter = {
    lat: -1.9441,
    lng: 30.0619
  };

  const mapContainerStyle = {
    width: '100%',
    height: 'calc(100vh - 200px)'
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: true,
    scaleControl: true,
    mapTypeControl: true,
    fullscreenControl: true
  };

  useEffect(() => {
    fetchBinsAndRoutes();
    // Set up polling for real-time updates
    const interval = setInterval(fetchBinsAndRoutes, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBinsAndRoutes = async () => {
    try {
      setLoading(true);
      const [binsResponse, routesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/bins', {
          headers: {  
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('http://localhost:5000/api/routes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      setBins(binsResponse.data.bins);
      setCollectionRoutes(routesResponse.data.routes);
    } catch (error) {
      toast.error('Failed to fetch map data');
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBinClick = (bin) => {
    setSelectedBin(bin);
  };

  const getBinIcon = (status) => {
    const icons = {
      EMPTY: '🟢',
      HALF_FULL: '🟡',
      FULL: '🔴',
      COLLECTED: '⚪'
    };
    return icons[status] || '⚪';
  };

  const getRouteColor = (route) => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080'];
    return colors[route.id % colors.length];
  };

  const filteredBins = bins.filter(bin => {
    if (filters.status !== 'ALL' && bin.status !== filters.status) return false;
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

  const getStatusCounts = () => {
    return bins.reduce((acc, bin) => {
      acc[bin.status] = (acc[bin.status] || 0) + 1;
      return acc;
    }, {});
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="flex h-screen bg-gray-100">
      <CompanySideNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Bin Monitoring Dashboard</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
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
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={13}
                options={mapOptions}
              >
                {/* Bin Markers */}
                {filteredBins.map((bin) => (
                  <Marker
                    key={bin.id}
                    position={{ lat: bin.latitude, lng: bin.longitude }}
                    onClick={() => handleBinClick(bin)}
                    icon={{
                      url: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23${getBinIcon(bin.status).replace('#', '')}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
                      scaledSize: new window.google.maps.Size(30, 30)
                    }}
                  />
                ))}

                {/* Collection Routes */}
                {collectionRoutes.map((route) => (
                  <Polyline
                    key={route.id}
                    path={route.coordinates}
                    options={{
                      strokeColor: getRouteColor(route),
                      strokeOpacity: 0.8,
                      strokeWeight: 3
                    }}
                  />
                ))}
              </GoogleMap>
            </LoadScript>
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
                <p><span className="font-medium">Last Collection:</span> {new Date(selectedBin.lastCollected).toLocaleDateString()}</p>
                <p><span className="font-medium">Location:</span> {selectedBin.address}</p>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      // Handle collection request
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
