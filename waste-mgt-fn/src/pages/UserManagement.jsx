import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSideNav from './SideNav/adminSideNav';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [usersByRole, setUsersByRole] = useState({});
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/user/user-management', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setUsersByRole(response.data.usersByRole);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      if (error.response?.status === 403) {
        navigate('/admin-dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCompany = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/user/approve-company', 
        { userId, status: 'APPROVED' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error approving company:', error);
      setError('Failed to approve company');
    }
  };

  const handleRejectCompany = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/user/approve-company', 
        { userId, status: 'REJECTED' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting company:', error);
      setError('Failed to reject company');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/user/delete/${userToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      setError('Failed to delete user');
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const getFilteredUsers = () => {
    if (selectedRole === 'ALL') {
      return users.filter(user => user.role !== 'ADMIN');
    }
    return users.filter(user => user.role === selectedRole && user.role !== 'ADMIN');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      case 'COMPANY':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSideNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSideNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => navigate('/admin-dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSideNav />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-2 text-gray-600">Manage all users and their roles</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">{summary.users}</div>
              <div className="text-sm text-gray-600">Regular Users</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-red-600">{summary.admin}</div>
              <div className="text-sm text-gray-600">Admins</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">{summary.companies}</div>
              <div className="text-sm text-gray-600">Companies</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-yellow-600">{summary.pendingCompanies}</div>
              <div className="text-sm text-gray-600">Pending Approval</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Filter by Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
                <option value="COMPANY">Company</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Users ({getFilteredUsers().length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bins
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredUsers().map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === 'COMPANY' ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalStatusColor(user.approvalStatus)}`}>
                            {user.approvalStatus}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phoneNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.bins?.length || 0} bins
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.role === 'COMPANY' && user.approvalStatus === 'PENDING' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveCompany(user.id)}
                              className="text-green-600 hover:text-green-900 text-xs bg-green-100 px-2 py-1 rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectCompany(user.id)}
                              className="text-red-600 hover:text-red-900 text-xs bg-red-100 px-2 py-1 rounded"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => { setShowDeleteModal(true); setUserToDelete(user.id); }}
                          className="ml-2 text-white bg-red-600 hover:bg-red-700 text-xs px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 