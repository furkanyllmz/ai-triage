import React from 'react';
import './DoctorPage.css';

interface DoctorPageProps {
  patientData: any;
  triageResult: any;
  onComplete: () => void;
}

export default function DoctorPage({
  patientData,
  triageResult,
  onComplete
}: DoctorPageProps) {
  return (
    <div className="doctor-page">
      <div className="doctor-container">
        <h1 className="doctor-title">Doktor Değerlendirme Paneli</h1>
        
        <div className="doctor-content">
          {/* Hasta Bilgileri */}
          <div className="doctor-section">
            <h2 className="section-title">Hasta Bilgileri</h2>
            <div className="patient-info-card">
              <div className="info-row">
                <span className="info-label">Yaş:</span>
                <span className="info-value">{patientData?.age || 'Belirtilmemiş'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Cinsiyet:</span>
                <span className="info-value">{patientData?.sex || 'Belirtilmemiş'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Şikayet:</span>
                <span className="info-value">{patientData?.complaint || 'Belirtilmemiş'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Hamilelik:</span>
                <span className="info-value">{patientData?.pregnancy ? 'Evet' : 'Hayır'}</span>
              </div>
            </div>
          </div>

          {/* Triaj Sonucu */}
          <div className="doctor-section">
            <h2 className="section-title">Triaj Sonucu</h2>
            <div className="triage-result-card">
              <div className="triage-priority">
                <span className="priority-label">Öncelik:</span>
                <span className={`priority-badge priority-${triageResult?.priority || 'unknown'}`}>
                  {triageResult?.priority || 'Belirlenmemiş'}
                </span>
              </div>
              <div className="triage-recommendation">
                <span className="recommendation-label">Önerilen Yaklaşım:</span>
                <span className="recommendation-text">
                  {triageResult?.recommendation || 'Değerlendirme bekleniyor'}
                </span>
              </div>
            </div>
          </div>



          {/* Doktor Değerlendirmesi */}
          <div className="doctor-section">
            <h2 className="section-title">Doktor Değerlendirmesi</h2>
            <div className="doctor-evaluation-card">
              <div className="evaluation-form">
                <div className="form-group">
                  <label className="form-label">Tanı:</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Tanı bilgisini giriniz"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tedavi Planı:</label>
                  <textarea 
                    className="form-textarea" 
                    rows={4}
                    placeholder="Tedavi planını detaylı olarak açıklayınız"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reçete:</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    placeholder="Reçete bilgilerini giriniz"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Takip:</label>
                  <select className="form-select">
                    <option value="">Takip durumunu seçiniz</option>
                    <option value="discharge">Taburcu</option>
                    <option value="observation">Gözlem</option>
                    <option value="admission">Yatış</option>
                    <option value="referral">Sevk</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* QR Kod Etiketi */}
          <div className="doctor-section">
            <h2 className="section-title">Triaj Etiketi</h2>
            <div className="qr-label-section">
              <p className="qr-description">
                Hasta için oluşturulan triaj etiketini yazdırabilir veya indirebilirsiniz.
              </p>
              <div className="qr-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/qr-test'}
                >
                  Etiketi Görüntüle
                </button>
              </div>
            </div>
          </div>

          {/* Tamamla Butonu */}
          <div className="doctor-actions">
            <button 
              className="btn btn-success btn-large"
              onClick={onComplete}
            >
              Değerlendirmeyi Tamamla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
