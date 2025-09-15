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
import { TriageState, TriageInput } from './types/TriageTypes';
import { triageApi } from './services/triageApi';

function AppContent() {
  const { patientData, setPatientData, triageResult, setTriageResult, clearData } = useTriageContext();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    
    // Add transition class for smooth animation
    document.documentElement.classList.add('theme-transitioning');
    
    // Small delay to ensure transition class is applied
    setTimeout(() => {
      setIsDarkMode(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      
      // Remove transition class after animation completes
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 300);
    }, 10);
  };
  
  const [triageState, setTriageState] = useState<TriageState>({
    caseId: null,
    currentQuestion: null,
    remainingQuestions: 0,
    triage: null,
    isLoading: false,
    error: null,
  });

  // Clear data only on initial page load (not on component re-renders)
  useEffect(() => {
    // Only clear if there's no active session (no current patient data being processed)
    if (!patientData && !triageResult) {
      clearData();
    }
  }, []); // Empty dependency array means this runs only once on mount

  const processQuestions = useCallback((questions: any) => {
    if (Array.isArray(questions)) {
      return questions;
    }
    if (questions && typeof questions === 'object') {
      const result: string[] = [];
      if (questions.primary) result.push(...questions.primary);
      if (questions.secondary) result.push(...questions.secondary);
      return result;
    }
    return [];
  }, []);

  const handleStartTriage = useCallback(async (input: TriageInput) => {
    setTriageState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await triageApi.startTriage(input);
      const questions = processQuestions(response.questions_to_ask_next);
      
      setTriageState(prev => ({
        ...prev,
        caseId: response.case_id,
        currentQuestion: questions[0] || null,
        remainingQuestions: questions.length - 1,
        triage: response.triage,
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
  }, [processQuestions]);

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
      const questions = processQuestions(response.questions_to_ask_next);
      
      setTriageState(prev => ({
        ...prev,
        currentQuestion: questions[0] || null,
        remainingQuestions: questions.length - 1,
        triage: response.triage,
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
  }, [triageState.caseId, triageState.currentQuestion, processQuestions]);

  const handleDone = useCallback(async () => {
    if (!triageState.caseId) return;

    setTriageState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await triageApi.sendAnswer(triageState.caseId, { done: true });
      
      setTriageState(prev => ({
        ...prev,
        currentQuestion: null,
        remainingQuestions: 0,
        triage: response.triage,
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
      
      // Gerçek API çağrısı - data zaten JSON formatında geliyor
      const triageInput: TriageInput = {
        age: data.age,
        sex: data.sex,
        complaint_text: data.complaint_text,
        pregnancy: data.pregnancy,
        chief: data.chief,
        vitals: data.vitals
      };

      const response = await handleStartTriage(triageInput);
      
      // API'den gelen sonucu kullan ve case_id'yi ekle
      setTriageResult({
        ...response.triage,
        case_id: response.case_id
      });
      setTriageState(prev => ({
        ...prev,
        triage: response.triage,
        caseId: response.case_id,
        isLoading: false,
        error: null
      }));
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
    <div className="App">
      <Router>
        <Header />
        <main className="main-content">
          <Switch>
            <Route path="/" exact>
              <HomePage />
            </Route>
            
            <Route path="/patient-entry">
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
        
        {/* Fixed theme toggle at bottom right */}
        <button 
          className="fixed-theme-toggle"
          onClick={toggleTheme}
          title={isDarkMode ? 'Gündüz moduna geç' : 'Gece moduna geç'}
        >
          <span className="sun-icon">☀️</span>
          <span className="moon-icon">🌙</span>
        </button>
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
