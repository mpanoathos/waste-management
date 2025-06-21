import React, { useEffect, useState } from 'react';
import AdminSideNav from './SideNav/adminSideNav';
import { FaTrash, FaUsers, FaBoxOpen, FaHistory, FaChartPie, FaUserTie, FaDownload, FaFilePdf } from 'react-icons/fa';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const statusColors = {
  FULL: 'bg-red-100 text-red-700',
  PARTIAL: 'bg-yellow-100 text-yellow-700',
  EMPTY: 'bg-green-100 text-green-700',
};

const pdfStyles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 16 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: 'bold' },
  statValue: { fontSize: 12 },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', marginBottom: 12 },
  tableRow: { flexDirection: 'row' },
  tableHeader: { backgroundColor: '#f0f0f0' },
  tableCell: { padding: 5, borderWidth: 1, borderColor: '#bfbfbf', fontSize: 10 },
  headerCell: { fontWeight: 'bold' },
});

const AnalyticsPDF = ({ report }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.title}>Admin Analytics Report</Text>
      {/* Key Stats */}
      <View style={pdfStyles.section}>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>Total Bins:</Text><Text style={pdfStyles.statValue}>{report.totalBins}</Text></View>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>Total Collections:</Text><Text style={pdfStyles.statValue}>{report.totalCollections}</Text></View>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>Collections Last 7 Days:</Text><Text style={pdfStyles.statValue}>{report.collectionsLast7Days}</Text></View>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>Total Users:</Text><Text style={pdfStyles.statValue}>{report.totalUsers}</Text></View>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>New Users This Month:</Text><Text style={pdfStyles.statValue}>{report.usersThisMonth}</Text></View>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>Average Fill Level:</Text><Text style={pdfStyles.statValue}>{report.avgFillLevel ? report.avgFillLevel.toFixed(1) : 0}%</Text></View>
      </View>
      {/* Bins by Status */}
      <Text style={{ fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Bins by Status</Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '50%' }]}>Status</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '50%' }]}>Count</Text>
        </View>
        {report.binsByStatus && report.binsByStatus.map((b) => (
          <View key={b.status} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: '50%' }]}>{b.status}</Text>
            <Text style={[pdfStyles.tableCell, { width: '50%' }]}>{b._count?.status || 0}</Text>
          </View>
        ))}
      </View>
      {/* Users by Role */}
      <Text style={{ fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Users by Role</Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '50%' }]}>Role</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '50%' }]}>Count</Text>
        </View>
        {report.usersByRole && report.usersByRole.map((r) => (
          <View key={r.role} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: '50%' }]}>{r.role}</Text>
            <Text style={[pdfStyles.tableCell, { width: '50%' }]}>{r._count?.role || 0}</Text>
          </View>
        ))}
      </View>
      {/* Most Active Collector */}
      <Text style={{ fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Most Active Collector</Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '40%' }]}>Name</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '40%' }]}>Email</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '20%' }]}>Collections</Text>
        </View>
        <View style={pdfStyles.tableRow}>
          <Text style={[pdfStyles.tableCell, { width: '40%' }]}>{report.mostActiveCollector ? report.mostActiveCollector.name : 'N/A'}</Text>
          <Text style={[pdfStyles.tableCell, { width: '40%' }]}>{report.mostActiveCollector ? report.mostActiveCollector.email : 'N/A'}</Text>
          <Text style={[pdfStyles.tableCell, { width: '20%' }]}>{report.mostActiveCollector ? report.mostActiveCollector.collections : 0}</Text>
        </View>
      </View>
      {/* Recent Collections */}
      <Text style={{ fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Recent Collections</Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '25%' }]}>Bin ID</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '45%' }]}>Collected By</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '30%' }]}>Date & Time</Text>
        </View>
        {report.recentCollections && report.recentCollections.map((rc) => (
          <View key={rc.id} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: '25%' }]}>{`#${rc.binId}`}</Text>
            <Text style={[pdfStyles.tableCell, { width: '45%' }]}>{rc.collectedBy?.name || 'Unknown'}</Text>
            <Text style={[pdfStyles.tableCell, { width: '30%' }]}>{new Date(rc.collectedAt).toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const Analytics = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/analytics/report')
      .then(res => res.json())
      .then(data => {
        // Ensure all required arrays exist with default values
        const safeData = {
          totalBins: data.totalBins || 0,
          totalCollections: data.totalCollections || 0,
          collectionsLast7Days: data.collectionsLast7Days || 0,
          totalUsers: data.totalUsers || 0,
          usersThisMonth: data.usersThisMonth || 0,
          avgFillLevel: data.avgFillLevel || 0,
          binsByStatus: data.binsByStatus || [],
          usersByRole: data.usersByRole || [],
          recentCollections: data.recentCollections || [],
          mostActiveCollector: data.mostActiveCollector || null
        };
        setReport(safeData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Analytics fetch error:', err);
        setError('Failed to fetch analytics report');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex h-screen"><AdminSideNav /><div className="flex-1 flex items-center justify-center text-lg">Loading analytics...</div></div>;
  if (error) return <div className="flex h-screen"><AdminSideNav /><div className="flex-1 flex items-center justify-center text-red-600 text-lg">{error}</div></div>;
  if (!report) return <div className="flex h-screen"><AdminSideNav /><div className="flex-1 flex items-center justify-center text-lg">No analytics data available.</div></div>;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-50">
      <AdminSideNav />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Analytics Dashboard</h1>
            <div className="flex gap-2">
              <PDFDownloadLink document={<AnalyticsPDF report={report} />} fileName="analytics_report.pdf" className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition-all duration-200">
                {({ loading }) => (<><FaFilePdf className="mr-2" />{loading ? 'Generating...' : 'Download PDF'}</>)}
              </PDFDownloadLink>
            </div>
          </div>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
              <FaBoxOpen className="text-3xl text-blue-500" />
              <div>
                <p className="text-gray-500 text-sm">Total Bins</p>
                <p className="text-2xl font-bold text-gray-800">{report.totalBins}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
              <FaHistory className="text-3xl text-green-500" />
              <div>
                <p className="text-gray-500 text-sm">Total Collections</p>
                <p className="text-2xl font-bold text-gray-800">{report.totalCollections}</p>
                <p className="text-xs text-gray-500 mt-1">Last 7 days: <span className="font-semibold text-gray-700">{report.collectionsLast7Days}</span></p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
              <FaUsers className="text-3xl text-purple-500" />
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{report.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">New this month: <span className="font-semibold text-gray-700">{report.usersThisMonth}</span></p>
              </div>
            </div>
          </div>

          {/* More Specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Bins by Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><FaChartPie className="mr-2 text-blue-400" />Bins by Status</h2>
              <ul className="space-y-2">
                {report.binsByStatus && report.binsByStatus.length > 0 ? (
                  report.binsByStatus.map((b) => (
                    <li key={b.status} className={`flex items-center justify-between px-4 py-2 rounded ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
                      <span className="font-medium">{b.status}</span>
                      <span className="font-bold">{b._count?.status || 0}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-center py-2">No bin status data available</li>
                )}
              </ul>
            </div>
            {/* Users by Role */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><FaUserTie className="mr-2 text-purple-400" />Users by Role</h2>
              <ul className="space-y-2">
                {report.usersByRole && report.usersByRole.length > 0 ? (
                  report.usersByRole.map((r) => (
                    <li key={r.role} className="flex items-center justify-between px-4 py-2 rounded bg-gray-100 text-gray-700">
                      <span className="font-medium">{r.role}</span>
                      <span className="font-bold">{r._count?.role || 0}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-center py-2">No user role data available</li>
                )}
              </ul>
            </div>
          </div>

          {/* Average Fill Level & Most Active Collector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><FaBoxOpen className="mr-2 text-blue-400" />Average Bin Fill Level</h2>
              <span className="text-3xl font-bold text-blue-700">{report.avgFillLevel ? report.avgFillLevel.toFixed(1) : 0}%</span>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><FaUsers className="mr-2 text-green-400" />Most Active Collector</h2>
              {report.mostActiveCollector ? (
                <div>
                  <p className="font-bold text-lg text-gray-800">{report.mostActiveCollector.name}</p>
                  <p className="text-gray-600 text-sm">{report.mostActiveCollector.email}</p>
                  <p className="text-gray-700 mt-1">Collections: <span className="font-semibold">{report.mostActiveCollector.collections}</span></p>
                </div>
              ) : (
                <p className="text-gray-500">No collections yet.</p>
              )}
            </div>
          </div>

          {/* Recent Collections Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center"><FaHistory className="mr-2 text-lg text-green-500" />Recent Collections</h2>
            {report.recentCollections && report.recentCollections.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bin ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.recentCollections.map(rc => (
                      <tr key={rc.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">#{rc.binId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{rc.collectedBy?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{new Date(rc.collectedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent collections found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 