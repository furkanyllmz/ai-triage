import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'ANA SAYFA';
      case '/patient':
        return 'HASTA GİRİŞİ';
      case '/doctor':
        return 'DOKTOR DEĞERLENDİRME PANELİ';
      case '/dashboard':
        return 'DASHBOARD';
      case '/qr-test':
        return 'QR KOD TEST SAYFASI';
      default:
        return 'E-TRİAJ SİSTEMİ';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <div className="logo-section">
            <div className="logo">
              <img src="/logo.png" alt="E-Triaj Logo" />
            </div>
            <div className="brand-text">
              <h1 className="header-title">E-Triaj</h1>
              <span className="header-subtitle">AI Destekli Hasta Değerlendirme</span>
              <div className="page-indicator">
                <span className="current-page">{getPageTitle()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          {/* Desktop Navigation */}
          <nav className="header-nav desktop-nav">
            <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
              Ana Sayfa
            </Link>
            <Link to="/patient" className={`nav-item ${location.pathname === '/patient' ? 'active' : ''}`}>
              Hasta Girişi
            </Link>
            <Link to="/doctor" className={`nav-item ${location.pathname === '/doctor' ? 'active' : ''}`}>
              Doktor Paneli
            </Link>
            <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              Dashboard
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <button 
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <nav className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Ana Sayfa
          </Link>
          <Link 
            to="/patient" 
            className={`mobile-nav-item ${location.pathname === '/patient' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Hasta Girişi
          </Link>
          <Link 
            to="/doctor" 
            className={`mobile-nav-item ${location.pathname === '/doctor' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Doktor Paneli
          </Link>
          <Link 
            to="/dashboard" 
            className={`mobile-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
