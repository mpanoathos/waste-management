import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CompanySideNav from './SideNav/CompanySideNav';
import LoadingSpinner from '../components/LoadingSpinner';
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

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    dailyCollections: [],
    binStatus: {},
    collectionEfficiency: 0,
    totalWasteCollected: 0,
    averageCollectionTime: 0,
    routeEfficiency: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/analytics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAnalyticsData(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
    labels: ['Empty', 'Half Full', 'Full', 'Collected'],
    datasets: [
      {
        data: [
          analyticsData.binStatus.EMPTY || 0,
          analyticsData.binStatus.HALF_FULL || 0,
          analyticsData.binStatus.FULL || 0,
          analyticsData.binStatus.COLLECTED || 0,
        ],
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
          'rgb(156, 163, 175)',
        ],
      },
    ],
  };

  const routeEfficiencyData = {
    labels: analyticsData.routeEfficiency.map(route => route.name),
    datasets: [
      {
        label: 'Route Efficiency Score',
        data: analyticsData.routeEfficiency.map(route => route.efficiency),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <CompanySideNav />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-600">Collection Efficiency</h3>
                <p className="text-3xl font-bold text-blue-600">{analyticsData.collectionEfficiency}%</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-600">Total Waste Collected</h3>
                <p className="text-3xl font-bold text-green-600">{analyticsData.totalWasteCollected} tons</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-600">Avg. Collection Time</h3>
                <p className="text-3xl font-bold text-purple-600">{analyticsData.averageCollectionTime} min</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-600">Active Routes</h3>
                <p className="text-3xl font-bold text-orange-600">{analyticsData.routeEfficiency.length}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Collections</h3>
                <Line data={dailyCollectionsData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bin Status Distribution</h3>
                <Pie data={binStatusData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Route Efficiency</h3>
                <Bar data={routeEfficiencyData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics; 