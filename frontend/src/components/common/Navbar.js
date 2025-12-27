import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import './Navbar.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="valiryart-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <div className="logo-text">
            <span className="logo-valiryart">ValiryArt</span>
            <span className="logo-tagline">Creazioni Artigianali</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <ul className="navbar-menu desktop-menu">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/incisioni" className="nav-link">Incisioni</Link></li>
          <li><Link to="/torte" className="nav-link">Torte</Link></li>
          <li><Link to="/eventi" className="nav-link">Eventi</Link></li>
          <li><Link to="/galleria" className="nav-link">Galleria</Link></li>
          <li><Link to="/chi-siamo" className="nav-link">Chi Sono</Link></li>
          <li><Link to="/come-funziona" className="nav-link">Come Funziona</Link></li>
        </ul>

        {/* Desktop Auth Buttons */}
        <div className="navbar-actions desktop-actions">
          {isAuthenticated ? (
            <>
              {isAdmin() ? (
                <Button 
                  variant="accent" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                >
                  Dashboard Admin
                </Button>
              ) : (
                <Button 
                  variant="accent" 
                  size="sm"
                  onClick={() => navigate('/user')}
                >
                  Area Personale
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/login')}
              >
                Accedi
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => navigate('/register')}
              >
                Registrati
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
          <li><Link to="/incisioni" onClick={closeMobileMenu}>Incisioni</Link></li>
          <li><Link to="/torte" onClick={closeMobileMenu}>Torte</Link></li>
          <li><Link to="/eventi" onClick={closeMobileMenu}>Eventi</Link></li>
          <li><Link to="/galleria" onClick={closeMobileMenu}>Galleria</Link></li>
          <li><Link to="/chi-siamo" onClick={closeMobileMenu}>Chi Sono</Link></li>
          <li><Link to="/come-funziona" onClick={closeMobileMenu}>Come Funziona</Link></li>
        </ul>

        <div className="mobile-auth-actions">
          {isAuthenticated ? (
            <>
              <Button 
                variant="accent" 
                fullWidth
                onClick={() => {
                  navigate(isAdmin() ? '/admin' : '/user');
                  closeMobileMenu();
                }}
              >
                {isAdmin() ? 'Dashboard Admin' : 'Area Personale'}
              </Button>
              <Button 
                variant="outline" 
                fullWidth
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                fullWidth
                onClick={() => {
                  navigate('/login');
                  closeMobileMenu();
                }}
              >
                Accedi
              </Button>
              <Button 
                variant="primary" 
                fullWidth
                onClick={() => {
                  navigate('/register');
                  closeMobileMenu();
                }}
              >
                Registrati
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overlay per chiudere menu mobile */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={closeMobileMenu}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;