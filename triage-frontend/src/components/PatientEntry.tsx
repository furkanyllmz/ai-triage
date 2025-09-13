import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './PatientEntry.css';
import { useTriageContext } from '../contexts/TriageContext';
import { triageApi } from '../services/triageApi';

interface PatientEntryProps {
  onStartAssessment: (patientData: any) => Promise<void>;
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
      await onStartAssessment(formData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setIsLoading(false);
    }
  };

  // API'den gelen sonuçları takip et ve soruları başlat
  useEffect(() => {
    if (triageResult && triageResult.questions_to_ask_next) {
      const questions = Array.isArray(triageResult.questions_to_ask_next) 
        ? triageResult.questions_to_ask_next 
        : [];
      
      if (questions.length > 0) {
        // İlk 3 soruyu al
        const firstThreeQuestions = questions.slice(0, 3);
        setCurrentQuestions(firstThreeQuestions);
        setShowQuestions(true);
        // Case ID'yi triageResult'tan al
        setCaseId(triageResult.case_id);
        // Cevapları sıfırla
        setQuestionAnswers({});
      }
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
      setTriageResult(response.triage);
      
      // Yeni gelen soruları kontrol et
      const newQuestions = Array.isArray(response.questions_to_ask_next) 
        ? response.questions_to_ask_next 
        : [];
      
      if (newQuestions.length > 0) {
        // Yeni soruları göster (ilk 3 tanesi)
        const nextThreeQuestions = newQuestions.slice(0, 3);
        setCurrentQuestions(nextThreeQuestions);
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
    <div className="patient-entry">
      <main>
        {/* SOL: Giriş & Soru Akışı */}
        <section className="card input-section">
          <div className="info-card">
            <h3>Triaj Değerlendirme</h3>
            <p>Hasta bilgilerini girin ve sistemin sorularını yanıtlayın</p>
          </div>
          
          <h2>Hasta Bilgisi</h2>

          {/* Form Content */}
          <div className="row">
            <div>
              <label>Yaş</label>
              <input 
                type="number" 
                min="0" 
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
              />
            </div>
            <div>
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

          <label>Şikâyet metni</label>
          <textarea 
            placeholder="örn. göğsümde baskı var, nefes almakta zorlanıyorum"
            value={formData.complaint}
            onChange={(e) => handleInputChange('complaint', e.target.value)}
          ></textarea>

          <div className="grid2">
            <div>
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
            <div>
              <label>Hastalık Özeti</label>
              <input 
                placeholder="Göğüs ağrısı"
                value={formData.chief}
                onChange={(e) => handleInputChange('chief', e.target.value)}
              />
            </div>
          </div>

          <label>Vitaller (JSON, opsiyonel)</label>
          <textarea 
            className="mono" 
            placeholder='örn. {"HR": 110, "RR": 24, "SpO2": 93, "SBP": 118, "Temp": 37.8}'
            value={formData.vitals}
            onChange={(e) => handleInputChange('vitals', e.target.value)}
          ></textarea>

          <div className="hr"></div>
          <div className="split">
            <button className="btn" onClick={handleSubmit} disabled={!isFormValid() || isLoading}>
              {isLoading ? 'Değerlendiriliyor...' : 'Başla'}
            </button>
            <button className="btn secondary" onClick={() => window.location.reload()}>
              Sıfırla
            </button>
          </div>

          <div className="small muted" style={{marginTop: '8px'}}>
            {isLoading && 'Değerlendirme başlatılıyor...'}
          </div>

          <div className="hr"></div>

          <h2>Takip Soruları</h2>
          <div className="qa" style={{display: showQuestions ? 'block' : 'none'}}>
            {currentQuestions.map((question, index) => (
              <div key={index} style={{marginBottom: '16px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px'}}>
                <div style={{marginBottom: '8px', fontWeight: '500'}}>
                  {index + 1}. {question}
                </div>
                <textarea 
                  placeholder="Cevabınızı yazın..."
                  value={questionAnswers[question] || ''}
                  onChange={(e) => handleAnswerChange(question, e.target.value)}
                  style={{width: '100%', minHeight: '60px'}}
                ></textarea>
              </div>
            ))}
            <div className="split" style={{marginTop: '16px'}}>
              <button className="btn" onClick={handleAnswerAllQuestions}>
                Tüm Cevapları Gönder
              </button>
              <button className="btn secondary" onClick={handleSkipAllQuestions}>
                Tümünü Atla
              </button>
              <button className="btn success" onClick={handleFinishQuestions}>
                Bitir
              </button>
            </div>
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
            <div className="small muted" style={{marginTop: '6px'}}>
              Toplam soru sayısı: {currentQuestions.length}
            </div>
          </div>

          <div className="small muted" style={{display: !showQuestions ? 'block' : 'none'}}>
            Şu an sorulacak başka soru yok.
          </div>

          <div className="hr"></div>
          <div>
            <h2>Oturum Bilgisi</h2>
            <div className="small">Case ID: <span className="pill">{caseId || '-'}</span></div>
            <div className="small">Son kayıt: <span>{caseId ? 'MOCK-' + Date.now() : '-'}</span></div>
          </div>
        </section>

        {/* SAĞ: Canlı Sonuç Paneli */}
        <aside className="card results-section">
          <h2>Değerlendirme Sonuçları</h2>
          
          {/* Durum Özeti */}
          <div className={`result-summary ${getESIClass()}`}>
            <div className="status-indicator">
              <span className={getDotClass()}></span>
              <span className="status-text">Değerlendirme Durumu</span>
            </div>
            <div className="badges-container">
              <span className={`badge primary ${getESIClass()}`}>ESI: {renderTriageLevel()}</span>
              <span className="badge secondary">Öncelik: {renderPriority()}</span>
              <span className="badge tertiary">Bölüm: {renderSpecialty()}</span>
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
          <div>
            <strong>Sorulacak ek sorular (güncel)</strong>
            <ul>
              {renderQuestionsToAsk().map((question: string, index: number) => (
                <li key={index}>{question}</li>
              ))}
              {renderQuestionsToAsk().length === 0 && (
                <li className="no-items">Henüz ek soru önerisi yok</li>
              )}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default PatientEntry;