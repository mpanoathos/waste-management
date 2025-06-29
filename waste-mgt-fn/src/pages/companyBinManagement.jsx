import { useEffect, useState } from 'react';
import CompanySideNav from "./SideNav/CompanySideNav";
import { toast } from 'react-toastify';
import { fetchUsersForBinManagement, collectBin } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { io } from 'socket.io-client';

const BinManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collecting, setCollecting] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    // Initialize socket connection
    const socket = io('http://localhost:5000');

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                setLoading(true);
                const data = await fetchUsersForBinManagement();
                setUsers(
                    Array.isArray(data.users)
                        ? data.users.map(user => ({
                            id: user.id || user._id,
                            name: user.name,
                            email: user.email,
                            binId: user.binId,
                            binStatus: user.binStatus,
                            binFillLevel: user.binFillLevel,
                            binLocation: user.binLocation,
                            binType: user.binType
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

    // Socket connection status
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Socket connected for bin management');
            setSocketConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected from bin management');
            setSocketConnected(false);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [socket]);

    // Listen for real-time sensor updates
    useEffect(() => {
        socket.on('sensorUpdate', (data) => {
            console.log('Received sensor update in bin management:', data);
            
            // Update only the specific user whose bin was updated
            setUsers((prevUsers) =>
                prevUsers.map((user) => {
                    // Check if this user's bin matches the updated bin ID
                    if (user.binId === data.binId) {
                        const newFillLevel = data.fillLevel;
                        let newStatus = 'EMPTY';
                        if (newFillLevel >= 80) newStatus = 'FULL';
                        else if (newFillLevel >= 50) newStatus = 'PARTIAL';

                        console.log(`Updating user ${user.name} bin: ${newFillLevel}% - ${newStatus}`);
                        
                        // Show toast for significant updates
                        if (newFillLevel >= 80) {
                            toast.info(`${user.name}'s bin is now FULL (${newFillLevel}%)`, {
                                position: "top-right",
                                autoClose: 3000,
                            });
                        }
                        
                        return {
                            ...user,
                            binFillLevel: newFillLevel,
                            binStatus: newStatus
                        };
                    }
                    return user;
                })
            );
        });

        return () => {
            socket.off('sensorUpdate');
        };
    }, [socket]);

    // Handle collected function
    const handleCollected = async (userId) => {
        try {
            setCollecting(true);
            await collectBin(userId);

            // Don't update local state - keep the bin status as is so button remains available
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
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center text-sm ${socketConnected ? 'text-green-600' : 'text-red-600'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            {socketConnected ? 'Live Updates' : 'Disconnected'}
                        </div>
                        <div className="text-sm text-gray-500">
                            Total Users: {users.length}
                        </div>
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
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fill Level</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
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
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                                                        user.binFillLevel >= 80 ? 'bg-red-500' :
                                                        user.binFillLevel >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                    style={{ width: `${user.binFillLevel}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500 min-w-[2rem]">{user.binFillLevel}%</span>
                                            <div className="ml-1">
                                                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{user.binLocation}</td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{user.binType}</td>
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
                                                'Not Full'
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="py-8 text-center text-gray-500">
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
