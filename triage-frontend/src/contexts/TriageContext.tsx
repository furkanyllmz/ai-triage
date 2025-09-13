import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TriageContextType {
  patientData: any;
  setPatientData: (data: any) => void;
  triageResult: any;
  setTriageResult: (result: any) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearData: () => void;
}

const TriageContext = createContext<TriageContextType | undefined>(undefined);

export const useTriageContext = () => {
  const context = useContext(TriageContext);
  if (!context) {
    throw new Error('useTriageContext must be used within a TriageProvider');
  }
  return context;
};

interface TriageProviderProps {
  children: ReactNode;
}

export const TriageProvider: React.FC<TriageProviderProps> = ({ children }) => {
  const [patientData, setPatientDataState] = useState<any>(null);
  const [triageResult, setTriageResultState] = useState<any>(null);
  const [isLoading, setIsLoadingState] = useState<boolean>(false);
  const [error, setErrorState] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPatientData = localStorage.getItem('triage-patient-data');
    const savedTriageResult = localStorage.getItem('triage-result');

    if (savedPatientData) {
      setPatientDataState(JSON.parse(savedPatientData));
    }
    if (savedTriageResult) {
      setTriageResultState(JSON.parse(savedTriageResult));
    }
  }, []);

  const setPatientData = (data: any) => {
    setPatientDataState(data);
    if (data) {
      localStorage.setItem('triage-patient-data', JSON.stringify(data));
    } else {
      localStorage.removeItem('triage-patient-data');
    }
  };

  const setTriageResult = (result: any) => {
    setTriageResultState(result);
    if (result) {
      localStorage.setItem('triage-result', JSON.stringify(result));
    } else {
      localStorage.removeItem('triage-result');
    }
  };

  const setLoading = (loading: boolean) => {
    setIsLoadingState(loading);
  };

  const setError = (error: string | null) => {
    setErrorState(error);
  };

  const clearData = () => {
    setPatientDataState(null);
    setTriageResultState(null);
    setIsLoadingState(false);
    setErrorState(null);
    localStorage.removeItem('triage-patient-data');
    localStorage.removeItem('triage-result');
  };

  const value: TriageContextType = {
    patientData,
    setPatientData,
    triageResult,
    setTriageResult,
    isLoading,
    setLoading,
    error,
    setError,
    clearData,
  };

  return (
    <TriageContext.Provider value={value}>
      {children}
    </TriageContext.Provider>
  );
};
