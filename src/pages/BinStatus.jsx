import React, { useState, useEffect } from 'react';
import SideNav from './SideNav/SideNav';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { FaTrash, FaMapMarkerAlt, FaClock, FaExclamationTriangle, FaCheckCircle, FaHistory } from 'react-icons/fa';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const BinStatus = () => {
  const [bin, setBin] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBin = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/bin/user-bins', {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      if (!response.ok) throw new Error('Failed to fetch bin');
      const data = await response.json();
      if (data && data.length > 0) {
        const binData = data[0]; // Get the first (and only) bin
        setBin({
          id: binData.id,
          level: binData.latestFillLevel || binData.fillLevel,
          type: binData.type,
          location: binData.location,
          lastCollected: binData.lastCollected,
          status: binData.status || (binData.latestFillLevel > 75 ? 'FULL' : binData.latestFillLevel > 40 ? 'PARTIAL' : 'EMPTY')
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }
    fetchBin();

    // Listen for real-time sensor updates
    socket.on('sensorUpdate', (data) => {
      setBin(prev => {
        if (prev && prev.id === data.binId) {
          return {
            ...prev,
            level: data.fillLevel,
            status: data.fillLevel > 75 ? 'FULL' : data.fillLevel > 40 ? 'PARTIAL' : 'EMPTY'
          };
        }
        return prev;
      });
    });

    return () => {
      socket.off('sensorUpdate');
    };
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'FULL':
        return 'bg-red-100 text-red-700';
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-700';
      case 'EMPTY':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'FULL':
        return <FaExclamationTriangle className="text-red-600" />;
      case 'PARTIAL':
        return <FaClock className="text-yellow-600" />;
      case 'EMPTY':
        return <FaCheckCircle className="text-green-600" />;
      default:
        return <FaTrash className="text-gray-600" />;
    }
  };

  return (
    <div className="flex h-screen">
      <SideNav />
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Bin Status</h1>
            <p className="text-gray-600">Monitor your bin in real-time</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-4">{error}</div>
          ) : !bin ? (
            <div className="text-center text-gray-600 p-4">No bin found.</div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* Bin Status Card */}
              <div className="flex flex-col items-center mb-8">
                <div className="p-4 rounded-full bg-gray-50 mb-4">
                  {getStatusIcon(bin.status)}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Bin #{bin.id}</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(bin.status)}`}>
                  {bin.status}
                </span>
              </div>

              {/* Fill Level Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">Fill Level</h3>
                  <span className="text-lg font-bold text-gray-800">{bin.level}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
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

              {/* Bin Details */}
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaMapMarkerAlt className="text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-800">{bin.location}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaHistory className="text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Last Collection</p>
                    <p className="font-medium text-gray-800">
                      {bin.lastCollected
                        ? new Date(bin.lastCollected).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaTrash className="text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-800">{bin.type}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BinStatus; 