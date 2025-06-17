import React, { useState, useEffect } from 'react';
import UserSideNav from './SideNav/userSideNav';
import Chatbot from '../components/Chatbot';
import { FaUser, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/user/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen">
                <UserSideNav />
                <div className="flex-1 p-6 bg-gray-100">
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <UserSideNav />
            <div className="flex-1 p-6 bg-gray-100 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Profile Section */}
                        <div className="col-span-1">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
                                {user && (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <FaUser className="text-blue-600 text-xl" />
                                            <div>
                                                <p className="text-sm text-gray-500">Name</p>
                                                <p className="font-medium">{user.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <FaBuilding className="text-blue-600 text-xl" />
                                            <div>
                                                <p className="text-sm text-gray-500">Company</p>
                                                <p className="font-medium">{user.companyName || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <FaEnvelope className="text-blue-600 text-xl" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <FaPhone className="text-blue-600 text-xl" />
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="font-medium">{user.phoneNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <FaMapMarkerAlt className="text-blue-600 text-xl" />
                                            <div>
                                                <p className="text-sm text-gray-500">Address</p>
                                                <p className="font-medium">{user.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chatbot Section */}
                        <div className="col-span-1">
                            <Chatbot />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard; 