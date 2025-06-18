import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import SideNav from './SideNav/SideNav';
import api from '../utils/api';
import { FaFilePdf } from 'react-icons/fa';
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
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
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
    fontSize: 8,
  },
  headerCell: {
    fontWeight: 'bold',
  },
});

// PDF Document Component
const CollectionHistoryPDF = ({ history }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Collection History Report</Text>
      <Text style={styles.subtitle}>
        Generated on: {new Date().toLocaleString()} | Total Collections: {history.length}
      </Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerCell, { width: '25%' }]}>Date & Time</Text>
          <Text style={[styles.tableCell, styles.headerCell, { width: '15%' }]}>Bin ID</Text>
          <Text style={[styles.tableCell, styles.headerCell, { width: '25%' }]}>Collected By</Text>
          <Text style={[styles.tableCell, styles.headerCell, { width: '20%' }]}>Location</Text>
          <Text style={[styles.tableCell, styles.headerCell, { width: '15%' }]}>Notes</Text>
        </View>
        {history.map((record) => (
          <View key={record.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '25%' }]}>
              {new Date(record.collectedAt).toLocaleString()}
            </Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>
              Bin #{record.bin.id}
            </Text>
            <Text style={[styles.tableCell, { width: '25%' }]}>
              {record.collectedBy.name}
            </Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {record.bin.location}
            </Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>
              {record.notes || '-'}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const CollectionHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await api.get('/user/collection-history');
                setHistory(response.data.history);
            } catch (error) {
                console.error('Error fetching collection history:', error);
                toast.error('Failed to load collection history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100">
                <SideNav />
                <div className="p-6 overflow-auto w-full flex items-center justify-center">
                    <LoadingSpinner size="large" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <SideNav />
            <div className="p-6 overflow-auto w-full">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Collection History</h1>
                                <p className="text-gray-600 mt-2">View your waste collection records</p>
                            </div>
                            <div className="flex space-x-3">
                                {history.length > 0 && (
                                    <PDFDownloadLink
                                        document={<CollectionHistoryPDF history={history} />}
                                        fileName={`collection-history-${new Date().toISOString().split('T')[0]}.pdf`}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        {({ loading }) => (
                                            <>
                                                <FaFilePdf className="mr-2" />
                                                {loading ? 'Generating...' : 'Download PDF'}
                                            </>
                                        )}
                                    </PDFDownloadLink>
                                )}
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bin ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected By</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(record.collectedAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                Bin #{record.bin.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    <div className="font-medium">{record.collectedBy.name}</div>
                                                    <div className="text-gray-500">{record.collectedBy.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    <div>{record.bin.location}</div>
                                                </div>
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

export default CollectionHistory;