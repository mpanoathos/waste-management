import React, { useState, useEffect } from 'react';
import AdminSideNav from './SideNav/adminSideNav';
import { fetchCompanyAlerts, resolveAlert } from '../utils/api';

const AdminDashboard = () => {
    const [pendingCompanies, setPendingCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alerts, setAlerts] = useState([]);
    const [alertsLoading, setAlertsLoading] = useState(true);
    const [resolvingAlertId, setResolvingAlertId] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchPendingCompanies();
        fetchAlerts();
    }, []);

    const fetchPendingCompanies = async () => {
        try {
            const response = await fetch('http://localhost:5000/admin/pending-companies', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setPendingCompanies(data);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to fetch pending companies' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error fetching pending companies' });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAlerts = async () => {
        setAlertsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const data = await fetchCompanyAlerts(token);
            setAlerts(data.alerts || []);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error fetching alerts' });
        } finally {
            setAlertsLoading(false);
        }
    };

    const handleApproveCompany = async (companyId) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/approve-company/${companyId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (response.ok) {
                setMessage({ type: 'success', text: 'Company approved successfully' });
                // Remove the approved company from the list
                setPendingCompanies(prev => prev.filter(company => company.id !== companyId));
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to approve company' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error approving company' });
        }
    };

    const handleResolveAlert = async (alertId) => {
        setResolvingAlertId(alertId);
        try {
            const token = localStorage.getItem('token');
            await resolveAlert(token, alertId);
            setMessage({ type: 'success', text: 'Alert resolved' });
            setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a));
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to resolve alert' });
        } finally {
            setResolvingAlertId(null);
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-50">
            <AdminSideNav />
            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
                    
                    {message && (
                        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                             onClick={() => setMessage(null)}
                             style={{ cursor: 'pointer', minWidth: 250, textAlign: 'center' }}>
                            {message.text} <span className="ml-2 text-xs">(Click to dismiss)</span>
                        </div>
                    )}
                    
                    {/* Pending Companies Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-200 hover:shadow-lg">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Pending Company Approvals</h2>
                        
                        {isLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
                            </div>
                        ) : pendingCompanies.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No pending companies to approve</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Company Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Registration Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {pendingCompanies.map((company) => (
                                            <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-800">
                                                        {company.companyName || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {company.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(company.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleApproveCompany(company.id)}
                                                        className="text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow"
                                                    >
                                                        Approve
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Alerts Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-200 hover:shadow-lg">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Urgent Bin Alerts</h2>
                        {alertsLoading ? (
                            <div className="flex justify-center items-center h-24">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            </div>
                        ) : alerts.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No urgent alerts</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bin</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {alerts.sort((a, b) => (b.priority === 'URGENT') - (a.priority === 'URGENT') || new Date(b.createdAt) - new Date(a.createdAt)).map(alert => (
                                            <tr key={alert.id} className={alert.priority === 'URGENT' ? 'bg-red-50' : ''}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-800">{alert.bin ? `#${alert.bin.id}` : '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-700">{alert.message}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${alert.priority === 'URGENT' ? 'bg-red-200 text-red-800' : 'bg-yellow-100 text-yellow-700'}`}>{alert.priority}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${alert.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{alert.status}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{new Date(alert.createdAt).toLocaleString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {alert.status !== 'RESOLVED' && (
                                                        <button
                                                            onClick={() => handleResolveAlert(alert.id)}
                                                            disabled={resolvingAlertId === alert.id}
                                                            className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
                                                        >
                                                            {resolvingAlertId === alert.id ? 'Resolving...' : 'Mark as Resolved'}
                                                        </button>
                                                    )}
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
    );
};

export default AdminDashboard;