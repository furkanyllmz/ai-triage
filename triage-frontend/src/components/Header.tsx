import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Hasta Girişi';
      case '/nurse':
        return 'Hemşire Onay Paneli';
      case '/doctor':
        return 'Doktor Değerlendirme Paneli';
      case '/qr-test':
        return 'QR Kod Test Sayfası';
      default:
        return 'E-Triaj Sistemi';
    }
  };
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <div className="logo-section">
            <div className="logo">
              <img src="/logo.png" alt="E-Triaj Logo" />
            </div>
            <div>
              <h1 className="header-title">Hızlı Değerlendirme (E-Triaj) Sistemi</h1>
              <p className="header-subtitle">Kişisel Sağlık Bilgilerinizi Yönetebileceğiniz Türkiye'nin Güvenilir Kişisel Sağlık Kayıt Sistemidir.</p>
              <div className="page-indicator">
                <span className="page-title">{getPageTitle()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDarkMode ? 'Gündüz moduna geç' : 'Gece moduna geç'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <div className="user-info">
            <span>Aile Hekimi Girişi</span>
            <div className="user-avatar">AH</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
