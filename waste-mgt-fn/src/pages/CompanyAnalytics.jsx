import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import CompanySideNav from './SideNav/CompanySideNav';
import { toast } from 'react-toastify';
import { Pie, Line, Bar } from 'react-chartjs-2';
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

const CompanyAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/analytics/company-analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Prepare bin status chart data robustly
  const binStatusMap = { EMPTY: 0, PARTIAL: 0, FULL: 0 };
  if (analytics?.binsByStatus && Array.isArray(analytics.binsByStatus)) {
    analytics.binsByStatus.forEach(s => {
      if (s.status && typeof s._count?.status === 'number') {
        binStatusMap[s.status] = s._count.status;
      }
    });
  }
  const binStatusLabels = ['EMPTY', 'PARTIAL', 'FULL'];
  const binStatusCounts = binStatusLabels.map(label => binStatusMap[label]);
  const binStatusData = {
    labels: binStatusLabels,
    datasets: [
      {
        data: binStatusCounts,
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
      },
    ],
  };

  // Mock daily collections for line chart (if not present)
  const dailyCollections = analytics?.dailyCollections || [
    { date: '2024-06-18', count: 2 },
    { date: '2024-06-19', count: 3 },
    { date: '2024-06-20', count: 1 },
    { date: '2024-06-21', count: 4 },
    { date: '2024-06-22', count: 2 },
    { date: '2024-06-23', count: 5 },
    { date: '2024-06-24', count: 3 },
  ];
  const dailyCollectionsData = {
    labels: dailyCollections.map(item => item.date),
    datasets: [
      {
        label: 'Collections per Day',
        data: dailyCollections.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // Mock route efficiency for bar chart (if not present)
  const routeEfficiency = analytics?.routeEfficiency || [
    { route: 'Route A', efficiency: 85 },
    { route: 'Route B', efficiency: 92 },
    { route: 'Route C', efficiency: 78 },
  ];
  const routeEfficiencyData = {
    labels: routeEfficiency.map(item => item.route),
    datasets: [
      {
        label: 'Route Efficiency',
        data: routeEfficiency.map(item => item.efficiency),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <CompanySideNav />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Company Analytics</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : analytics ? (
          <>
            {/* Visual Analytics Section (remove Bin Status Distribution) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <h2 className="font-semibold mb-2">Collections Over Time</h2>
                <Line data={dailyCollectionsData} />
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <h2 className="font-semibold mb-2">Route Efficiency</h2>
                <Bar data={routeEfficiencyData} />
              </div>
            </div>
            {/* Summary Cards (remove Bin Status card) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <span className="text-4xl font-bold text-blue-700">{analytics.totalBins}</span>
                <span className="text-gray-600 mt-2">Total Bins Managed</span>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <span className="text-4xl font-bold text-green-700">{analytics.totalCollections}</span>
                <span className="text-gray-600 mt-2">Total Collections</span>
              </div>
            </div>
            {/* Recent Collections Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Collections (Last 7 Days)</h2>
              {analytics.recentCollections?.length > 0 ? (
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 px-4">Bin ID</th>
                      <th className="py-2 px-4">Location</th>
                      <th className="py-2 px-4">Collected At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentCollections.map((col, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-4">{col.bin?.id}</td>
                        <td className="py-2 px-4">{col.bin?.location}</td>
                        <td className="py-2 px-4">{new Date(col.collectedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500">No recent collections.</div>
              )}
            </div>
          </>
        ) : (
          <div className="text-red-500">Failed to load analytics.</div>
        )}
      </div>
    </div>
  );
};

export default CompanyAnalytics; 