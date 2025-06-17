import React from 'react';
import AdminSideNav from './SideNav/adminSideNav'
const AdminDashboard = () => {
    return (
        <div className="flex h-screen">
            <AdminSideNav />
            {/* <h1 className="text-2xl font-bold">Company Dashboard</h1>
            <p>Welcome to the company dashboard!</p> */}
        </div>
    );
};

export default AdminDashboard;