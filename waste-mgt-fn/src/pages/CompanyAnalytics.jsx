import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import CompanySideNav from './SideNav/CompanySideNav';
import { toast } from 'react-toastify';

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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <span className="text-4xl font-bold text-blue-700">{analytics.totalBins}</span>
                <span className="text-gray-600 mt-2">Total Bins Managed</span>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <span className="text-4xl font-bold text-green-700">{analytics.totalCollections}</span>
                <span className="text-gray-600 mt-2">Total Collections</span>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <span className="text-4xl font-bold text-yellow-700">{analytics.binsByStatus?.map(s => s._count.status).reduce((a, b) => a + b, 0)}</span>
                <span className="text-gray-600 mt-2">Bins (by Status)</span>
                <ul className="mt-2 text-sm">
                  {analytics.binsByStatus?.map(s => (
                    <li key={s.status}>
                      <span className="font-semibold">{s.status}:</span> {s._count.status}
                    </li>
                  ))}
                </ul>
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