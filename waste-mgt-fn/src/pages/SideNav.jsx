import React from 'react';
import { FaUser, FaClock, FaCreditCard, FaTrash,FaSignOutAlt } from 'react-icons/fa';

const SideNav = () => {
  return (
    <div className="w-64 h-screen bg-blue-500 text-white flex flex-col">
      <div className="p-4 text-center border-b border-gray-700">
        <h2 className="text-xl font-bold">Waste Management</h2>
      </div>
      <ul className="flex flex-col mt-4 space-y-2">
      <li>
          <a
            href="/dashboard"
            className="flex items-center px-4 py-2 hover:bg-gray-700 rounded transition"
          >
            <FaTrash className="h-5 w-5 mr-3" />
            Bin Status
          </a>
        </li>
        <li>
          <a
            href="/collection-history"
            className="flex items-center px-4 py-2 hover:bg-gray-700 rounded transition"
          >
            <FaClock className="h-5 w-5 mr-3" />
            Collection History
          </a>
        </li>
        <li>
          <a
            href="/payments"
            className="flex items-center px-4 py-2 hover:bg-gray-700 rounded transition"
          >
            <FaCreditCard className="h-5 w-5 mr-3" />
            Payments
          </a>
        </li>
        <li>
          <button
            onClick={() => {
              localStorage.removeItem('token'); // Clear token
              window.location.href = '/'; // Redirect to login
            }}
            className="flex items-center px-4 py-2 hover:bg-gray-700 rounded transition w-full text-left"
          // className='flex items-center px-4 py-2 hover:bg-gray-700 rounded transition'
          >
            <FaSignOutAlt className="h-5 w-5 mr-3" />  
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default SideNav;
