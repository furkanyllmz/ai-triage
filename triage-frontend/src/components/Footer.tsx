import React, { useState, useEffect } from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="waiting-stats">
          <div className="waiting-item">
            <span className="waiting-label">ESI-1-2</span>
            <span className="waiting-count critical">7</span>
          </div>
          <div className="waiting-item">
            <span className="waiting-label">ESI-3</span>
            <span className="waiting-count moderate">8</span>
          </div>
          <div className="waiting-item">
            <span className="waiting-label">ESI-4-5</span>
            <span className="waiting-count low">12</span>
          </div>
        </div>
        
        <div className="footer-info">
          <span className="footer-text">Bekleyen Hasta Sayıları</span>
          <span className="footer-time">Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}</span>
        </div>
        
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDarkMode ? 'Gündüz moduna geç' : 'Gece moduna geç'}
        >
          {isDarkMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          )}
        </button>
      </div>
    </footer>
  );
};

export default Footer;
