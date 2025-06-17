import { FaClock, FaCreditCard, FaTrash, FaSignOutAlt, FaUser, FaHome, FaRobot } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const SideNav = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/bin-status', icon: <FaTrash />, label: 'Bin Status' },
    { path: '/collection-history', icon: <FaClock />, label: 'Collection History' },
    { path: '/payments', icon: <FaCreditCard />, label: 'Payments' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
    { path: '/chat', icon: <FaRobot />, label: 'AI Assistant' },
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-lg">
      {/* Logo and Title */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
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
                ? 'bg-gray-700 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            <span className="text-lg mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}
          className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
        >
          <FaSignOutAlt className="text-lg mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SideNav;
