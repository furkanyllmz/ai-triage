import React, { useState } from 'react';
import './DoctorPage.css';

interface DoctorPageProps {
  patientData: any;
  triageResult: any;
  nurseNotes: string;
  onComplete: () => void;
}

const DoctorPage: React.FC<DoctorPageProps> = ({ 
  patientData, 
  triageResult, 
  nurseNotes,
  onComplete 
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescription, setPrescription] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'queue'>('current');

  // Mock data for other patients
  const otherPatients = [
    {
      id: 'P001',
      name: 'Ahmet Yılmaz',
      age: 45,
      sex: 'M',
      complaint: 'Göğüs ağrısı',
      priority: 'ESI-2',
      arrivalTime: '14:30',
      status: 'Bekliyor'
    },
    {
      id: 'P002', 
      name: 'Fatma Demir',
      age: 32,
      sex: 'F',
      complaint: 'Baş ağrısı',
      priority: 'ESI-3',
      arrivalTime: '14:45',
      status: 'Muayene Edildi'
    },
    {
      id: 'P003',
      name: 'Mehmet Kaya',
      age: 67,
      sex: 'M', 
      complaint: 'Nefes darlığı',
      priority: 'ESI-1',
      arrivalTime: '15:00',
      status: 'Acil'
    },
    {
      id: 'P004',
      name: 'Ayşe Özkan',
      age: 28,
      sex: 'F',
      complaint: 'Karın ağrısı',
      priority: 'ESI-3',
      arrivalTime: '15:15',
      status: 'Bekliyor'
    }
  ];

  const handleComplete = () => {
    const finalAssessment = {
      patientData,
      triageResult,
      nurseNotes,
      doctorAssessment: {
        diagnosis,
        treatment,
        prescription,
        followUp,
        doctorNotes
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('Final Assessment:', finalAssessment);
    onComplete();
  };

  const getPriorityInfo = (level: string) => {
    switch (level) {
      case 'ESI-1':
        return { 
          color: 'critical', 
          text: 'Kritik - Acil Müdahale Gerekli',
          icon: '🚨'
        };
      case 'ESI-2':
        return { 
          color: 'urgent', 
          text: 'Acil - Yüksek Öncelik',
          icon: '⚠️'
        };
      case 'ESI-3':
        return { 
          color: 'moderate', 
          text: 'Orta - Standart Öncelik',
          icon: '⚡'
        };
      case 'ESI-4':
      case 'ESI-5':
        return { 
          color: 'low', 
          text: 'Düşük - Rutin Bakım',
          icon: '✅'
        };
      default:
        return { 
          color: 'unknown', 
          text: 'Değerlendirme Bekleniyor',
          icon: '❓'
        };
    }
  };

  const priorityInfo = getPriorityInfo(triageResult?.triage_level || 'ESI-3');

  return (
    <div className="doctor-page">
      <div className="doctor-content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            <span className="tab-icon">👤</span>
            Mevcut Hasta
          </button>
          <button 
            className={`tab-button ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <span className="tab-icon">📋</span>
            Hasta Kuyruğu ({otherPatients.length})
          </button>
        </div>

        {activeTab === 'current' ? (
          <div className="doctor-grid">
          {/* Patient Summary */}
          <div className="summary-card">
            <div className="card-header">
              <h3>Hasta Özeti</h3>
              <div className={`priority-badge ${priorityInfo.color}`}>
                <span className="priority-icon">{priorityInfo.icon}</span>
                {triageResult?.triage_level || 'Değerlendirme Bekleniyor'}
              </div>
            </div>
            <div className="card-body">
              <div className="patient-summary">
                <div className="summary-item">
                  <span className="summary-label">Yaş/Cinsiyet:</span>
                  <span className="summary-value">{patientData?.age || 'Belirtilmedi'} / {patientData?.sex === 'F' ? 'Kadın' : patientData?.sex === 'M' ? 'Erkek' : 'Belirtilmedi'}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Gebelik:</span>
                  <span className="summary-value">
                    {patientData?.pregnancy === 'positive' ? 'Pozitif' : 
                     patientData?.pregnancy === 'negative' ? 'Negatif' : 'Seçilmedi'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Hastalık Özeti:</span>
                  <span className="summary-value">{patientData?.chief || 'Belirtilmedi'}</span>
                </div>
                <div className="summary-item full-width">
                  <span className="summary-label">Şikâyet Metni:</span>
                  <span className="summary-value">{patientData?.complaint || 'Belirtilmedi'}</span>
                </div>
                <div className="summary-item full-width">
                  <span className="summary-label">Vitaller:</span>
                  <span className="summary-value">{patientData?.vitals || 'Belirtilmedi'}</span>
                </div>
              </div>
              
              <div className="ai-assessment">
                <h4>AI Değerlendirmesi</h4>
                <div className={`priority-status ${priorityInfo.color}`}>
                  {priorityInfo.text}
                </div>
                <div className="assessment-rationale">
                  {triageResult?.rationale_brief || 'Değerlendirme henüz tamamlanmadı.'}
                </div>
              </div>

              {nurseNotes && (
                <div className="nurse-notes-section">
                  <h4>Hemşire Notları</h4>
                  <div className="notes-content">
                    {nurseNotes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Assessment */}
          <div className="assessment-card">
            <div className="card-header">
              <h3>Doktor Değerlendirmesi</h3>
            </div>
            <div className="card-body">
              <div className="assessment-form">
                <div className="form-group">
                  <label className="form-label">Tanı *</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Hastanın tanısını girin"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tedavi Planı *</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Tedavi planını detaylı olarak açıklayın..."
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reçete</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Verilecek ilaçları ve dozlarını belirtin..."
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Takip Önerileri</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Hasta takibi için öneriler..."
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Doktor Notları</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Ek gözlemler ve notlar..."
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Critical Findings */}
          {triageResult?.red_flags && Array.isArray(triageResult.red_flags) && triageResult.red_flags.length > 0 && (
            <div className="findings-card">
              <div className="card-header">
                <h3>Kritik Bulgular</h3>
              </div>
              <div className="card-body">
                <ul className="findings-list">
                  {triageResult.red_flags.map((finding: string, index: number) => (
                    <li key={index} className="finding-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.29 3.86L1.82 18C1.64547 18.3024 1.5729 18.6453 1.61211 18.9874C1.65132 19.3295 1.8005 19.6507 2.03819 19.8991C2.27588 20.1475 2.59005 20.3108 2.93006 20.3653C3.27007 20.4198 3.61959 20.3626 3.92 20.2L12 16L20.08 20.2C20.3804 20.3626 20.7299 20.4198 21.0699 20.3653C21.4099 20.3108 21.7241 20.1475 21.9618 19.8991C22.1995 19.6507 22.3487 19.3295 22.3879 18.9874C22.4271 18.6453 22.3545 18.3024 22.18 18L13.71 3.86C13.5318 3.56631 13.2807 3.32312 12.9812 3.15447C12.6817 2.98582 12.3438 2.89725 12 2.89725C11.6562 2.89725 11.3183 2.98582 11.0188 3.15447C10.7193 3.32312 10.4682 3.56631 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Complete Assessment */}
          <div className="complete-card">
            <div className="card-header">
              <h3>Değerlendirmeyi Tamamla</h3>
            </div>
            <div className="card-body">
              <div className="completion-summary">
                <div className="summary-check">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Hasta bilgileri alındı</span>
                </div>
                <div className="summary-check">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>AI değerlendirmesi tamamlandı</span>
                </div>
                <div className="summary-check">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Hemşire onayı alındı</span>
                </div>
                <div className={`summary-check ${diagnosis && treatment ? 'completed' : 'pending'}`}>
                  {diagnosis && treatment ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                  <span>Doktor değerlendirmesi</span>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-large"
                onClick={handleComplete}
                disabled={!diagnosis || !treatment}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Değerlendirmeyi Tamamla
              </button>
            </div>
          </div>
        </div>
        ) : (
          <div className="queue-container">
            <div className="queue-header">
              <h2>Hasta Kuyruğu</h2>
              <div className="queue-stats">
                <span className="stat-item critical">
                  <span className="stat-count">{otherPatients.filter(p => p.priority === 'ESI-1').length}</span>
                  <span className="stat-label">ESI-1</span>
                </span>
                <span className="stat-item moderate">
                  <span className="stat-count">{otherPatients.filter(p => p.priority === 'ESI-2').length}</span>
                  <span className="stat-label">ESI-2</span>
                </span>
                <span className="stat-item low">
                  <span className="stat-count">{otherPatients.filter(p => p.priority === 'ESI-3').length}</span>
                  <span className="stat-label">ESI-3</span>
                </span>
              </div>
            </div>

            <div className="patients-list">
              {otherPatients.map((patient) => (
                <div key={patient.id} className={`patient-card ${patient.priority.toLowerCase()}`}>
                  <div className="patient-header">
                    <div className="patient-info">
                      <h4>{patient.name}</h4>
                      <span className="patient-id">#{patient.id}</span>
                    </div>
                    <div className={`priority-badge ${patient.priority.toLowerCase()}`}>
                      {patient.priority}
                    </div>
                  </div>
                  
                  <div className="patient-details">
                    <div className="detail-row">
                      <span className="detail-label">Yaş/Cinsiyet:</span>
                      <span className="detail-value">{patient.age} / {patient.sex === 'M' ? 'Erkek' : 'Kadın'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Şikayet:</span>
                      <span className="detail-value">{patient.complaint}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Geliş Saati:</span>
                      <span className="detail-value">{patient.arrivalTime}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Durum:</span>
                      <span className={`status-badge ${patient.status.toLowerCase().replace(' ', '-')}`}>
                        {patient.status}
                      </span>
                    </div>
                  </div>

                  <div className="patient-actions">
                    <button className="btn btn-secondary btn-small">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Detayları Gör
                    </button>
                    <button className="btn btn-primary btn-small">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Muayene Et
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPage;
