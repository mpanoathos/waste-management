import React, { useEffect, useState } from 'react';
import { fetchMyRoutes } from '../utils/api';
import CompanySideNav from './SideNav/CompanySideNav';
import { FaRoute, FaMapMarkerAlt, FaCalendar, FaInfoCircle } from 'react-icons/fa';

const MyRoutes = ({ token }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const response = await fetchMyRoutes(token);
        setRoutes(response.data.routes || []);
      } catch (error) {
        console.error('Error fetching routes:', error);
        setError('Error fetching routes: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRoutes();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <CompanySideNav />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your routes...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <CompanySideNav />
        <main className="flex-1 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <FaInfoCircle className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <CompanySideNav />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Routes</h1>
          <p className="text-gray-600">View and manage your assigned collection routes</p>
        </div>

        {/* Route Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaRoute className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Routes</p>
                <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaMapMarkerAlt className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">
                  {routes.reduce((total, route) => total + (route.coordinates?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaCalendar className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Routes</p>
                <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Routes List */}
        {routes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="mb-4">
              <FaRoute className="text-gray-400 text-6xl mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Routes Assigned</h3>
            <p className="text-gray-500 mb-4">
              You don't have any routes assigned to your company yet.
            </p>
            <p className="text-gray-400 text-sm">
              Contact an administrator to get routes assigned for your collection areas.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {routes.map((route, index) => (
              <div key={route.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {route.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendar className="mr-1" />
                        Created: {new Date(route.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <FaRoute className="mr-1" />
                        Active
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaMapMarkerAlt className="mr-2" />
                      Route Coordinates ({route.coordinates?.length || 0} points)
                    </h4>
                    <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {route.coordinates && route.coordinates.map((coord, idx) => (
                          <div key={idx} className="text-xs text-gray-600 bg-white px-2 py-1 rounded border">
                            <span className="font-medium">Point {idx + 1}:</span>
                            <br />
                            <span className="font-mono">
                              {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Route ID: #{route.id}
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                      View on Map →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRoutes; 