import { useEffect, useState } from 'react';
import CompanySideNav from "./SideNav/CompanySideNav";
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaDownload } from 'react-icons/fa';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  summary: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 12,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  headerCell: {
    fontWeight: 'bold',
  },
  dateCell: {
    width: '20%',
  },
  customerCell: {
    width: '25%',
  },
  locationCell: {
    width: '25%',
  },
  binCell: {
    width: '15%',
  },
  notesCell: {
    width: '15%',
  },
});

// PDF Document Component
const CollectionHistoryPDF = ({ history, summary }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Company Collection History Report</Text>
      
      {/* Summary Section */}
      <View style={styles.summary}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Collections:</Text>
          <Text style={styles.summaryValue}>{summary.totalCollections || 0}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Unique Users:</Text>
          <Text style={styles.summaryValue}>{summary.totalUsers || 0}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service Areas:</Text>
          <Text style={styles.summaryValue}>{summary.totalLocations || 0}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>This Month:</Text>
          <Text style={styles.summaryValue}>{summary.thisMonth || 0}</Text>
        </View>
      </View>

      {/* Collection History Table */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Collection Records</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerCell, styles.dateCell]}>Date & Time</Text>
          <Text style={[styles.tableCell, styles.headerCell, styles.customerCell]}>Customer</Text>
          <Text style={[styles.tableCell, styles.headerCell, styles.locationCell]}>Location</Text>
          <Text style={[styles.tableCell, styles.headerCell, styles.binCell]}>Bin ID</Text>
          <Text style={[styles.tableCell, styles.headerCell, styles.notesCell]}>Notes</Text>
        </View>
        {history.map((record) => (
          <View key={record.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.dateCell]}>
              {new Date(record.collectedAt).toLocaleDateString()}
            </Text>
            <Text style={[styles.tableCell, styles.customerCell]}>
              {record.bin.user.name}
            </Text>
            <Text style={[styles.tableCell, styles.locationCell]}>
              {record.bin.location}
            </Text>
            <Text style={[styles.tableCell, styles.binCell]}>
              Bin #{record.bin.id}
            </Text>
            <Text style={[styles.tableCell, styles.notesCell]}>
              {record.notes || '-'}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const CompanyCollectionHistory = () => {
    const [history, setHistory] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollectionHistory();
    }, []);

    const fetchCollectionHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/user/company-collection-history', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch collection history');
            }

            const data = await response.json();
            setHistory(data.history);
            setSummary(data.summary);
        } catch (error) {
            console.error('Error fetching collection history:', error);
            toast.error('Failed to load collection history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100">
                <CompanySideNav />
                <div className="p-6 overflow-auto w-full flex items-center justify-center">
                    <LoadingSpinner size="large" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <CompanySideNav />
            <div className="p-6 overflow-auto w-full">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Collection History</h1>
                                <p className="text-gray-600 mt-2">View all collections performed by your company</p>
                            </div>
                            {history.length > 0 && (
                                <PDFDownloadLink
                                    document={<CollectionHistoryPDF history={history} summary={summary} />}
                                    fileName="company-collection-history.pdf"
                                    className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    {({ loading }) => (
                                        <>
                                            <FaDownload className="mr-2" />
                                            {loading ? 'Generating...' : 'Download PDF'}
                                        </>
                                    )}
                                </PDFDownloadLink>
                            )}
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Collections</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.totalCollections || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Unique Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.totalUsers || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Service Areas</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.totalLocations || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.thisMonth || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Collection History Table */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Collection Records</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bin ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(record.collectedAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    <div className="font-medium">{record.bin.user.name}</div>
                                                    <div className="text-gray-500">{record.bin.user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    <div>{record.bin.location}</div>
                                                    {record.bin.user.address && (
                                                        <div className="text-gray-500 text-xs">{record.bin.user.address}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                Bin #{record.bin.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {record.notes || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                                                No collection history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyCollectionHistory; 