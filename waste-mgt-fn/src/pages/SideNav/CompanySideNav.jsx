import { FaMap, FaTrash, FaRoute, FaChartBar, FaSignOutAlt, FaBuilding, FaHistory } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const CompanySideNav = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/company-dashboard', icon: <FaBuilding />, label: 'Dashboard' },
    { path: '/map-view', icon: <FaMap />, label: 'Map View' },
    { path: '/bin-management', icon: <FaTrash />, label: 'Bin Management' },
    { path: '/route-optimization', icon: <FaRoute />, label: 'Route Optimization' },
    { path: '/company-analytics', icon: <FaChartBar />, label: 'Analytics' },
    { path: '/collection-history-company', icon: <FaHistory />, label: 'Collection History' },
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-blue-600 to-blue-800 text-white flex flex-col shadow-lg">
      {/* Logo and Title */}
      <div className="p-6 border-b border-blue-500/30">
        <h2 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
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
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <span className="text-lg mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-blue-500/30">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}
          className="flex items-center w-full px-4 py-3 text-blue-100 hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <FaSignOutAlt className="text-lg mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default CompanySideNav;
