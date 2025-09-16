import React, { useState } from 'react';
import './DoctorPage.css';

interface DoctorPageProps {
  patientData: any;
  triageResult: any;
  onComplete: () => void;
}

// Helper function to map Turkish priority values to English CSS classes
const getPriorityClass = (priority: string | undefined): string => {
  if (!priority) return 'unknown';
  
  const priorityMap: { [key: string]: string } = {
    'Yüksek': 'high',
    'Orta': 'medium', 
    'Düşük': 'low',
    'High': 'high',
    'Medium': 'medium',
    'Low': 'low'
  };
  
  return priorityMap[priority] || 'unknown';
};

export default function DoctorPage({
  patientData,
  triageResult,
  onComplete
}: DoctorPageProps) {
  const [searchCaseId, setSearchCaseId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState('');

  const handleCaseSearch = async () => {
    if (!searchCaseId.trim()) {
      setSearchError('Lütfen bir Case ID girin');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search result - replace with actual API response
      const mockResult = {
        caseId: searchCaseId,
        patientData: {
          age: '35',
          sex: 'F',
          complaint: 'Göğüs ağrısı ve nefes darlığı',
          pregnancy: 'negative',
          chief: 'Göğüs ağrısı',
          vitals: '{"blood_pressure": "140/90", "heart_rate": "95", "temperature": "37.2"}'
        },
        triageResult: {
          triage_level: 'ESI-3',
          routing: {
            priority: 'Orta',
            specialty: 'Kardiyoloji'
          },
          rationale_brief: 'Göğüs ağrısı ve yüksek tansiyon nedeniyle kardiyoloji konsültasyonu önerilir.',
          red_flags: ['Yüksek tansiyon', 'Göğüs ağrısı'],
          immediate_actions: ['EKG çekimi', 'Kardiyak enzimler'],
          questions_to_ask_next: ['Ağrı ne zaman başladı?', 'Egzersizle ilişkisi var mı?']
        },
        timestamp: new Date().toISOString(),
        status: 'pending_review'
      };
      
      setSearchResult(mockResult);
    } catch (error) {
      setSearchError('Case ID bulunamadı veya bir hata oluştu');
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchCaseId('');
    setSearchResult(null);
    setSearchError('');
  };

  // Use search result data if available, otherwise use props
  const currentPatientData = searchResult?.patientData || patientData;
  const currentTriageResult = searchResult?.triageResult || triageResult;

  return (
    <div className="doctor-page">
      <div className="doctor-container">
        {/* Case Search Section */}
        <div className="case-search-section">
          <div className="case-search-card">
            <div className="search-header">
              <h2 className="search-title">Case ID ile Hasta Arama</h2>
              <p className="search-description">
                Belirli bir hasta vakasını Case ID ile bulup değerlendirebilirsiniz
              </p>
            </div>
            
            <div className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Case ID girin (örn: CASE-123456)"
                  value={searchCaseId}
                  onChange={(e) => setSearchCaseId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCaseSearch()}
                />
                <button
                  className="btn btn-primary search-btn"
                  onClick={handleCaseSearch}
                  disabled={isSearching}
                >
                  {isSearching ? 'Aranıyor...' : 'Ara'}
                </button>
                {searchResult && (
                  <button
                    className="btn btn-secondary clear-btn"
                    onClick={clearSearch}
                  >
                    Temizle
                  </button>
                )}
              </div>
              
              {searchError && (
                <div className="search-error">
                  {searchError}
                </div>
              )}
              
              {searchResult && (
                <div className="search-success">
                  <div className="success-header">
                    <span className="success-icon">✓</span>
                    <span>Case bulundu: {searchResult.caseId}</span>
                  </div>
                  <div className="case-info">
                    <span className="case-timestamp">
                      Oluşturulma: {new Date(searchResult.timestamp).toLocaleString('tr-TR')}
                    </span>
                    <span className="case-status">
                      Durum: {searchResult.status === 'pending_review' ? 'Değerlendirme Bekliyor' : 'Tamamlandı'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="doctor-content">
          {/* Hasta Bilgileri */}
          <div className="doctor-section">
            <h2 className="section-title">Hasta Bilgileri</h2>
            <div className="patient-info-card">
              <div className="info-row">
                <span className="info-label">Yaş:</span>
                <span className="info-value">{currentPatientData?.age || 'Belirtilmemiş'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Cinsiyet:</span>
                <span className="info-value">{currentPatientData?.sex || 'Belirtilmemiş'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Şikayet:</span>
                <span className="info-value">{currentPatientData?.complaint || 'Belirtilmemiş'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Hamilelik:</span>
                <span className="info-value">{currentPatientData?.pregnancy ? 'Evet' : 'Hayır'}</span>
              </div>
              {currentPatientData?.chief && (
                <div className="info-row">
                  <span className="info-label">Hastalık Özeti:</span>
                  <span className="info-value">{currentPatientData.chief}</span>
                </div>
              )}
              {currentPatientData?.vitals && (
                <div className="info-row">
                  <span className="info-label">Vitaller:</span>
                  <span className="info-value">{currentPatientData.vitals}</span>
                </div>
              )}
            </div>
          </div>

          {/* Triaj Sonucu */}
          <div className="doctor-section">
            <h2 className="section-title">Triaj Sonucu</h2>
            <div className="triage-result-card">
              <div className="triage-summary">
                <div className="triage-level">
                  <span className="level-label">ESI Seviyesi:</span>
                  <span className={`level-badge level-${currentTriageResult?.triage_level?.split('-')[1] || 'unknown'} ${!currentTriageResult?.triage_level ? 'undetermined' : ''}`}>
                    {currentTriageResult?.triage_level || 'Belirlenmemiş'}
                  </span>
                </div>
                <div className="triage-priority">
                  <span className="priority-label">Öncelik:</span>
                  <span className={`priority-badge priority-${getPriorityClass(currentTriageResult?.routing?.priority)} ${!currentTriageResult?.routing?.priority ? 'undetermined' : ''}`}>
                    {currentTriageResult?.routing?.priority || 'Belirlenmemiş'}
                  </span>
                </div>
                <div className="triage-specialty">
                  <span className="specialty-label">Önerilen Bölüm:</span>
                  <span className={`specialty-value ${!currentTriageResult?.routing?.specialty ? 'undetermined' : ''}`}>
                    {currentTriageResult?.routing?.specialty || 'Belirlenmemiş'}
                  </span>
                </div>
              </div>
              
              <div className="triage-details">
                <div className="triage-rationale">
                  <span className="rationale-label">Değerlendirme Açıklaması:</span>
                  <span className="rationale-text">
                    {currentTriageResult?.rationale_brief || currentTriageResult?.rationale || 'Değerlendirme bekleniyor'}
                  </span>
                </div>
                
                {currentTriageResult?.red_flags && currentTriageResult.red_flags.length > 0 && (
                  <div className="red-flags">
                    <span className="red-flags-label">Kritik Bulgular:</span>
                    <ul className="red-flags-list">
                      {currentTriageResult.red_flags.map((flag: string, index: number) => (
                        <li key={index} className="red-flag-item">{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {currentTriageResult?.immediate_actions && currentTriageResult.immediate_actions.length > 0 && (
                  <div className="immediate-actions">
                    <span className="actions-label">Acil Müdahaleler:</span>
                    <ul className="actions-list">
                      {currentTriageResult.immediate_actions.map((action: string, index: number) => (
                        <li key={index} className="action-item">{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
