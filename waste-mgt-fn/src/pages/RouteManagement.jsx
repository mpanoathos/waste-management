import React, { useEffect, useState } from 'react';
import { fetchUnassignedRoutes, assignRouteToCompany, fetchAllRoutes, fetchAllCompanies } from '../utils/api';
import AdminSideNav from '../pages/SideNav/adminSideNav';
import axios from 'axios';
import { toast } from 'react-toastify';

const RouteManagement = ({ token }) => {
  const [routes, setRoutes] = useState([]);
  const [unassignedRoutes, setUnassignedRoutes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Route creation state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteCoordinates, setNewRouteCoordinates] = useState('');
  const [creatingRoute, setCreatingRoute] = useState(false);
  const [address, setAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [unassignedRes, allRoutesRes, companiesRes] = await Promise.all([
          fetchUnassignedRoutes(token),
          fetchAllRoutes(token),
          fetchAllCompanies(token)
        ]);
        
        setUnassignedRoutes(unassignedRes.data.routes || []);
        setRoutes(allRoutesRes.data.routes || []);
        setCompanies(companiesRes.data.companies || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Error fetching data: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    
    if (!newRouteName.trim()) {
      setMessage('Route name is required');
      return;
    }

    // Parse coordinates from text input
    let coordinates = [];
    try {
      // Expect format: "lat1,lng1;lat2,lng2;lat3,lng3"
      const coordPairs = newRouteCoordinates.split(';').filter(pair => pair.trim());
      coordinates = coordPairs.map(pair => {
        const [lat, lng] = pair.split(',').map(coord => parseFloat(coord.trim()));
        if (isNaN(lat) || isNaN(lng)) {
          throw new Error('Invalid coordinate format');
        }
        return { lat, lng };
      });
      
      if (coordinates.length < 2) {
        throw new Error('At least 2 coordinate pairs are required');
      }
    } catch (error) {
      setMessage('Invalid coordinates format. Use: lat1,lng1;lat2,lng2;lat3,lng3');
      return;
    }

    try {
      setCreatingRoute(true);
      
      // Create route using the API
      const response = await fetch('http://localhost:5000/api/routes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newRouteName,
          coordinates: coordinates
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create route');
      }

      const newRoute = await response.json();
      setMessage('Route created successfully!');
      toast.success('Route created successfully!');
      
      // Reset form
      setNewRouteName('');
      setNewRouteCoordinates('');
      setShowCreateForm(false);
      
      // Refresh lists
      const [unassignedRes, allRoutesRes] = await Promise.all([
        fetchUnassignedRoutes(token),
        fetchAllRoutes(token)
      ]);
      
      setUnassignedRoutes(unassignedRes.data.routes || []);
      setRoutes(allRoutesRes.data.routes || []);
      
    } catch (error) {
      setMessage('Error creating route: ' + error.message);
      toast.error('Error creating route: ' + error.message);
    } finally {
      setCreatingRoute(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assignRouteToCompany(selectedRoute, selectedCompany, token);
      setMessage('Route assigned successfully!');
      toast.success('Route assigned successfully!');
      
      // Refresh lists
      const [unassignedRes, allRoutesRes] = await Promise.all([
        fetchUnassignedRoutes(token),
        fetchAllRoutes(token)
      ]);
      
      setUnassignedRoutes(unassignedRes.data.routes || []);
      setRoutes(allRoutesRes.data.routes || []);
      
      // Reset form
      setSelectedRoute('');
      setSelectedCompany('');
    } catch (err) {
      setMessage('Error assigning route: ' + (err.response?.data?.message || err.message));
      toast.error('Error assigning route: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGeocodeAddress = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setMessage('Please enter an address to geocode.');
      return;
    }
    setGeocoding(true);
    setMessage('');
    try {
      // Use OpenStreetMap Nominatim API
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 3
        }
      });
      if (response.data && response.data.length > 0) {
        // Use all returned results as route points
        const coords = response.data.map(loc => `${loc.lat},${loc.lon}`).join(';');
        setNewRouteCoordinates(coords);
        setMessage('Coordinates filled from address! You can edit them if needed.');
      } else {
        setMessage('No results found for that address.');
      }
    } catch (err) {
      setMessage('Error geocoding address.');
    } finally {
      setGeocoding(false);
    }
  };

  if (loading) {
    return <div>Loading routes...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSideNav />
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Route Management</h2>

        {/* Create Route Section */}
        <section className="mb-10 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Create New Route</h3>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            >
              {showCreateForm ? 'Cancel' : 'Create Route'}
            </button>
          </div>
          {showCreateForm && (
            <form onSubmit={handleCreateRoute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Route Name:</label>
                <input
                  type="text"
                  value={newRouteName}
                  onChange={e => setNewRouteName(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Kicukiro Kabeza"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Address (optional):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., KK 123 St, Kigali"
                  />
                  <button
                    type="button"
                    onClick={handleGeocodeAddress}
                    disabled={geocoding || !address.trim()}
                    className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {geocoding ? 'Geocoding...' : 'Geocode Address'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter an address and click 'Geocode Address' to fill coordinates automatically.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Coordinates (format: lat1,lng1;lat2,lng2;lat3,lng3):
                </label>
                <textarea
                  value={newRouteCoordinates}
                  onChange={e => setNewRouteCoordinates(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md h-20"
                  placeholder="e.g., -1.9441,30.0619;-1.9450,30.0625;-1.9460,30.0630"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate coordinate pairs with semicolons (;). Each pair should be latitude,longitude.
                </p>
              </div>
              <button
                type="submit"
                disabled={creatingRoute}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition"
              >
                {creatingRoute ? 'Creating...' : 'Create Route'}
              </button>
            </form>
          )}
        </section>

        {/* Assign Route Section */}
        <section className="mb-10 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Assign Route to Company</h3>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Select Route:</label>
              <select
                value={selectedRoute}
                onChange={e => setSelectedRoute(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">--Select a route--</option>
                {unassignedRoutes.map(route => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Select Company:</label>
              <select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">--Select a company--</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.companyName || company.name} ({company.email})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Assign Route
            </button>
          </form>
        </section>

        {/* All Routes Display */}
        <section>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">All Routes</h3>
          {routes.length === 0 ? (
            <p className="text-gray-500">No routes found. Create some routes first.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map(route => (
                <div key={route.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow">
                  <h4 className="font-medium text-lg text-gray-800">{route.name}</h4>
                  <p className="text-sm text-gray-600">
                    {route.company ? `Assigned to: ${route.company.companyName}` : 'Unassigned'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(route.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default RouteManagement; 