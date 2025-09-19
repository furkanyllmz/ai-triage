import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import HomePage from './components/HomePage';
import PatientEntry from './components/PatientEntry';
import DoctorPage from './components/DoctorPage';
import Dashboard from './components/Dashboard';
import QrCodeTestPage from './components/QrCodeTestPage';
import { TriageProvider, useTriageContext } from './contexts/TriageContext';
import { TriageState, TriageInput, StepResp } from './types/TriageTypes';
import { triageApi } from './services/triageApi';

function AppContent() {
  const { patientData, setPatientData, triageResult, setTriageResult, clearData } = useTriageContext();
  
  const [triageState, setTriageState] = useState<TriageState>({
    caseId: null,
    currentQuestion: null,
    remainingQuestions: 0,
    triage: null,
    isLoading: false,
    error: null,
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Clear data only on initial page load (not on component re-renders)
  useEffect(() => {
    // Only clear if there's no active session (no current patient data being processed)
    if (!patientData && !triageResult) {
      clearData();
    }
  }, []); // Empty dependency array means this runs only once on mount

  const processNextQuestion = useCallback((resp: StepResp) => {
    return resp.next_question || null;
  }, []);

  const handleStartTriage = useCallback(async (input: TriageInput) => {
    setTriageState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await triageApi.startTriage(input);
      setTriageState(prev => ({
        ...prev,
        caseId: response.case_id,
        currentQuestion: processNextQuestion(response),
        remainingQuestions: response.finished ? 0 : 2,
        triage: response.triage || null,
        isLoading: false,
        error: null,
      }));
      
      return response; // Response'u döndür
    } catch (error: any) {
      setTriageState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [processNextQuestion]);

  const handleSendAnswer = useCallback(async (answer: string, skip: boolean = false) => {
    if (!triageState.caseId) return;

    setTriageState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const currentQ = triageState.currentQuestion;
      const body = {
        answers: currentQ ? { [currentQ]: skip ? '' : answer } : undefined,
        done: false,
      };

      const response = await triageApi.sendAnswer(triageState.caseId, body);
      setTriageState(prev => ({
        ...prev,
        currentQuestion: response.finished ? null : processNextQuestion(response),
        remainingQuestions: response.finished ? 0 : Math.max(0, prev.remainingQuestions - 1),
        triage: response.triage || null,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setTriageState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [triageState.caseId, triageState.currentQuestion, processNextQuestion]);

  const handleDone = useCallback(async () => {
    if (!triageState.caseId) return;

    setTriageState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await triageApi.sendAnswer(triageState.caseId, { done: true });
      
      setTriageState(prev => ({
        ...prev,
        currentQuestion: null,
        remainingQuestions: 0,
        triage: response.triage || null,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setTriageState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [triageState.caseId]);

  const handleReset = useCallback(() => {
    setTriageState({
      caseId: null,
      currentQuestion: null,
      remainingQuestions: 0,
      triage: null,
      isLoading: false,
      error: null,
    });
    clearData();
  }, [clearData]);

  const handlePatientStart = useCallback(async (data: any) => {
    try {
      setPatientData(data);
      
      // Vitals artık obje formatında geliyor, direkt kullan
      const vitals = data.vitals || {};
      
      // Gerçek API çağrısı
      const triageInput: TriageInput = {
        age: parseInt(data.age),
        sex: data.sex,
        complaint_text: data.complaint,
        pregnancy: data.pregnancy,
        chief: data.chief || 'string',

        vitals: data.vitals || {}
      };

      const response = await handleStartTriage(triageInput);
      
      // API'den gelen sonucu kullan ve case_id'yi ekle
      setTriageResult(response.triage ? { ...response.triage, case_id: response.case_id } : null);
      setTriageState(prev => ({
        ...prev,
        triage: response.triage || null,
        caseId: response.case_id,
        isLoading: false,
        error: null
      }));
      return response;
    } catch (error) {
      console.error('Error starting triage:', error);
      // Stay on patient page if there's an error
    }
  }, [handleStartTriage]);



  const handleDoctorComplete = useCallback(() => {
    // Reset to start new assessment
    handleReset();
    window.location.href = '/';
  }, [handleReset]);

  return (
    <div className="App min-h-screen flex flex-col">
      <Router>
        <Header />
        <div className="theme-toggle-container">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDarkMode ? 'Gündüz moduna geç' : 'Gece moduna geç'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <main className="main-content flex-grow">
          <Switch>
            <Route path="/" exact>
              <HomePage />
            </Route>

            <Route path="/patient">
              <PatientEntry onStartAssessment={handlePatientStart} />
            </Route>

            <Route path="/doctor">
              <DoctorPage
                patientData={patientData}
                triageResult={triageResult}
                onComplete={handleDoctorComplete}
              />
            </Route>
            <Route path="/dashboard">
              <Dashboard />
            </Route>
            <Route path="/qr-test">
              <QrCodeTestPage />
            </Route>
            
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        </main>
        
        {/* Footer */}
        <footer className="w-full py-4 px-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 mt-auto">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Product by Furkan Yılmaz, Talip Kurt, Aleyna Taşdemir
            </p>
          </div>
        </footer>
      </Router>
    </div>
  );
}

function App() {
  return (
    <TriageProvider>
      <AppContent />
    </TriageProvider>
  );
}

export default App;
