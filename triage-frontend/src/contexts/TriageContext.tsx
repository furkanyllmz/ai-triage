import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TriageContextType {
  patientData: any;
  setPatientData: (data: any) => void;
  triageResult: any;
  setTriageResult: (result: any) => void;
  nurseNotes: string;
  setNurseNotes: (notes: string) => void;
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
  const [nurseNotes, setNurseNotesState] = useState<string>('');
  const [isLoading, setIsLoadingState] = useState<boolean>(false);
  const [error, setErrorState] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPatientData = localStorage.getItem('triage-patient-data');
    const savedTriageResult = localStorage.getItem('triage-result');
    const savedNurseNotes = localStorage.getItem('triage-nurse-notes');

    if (savedPatientData) {
      setPatientDataState(JSON.parse(savedPatientData));
    }
    if (savedTriageResult) {
      setTriageResultState(JSON.parse(savedTriageResult));
    }
    if (savedNurseNotes) {
      setNurseNotesState(savedNurseNotes);
    }
  }, []);

  const setPatientData = (data: any) => {
    try {
      setPatientDataState(data);
      if (data) {
        localStorage.setItem('triage-patient-data', JSON.stringify(data));
      } else {
        localStorage.removeItem('triage-patient-data');
      }
    } catch (error) {
      console.error('localStorage error:', error);
      setErrorState('Veri kaydetme hatası');
    }
  };

  const setTriageResult = (result: any) => {
    try {
      setTriageResultState(result);
      if (result) {
        localStorage.setItem('triage-result', JSON.stringify(result));
      } else {
        localStorage.removeItem('triage-result');
      }
    } catch (error) {
      console.error('localStorage error:', error);
      setErrorState('Veri kaydetme hatası');
    }
  };

  const setNurseNotes = (notes: string) => {
    try {
      setNurseNotesState(notes);
      if (notes) {
        localStorage.setItem('triage-nurse-notes', notes);
      } else {
        localStorage.removeItem('triage-nurse-notes');
      }
    } catch (error) {
      console.error('localStorage error:', error);
      setErrorState('Veri kaydetme hatası');
    }
  };

  const clearData = () => {
    try {
      setPatientDataState(null);
      setTriageResultState(null);
      setNurseNotesState('');
      setIsLoadingState(false);
      setErrorState(null);
      localStorage.removeItem('triage-patient-data');
      localStorage.removeItem('triage-result');
      localStorage.removeItem('triage-nurse-notes');
    } catch (error) {
      console.error('localStorage error:', error);
      setErrorState('Veri temizleme hatası');
    }
  };

  const value: TriageContextType = {
    patientData,
    setPatientData,
    triageResult,
    setTriageResult,
    nurseNotes,
    setNurseNotes,
    isLoading,
    setLoading: setIsLoadingState,
    error,
    setError: setErrorState,
    clearData,
  };

  return (
    <TriageContext.Provider value={value}>
      {children}
    </TriageContext.Provider>
  );
};
