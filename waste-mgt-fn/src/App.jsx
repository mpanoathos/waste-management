import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import './index.css';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/profile';
import CollectionHistory from './pages/CollectionHistory';
import CompanyCollectionHistory from './pages/CompanyCollectionHistory';
import Payment from './pages/payment';
import CompanyPayments from './pages/CompanyPayments';
import AdminDashboard from './pages/adminDashboard';
import BinManagement from './pages/companyBinManagement';
import ResetPassword from './pages/ResetPassword';
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';
import BinStatus from './pages/BinStatus';
import CompanyManagement from './pages/CompanyManagement';
import Chat from './pages/Chat';
import UserManagement from './pages/UserManagement';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReportThreads from './pages/ReportThreads';
import AdminReportThreads from './pages/AdminReportThreads';
import CompanyAnalytics from './pages/CompanyAnalytics';
import RouteManagement from './pages/RouteManagement';
import MyRoutes from './pages/MyRoutes';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/collection-history" element={<CollectionHistory />} />
          <Route path="/company-collection-history" element={<CompanyCollectionHistory />} />
          <Route path="/payments" element={<Payment />} />
          <Route path="/company-payments" element={<CompanyPayments />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/bin-management" element={<BinManagement />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/map-view" element={<MapView />} />
          {/* <Route path="/company-analytics" element={<CompanyAnalytics />} /> */}
          <Route path="/bin-status" element={<BinStatus />} />
          <Route path="/company-management" element={<CompanyManagement />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/admin-analytics" element={<Analytics />} />
          <Route path="/report-threads" element={<ReportThreads />} />
          <Route path="/admin-report-threads" element={<AdminReportThreads />} />
          <Route path="/company-analytics" element={<CompanyAnalytics />} />
          <Route path="/route-management" element={<RouteManagement token={localStorage.getItem('token')} />} />
          <Route path="/my-routes" element={<MyRoutes token={localStorage.getItem('token')} />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
