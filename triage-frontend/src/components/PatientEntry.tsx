import React, { useState } from 'react';
import './PatientEntry.css';

interface PatientEntryProps {
  onStartAssessment: (patientData: any) => Promise<void>;
}

const PatientEntry: React.FC<PatientEntryProps> = ({ onStartAssessment }) => {
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
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [remainingQuestions, setRemainingQuestions] = useState(0);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Mock takip soruları başlat
      const mockQuestions = [
        'Ağrı ne zaman başladı?',
        'Daha önce benzer şikayet yaşadınız mı?',
        'Ağrı kesici aldınız mı?',
        'Başka belirtiler var mı?'
      ];
      
      setCaseId('MOCK-' + Date.now());
      setCurrentQuestion(mockQuestions[0]);
      setRemainingQuestions(mockQuestions.length - 1);
      setShowQuestions(true);
      
      await onStartAssessment(formData);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setIsLoading(false);
    }
  };

  const handleAnswerQuestion = () => {
    if (remainingQuestions > 0) {
      // Mock: Sonraki soruya geç
      const mockQuestions = [
        'Ağrı ne zaman başladı?',
        'Daha önce benzer şikayet yaşadınız mı?',
        'Ağrı kesici aldınız mı?',
        'Başka belirtiler var mı?'
      ];
      
      const currentIndex = mockQuestions.findIndex(q => q === currentQuestion);
      if (currentIndex < mockQuestions.length - 1) {
        setCurrentQuestion(mockQuestions[currentIndex + 1]);
        setRemainingQuestions(remainingQuestions - 1);
      }
    } else {
      // Sorular bitti
      setCurrentQuestion(null);
      setRemainingQuestions(0);
      setShowQuestions(false);
    }
    setQuestionAnswer('');
  };

  const handleSkipQuestion = () => {
    handleAnswerQuestion();
  };

  const handleFinishQuestions = () => {
    setCurrentQuestion(null);
    setRemainingQuestions(0);
    setShowQuestions(false);
    setQuestionAnswer('');
  };

  const isFormValid = () => {
    return formData.age && formData.sex && formData.complaint.trim();
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
            <div style={{marginBottom: '8px', fontWeight: '500'}}>
              {currentQuestion || 'Soru burada görünecek'}
            </div>
            <textarea 
              placeholder="Cevabınızı yazın..."
              value={questionAnswer}
              onChange={(e) => setQuestionAnswer(e.target.value)}
            ></textarea>
            <div className="split" style={{marginTop: '8px'}}>
              <button className="btn" onClick={handleAnswerQuestion}>
                Yanıtla (sonraki soru)
              </button>
              <button className="btn secondary" onClick={handleSkipQuestion}>
                Bu soruyu atla
              </button>
              <button className="btn success" onClick={handleFinishQuestions}>
                Bitir
              </button>
            </div>
            <div className="small muted" style={{marginTop: '6px'}}>
              Kalan soru sayısı: {remainingQuestions}
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
          <div className="result-summary">
            <div className="status-indicator">
              <span className="dot green"></span>
              <span className="status-text">Değerlendirme Durumu</span>
            </div>
            <div className="badges-container">
              <span className="badge primary">ESI: -</span>
              <span className="badge secondary">Öncelik: -</span>
              <span className="badge tertiary">Bölüm: -</span>
            </div>
          </div>

          {/* Değerlendirme Açıklaması */}
          <div className="rationale-section">
            <h3>Değerlendirme Açıklaması</h3>
            <div className="rationale-content">
              Henüz değerlendirme yapılmadı. Hasta bilgilerini girin ve değerlendirmeyi başlatın.
            </div>
          </div>

          <div className="hr"></div>
          
          {/* Kritik Bulgular */}
          <div className="section-block">
            <h3>Kritik Bulgular (Red Flags)</h3>
            <ul className="findings-list"></ul>
          </div>

          <div className="hr"></div>
          
          {/* İlk Müdahaleler */}
          <div className="section-block">
            <h3>İlk Müdahaleler</h3>
            <ul></ul>
          </div>

          <div className="hr"></div>
          <div>
            <strong>Sorulacak ek sorular (güncel)</strong>
            <ul></ul>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default PatientEntry;