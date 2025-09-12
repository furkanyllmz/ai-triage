import React, { useState } from 'react';
import './NurseApproval.css';

interface NurseApprovalProps {
  patientData: any;
  triageResult: any;
  onApprove: (notes: string) => void;
  onReject: () => void;
}

export default function NurseApproval({ 
  patientData, 
  triageResult, 
  onApprove, 
  onReject 
}: NurseApprovalProps) {
  const [nurseNotes, setNurseNotes] = useState('');
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  const handleApprove = () => {
    setIsApproved(true);
    onApprove(nurseNotes);
  };

  const handleReject = () => {
    setIsApproved(false);
    onReject();
  };

  return (
    <div className="nurse-approval-page">
      <div className="nurse-container">
        <h1 className="nurse-title">Hemşire Onay Paneli</h1>
        
        <div className="nurse-content">
          {/* Hasta Bilgileri */}
          <div className="nurse-section">
            <h2 className="section-title">Hasta Bilgileri</h2>
            <div className="patient-summary-card">
              <div className="patient-info-grid">
                <div className="info-item">
                  <span className="info-label">Yaş:</span>
                  <span className="info-value">{patientData?.age || 'Belirtilmemiş'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Cinsiyet:</span>
                  <span className="info-value">{patientData?.sex || 'Belirtilmemiş'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Şikayet:</span>
                  <span className="info-value">{patientData?.complaint || 'Belirtilmemiş'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Hamilelik:</span>
                  <span className="info-value">{patientData?.pregnancy ? 'Evet' : 'Hayır'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Triaj Sonucu */}
          <div className="nurse-section">
            <h2 className="section-title">AI Triaj Sonucu</h2>
            <div className="triage-summary-card">
              <div className="triage-header">
                <div className="triage-priority">
                  <span className="priority-label">Öncelik Seviyesi:</span>
                  <span className={`priority-badge priority-${triageResult?.priority || 'unknown'}`}>
                    {triageResult?.priority || 'Belirlenmemiş'}
                  </span>
                </div>
              </div>
              
              <div className="triage-details">
                <div className="detail-item">
                  <span className="detail-label">Önerilen Yaklaşım:</span>
                  <span className="detail-text">
                    {triageResult?.recommendation || 'Değerlendirme bekleniyor'}
                  </span>
                </div>
                
                {triageResult?.confidence && (
                  <div className="detail-item">
                    <span className="detail-label">Güven Skoru:</span>
                    <span className="detail-text">
                      %{Math.round(triageResult.confidence * 100)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hemşire Değerlendirmesi */}
          <div className="nurse-section">
            <h2 className="section-title">Hemşire Değerlendirmesi</h2>
            <div className="nurse-evaluation-card">
              <div className="evaluation-form">
                <div className="form-group">
                  <label className="form-label">AI Triaj Sonucunu Onaylıyor musunuz?</label>
                  <div className="approval-buttons">
                    <button 
                      className={`approval-btn approval-yes ${isApproved === true ? 'active' : ''}`}
                      onClick={() => setIsApproved(true)}
                    >
                      ✅ Evet, Onaylıyorum
                    </button>
                    <button 
                      className={`approval-btn approval-no ${isApproved === false ? 'active' : ''}`}
                      onClick={() => setIsApproved(false)}
                    >
                      ❌ Hayır, Onaylamıyorum
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Hemşire Notları:</label>
                  <textarea 
                    className="form-textarea"
                    rows={4}
                    value={nurseNotes}
                    onChange={(e) => setNurseNotes(e.target.value)}
                    placeholder="Hasta durumu, gözlemleriniz ve ek notlarınızı buraya yazabilirsiniz..."
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Vital Bulgular:</label>
                  <div className="vitals-grid">
                    <div className="vital-item">
                      <label className="vital-label">Kan Basıncı:</label>
                      <input 
                        type="text" 
                        className="vital-input" 
                        placeholder="120/80"
                      />
                    </div>
                    <div className="vital-item">
                      <label className="vital-label">Nabız:</label>
                      <input 
                        type="text" 
                        className="vital-input" 
                        placeholder="72"
                      />
                    </div>
                    <div className="vital-item">
                      <label className="vital-label">Ateş:</label>
                      <input 
                        type="text" 
                        className="vital-input" 
                        placeholder="36.5°C"
                      />
                    </div>
                    <div className="vital-item">
                      <label className="vital-label">Oksijen Satürasyonu:</label>
                      <input 
                        type="text" 
                        className="vital-input" 
                        placeholder="98%"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="nurse-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleReject}
              disabled={isApproved === null}
            >
              Geri Gönder
            </button>
            
            <button 
              className="btn btn-success"
              onClick={handleApprove}
              disabled={isApproved === null || isApproved === false}
            >
              Doktora Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
