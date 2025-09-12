import React from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Hasta Girişi';
      case '/nurse':
        return 'Hemşire Onay Paneli';
      case '/doctor':
        return 'Doktor Değerlendirme Paneli';
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
