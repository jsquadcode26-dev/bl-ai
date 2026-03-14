import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  Users,
  Truck,
  Lightbulb,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Home,
  Search
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/price-tracker', icon: TrendingUp, label: 'Price Tracker' },
    { path: '/reviews', icon: MessageSquare, label: 'Review Intelligence' },
    { path: '/competitors', icon: Users, label: 'Competitor Radar' },
    { path: '/logistics', icon: Truck, label: 'Logistics' },
    { path: '/insights', icon: Lightbulb, label: 'Insights Feed' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  useEffect(() => {
    // TODO: Fetch real unread notifications from API
    // const fetchNotifications = async () => {
    //   const res = await api.getAlerts();
    //   setUnreadNotifications(res.data?.length || 0);
    // };
    // fetchNotifications();
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        animate={sidebarOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        initial="closed"
      >
        <div className="sidebar-header">
          <Link to="/" className="logo-link">
            <span className="logo">{sidebarOpen && 'MarketMind'}</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span className="nav-label">{item.label}</span>
                {item.path === '/notifications' && unreadNotifications > 0 && (
                  <span className="nav-badge">{unreadNotifications}</span>
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/settings" className="settings-link">
            <Settings size={18} />
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </div>
      </motion.aside>

      {/* Main Container */}
      <div className="main-container">
        {/* Header */}
        <header className="top-nav">
          <motion.button
            className="menu-toggle"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>

          <div className="top-nav-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search insights, products, or reports..."
              className="nav-search-input"
            />
          </div>

          <div className="top-nav-right">
            <motion.button
              className="notification-btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </motion.button>

            {/* User Profile Dropdown */}
            <div className="user-menu-wrapper">
              <motion.button
                className="user-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                whileHover={{ scale: 1.05 }}
              >
                <div className="user-avatar">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                {sidebarOpen && (
                  <div className="user-info">
                    <span className="user-name">{user?.full_name || 'User'}</span>
                    <span className="user-email">{user?.email}</span>
                  </div>
                )}
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    className="user-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        {user?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="dropdown-name">{user?.full_name || 'User'}</p>
                        <p className="dropdown-email">{user?.email}</p>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/settings" className="dropdown-item">
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <button
                      className="dropdown-item logout-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="content">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
