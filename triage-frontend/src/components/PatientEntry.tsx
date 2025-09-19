import React, { useState, useEffect } from 'react';
import { TriageOutput, StepResp } from '../types/TriageTypes';
import { triageApi } from '../services/triageApi';

interface PatientEntryProps {
  onStartAssessment: (patientData: any) => Promise<StepResp | void>;
}

const PatientEntry: React.FC<PatientEntryProps> = ({ onStartAssessment }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '30',
    sex: 'F',
    complaint: '',
    pregnancy: 'any',
    chief: '',
    vitals: {
      pulse: '',
      temperature: '',
      oxygen: '',
      blood_pressure: '',
      respiratory_rate: ''
    }
  });
  
  // Takip soruları için state
  const [currentQuestions, setCurrentQuestions] = useState<string[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<{[key: string]: string}>({});
  const [showQuestions, setShowQuestions] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<TriageOutput | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVitalChange = (vitalField: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [vitalField]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const apiData = {
        ...formData,
        vitals: getVitalsForAPI()
      };
      const resp = await onStartAssessment(apiData);
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

  // API'den gelen step yanıtını takip et ve soruyu başlat
  useEffect(() => {
    // TriageResult artık case_id içermiyor, caseId ayrı state olarak yönetiliyor
  }, [triageResult]);

  const handleAnswerAllQuestions = async () => {
    if (!caseId || currentQuestions.length === 0) return;
    
    try {
      const response = await triageApi.sendAnswer(caseId, {
        answers: questionAnswers
      });
      
      setTriageResult(response.triage || null);
      
      if (!response.finished && response.next_question) {
        setCurrentQuestions([response.next_question]);
        setShowQuestions(true);
        setQuestionAnswers({});
      } else {
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
      window.open(`/qr-test?caseId=${caseId}`, '_blank');
    }
  };

  const isFormValid = () => {
    return formData.age && formData.sex && formData.complaint.trim();
  };

  // Vitalleri API formatına çevir
  const getVitalsForAPI = () => {
    const vitals = { ...formData.vitals };
    // Boş değerleri temizle
    Object.keys(vitals).forEach(key => {
      if (!vitals[key as keyof typeof vitals]) {
        delete vitals[key as keyof typeof vitals];
      }
    });
    return vitals;
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
    if (!triageResult?.rationale_brief) {
      return 'Henüz değerlendirme yapılmadı. Hasta bilgilerini girin ve değerlendirmeyi başlatın.';
    }
    return triageResult.rationale_brief;
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

  const getESIClass = () => {
    if (!triageResult?.triage_level) return '';
    const level = triageResult.triage_level.split('-')[1];
    return `esi-${level}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="flex-grow w-full max-w-6xl mx-auto py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 lg:p-8 xl:p-10 rounded-xl shadow-lg">
          <div className="mb-6 sm:mb-8">
            <div className="bg-blue-600 text-white p-4 rounded-lg mb-6 w-full lg:w-1/2">
              <h2 className="text-lg sm:text-xl font-bold text-left text-white">Triaj Değerlendirme</h2>
              <p className="mt-2 text-xs sm:text-sm text-left text-white opacity-90">Lütfen bilgilerinizi girerek ön değerlendirme sürecini başlatın.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 sm:gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-8">
            {/* Sol: Hasta Bilgileri */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2 sm:pb-3">Hasta Bilgileri</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="complaint">Ana Şikayetiniz</label>
                <input 
                  className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 mt-1"
                  id="complaint" 
                  name="complaint" 
                  placeholder="Örn: Göğüs ağrısı, baş dönmesi..."
                  value={formData.complaint}
                  onChange={(e) => handleInputChange('complaint', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="age">Yaş</label>
                  <input 
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 mt-1"
                    id="age" 
                    name="age" 
                    placeholder="Örn: 35" 
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="gender">Cinsiyet</label>
                  <select 
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 mt-1"
                    id="gender" 
                    name="gender"
                    value={formData.sex}
                    onChange={(e) => handleInputChange('sex', e.target.value)}
                  >
                    <option value="F">Kadın</option>
                    <option value="M">Erkek</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vital Bulgular</h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400" htmlFor="pulse">Nabız (bpm)</label>
                    <input 
                      className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 mt-1"
                      id="pulse" 
                      name="pulse" 
                      placeholder="80" 
                      type="text"
                      value={formData.vitals.pulse}
                      onChange={(e) => handleVitalChange('pulse', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400" htmlFor="temperature">Ateş (°C)</label>
                    <input 
                      className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 mt-1"
                      id="temperature" 
                      name="temperature" 
                      placeholder="36.5" 
                      type="text"
                      value={formData.vitals.temperature}
                      onChange={(e) => handleVitalChange('temperature', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400" htmlFor="oxygen">O2 Sat. (%)</label>
                    <input 
                      className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 mt-1"
                      id="oxygen" 
                      name="oxygen" 
                      placeholder="98" 
                      type="text"
                      value={formData.vitals.oxygen}
                      onChange={(e) => handleVitalChange('oxygen', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400" htmlFor="blood_pressure">Tansiyon (mmHg)</label>
                    <input 
                      className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 mt-1"
                      id="blood_pressure" 
                      name="blood_pressure" 
                      placeholder="120/80" 
                      type="text"
                      value={formData.vitals.blood_pressure}
                      onChange={(e) => handleVitalChange('blood_pressure', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 dark:text-gray-400" htmlFor="respiratory_rate">Solunum (dakika)</label>
                    <input 
                      className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 mt-1"
                      id="respiratory_rate" 
                      name="respiratory_rate" 
                      placeholder="20" 
                      type="text"
                      value={formData.vitals.respiratory_rate}
                      onChange={(e) => handleVitalChange('respiratory_rate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="pregnancy">Gebelik</label>
                  <select 
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 mt-1"
                    id="pregnancy" 
                    name="pregnancy"
                    value={formData.pregnancy}
                    onChange={(e) => handleInputChange('pregnancy', e.target.value)}
                  >
                    <option value="any">Seçilmedi</option>
                    <option value="positive">Pozitif</option>
                    <option value="negative">Negatif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="chief">Hastalık Özeti</label>
                  <input 
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 mt-1"
                    id="chief" 
                    name="chief" 
                    placeholder="Göğüs ağrısı"
                    value={formData.chief}
                    onChange={(e) => handleInputChange('chief', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#2563eb' }}
                  onClick={handleSubmit} 
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? 'Değerlendiriliyor...' : 'Değerlendir ve Sonucu Göster'}
                </button>
              </div>
            </div>

            {/* Sağ: Takip Soruları ve Sonuçlar */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2 sm:pb-3">Takip Soruları</h3>
              
              {showQuestions && currentQuestions.length > 0 ? (
                <div className="space-y-4">
                  {currentQuestions.map((question, index) => (
                    <div key={index} className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700">
                      <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {index + 1}. {question}
                      </p>
                      <textarea 
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
                        placeholder="Cevabınızı yazın..."
                        value={questionAnswers[question] || ''}
                        onChange={(e) => handleAnswerChange(question, e.target.value)}
                        rows={3}
                      />
                    </div>
                  ))}
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                    <button 
                      className="flex-1 py-2 px-3 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: '#2563eb' }}
                      onClick={handleAnswerAllQuestions}
                    >
                      Cevapları Gönder
                    </button>
                    <button 
                      className="flex-1 py-2 px-3 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      onClick={handleSkipAllQuestions}
                    >
                      Atla
                    </button>
                    <button 
                      className="flex-1 py-2 px-3 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={handleFinishQuestions}
                    >
                      Bitir
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-center">
                  <p className="text-gray-600 dark:text-gray-300">Şu an sorulacak başka soru yok.</p>
                </div>
              )}

              {/* Oturum Bilgisi */}
              {caseId && (
                <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Oturum Bilgisi</h4>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    <p><strong>Case ID:</strong> {caseId}</p>
                    <p><strong>Son kayıt:</strong> {new Date().toLocaleString('tr-TR')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sonuç Bölümü */}
          {triageResult && (
            <div className="mt-10 border-t border-gray-200 dark:border-gray-600 pt-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Ön Değerlendirme Sonucu ve Yönlendirme</h3>
              <div className="p-3 sm:p-4 lg:p-5 rounded-lg border bg-blue-50 dark:bg-indigo-900/20 border-blue-200 dark:border-indigo-700">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2563eb' }}>
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-base font-bold text-gray-900 dark:text-white">ESI Seviyesi: {renderTriageLevel()}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">Yönlendirme:</span> {renderSpecialty()} - {renderPriority()} öncelik
                    </p>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{renderRationale()}</p>
                    
                    {renderRedFlags().length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">Kritik Bulgular:</p>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {renderRedFlags().map((flag: string, index: number) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                              {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {renderImmediateActions().length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">İlk Müdahaleler:</p>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {renderImmediateActions().map((action: string, index: number) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-orange-500 rounded-full mr-2"></span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button 
                        className="py-2 px-3 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{ backgroundColor: '#2563eb' }}
                        onClick={handleViewLabel}
                      >
                        📋 Etiketi Görüntüle
                      </button>
                      <button 
                        className="py-2 px-3 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        onClick={() => window.location.reload()}
                      >
                        Yeni Değerlendirme
                      </button>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <strong>Yasal Uyarı:</strong> Bu sonuç, yapay zeka tarafından yapılan bir ön değerlendirmedir ve tıbbi bir tanı niteliği taşımaz. Sağlık sorunlarınız için mutlaka bir sağlık uzmanına danışın.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientEntry;