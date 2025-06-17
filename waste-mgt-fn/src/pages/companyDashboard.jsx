import React from 'react';
import CompanySideNav from './SideNav/CompanySideNav';
const CompanyDashboard = () => {
    return (
        <div className="flex h-screen">
            <CompanySideNav />
            {/* <h1 className="text-2xl font-bold">Company Dashboard</h1>
            <p>Welcome to the company dashboard!</p> */}
        </div>
    );
};

export default CompanyDashboard;