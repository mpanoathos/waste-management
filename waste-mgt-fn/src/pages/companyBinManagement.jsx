import { useEffect, useState } from 'react';
import CompanySideNav from "./SideNav/CompanySideNav";
import { toast } from 'react-toastify';
import { fetchUsers, collectBin } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const BinManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collecting, setCollecting] = useState(false);

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                setLoading(true);
                const data = await fetchUsers();
                setUsers(
                    Array.isArray(data.users)
                        ? data.users.map(user => ({
                            id: user.id || user._id,
                            name: user.name,
                            email: user.email,
                            binStatus: user.binStatus 
                        }))
                        : []
                );
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Failed to load users. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllUsers();
    }, []);

    // Handle collected function
    const handleCollected = async (userId) => {
        try {
            setCollecting(true);
            await collectBin(userId);

            // Update local state to reflect collected status
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, binStatus: 'EMPTY' } : user
                )
            );
            toast.success('Bin marked as collected successfully');
        } catch (error) {
            console.error('Error marking as collected:', error);
            toast.error('Failed to mark bin as collected. Please try again.');
        } finally {
            setCollecting(false);
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">User Bin Management</h1>
                    <div className="text-sm text-gray-500">
                        Total Users: {users.length}
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bin Status</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                user.binStatus === 'FULL'
                                                    ? 'bg-red-100 text-red-700'
                                                    : user.binStatus === 'PARTIAL'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}
                                        >
                                            {user.binStatus}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleCollected(user.id)}
                                            disabled={user.binStatus !== 'FULL' || collecting}
                                            className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                                                user.binStatus === 'FULL' && !collecting
                                                    ? 'bg-blue-500 hover:bg-blue-600'
                                                    : 'bg-gray-300 cursor-not-allowed'
                                            }`}
                                        >
                                            {collecting ? (
                                                <LoadingSpinner size="small" />
                                            ) : user.binStatus === 'FULL' ? (
                                                'Collect'
                                            ) : (
                                                'Collected'
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BinManagement;
