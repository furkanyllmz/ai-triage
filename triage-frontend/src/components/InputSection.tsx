import React, { useState } from 'react';
import './InputSection.css';
import { TriageState } from '../types/TriageTypes';

interface InputSectionProps {
  triageState: TriageState;
  onStartTriage: (data: any) => void;
  onSendAnswer: (answer: string, skip?: boolean) => void;
  onDone: () => void;
  onReset: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  triageState,
  onStartTriage,
  onSendAnswer,
  onDone,
  onReset
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: 30,
    sex: 'F',
    complaint: '',
    pregnancy: 'any',
    chief: '',
    vitals: ''
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'muted' | 'success' | 'err'>('muted');

  const steps = [
    { id: 1, title: 'Patient Info', description: 'Basic patient information' },
    { id: 2, title: 'Symptoms', description: 'Chief complaint and symptoms' },
    { id: 3, title: 'Vitals', description: 'Vital signs and measurements' },
    { id: 4, title: 'Review', description: 'Review and submit' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleStartTriage = async () => {
    if (!formData.complaint.trim()) {
      setMessage('Şikâyet metni boş olamaz.');
      setMessageType('err');
      return;
    }

    // Parse vitals JSON
    let vitals = {};
    if (formData.vitals.trim()) {
      try {
        vitals = JSON.parse(formData.vitals);
      } catch (e) {
        setMessage('Vitaller geçerli JSON değil.');
        setMessageType('err');
        return;
      }
    }

    setMessage('Gönderiliyor...');
    setMessageType('muted');

    const triageData = {
      age: formData.age,
      sex: formData.sex,
      complaint_text: formData.complaint.trim(),
      vitals,
      pregnancy: formData.pregnancy,
      chief: formData.chief.trim() || null
    };

    try {
      await onStartTriage(triageData);
      setMessage('İlk değerlendirme alındı. Sorular sırayla yönlendirilecek.');
      setMessageType('success');
    } catch (err: any) {
      setMessage('Hata: ' + err.message);
      setMessageType('err');
    }
  };

  const handleAnswerSubmit = () => {
    const el = document.getElementById('answerInput') as HTMLTextAreaElement | null;
    const answer = el?.value || '';
    onSendAnswer(answer, false);
    if (el) el.value = '';
  };

  const handleSkip = () => {
    onSendAnswer('', true);
  };

  const handleReset = () => {
    setFormData({
      age: 30,
      sex: 'F',
      complaint: '',
      pregnancy: 'any',
      chief: '',
      vitals: ''
    });
    setMessage('');
    setMessageType('muted');
    onReset();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input 
                type="number" 
                className="form-input"
                min="0" 
                max="120"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sex</label>
              <select 
                className="form-select"
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
              >
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Pregnancy Status</label>
              <select 
                className="form-select"
                value={formData.pregnancy}
                onChange={(e) => handleInputChange('pregnancy', e.target.value)}
              >
                <option value="any">Not Specified</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="step-content">
            <div className="form-group">
              <label className="form-label">Chief Complaint</label>
              <input 
                className="form-input"
                placeholder="e.g., Chest pain"
                value={formData.chief}
                onChange={(e) => handleInputChange('chief', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Detailed Complaint</label>
              <textarea 
                className="form-textarea"
                placeholder="Describe the patient's symptoms in detail..."
                value={formData.complaint}
                onChange={(e) => handleInputChange('complaint', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="step-content">
            <div className="form-group">
              <label className="form-label">Vital Signs (JSON Format)</label>
              <textarea 
                className="form-textarea"
                placeholder='{"HR": 110, "RR": 24, "SpO2": 93, "SBP": 118, "Temp": 37.8}'
                value={formData.vitals}
                onChange={(e) => handleInputChange('vitals', e.target.value)}
                rows={3}
              />
              <small className="form-help">Enter vital signs in JSON format. Leave empty if not available.</small>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="step-content">
            <div className="review-section">
              <h4>Review Patient Information</h4>
              <div className="review-item">
                <span className="review-label">Age:</span>
                <span className="review-value">{formData.age} years</span>
              </div>
              <div className="review-item">
                <span className="review-label">Sex:</span>
                <span className="review-value">{formData.sex === 'F' ? 'Female' : 'Male'}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Pregnancy:</span>
                <span className="review-value">{formData.pregnancy}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Chief Complaint:</span>
                <span className="review-value">{formData.chief || 'Not specified'}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Detailed Complaint:</span>
                <span className="review-value">{formData.complaint || 'Not specified'}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Vital Signs:</span>
                <span className="review-value">{formData.vitals || 'Not provided'}</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <section className="card input-section">
      <div className="card-header">
        <h3>Triage Assessment</h3>
        <p>Enter patient information and complete the assessment</p>
      </div>

      {/* Step Progress */}
      <div className="step-progress">
        {steps.map((step, index) => (
          <div key={step.id} className={`step ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
            <div className="step-number" onClick={() => goToStep(step.id)}>
              {currentStep > step.id ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                step.id
              )}
            </div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-body">
        {renderStepContent()}
        
        {message && (
          <div className={`message message-${messageType}`}>
            {message}
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="step-actions">
          {currentStep > 1 && (
            <button className="btn btn-outline" onClick={prevStep}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </button>
          )}
          
          <div className="step-actions-right">
            {currentStep < steps.length ? (
              <button className="btn btn-primary" onClick={nextStep}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleStartTriage} disabled={triageState.isLoading}>
                {triageState.isLoading ? 'Starting...' : 'Start Assessment'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="5,3 19,12 5,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            
            <button className="btn btn-outline" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Follow-up Questions */}
      {triageState.currentQuestion && (
        <div className="follow-up-section">
          <div className="section-divider"></div>
          <div className="card-body">
            <h4>Follow-up Question</h4>
            <div className="question-card">
              <div className="question-text">{triageState.currentQuestion}</div>
              <textarea 
                id="answerInput" 
                className="form-textarea"
                placeholder="Enter your answer..."
                rows={3}
              />
              <div className="question-actions">
                <button className="btn btn-primary" onClick={handleAnswerSubmit}>
                  Submit Answer
                </button>
                <button className="btn btn-outline" onClick={handleSkip}>
                  Skip Question
                </button>
                <button className="btn btn-success" onClick={onDone}>
                  Complete Assessment
                </button>
              </div>
              <div className="question-progress">
                {triageState.remainingQuestions} questions remaining
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Info */}
      {triageState.caseId && (
        <div className="session-info">
          <div className="section-divider"></div>
          <div className="card-body">
            <h4>Session Information</h4>
            <div className="session-details">
              <div className="session-item">
                <span className="session-label">Case ID:</span>
                <span className="session-value">{triageState.caseId}</span>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default InputSection;
