import React, { useState, useEffect } from 'react';
import CompanySideNav from './SideNav/CompanySideNav';
import { fetchCompanyPayments } from '../utils/api';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { FaCreditCard, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf' },
  tableRow: { flexDirection: 'row' },
  tableHeader: { backgroundColor: '#f0f0f0' },
  tableCell: { padding: 5, borderWidth: 1, borderColor: '#bfbfbf' },
  headerCell: { fontWeight: 'bold' },
});

const PaymentHistoryPDF = ({ payments }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Company Payment History Report</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerCell, { width: '25%' }]}>Date</Text>
          <Text style={[styles.tableCell, styles.headerCell, { width: '30%' }]}>Payer</Text>
          <Text style={[styles.tableCell, styles.headerCell, { width: '25%' }]}>Amount</Text>
          <Text style={[styles.tableCell, styles.headerCell, { width: '20%' }]}>Reference</Text>
        </View>
        {payments.map((payment) => (
          <View key={payment.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '25%' }]}>
              {new Date(payment.createdAt).toLocaleDateString()}
            </Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>
              {payment.user ? payment.user.name : 'Unknown User'}
            </Text>
            <Text style={[styles.tableCell, { width: '25%' }]}>
              RWF {payment.amount.toFixed(2)}
            </Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {payment.referenceId}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const CompanyPayments = () => {
  const [companyPayments, setCompanyPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', phoneNumber: '', description: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const payments = await fetchCompanyPayments();
      setCompanyPayments(payments);
    } catch (error) {
      toast.error('Failed to fetch company payments');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handlePaymentInputChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to initiate payment');
      toast.success('Payment initiated successfully');
      setShowPaymentModal(false);
      setPaymentForm({ amount: '', phoneNumber: '', description: '' });
      fetchPayments();
    } catch (error) {
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const filteredPayments = companyPayments.filter(payment => {
    const matchesSearch = searchTerm === '' ||
      (payment.referenceId && payment.referenceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.phoneNumber && payment.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.user && payment.user.name && payment.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.user && payment.user.email && payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="flex h-screen">
      <CompanySideNav />
      <div className="flex-1 p-6 bg-gray-100 relative overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Company Payments</h1>
          <p className="text-gray-600">View, filter, and manage all your company payments here.</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Search by Payer, Ref, or Phone"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-2 py-1 border rounded"
              />
              {companyPayments.length > 0 && (
                <PDFDownloadLink
                  document={<PaymentHistoryPDF payments={companyPayments} />}
                  fileName="company-payment-history.pdf"
                  className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 ml-2"
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
          {loadingPayments ? (
            <p className="text-gray-500">Loading payments...</p>
          ) : filteredPayments.length === 0 ? (
            <p className="text-gray-500">No payment history available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {payment.user ? (
                          <div>
                            <div className="font-medium">{payment.user.name}</div>
                            <div className="text-gray-500 text-xs">{payment.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unknown User</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">RWF {payment.amount.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{payment.referenceId}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{payment.phoneNumber || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{payment.updatedAt ? new Date(payment.updatedAt).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 underline cursor-pointer" onClick={() => setSelectedPayment(payment)}>
                        Details
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Payment Details Modal */}
          {selectedPayment && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Payment Details</h2>
                <ul className="mb-4">
                  <li><b>Date:</b> {new Date(selectedPayment.createdAt).toLocaleString()}</li>
                  <li><b>Payer:</b> {selectedPayment.user ? `${selectedPayment.user.name} (${selectedPayment.user.email})` : 'Unknown User'}</li>
                  <li><b>Amount:</b> RWF {selectedPayment.amount.toFixed(2)}</li>
                  <li><b>Reference ID:</b> {selectedPayment.referenceId}</li>
                  <li><b>Phone:</b> {selectedPayment.phoneNumber || '-'}</li>
                  <li><b>Updated:</b> {selectedPayment.updatedAt ? new Date(selectedPayment.updatedAt).toLocaleString() : '-'}</li>
                </ul>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyPayments; 