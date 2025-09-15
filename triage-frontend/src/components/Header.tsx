import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Ana Sayfa';
      case '/patient-entry':
        return 'Hasta Girişi';
      case '/doctor':
        return 'Doktor Değerlendirme Paneli';
      case '/dashboard':
        return 'Dashboard';
      case '/qr-test':
        return 'QR Kod Test Sayfası';
      default:
        return 'E-Triaj Sistemi';
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <div className="logo-section">
            <div className="logo">
              <img src="/logo.png" alt="E-Triaj Logo" />
            </div>
            <div>
              <h1 className="header-title">
                <span className="header-title-full">Hızlı Değerlendirme (E-Triaj) Sistemi</span>
                <span className="header-title-short">E-Triaj</span>
              </h1>
              <p className="header-subtitle">Kişisel Sağlık Bilgilerinizi Yönetebileceğiniz Türkiye'nin Güvenilir Kişisel Sağlık Kayıt Sistemidir.</p>
              <div className="page-indicator">
                <span className="page-title">{getPageTitle()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <nav className="header-nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Ana Sayfa
            </Link>
            <Link to="/patient-entry" className={`nav-link ${location.pathname === '/patient-entry' ? 'active' : ''}`}>
              Hasta Girişi
            </Link>
            <Link to="/doctor" className={`nav-link ${location.pathname === '/doctor' ? 'active' : ''}`}>
              Doktor Paneli
            </Link>
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              Dashboard
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Menü"
            aria-label="Menüyü aç/kapat"
          >
            <span className={`hamburger-icon ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu" ref={mobileMenuRef}>
            <Link 
              to="/" 
              className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link 
              to="/patient-entry" 
              className={`mobile-nav-link ${location.pathname === '/patient-entry' ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Hasta Girişi
            </Link>
            <Link 
              to="/doctor" 
              className={`mobile-nav-link ${location.pathname === '/doctor' ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Doktor Paneli
            </Link>
            <Link 
              to="/dashboard" 
              className={`mobile-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
