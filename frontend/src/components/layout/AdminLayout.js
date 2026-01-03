import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Helper per controllare se il link è attivo
  const isActiveLink = (path) => {
    if (path === '/admin' || path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // ✅ MENU PULITO - Solo Dashboard, Richieste, Utenti
  const menuItems = [
    {
      path: '/admin',
      icon: '📊',
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/admin/requests',
      icon: '📋',
      label: 'Richieste'
    },
    {
      path: '/admin/users',
      icon: '👥',
      label: 'Utenti'
    }
  ];

  // Get page title based on current path
  const getPageTitle = () => {
    const currentItem = menuItems.find(item => isActiveLink(item.path));
    return currentItem ? currentItem.label : 'Dashboard Amministrativa';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Desktop */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">ValiryArt Admin</h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActiveLink(item.path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="link-icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Button 
            variant="ghost" 
            size="sm" 
            fullWidth
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
            }}
          >
            {sidebarOpen ? '🏠 Vai al Sito' : '🏠'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            fullWidth
            onClick={handleLogout}
          >
            {sidebarOpen ? '🚪 Logout' : '🚪'}
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button 
              className="mobile-menu-toggle" 
              onClick={toggleMobileMenu}
            >
              ☰
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>
          <div className="topbar-right">
            <span className="admin-user">
              Ciao, <strong>{user?.nome}</strong>
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;