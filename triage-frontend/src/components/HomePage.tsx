import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <span className="medical-icon">🏥</span>
          </div>
          <h1 className="hero-title">E-Triaj Sistemi</h1>
          <p className="hero-subtitle">
            Yapay Zeka Destekli Hızlı Hasta Değerlendirme ve Önceliklendirme Sistemi
          </p>
          <div className="hero-description">
            <p>
              Modern teknoloji ile hasta şikayetlerini analiz eden, 
              aciliyet seviyesini belirleyen ve doktorlara yol gösteren 
              akıllı triaj sistemi.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/patient-entry" className="btn btn-primary btn-large">
              Hasta Değerlendirmesi Başlat
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-large">
              Dashboard'u Görüntüle
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Sistem Özellikleri</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>Yapay Zeka Analizi</h3>
              <p>
                Gelişmiş AI algoritmaları ile hasta şikayetlerini analiz eder 
                ve aciliyet seviyesini belirler.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Hızlı Değerlendirme</h3>
              <p>
                Dakikalar içinde hasta triajını tamamlar ve 
                öncelik sıralaması yapar.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Detaylı Raporlama</h3>
              <p>
                Kapsamlı hasta bilgileri, vital bulgular ve 
                doktor önerileri ile detaylı raporlar sunar.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Güvenli Veri</h3>
              <p>
                Hasta bilgileri güvenli şekilde saklanır ve 
                gizlilik standartlarına uygun işlenir.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobil Uyumlu</h3>
              <p>
                Tüm cihazlarda mükemmel çalışır, 
                tablet ve telefonlarda kolay kullanım.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>ESI Sınıflandırması</h3>
              <p>
                Uluslararası ESI (Emergency Severity Index) 
                standartlarına uygun önceliklendirme.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="workflow-section">
        <div className="container">
          <h2 className="section-title">Nasıl Çalışır?</h2>
          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Hasta Bilgileri</h3>
                <p>Yaş, cinsiyet, şikayet ve vital bulguları girin</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>AI Analizi</h3>
                <p>Yapay zeka sistemi verileri analiz eder</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>ESI Belirleme</h3>
                <p>Aciliyet seviyesi (ESI 1-5) otomatik belirlenir</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Doktor Değerlendirmesi</h3>
                <p>Doktorlar sonuçları gözden geçirir ve onaylar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="container">
          <h2 className="section-title">Sistem İstatistikleri</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">99.8%</div>
              <div className="stat-label">Doğruluk Oranı</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">&lt;30s</div>
              <div className="stat-label">Ortalama Süre</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Günlük Değerlendirme</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Kesintisiz Hizmet</div>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Hemen Başlayın</h2>
            <p>
              E-Triaj sistemi ile hasta değerlendirmelerinizi 
              daha hızlı ve doğru şekilde gerçekleştirin.
            </p>
            <div className="cta-actions">
              <Link to="/patient-entry" className="btn btn-primary btn-large">
                Hasta Değerlendirmesi Başlat
              </Link>
              <Link to="/doctor" className="btn btn-outline btn-large">
                Doktor Paneli
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
