import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import ContributorsSection from './ContributorsSection';

const HomePage: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [filledSteps, setFilledSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prevStep) => {
        const nextStep = (prevStep + 1) % 5;
        
        // Eğer döngü tamamlandıysa (0'a geri döndüyse) tüm kutucukları boşalt
        if (nextStep === 0) {
          setFilledSteps(new Set());
        } else {
          // Önceki kutucuğu dolu olarak işaretle
          setFilledSteps(prev => {
            const newSet = new Set(prev);
            newSet.add(prevStep);
            return newSet;
          });
        }
        
        return nextStep;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="homepage">
      <div className="homepage-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-text">Yapay Zeka Destekli</span>
            </div>
            <h1 className="hero-title">
              E-Triaj Sistemi
            </h1>
            <p className="hero-subtitle">
              Hızlı ve Doğru Hasta Değerlendirme
            </p>
            <p className="hero-description">
              Modern teknoloji ile hasta şikayetlerini analiz eden, aciliyet seviyesini belirleyen ve doktorlara yol gösteren akıllı triaj sistemi.
            </p>
            <div className="hero-buttons">
              <Link to="/patient" className="btn btn-primary btn-hero">
                <div className="btn-icon-wrapper">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                </div>
                Hasta Girişi
                <div className="btn-arrow-wrapper">
                  <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12,5 19,12 12,19"/>
                  </svg>
                </div>
              </Link>
              <Link to="/doctor" className="btn btn-secondary btn-hero">
                <div className="btn-icon-wrapper">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M12 11v6"/>
                    <path d="M9 14h6"/>
                  </svg>
                </div>
                Doktor Paneli
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-container">
              <div className="esi-cards-grid">
                {/* ESI-1 Card - Critical (Red) */}
                <div className="visual-card esi-card esi-1-card">
                  <div className="card-header">
                    <div className="header-text">
                      <div className="status-indicator esi-1-indicator active"></div>
                      <span className="status-text">ESI-1</span>
                      <span className="priority-text">Kritik</span>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="metric">
                      <span className="metric-label">Öncelik</span>
                      <span className="metric-value">Kritik</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Bölüm</span>
                      <span className="metric-value">Acil Servis</span>
                    </div>
                  </div>
                </div>

                {/* ESI-3 Card - Medium (Yellow) */}
                <div className="visual-card esi-card esi-3-card">
                  <div className="card-header">
                    <div className="header-text">
                      <div className="status-indicator esi-3-indicator active"></div>
                      <span className="status-text">ESI-3</span>
                      <span className="priority-text">Aktif</span>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="metric">
                      <span className="metric-label">Öncelik</span>
                      <span className="metric-value">Orta</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Bölüm</span>
                      <span className="metric-value">İç Hastalıkları</span>
                    </div>
                  </div>
                </div>

                {/* ESI-4 Card - Low (Green) */}
                <div className="visual-card esi-card esi-4-card">
                  <div className="card-header">
                    <div className="header-text">
                      <div className="status-indicator esi-4-indicator active"></div>
                      <span className="status-text">ESI-4</span>
                      <span className="priority-text">Düşük</span>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="metric">
                      <span className="metric-label">Öncelik</span>
                      <span className="metric-value">Düşük</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Bölüm</span>
                      <span className="metric-value">Poliklinik</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="section-header">
            <h2 className="section-title">Sistem Özellikleri</h2>
            <p className="section-subtitle">
              Gelişmiş teknoloji ile hasta bakımınızı optimize edin
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1 .34-4.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0-.34-4.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                  </svg>
                </div>
              </div>
              <h3>Yapay Zeka Analizi</h3>
              <p>Gelişmiş AI algoritmaları ile hasta şikayetlerini analiz eder ve aciliyet seviyesini belirler.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
              </div>
              <h3>Hızlı Değerlendirme</h3>
              <p>Dakikalar içinde hasta triajını tamamlar ve öncelik sıralaması yapar.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                  </svg>
                </div>
              </div>
              <h3>Detaylı Raporlama</h3>
              <p>Kapsamlı hasta bilgileri, vital bulgular ve doktor önerileri ile detaylı raporlar sunar.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
              </div>
              <h3>Güvenli Veri</h3>
              <p>Hasta bilgileri güvenli şekilde saklanır ve gizlilik standartlarına uygun işlenir.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
              </div>
              <h3>Mobil Uyumlu</h3>
              <p>Tüm cihazlarda mükemmel çalışır, tablet ve telefonlarda kolay kullanım.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </div>
              </div>
              <h3>ESI Sınıflandırması</h3>
              <p>Uluslararası ESI (Emergency Severity Index) standartlarına uygun önceliklendirme.</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="how-it-works-section">
          <div className="section-header">
            <h2 className="section-title">Nasıl Çalışır?</h2>
            <p className="section-subtitle">
              Yapay zeka destekli hasta değerlendirme süreci
            </p>
          </div>
          
          <div className="process-flow-enhanced">
            <div className="flow-background-enhanced">
              <div className="flow-line-enhanced"></div>
              <div className="flow-dots-enhanced">
                <div className="dot-enhanced dot-1"></div>
                <div className="dot-enhanced dot-2"></div>
                <div className="dot-enhanced dot-3"></div>
                <div className="dot-enhanced dot-4"></div>
                <div className="dot-enhanced dot-5"></div>
              </div>
            </div>
            
            <div className="steps-grid-enhanced">
              <div className={`step-card-enhanced step-1 ${activeStep === 0 ? 'auto-hover' : ''}`}>
                <div className="step-header-enhanced">
                  <div className="step-icon-enhanced">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                  </div>
                  <div className="step-number-enhanced">01</div>
                </div>
                <div className="step-body-enhanced">
                  <h3 className="step-title-enhanced">Hasta Bilgileri</h3>
                  <p className="step-desc-enhanced">Yaş, cinsiyet, şikayet ve vital bulguları sisteme girilir</p>
                  <div className="step-screenshot">
                    <div className="screenshot-mockup">
                      <div className="mockup-header">
                        <div className="mockup-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <div className="mockup-title">Hasta Girişi</div>
                      </div>
                      <div className="mockup-content">
                        <div className="mockup-form">
                          <div className="mockup-field">
                            <div className="mockup-label">Yaş</div>
                            <div className={`mockup-input ${filledSteps.has(0) ? 'filled' : 'empty'}`}>
                              {filledSteps.has(0) ? '30' : ''}
                            </div>
                          </div>
                          <div className="mockup-field">
                            <div className="mockup-label">Cinsiyet</div>
                            <div className={`mockup-input ${filledSteps.has(0) ? 'filled' : 'empty'}`}>
                              {filledSteps.has(0) ? 'Kadın' : ''}
                            </div>
                          </div>
                          <div className="mockup-field">
                            <div className="mockup-label">Şikayet</div>
                            <div className={`mockup-textarea ${filledSteps.has(0) ? 'filled' : 'empty'}`}>
                              {filledSteps.has(0) ? 'Göğüs ağrısı...' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`step-card-enhanced step-2 ${activeStep === 1 ? 'auto-hover' : ''}`}>
                <div className="step-header-enhanced">
                  <div className="step-icon-enhanced">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1 .34-4.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0-.34-4.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                    </svg>
                  </div>
                  <div className="step-number-enhanced">02</div>
                </div>
                <div className="step-body-enhanced">
                  <h3 className="step-title-enhanced">AI Analizi</h3>
                  <p className="step-desc-enhanced">Yapay zeka algoritmaları verileri analiz eder ve ön değerlendirme yapar</p>
                  <div className="step-screenshot">
                    <div className="screenshot-mockup ai-analysis">
                      <div className="mockup-header">
                        <div className="mockup-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <div className="mockup-title">AI Analizi</div>
                      </div>
                      <div className="mockup-content">
                        <div className="ai-process">
                          <div className="ai-step">
                            <div className="ai-icon">🧠</div>
                            <div className="ai-text">Veri Analizi</div>
                          </div>
                          <div className="ai-step">
                            <div className="ai-icon">⚡</div>
                            <div className="ai-text">Hızlı İşlem</div>
                          </div>
                          <div className="ai-step">
                            <div className="ai-icon">🎯</div>
                            <div className="ai-text">Sonuç</div>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`step-card-enhanced step-3 ${activeStep === 2 ? 'auto-hover' : ''}`}>
                <div className="step-header-enhanced">
                  <div className="step-icon-enhanced">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                      <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                      <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
                    </svg>
                  </div>
                  <div className="step-number-enhanced">03</div>
                </div>
                <div className="step-body-enhanced">
                  <h3 className="step-title-enhanced">ESI Belirleme</h3>
                  <p className="step-desc-enhanced">Aciliyet seviyesi (ESI 1-5) uluslararası standartlara göre belirlenir</p>
                  <div className="step-screenshot">
                    <div className="screenshot-mockup esi-result">
                      <div className="mockup-header">
                        <div className="mockup-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <div className="mockup-title">Triaj Sonucu</div>
                      </div>
                      <div className="mockup-content">
                        <div className="esi-display">
                          <div className="esi-level esi-3">
                            <div className="esi-number">3</div>
                            <div className="esi-label">ESI-3</div>
                          </div>
                          <div className="esi-details">
                            <div className="esi-item">
                              <span className="esi-label">Öncelik:</span>
                              <span className="esi-value">Orta</span>
                            </div>
                            <div className="esi-item">
                              <span className="esi-label">Bölüm:</span>
                              <span className="esi-value">Kardiyoloji</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`step-card-enhanced step-4 ${activeStep === 3 ? 'auto-hover' : ''}`}>
                <div className="step-header-enhanced">
                  <div className="step-icon-enhanced">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                      <path d="M12 11v6"/>
                      <path d="M9 14h6"/>
                    </svg>
                  </div>
                  <div className="step-number-enhanced">04</div>
                </div>
                <div className="step-body-enhanced">
                  <h3 className="step-title-enhanced">Doktor Onayı</h3>
                  <p className="step-desc-enhanced">Doktorlar sonuçları gözden geçirir, onaylar ve takip planı oluşturur</p>
                  <div className="step-screenshot">
                    <div className="screenshot-mockup doctor-review">
                      <div className="mockup-header">
                        <div className="mockup-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <div className="mockup-title">Doktor Paneli</div>
                      </div>
                      <div className="mockup-content">
                        <div className="doctor-form">
                          <div className="doctor-field">
                            <div className="doctor-label">Tanı</div>
                            <div className={`doctor-input ${filledSteps.has(3) ? 'filled' : 'empty'}`}>
                              {filledSteps.has(3) ? 'Miyokard infarktüsü' : ''}
                            </div>
                          </div>
                          <div className="doctor-field">
                            <div className="doctor-label">Tedavi Planı</div>
                            <div className={`doctor-textarea ${filledSteps.has(3) ? 'filled' : 'empty'}`}>
                              {filledSteps.has(3) ? 'EKG, enzimler...' : ''}
                            </div>
                          </div>
                          <div className="doctor-actions">
                            <div className="doctor-btn primary">Onayla</div>
                            <div className="doctor-btn secondary">Düzenle</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`step-card-enhanced step-5 ${activeStep === 4 ? 'auto-hover' : ''}`}>
                <div className="step-header-enhanced">
                  <div className="step-icon-enhanced">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="9" x2="15" y2="9"/>
                      <line x1="9" y1="13" x2="15" y2="13"/>
                      <line x1="9" y1="17" x2="15" y2="17"/>
                    </svg>
                  </div>
                  <div className="step-number-enhanced">05</div>
                </div>
                <div className="step-body-enhanced">
                  <h3 className="step-title-enhanced">Dashboard & Takip</h3>
                  <p className="step-desc-enhanced">Tüm triaj işlemleri dashboard'da görüntülenir ve takip edilir</p>
                  <div className="step-screenshot">
                    <div className="screenshot-mockup dashboard-view">
                      <div className="mockup-header">
                        <div className="mockup-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <div className="mockup-title">Dashboard</div>
                      </div>
                      <div className="mockup-content">
                        <div className="dashboard-kpis">
                          <div className="kpi-item">
                            <div className="kpi-label">Toplam</div>
                            <div className="kpi-value">1,247</div>
                          </div>
                          <div className="kpi-item">
                            <div className="kpi-label">Kritik</div>
                            <div className="kpi-value">23</div>
                          </div>
                          <div className="kpi-item">
                            <div className="kpi-label">Ort. Yaş</div>
                            <div className="kpi-value">42</div>
                          </div>
                        </div>
                        <div className="dashboard-table-mockup">
                          <div className="table-header">
                            <div className="table-cell">Case ID</div>
                            <div className="table-cell">Yaş/Cinsiyet</div>
                            <div className="table-cell">ESI</div>
                            <div className="table-cell">Durum</div>
                          </div>
                          <div className="table-row">
                            <div className="table-cell">CASE-1001</div>
                            <div className="table-cell">35/K</div>
                            <div className="table-cell esi-3">ESI-3</div>
                            <div className="table-cell completed">✓</div>
                          </div>
                          <div className="table-row">
                            <div className="table-cell">CASE-1002</div>
                            <div className="table-cell">28/E</div>
                            <div className="table-cell esi-2">ESI-2</div>
                            <div className="table-cell completed">✓</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contributors Section */}
        <ContributorsSection />

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-banner">
            <div className="cta-background">
              <div className="cta-pattern"></div>
            </div>
            <div className="cta-content">
              <div className="cta-header">
                <h2 className="cta-title">Hemen Başlayın</h2>
                <div className="cta-subtitle">
                  E-Triaj sistemi ile hasta değerlendirmelerinizi daha hızlı ve doğru şekilde gerçekleştirin.
                </div>
              </div>
              <div className="cta-buttons">
                <Link to="/patient" className="btn btn-cta-primary">
                  <div className="btn-content">
                    <div className="btn-icon-wrapper">
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                      </svg>
                    </div>
                    <div className="btn-text">
                      <span className="btn-title">Hasta Girişi</span>
                      <span className="btn-subtitle">Yeni hasta kaydı</span>
                    </div>
                    <div className="btn-arrow-wrapper">
                      <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12,5 19,12 12,19"/>
                      </svg>
                    </div>
                  </div>
                </Link>
                <Link to="/doctor" className="btn btn-cta-secondary">
                  <div className="btn-content">
                    <div className="btn-icon-wrapper">
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                        <path d="M12 11v6"/>
                        <path d="M9 14h6"/>
                      </svg>
                    </div>
                    <div className="btn-text">
                      <span className="btn-title">Doktor Paneli</span>
                      <span className="btn-subtitle">Hasta değerlendirme</span>
                    </div>
                    <div className="btn-arrow-wrapper">
                      <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12,5 19,12 12,19"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="cta-features">
                <div className="cta-feature">
                  <div className="feature-icon-wrapper">
                    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <span className="feature-text">30 saniyede analiz</span>
                </div>
                <div className="cta-feature">
                  <div className="feature-icon-wrapper">
                    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                      <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                      <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
                    </svg>
                  </div>
                  <span className="feature-text">%99.8 doğruluk</span>
                </div>
                <div className="cta-feature">
                  <div className="feature-icon-wrapper">
                    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <circle cx="12" cy="16" r="1"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <span className="feature-text">Güvenli veri</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
