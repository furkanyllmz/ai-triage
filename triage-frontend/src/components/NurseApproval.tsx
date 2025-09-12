import React, { useState } from 'react';
import './NurseApproval.css';

interface NurseApprovalProps {
  patientData: any;
  triageResult: any;
  onApprove: (notes: string) => void;
  onReject: () => void;
}

const NurseApproval: React.FC<NurseApprovalProps> = ({ 
  patientData, 
  triageResult, 
  onApprove, 
  onReject 
}) => {
  const [notes, setNotes] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [activeTab, setActiveTab] = useState<'current' | 'queue'>('current');

  // Mock data for other patients waiting for nurse approval
  const waitingPatients = [
    {
      id: 'P005',
      name: 'Ali Veli',
      age: 38,
      sex: 'M',
      complaint: 'Mide bulantısı',
      priority: 'ESI-3',
      arrivalTime: '15:30',
      status: 'Hemşire Onayı Bekliyor',
      triageLevel: 'ESI-3'
    },
    {
      id: 'P006',
      name: 'Zeynep Kaya',
      age: 25,
      sex: 'F',
      complaint: 'Baş dönmesi',
      priority: 'ESI-2',
      arrivalTime: '15:45',
      status: 'Hemşire Onayı Bekliyor',
      triageLevel: 'ESI-2'
    },
    {
      id: 'P007',
      name: 'Mustafa Öz',
      age: 55,
      sex: 'M',
      complaint: 'Göğüs sıkışması',
      priority: 'ESI-1',
      arrivalTime: '16:00',
      status: 'Acil Onay Bekliyor',
      triageLevel: 'ESI-1'
    }
  ];

  const handleApprove = () => {
    setApprovalStatus('approved');
    setTimeout(() => {
      onApprove(notes);
    }, 1000);
  };

  const handleReject = () => {
    setApprovalStatus('rejected');
    setTimeout(() => {
      onReject();
    }, 1000);
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
    <div className="nurse-approval">
      <div className="approval-content">
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
            <span className="tab-icon">⏳</span>
            Onay Bekleyen ({waitingPatients.length})
          </button>
        </div>

        {activeTab === 'current' ? (
          <div className="approval-grid">
          {/* Patient Information */}
          <div className="info-card">
            <div className="card-header">
              <h3>Hasta Bilgileri</h3>
            </div>
            <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Yaş:</span>
                <span className="info-value">{patientData?.age || 'Belirtilmedi'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Cinsiyet:</span>
                <span className="info-value">{patientData?.sex === 'F' ? 'Kadın' : patientData?.sex === 'M' ? 'Erkek' : 'Belirtilmedi'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Gebelik:</span>
                <span className="info-value">
                  {patientData?.pregnancy === 'positive' ? 'Pozitif' : 
                   patientData?.pregnancy === 'negative' ? 'Negatif' : 'Seçilmedi'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Hastalık Özeti:</span>
                <span className="info-value">{patientData?.chief || 'Belirtilmedi'}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Şikâyet Metni:</span>
                <span className="info-value">{patientData?.complaint || 'Belirtilmedi'}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Vitaller:</span>
                <span className="info-value">{patientData?.vitals || 'Belirtilmedi'}</span>
              </div>
            </div>
            </div>
          </div>

          {/* AI Assessment */}
          <div className="assessment-card">
            <div className="card-header">
              <h3>AI Değerlendirmesi</h3>
              <div className={`priority-badge ${priorityInfo.color}`}>
                <span className="priority-icon">{priorityInfo.icon}</span>
                {triageResult?.triage_level || 'Değerlendirme Bekleniyor'}
              </div>
            </div>
            <div className="card-body">
              <div className={`priority-status ${priorityInfo.color}`}>
                <div className="priority-text">{priorityInfo.text}</div>
              </div>
              
              <div className="assessment-details">
                <h4>Değerlendirme Açıklaması</h4>
                <div className="rationale">
                  {triageResult?.rationale_brief || 'Değerlendirme henüz tamamlanmadı.'}
                </div>
              </div>

              {triageResult?.red_flags && Array.isArray(triageResult.red_flags) && triageResult.red_flags.length > 0 && (
                <div className="critical-findings">
                  <h4>Kritik Bulgular</h4>
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
              )}

              {triageResult?.immediate_actions && Array.isArray(triageResult.immediate_actions) && triageResult.immediate_actions.length > 0 && (
                <div className="immediate-actions">
                  <h4>Önerilen Müdahaleler</h4>
                  <ul className="actions-list">
                    {triageResult.immediate_actions.map((action: string, index: number) => (
                      <li key={index} className="action-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Nurse Actions */}
          <div className="actions-card">
            <div className="card-header">
              <h3>Hemşire Kararı</h3>
            </div>
            <div className="card-body">
              <div className="nurse-notes">
                <label className="form-label">Hemşire Notları</label>
                <textarea 
                  className="form-textarea"
                  placeholder="Ek gözlemlerinizi ve notlarınızı buraya yazın..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="approval-actions">
                <button 
                  className={`btn btn-success ${approvalStatus === 'approved' ? 'loading' : ''}`}
                  onClick={handleApprove}
                  disabled={approvalStatus !== 'pending'}
                >
                  {approvalStatus === 'approved' ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Onaylandı
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Onayla
                    </>
                  )}
                </button>

                <button 
                  className={`btn btn-secondary ${approvalStatus === 'rejected' ? 'loading' : ''}`}
                  onClick={handleReject}
                  disabled={approvalStatus !== 'pending'}
                >
                  {approvalStatus === 'rejected' ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="18,6 6,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="6,6 18,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Reddedildi
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="18,6 6,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="6,6 18,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Reddet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="queue-container">
            <div className="queue-header">
              <h2>Hemşire Onayı Bekleyen Hastalar</h2>
              <div className="queue-stats">
                <span className="stat-item critical">
                  <span className="stat-count">{waitingPatients.filter(p => p.priority === 'ESI-1').length}</span>
                  <span className="stat-label">ESI-1</span>
                </span>
                <span className="stat-item moderate">
                  <span className="stat-count">{waitingPatients.filter(p => p.priority === 'ESI-2').length}</span>
                  <span className="stat-label">ESI-2</span>
                </span>
                <span className="stat-item low">
                  <span className="stat-count">{waitingPatients.filter(p => p.priority === 'ESI-3').length}</span>
                  <span className="stat-label">ESI-3</span>
                </span>
              </div>
            </div>

            <div className="patients-list">
              {waitingPatients.map((patient) => (
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
                      <span className={`status-badge ${patient.status.toLowerCase().replace(/\s+/g, '-')}`}>
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
                      Onayla
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

export default NurseApproval;
