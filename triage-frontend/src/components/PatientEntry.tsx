import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './PatientEntry.css';
import '../styles/triage-page.css';
import { useTriageContext } from '../contexts/TriageContext';
import { StepResp } from '../types/TriageTypes';
import { triageApi } from '../services/triageApi';

interface PatientEntryProps {
  onStartAssessment: (patientData: any) => Promise<StepResp | void>;
}

const PatientEntry: React.FC<PatientEntryProps> = ({ onStartAssessment }) => {
  const { triageResult, setTriageResult } = useTriageContext();
  const history = useHistory();
  
  // Debug: triageResult'ı console'a yazdır
  useEffect(() => {
    console.log('PatientEntry - triageResult:', triageResult);
  }, [triageResult]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '30',
    sex: 'F',
    complaint: '',
    pregnancy: 'any',
    chief: '',
    vitals: ''
  });
  
  // Takip soruları için state
  const [currentQuestions, setCurrentQuestions] = useState<string[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<{[key: string]: string}>({});
  const [showQuestions, setShowQuestions] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const resp = await onStartAssessment(formData);
      if (resp && typeof resp === 'object') {
        const step = resp as StepResp;
        if (step.case_id) setCaseId(step.case_id);
        if (!step.finished && step.next_question) {
          setCurrentQuestions([step.next_question]);
          setShowQuestions(true);
          setQuestionAnswers({});
        } else {
          setCurrentQuestions([]);
          setShowQuestions(false);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setIsLoading(false);
    }
  };

  // API'den gelen step yanıtını takip et ve soruyu başlat (App artık state'i yönetiyor)
  useEffect(() => {
    if (triageResult && triageResult.case_id) {
      setCaseId(triageResult.case_id);
    }
  }, [triageResult]);

  const handleAnswerAllQuestions = async () => {
    if (!caseId || currentQuestions.length === 0) return;
    
    try {
      // Tüm cevapları birden gönder
      const response = await triageApi.sendAnswer(caseId, {
        answers: questionAnswers
      });
      
      // Sonuçları güncelle (context'e yeni veri gönder)
      setTriageResult(response.triage || null);
      
      // Yeni step'e göre sıradaki soruyu belirle
      if (!response.finished && response.next_question) {
        setCurrentQuestions([response.next_question]);
        setShowQuestions(true);
        setQuestionAnswers({});
      } else {
        // Sorular bitti
        setCurrentQuestions([]);
        setShowQuestions(false);
      }
      
    } catch (error) {
      console.error('Cevap gönderme hatası:', error);
      alert('Cevap gönderilirken hata oluştu: ' + error);
    }
  };

  const handleSkipAllQuestions = () => {
    handleAnswerAllQuestions();
  };

  const handleFinishQuestions = () => {
    setCurrentQuestions([]);
    setShowQuestions(false);
    setQuestionAnswers({});
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  const handleViewLabel = () => {
    if (caseId) {
      history.push(`/qr-test?caseId=${caseId}`);
    }
  };

  const isFormValid = () => {
    return formData.age && formData.sex && formData.complaint.trim();
  };

  // Triaj sonuçlarını render etmek için yardımcı fonksiyonlar
  const renderTriageLevel = () => {
    if (!triageResult?.triage_level) return '-';
    return triageResult.triage_level;
  };

  const renderPriority = () => {
    if (!triageResult?.routing?.priority) return '-';
    return triageResult.routing.priority;
  };

  const renderSpecialty = () => {
    if (!triageResult?.routing?.specialty) return '-';
    return triageResult.routing.specialty;
  };

  const renderRationale = () => {
    if (!triageResult?.rationale_brief && !triageResult?.rationale) {
      return 'Henüz değerlendirme yapılmadı. Hasta bilgilerini girin ve değerlendirmeyi başlatın.';
    }
    return triageResult.rationale_brief || triageResult.rationale;
  };

  const renderRedFlags = () => {
    if (!triageResult?.red_flags || triageResult.red_flags.length === 0) {
      return [];
    }
    return triageResult.red_flags;
  };

  const renderImmediateActions = () => {
    if (!triageResult?.immediate_actions || triageResult.immediate_actions.length === 0) {
      return [];
    }
    return triageResult.immediate_actions;
  };

  const renderQuestionsToAsk = () => {
    if (!triageResult?.questions_to_ask_next || triageResult.questions_to_ask_next.length === 0) {
      return [];
    }
    return triageResult.questions_to_ask_next;
  };

  const getESIClass = () => {
    if (!triageResult?.triage_level) return '';
    const level = triageResult.triage_level.split('-')[1];
    return `esi-${level}`;
  };

  const getDotClass = () => {
    if (!triageResult?.triage_level) return 'dot green';
    const level = parseInt(triageResult.triage_level.split('-')[1]);
    if (level <= 2) return 'dot red';
    if (level === 3) return 'dot yellow';
    return 'dot green';
  };

  return (
    <div className="app-shell">
      <div className="grid">
        {/* SOL: Giriş & Soru Akışı */}
        <section className="card form-card">
          <div className="card__body">
            {/* Header Section */}
            <div className="form-header">
              <h2 className="form-title">Triaj Değerlendirme</h2>
              <p className="form-subtitle">Hasta bilgilerini girin ve sistemin sorularını yanıtlayın</p>
            </div>
            
            {/* Hasta Bilgisi Section */}
            <h3 className="section-title">Hasta Bilgisi</h3>
            <div className="patient-info-section">
              
              <div className="form-row">
                <div className="form-field">
                  <label>Yaş</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Cinsiyet</label>
                  <select 
                    value={formData.sex}
                    onChange={(e) => handleInputChange('sex', e.target.value)}
                  >
                    <option value="F">Kadın</option>
                    <option value="M">Erkek</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Şikâyet metni</label>
                <textarea 
                  placeholder="örn. göğsümde baskı var, nefes almakta zorlanıyorum"
                  value={formData.complaint}
                  onChange={(e) => handleInputChange('complaint', e.target.value)}
                  rows={4}
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Gebelik</label>
                  <select 
                    value={formData.pregnancy}
                    onChange={(e) => handleInputChange('pregnancy', e.target.value)}
                  >
                    <option value="any">Seçilmedi</option>
                    <option value="positive">Pozitif</option>
                    <option value="negative">Negatif</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Hastalık Özeti</label>
                  <input 
                    placeholder="Göğüs ağrısı"
                    value={formData.chief}
                    onChange={(e) => handleInputChange('chief', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Vitaller (opsiyonel)</label>
                <textarea 
                  placeholder='Örnek: Tansiyon 120/80, Nabız 90, Ateş 37.5°C, Oksijen 95%'
                  value={formData.vitals}
                  onChange={(e) => handleInputChange('vitals', e.target.value)}
                  rows={3}
                ></textarea>
                <div className="vitals-help-box">
                  <h4>Hangi bilgileri yazabilirsiniz?</h4>
                  <ul>
                    <li><strong>Tansiyon:</strong> 120/80, 140/90 gibi</li>
                    <li><strong>Nabız:</strong> 90, 110 gibi</li>
                    <li><strong>Ateş:</strong> 37.5°C, 38.2°C gibi</li>
                    <li><strong>Oksijen saturasyonu:</strong> 95%, 98% gibi</li>
                    <li><strong>Solunum sayısı:</strong> 20/dk, 24/dk gibi</li>
                    <li><strong>Diğer:</strong> İstediğiniz vital bulguları serbest metin olarak yazabilirsiniz</li>
                  </ul>
                  <div className="vitals-note">
                    <strong>Not:</strong> Vitalleri doğal dilde yazabilirsiniz. Sistem otomatik olarak işleyecektir.
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn btn--primary" onClick={handleSubmit} disabled={!isFormValid() || isLoading}>
                  {isLoading ? 'Değerlendiriliyor...' : 'Başla'}
                </button>
                <button className="btn btn--secondary" onClick={() => window.location.reload()}>
                  Sıfırla
                </button>
              </div>
            </div>

            {/* Takip Soruları Section */}
            <div className="follow-up-section">
              <h3 className="section-title">Takip Soruları</h3>
              <div className="qa" style={{display: showQuestions ? 'block' : 'none'}}>
                {currentQuestions.map((question, index) => (
                  <div key={index} className="question-item">
                    <div className="question-text">
                      {index + 1}. {question}
                    </div>
                    <textarea 
                      placeholder="Cevabınızı yazın..."
                      value={questionAnswers[question] || ''}
                      onChange={(e) => handleAnswerChange(question, e.target.value)}
                      className="answer-input"
                    ></textarea>
                  </div>
                ))}
                <div className="question-actions">
                  <button className="btn btn--primary" onClick={handleAnswerAllQuestions}>
                    Tüm Cevapları Gönder
                  </button>
                  <button className="btn btn--secondary" onClick={handleSkipAllQuestions}>
                    Tümünü Atla
                  </button>
                  <button className="btn btn--success" onClick={handleFinishQuestions}>
                    Bitir
                  </button>
                </div>
                <div className="question-info">
                  <button 
                    className="btn btn--secondary" 
                    onClick={handleViewLabel}
                    disabled={!caseId}
                  >
                    Etiketi Görüntüle
                  </button>
                </div>
                <div className="question-count">
                  Toplam soru sayısı: {currentQuestions.length}
                </div>
              </div>
              <div className="no-questions" style={{display: !showQuestions ? 'block' : 'none'}}>
                Şu an sorulacak başka soru yok.
              </div>
            </div>

            {/* Oturum Bilgisi Section */}
            <div className="session-info-section">
              <h3 className="section-title">Oturum Bilgisi</h3>
              <div className="session-details">
                <div className="session-item">
                  <span className="session-label">Case ID:</span>
                  <span className="session-value">{caseId || '-'}</span>
                </div>
                <div className="session-item">
                  <span className="session-label">Son kayıt:</span>
                  <span className="session-value">{caseId ? 'MOCK-' + Date.now() : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SAĞ: Canlı Sonuç Paneli */}
        <aside className="card result-card">
          <div className="card__body">
            {/* Header Section */}
            <h2 className="section-title">Değerlendirme Sonuçları</h2>
            {/* Durum Özeti */}
            <div className="status-bar">
              <div className="status-bar__title">Değerlendirme Durumu</div>
              <div className="status-bar__content">
                <div className="status-bar__value">{renderTriageLevel()}</div>
                <div className="status-pills">
                  <span className="status-pill status-pill--inactive">
                    ESI: {renderTriageLevel()}
                  </span>
                  <span className="status-pill status-pill--inactive">
                    Öncelik: {renderPriority()}
                  </span>
                  <span className="status-pill status-pill--inactive">
                    Bölüm: {renderSpecialty()}
                  </span>
                </div>
              </div>
            </div>

          {/* Değerlendirme Açıklaması */}
          <div className="rationale-section">
            <h3>Değerlendirme Açıklaması</h3>
            <div className="rationale-content">
              {renderRationale()}
            </div>
          </div>

          <div className="hr"></div>
          
          {/* Kritik Bulgular */}
          <div className="section-block">
            <h3>Kritik Bulgular (Red Flags)</h3>
            <ul className="findings-list">
              {renderRedFlags().map((flag: string, index: number) => (
                <li key={index}>{flag}</li>
              ))}
              {renderRedFlags().length === 0 && (
                <li className="no-items">Henüz kritik bulgu tespit edilmedi</li>
              )}
            </ul>
          </div>

          <div className="hr"></div>
          
          {/* İlk Müdahaleler */}
          <div className="section-block">
            <h3>İlk Müdahaleler</h3>
            <ul>
              {renderImmediateActions().map((action: string, index: number) => (
                <li key={index}>{action}</li>
              ))}
              {renderImmediateActions().length === 0 && (
                <li className="no-items">Henüz acil müdahale önerisi yok</li>
              )}
            </ul>
          </div>

          <div className="hr"></div>
          <div className="section-block">
            <h3>Sorulacak ek sorular (güncel)</h3>
            <ul>
              {renderQuestionsToAsk().map((question: string, index: number) => (
                <li key={index}>{question}</li>
              ))}
              {renderQuestionsToAsk().length === 0 && (
                <li className="no-items">Henüz ek soru önerisi yok</li>
              )}
            </ul>
            <div className="split" style={{marginTop: '12px'}}>
              <button 
                className="btn secondary" 
                onClick={handleViewLabel}
                disabled={!caseId}
                style={{width: '100%'}}
              >
                📋 Etiketi Görüntüle
              </button>
            </div>
          </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PatientEntry;