import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import './index.css';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CompanyDashboard from './pages/companyDashboard';
import Profile from './pages/profile';
import CollectionHistory from './pages/CollectionHistory';
import Payment from './pages/payment';
import AdminDashboard from './pages/adminDashboard';
import BinManagement from './pages/companyBinManagement';
import ResetPassword from './pages/ResetPassword';
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/collection-history" element={<CollectionHistory />} />
        <Route path="/payments" element={<Payment />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/admin-dashboard" element={< AdminDashboard/>} />
        <Route path="/bin-management" element={<BinManagement />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/map-view" element={<MapView />} />
        <Route path="/company-analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;
