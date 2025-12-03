import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">ValiryArt Admin</h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-link">
            <span className="link-icon">📊</span>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link to="/admin/requests" className="sidebar-link">
            <span className="link-icon">📋</span>
            {sidebarOpen && <span>Richieste</span>}
          </Link>
          <Link to="/admin/portfolio" className="sidebar-link">
            <span className="link-icon">🖼️</span>
            {sidebarOpen && <span>Portfolio</span>}
          </Link>
          <Link to="/admin/designs" className="sidebar-link">
            <span className="link-icon">🎨</span>
            {sidebarOpen && <span>Galleria Disegni</span>}
          </Link>
          <Link to="/admin/users" className="sidebar-link">
            <span className="link-icon">👥</span>
            {sidebarOpen && <span>Utenti</span>}
          </Link>
          <Link to="/admin/content" className="sidebar-link">
            <span className="link-icon">📄</span>
            {sidebarOpen && <span>Contenuti</span>}
          </Link>
          <Link to="/admin/settings" className="sidebar-link">
            <span className="link-icon">⚙️</span>
            {sidebarOpen && <span>Impostazioni</span>}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Button 
            variant="ghost" 
            size="sm" 
            fullWidth
            onClick={() => navigate('/')}
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

      {/* Main Content */}
      <div className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="mobile-menu-toggle" onClick={toggleSidebar}>
              ☰
            </button>
            <h1 className="page-title">Dashboard Amministrativa</h1>
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