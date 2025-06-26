import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import SideNav from './SideNav/SideNav';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaFilter, FaTrash, FaCheckCircle, FaExclamationTriangle, FaRoute, FaMapMarkerAlt, FaSearch, FaTimes, FaInfoCircle } from 'react-icons/fa';
import CompanySideNav from './SideNav/CompanySideNav';
import { fetchMyRoutes } from '../utils/api';
import MarkerClusterGroup from 'react-leaflet-cluster';

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

// Helper: Calculate distance between two lat/lng points in meters (Haversine formula)
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [showFabMenu, setShowFabMenu] = useState(false);

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

  // Debug information for bin filtering
  const debugInfo = useMemo(() => {
    const binsWithCoordinates = bins.filter(bin => 
      !isNaN(Number(bin.latitude)) && !isNaN(Number(bin.longitude))
    );
    const binsWithoutCoordinates = bins.filter(bin => 
      isNaN(Number(bin.latitude)) || isNaN(Number(bin.longitude))
    );
    const binsAfterStatusFilter = filteredBins.filter(bin => 
      !isNaN(Number(bin.latitude)) && !isNaN(Number(bin.longitude))
    );
    
    return {
      totalBins: bins.length,
      binsWithCoordinates: binsWithCoordinates.length,
      binsWithoutCoordinates: binsWithoutCoordinates.length,
      binsAfterStatusFilter: binsAfterStatusFilter.length,
      binsShownOnMap: binsAfterStatusFilter.length
    };
  }, [bins, filteredBins]);

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

  // Search filter
  const searchedBins = useMemo(() => {
    if (!searchTerm.trim()) return filteredBins;
    const term = searchTerm.toLowerCase();
    return filteredBins.filter(bin => {
      return (
        (bin.id && bin.id.toString().includes(term)) ||
        (bin.user && bin.user.name && bin.user.name.toLowerCase().includes(term)) ||
        (bin.user && bin.user.email && bin.user.email.toLowerCase().includes(term)) ||
        (bin.location && bin.location.toLowerCase().includes(term)) ||
        (bin.address && bin.address.toLowerCase().includes(term))
      );
    });
  }, [filteredBins, searchTerm]);

  return (
    <div className="flex h-screen bg-gray-100">
      <CompanySideNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          {/* Map and overlays */}
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
              className="rounded-lg shadow-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {/* Bin Markers */}
              <MarkerClusterGroup>
                {searchedBins
                  .filter(bin => !isNaN(Number(bin.latitude)) && !isNaN(Number(bin.longitude)))
                  .map((bin) => {
                    const statusKey = getStatusKey(bin.status);
                    const icon = bin.userId === currentUserId ? userBinIcon : (binIcons[statusKey] || binIcons.EMPTY);
                    return (
                      <Marker
                        key={bin.id}
                        position={[Number(bin.latitude), Number(bin.longitude)]}
                        icon={icon}
                      >
                        <Tooltip direction="top" offset={[0, -20]} opacity={1} sticky>
                          <div className="min-w-[200px]">
                            <div className="mb-2 flex items-center gap-2">
                              <span className={`inline-block w-3 h-3 rounded-full ${
                                statusKey === 'FULL' ? 'bg-red-500' :
                                statusKey === 'HALF_FULL' ? 'bg-yellow-400' :
                                statusKey === 'EMPTY' ? 'bg-green-500' :
                                statusKey === 'COLLECTED' ? 'bg-gray-400' : 'bg-blue-500'
                              }`}></span>
                              <h3 className="font-bold text-lg text-gray-800">Bin #{bin.id}</h3>
                              {bin.userId === currentUserId && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-semibold">Your Bin</span>
                              )}
                            </div>
                            {bin.user && (
                              <div className="mb-2">
                                <p className="text-sm text-gray-600"><strong>Owner:</strong> {bin.user.name}</p>
                                <p className="text-xs text-gray-500">{bin.user.email}</p>
                              </div>
                            )}
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  statusKey === 'FULL' ? 'bg-red-100 text-red-700' :
                                  statusKey === 'HALF_FULL' ? 'bg-yellow-100 text-yellow-700' :
                                  statusKey === 'EMPTY' ? 'bg-green-100 text-green-700' :
                                  statusKey === 'COLLECTED' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {statusKey}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Fill Level:</span>
                                <span className="text-gray-800">{bin.fillLevel || bin.latestFillLevel || 0}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Last Collected:</span>
                                <span className="text-gray-800">{bin.lastCollected ? new Date(bin.lastCollected).toLocaleDateString() : 'Never'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Location:</span>
                                <span className="text-gray-800">{bin.address || bin.location || 'Unknown'}</span>
                              </div>
                            </div>
                          </div>
                        </Tooltip>
                      </Marker>
                    );
                  })}
              </MarkerClusterGroup>
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
        </div>
        {/* Status Summary as Card Row */}
        <div className="bg-white shadow-sm p-4 sticky top-0 z-20">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Bin Monitoring Dashboard</h1>
          </div>
          {/* Card Row */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border-l-4 border-red-500 shadow hover:shadow-lg transition p-4 rounded-lg flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-3xl" />
              <div>
                <div className="text-gray-500 text-xs font-semibold">Full Bins</div>
                <div className="text-2xl font-bold text-red-600">{statusCounts.FULL || 0}</div>
              </div>
            </div>
            <div className="bg-white border-l-4 border-yellow-400 shadow hover:shadow-lg transition p-4 rounded-lg flex items-center gap-3">
              <FaExclamationTriangle className="text-yellow-400 text-3xl" />
              <div>
                <div className="text-gray-500 text-xs font-semibold">Half Full</div>
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.HALF_FULL || 0}</div>
              </div>
            </div>
            <div className="bg-white border-l-4 border-green-500 shadow hover:shadow-lg transition p-4 rounded-lg flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-3xl" />
              <div>
                <div className="text-gray-500 text-xs font-semibold">Empty</div>
                <div className="text-2xl font-bold text-green-600">{statusCounts.EMPTY || 0}</div>
              </div>
            </div>
            <div className="bg-white border-l-4 border-gray-400 shadow hover:shadow-lg transition p-4 rounded-lg flex items-center gap-3">
              <FaTrash className="text-gray-400 text-3xl" />
              <div>
                <div className="text-gray-500 text-xs font-semibold">Total Bins</div>
                <div className="text-2xl font-bold text-gray-600">{bins.length}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Bin Details Bar at the Bottom */}
        {selectedBin && (
          <div className="fixed left-0 right-0 bottom-0 z-50 bg-white shadow-lg border-t border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between max-w-4xl mx-auto rounded-t-lg animate-slide-up" style={{margin: '0 auto'}}>
            <div className="flex-1 flex flex-col md:flex-row md:items-center md:gap-8">
              <div className="mb-2 md:mb-0">
                <span className="font-medium">ID:</span> {selectedBin.id}
              </div>
              {selectedBin.user && (
                <>
                  <div className="mb-2 md:mb-0"><span className="font-medium">Owner:</span> {selectedBin.user.name}</div>
                  <div className="mb-2 md:mb-0"><span className="font-medium">Email:</span> {selectedBin.user.email}</div>
                </>
              )}
              <div className="mb-2 md:mb-0"><span className="font-medium">Status:</span> {selectedBin.status}</div>
              <div className="mb-2 md:mb-0"><span className="font-medium">Fill Level:</span> {selectedBin.fillLevel || selectedBin.latestFillLevel || 0}%</div>
              <div className="mb-2 md:mb-0"><span className="font-medium">Last Collection:</span> {selectedBin.lastCollected ? new Date(selectedBin.lastCollected).toLocaleDateString() : 'Never'}</div>
              <div className="mb-2 md:mb-0"><span className="font-medium">Location:</span> {selectedBin.address || selectedBin.location}</div>
            </div>
            <button
              onClick={() => setSelectedBin(null)}
              className="ml-4 mt-4 md:mt-0 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
