import React, { useState, useEffect } from 'react';
import AdminSideNav from './SideNav/adminSideNav';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaSpinner, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEye } from 'react-icons/fa';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // PENDING, APPROVED, REJECTED, ALL
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/user/companies', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }

            const data = await response.json();
            setCompanies(data.companies);
        } catch (error) {
            toast.error(error.message || 'Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (userId, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/user/approve-company', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    userId, 
                    status,
                    ...(status === 'REJECTED' && { reason: rejectionReason })
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update company status');
            }

            toast.success(`Company ${status.toLowerCase()} successfully`);
            setShowConfirmationModal(false);
            setRejectionReason('');
            fetchCompanies(); // Refresh the list
        } catch (error) {
            toast.error(error.message || 'Failed to update company status');
        }
    };

    const openConfirmationModal = (company, action) => {
        setSelectedCompany(company);
        setActionType(action);
        setShowConfirmationModal(true);
    };

    const openDetailsModal = (company) => {
        setSelectedCompany(company);
        setShowDetailsModal(true);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen">
                <AdminSideNav />
                <div className="flex-1 p-6 bg-gray-100">
                    <div className="flex items-center justify-center h-full">
                        <FaSpinner className="animate-spin text-4xl text-blue-600" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <AdminSideNav />
            <div className="flex-1 p-6 bg-gray-100 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Company Management</h1>
                        <p className="text-gray-600 mt-2">Manage company registrations and approvals</p>
                    </div>

                    {/* Filter Buttons */}
                    <div className="mb-6 flex space-x-4">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-4 py-2 rounded-lg ${
                                filter === 'ALL'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            All Companies
                        </button>
                        <button
                            onClick={() => setFilter('PENDING')}
                            className={`px-4 py-2 rounded-lg ${
                                filter === 'PENDING'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('APPROVED')}
                            className={`px-4 py-2 rounded-lg ${
                                filter === 'APPROVED'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setFilter('REJECTED')}
                            className={`px-4 py-2 rounded-lg ${
                                filter === 'REJECTED'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Rejected
                        </button>
                    </div>

                    {/* Companies List */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Company Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {companies
                                        .filter(company => filter === 'ALL' || company.approvalStatus === filter)
                                        .map((company) => (
                                            <tr key={company.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <FaBuilding className="h-6 w-6 text-blue-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {company.companyName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {company.companyType}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="flex items-center mb-1">
                                                            <FaEnvelope className="h-4 w-4 text-gray-400 mr-2" />
                                                            {company.email}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <FaPhone className="h-4 w-4 text-gray-400 mr-2" />
                                                            {company.phoneNumber || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="flex items-center">
                                                            <FaMapMarkerAlt className="h-4 w-4 text-gray-400 mr-2" />
                                                            {company.address || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(company.approvalStatus)}`}>
                                                        {company.approvalStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => openDetailsModal(company)}
                                                            className="text-blue-600 hover:text-blue-900 flex items-center"
                                                        >
                                                            <FaEye className="mr-1" /> View
                                                        </button>
                                                        {company.approvalStatus === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    onClick={() => openConfirmationModal(company, 'APPROVED')}
                                                                    className="text-green-600 hover:text-green-900 flex items-center"
                                                                >
                                                                    <FaCheck className="mr-1" /> Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => openConfirmationModal(company, 'REJECTED')}
                                                                    className="text-red-600 hover:text-red-900 flex items-center"
                                                                >
                                                                    <FaTimes className="mr-1" /> Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmationModal && selectedCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">
                            {actionType === 'APPROVED' ? 'Approve Company' : 'Reject Company'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to {actionType.toLowerCase()} {selectedCompany.companyName}?
                        </p>
                        {actionType === 'REJECTED' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Rejection
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Enter reason for rejection..."
                                    required
                                />
                            </div>
                        )}
                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleApproval(selectedCompany.id, actionType)}
                                className={`flex-1 py-2 px-4 rounded-lg text-white ${
                                    actionType === 'APPROVED'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                                disabled={actionType === 'REJECTED' && !rejectionReason}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmationModal(false);
                                    setRejectionReason('');
                                }}
                                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Company Details Modal */}
            {showDetailsModal && selectedCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold">Company Details</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Basic Information</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Name:</span> {selectedCompany.companyName}</p>
                                    <p><span className="font-medium">Type:</span> {selectedCompany.companyType}</p>
                                    <p><span className="font-medium">Status:</span> 
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedCompany.approvalStatus)}`}>
                                            {selectedCompany.approvalStatus}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Email:</span> {selectedCompany.email}</p>
                                    <p><span className="font-medium">Phone:</span> {selectedCompany.phoneNumber || 'N/A'}</p>
                                    <p><span className="font-medium">Address:</span> {selectedCompany.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        {selectedCompany.approvalStatus === 'REJECTED' && selectedCompany.rejectionReason && (
                            <div className="mt-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Rejection Reason</h4>
                                <p className="text-gray-600">{selectedCompany.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyManagement; 