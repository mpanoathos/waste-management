import { FaUser, FaCarSide, FaBuilding, FaRoute, FaChartBar, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const AdminSideNav = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/admin-dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/user-management', icon: <FaUser />, label: 'Users' },
    { path: '/company-management', icon: <FaBuilding />, label: 'Companies' },
    { path: '/route-management', icon: <FaRoute />, label: 'Routes' },
    { path: '/driver-management', icon: <FaCarSide />, label: 'Drivers' },
    { path: '/admin-analytics', icon: <FaChartBar />, label: 'Analytics' },
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white flex flex-col shadow-lg">
      {/* Logo and Title */}
      <div className="p-6 border-b border-gray-600/30">
        <h2 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
          Smart Collection
        </h2>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-gray-200 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-lg mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-600/30">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}
          className="flex items-center w-full px-4 py-3 text-gray-200 hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200"
        >
          <FaSignOutAlt className="text-lg mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSideNav;
