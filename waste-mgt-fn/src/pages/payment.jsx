import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import SideNav from './SideNav/SideNav';
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
});

// PDF Document Component
const PaymentHistoryPDF = ({ payments }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Payment History Report</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerCell, { width: '30%' }]}>Date</Text>
          <Text style={[styles.tableCell, styles.headerCell, { width: '30%' }]}>Amount</Text>
          <Text style={[styles.tableCell, styles.headerCell, { width: '40%' }]}>Status</Text>
        </View>
        {payments.map((payment) => (
          <View key={payment.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '30%' }]}>
              {new Date(payment.createdAt).toLocaleDateString()}
            </Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>
              RWF {payment.amount.toFixed(2)}
            </Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>
              {payment.status}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const InvoicePDF = ({ invoice }) => (
    <Document>
        <Page style={pdfStyles.body}>
            {/* Header with logo and business name */}
            <View style={pdfStyles.header}>
                <View style={pdfStyles.logoBox}>
                    {/* Replace with your logo if you have one */}
                    <Text style={pdfStyles.logo}>WMG</Text>
                </View>
                <Text style={pdfStyles.businessName}>Waste Management Group</Text>
            </View>
            <Text style={pdfStyles.invoiceTitle}>INVOICE</Text>
            <View style={pdfStyles.sectionRow}>
                <View style={pdfStyles.sectionCol}>
                    <Text style={pdfStyles.label}>Invoice Date:</Text>
                    <Text>{invoice.date}</Text>
                </View>
                <View style={pdfStyles.sectionCol}>
                    <Text style={pdfStyles.label}>Reference:</Text>
                    <Text>{invoice.referenceId}</Text>
                </View>
            </View>
            <View style={pdfStyles.section}>
                <Text style={pdfStyles.label}>Billed To:</Text>
                <Text>{invoice.recipient || 'Customer'}</Text>
            </View>
            <View style={pdfStyles.section}>
                <Text style={pdfStyles.label}>Amount Paid:</Text>
                <Text style={pdfStyles.amount}>RWF {invoice.amount}</Text>
            </View>
            <View style={pdfStyles.section}>
                <Text style={pdfStyles.label}>Payment Status:</Text>
                <Text>Paid</Text>
            </View>
            <View style={pdfStyles.thankYouBox}>
                <Text style={pdfStyles.thankYou}>Thank you for your payment!</Text>
            </View>
        </Page>
    </Document>
);

const pdfStyles = StyleSheet.create({
    body: { padding: 32, fontFamily: 'Helvetica' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    logoBox: { width: 48, height: 48, backgroundColor: '#2563eb', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    logo: { color: 'white', fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
    businessName: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
    invoiceTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 16, color: '#111827', letterSpacing: 2 },
    section: { marginVertical: 8 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
    sectionCol: { flexDirection: 'column', flex: 1 },
    label: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
    amount: { fontSize: 20, fontWeight: 'bold', color: '#16a34a', marginTop: 2 },
    thankYouBox: { marginTop: 32, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8 },
    thankYou: { textAlign: 'center', color: '#16a34a', fontSize: 16, fontWeight: 'bold' },
});

const Payment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [formData, setFormData] = useState({
        amount: '',
        phoneNumber: '',
        description: ''
    });
    const [redirectUrl, setRedirectUrl] = useState(null);
    const [showRedirectModal, setShowRedirectModal] = useState(false);
    const [showPaymentDone, setShowPaymentDone] = useState(false);
    const [processedNumber, setProcessedNumber] = useState("");
    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/payments/history', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPaymentHistory(response.data.payments);
        } catch (error) {
            toast.error('Failed to fetch payment history');
            console.error('Error fetching payment history:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setRedirectUrl(null);
        setShowRedirectModal(false);

        try {
            const response = await axios.post(
                'http://localhost:5000/api/payments/initiate',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            toast.success('Payment initiated successfully');
            setInvoiceData({
                amount: response.data.payment.amount,
                referenceId: response.data.payment.referenceId,
                date: new Date().toLocaleString(),
                recipient: user?.name || user?.email || 'Customer',
            });
            setShowInvoice(true);
            setShowPaymentDone(false);
            
            // Handle redirect URL if provided
            if (response.data.redirectUrl) {
                setRedirectUrl(response.data.redirectUrl);
                setShowRedirectModal(true);
            }
            
            setFormData({
                amount: '',
                phoneNumber: '',
                description: ''
            });
            fetchPaymentHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
            console.error('Payment error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedirectToPayment = () => {
        if (redirectUrl) {
            window.open(redirectUrl, '_blank');
            setShowRedirectModal(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS':
                return 'text-green-600';
            case 'FAILED':
                return 'text-red-600';
            case 'PENDING':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <SideNav />
            <div className="flex-1 overflow-auto">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-8">Payment</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Payment Form */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Make a Payment</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Amount (RWF)
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        placeholder="e.g., 250788123456"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Payment description"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {loading ? <LoadingSpinner size="small" /> : 'Pay Now'}
                                </button>
                            </form>
                        </div>

                        {/* Payment History */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Payment History</h2>
                                {paymentHistory.length > 0 && (
                                    <PDFDownloadLink
                                        document={<PaymentHistoryPDF payments={paymentHistory} />}
                                        fileName="payment-history.pdf"
                                        className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
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
                            {paymentHistory.length === 0 ? (
                                <p className="text-gray-500">No payment history available</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {paymentHistory.map((payment) => (
                                                <tr key={payment.id}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(payment.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        RWF {payment.amount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Redirect Modal */}
            {showRedirectModal && redirectUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Complete Your Payment</h3>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleRedirectToPayment}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Complete Payment
                            </button>
                            <button
                                onClick={() => setShowRedirectModal(false)}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            You can also copy and paste this URL: <br />
                            <span className="break-all">{redirectUrl}</span>
                        </p>
                    </div>
                </div>
            )}

            {showPaymentDone && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full mx-4 text-center animate-fade-in">
                        <div className="flex flex-col items-center justify-center">
                            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-4 animate-pop">
                                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-green-700">Payment Successful!</h3>
                            <p className="text-gray-600 mb-2">Your payment has been processed.</p>
                            <p className="text-gray-800 font-semibold mb-4">Number: {processedNumber}</p>
                            <button
                                onClick={() => setShowPaymentDone(false)}
                                className="mt-2 bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showInvoice && invoiceData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center animate-fade-in">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Payment Invoice</h2>
                        <div className="mb-4 text-left">
                            <p><span className="font-semibold">Reference:</span> {invoiceData.referenceId}</p>
                            <p><span className="font-semibold">Amount:</span> RWF {invoiceData.amount}</p>
                            <p><span className="font-semibold">Date:</span> {invoiceData.date}</p>
                        </div>
                        <PDFDownloadLink
                            document={<InvoicePDF invoice={invoiceData} />}
                            fileName={`invoice-${invoiceData.referenceId}.pdf`}
                            className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition mb-2"
                        >
                            {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
                        </PDFDownloadLink>
                        <button
                            onClick={() => setShowInvoice(false)}
                            className="mt-2 bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;