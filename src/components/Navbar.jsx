import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-green-700 text-white p-4 flex justify-between">
    <h1 className="font-bold">Smart Waste</h1>
    <div className="space-x-4">
      <Link to="/">Dashboard</Link>
      <Link to="/bins">Bins</Link>
      <Link to="/payments">Payments</Link>
      <Link to="/profile">Profile</Link>
    </div>
  </nav>
);

export default Navbar;
