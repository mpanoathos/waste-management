import React, { useState, useEffect } from 'react';
import AdminSideNav from './SideNav/adminSideNav';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
    const [pendingCompanies, setPendingCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPendingCompanies();
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
                toast.error(data.message || 'Failed to fetch pending companies');
            }
        } catch (error) {
            toast.error('Error fetching pending companies');
        } finally {
            setIsLoading(false);
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
                toast.success('Company approved successfully');
                // Remove the approved company from the list
                setPendingCompanies(prev => prev.filter(company => company.id !== companyId));
            } else {
                toast.error(data.message || 'Failed to approve company');
            }
        } catch (error) {
            toast.error('Error approving company');
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-50">
            <AdminSideNav />
            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
                    
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
                </div>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default AdminDashboard;