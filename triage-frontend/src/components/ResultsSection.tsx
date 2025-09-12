import React from 'react';
import './ResultsSection.css';
import { TriageState } from '../types/TriageTypes';

interface ResultsSectionProps {
  triageState: TriageState;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ triageState }) => {
  const getESIClass = (esi: string | null) => {
    if (!esi) return '';
    const level = esi.includes('level_') ? 
      Number(esi.split('_')[1]) : 
      Number(esi.split('-')[1]);
    return `esi-${level}`;
  };

  const getDotColor = (esi: string | null) => {
    if (!esi) return 'green';
    const level = esi.includes('level_') ? 
      Number(esi.split('_')[1]) : 
      Number(esi.split('-')[1]);
    if (level <= 2) return 'red';
    if (level === 3) return 'yellow';
    return 'green';
  };

  const renderList = (data: any[] | { primary?: any[]; secondary?: any[]; vital_instability?: any[] }) => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <li key={index}>{item}</li>
      ));
    }

    if (data && typeof data === 'object') {
      const items: JSX.Element[] = [];
      let keyCounter = 0;

      if (data.primary && data.primary.length > 0) {
        items.push(
          <li key={keyCounter++} style={{ color: 'var(--danger)' }}>
            <strong>Birincil:</strong>
          </li>
        );
        data.primary.forEach((item: any) => {
          items.push(
            <li key={keyCounter++} style={{ marginLeft: '1rem', color: 'var(--danger)' }}>
              • {item}
            </li>
          );
        });
      }

      if (data.secondary && data.secondary.length > 0) {
        items.push(
          <li key={keyCounter++} style={{ color: 'var(--warning)' }}>
            <strong>İkincil:</strong>
          </li>
        );
        data.secondary.forEach((item: any) => {
          items.push(
            <li key={keyCounter++} style={{ marginLeft: '1rem', color: 'var(--warning)' }}>
              • {item}
            </li>
          );
        });
      }

      if (data.vital_instability && data.vital_instability.length > 0) {
        items.push(
          <li key={keyCounter++} style={{ color: 'var(--danger)' }}>
            <strong>Vital İnstabilite:</strong>
          </li>
        );
        data.vital_instability.forEach((item: any) => {
          items.push(
            <li key={keyCounter++} style={{ marginLeft: '1rem', color: 'var(--danger)' }}>
              • {item}
            </li>
          );
        });
      }

      return items;
    }

    return null;
  };

  const renderQuestions = (data: any[] | { primary?: any[]; secondary?: any[] }) => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <li key={index}>{item}</li>
      ));
    }

    if (data && typeof data === 'object') {
      const items: JSX.Element[] = [];
      let keyCounter = 0;

      if (data.primary && data.primary.length > 0) {
        data.primary.forEach((item: any) => {
          items.push(
            <li key={keyCounter++} style={{ color: 'var(--primary)' }}>
              {item}
            </li>
          );
        });
      }

      if (data.secondary && data.secondary.length > 0) {
        data.secondary.forEach((item: any) => {
          items.push(
            <li key={keyCounter++} style={{ color: 'var(--text-secondary)' }}>
              {item}
            </li>
          );
        });
      }

      return items;
    }

    return null;
  };

  const esiClass = getESIClass(triageState.triage?.triage_level ?? null);
  const dotColor = getDotColor(triageState.triage?.triage_level ?? null);

  return (
    <aside className="card results-section">
      <div className="card-header">
        <h3>Triage Results</h3>
        <p>AI-powered assessment and recommendations</p>
      </div>

      <div className="card-body">
        {/* Priority Status */}
        <div className={`priority-status ${esiClass}`}>
          <div className="priority-header">
            <div className="priority-icon">
              {esiClass === 'esi-1' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86L1.82 18C1.64547 18.3024 1.5729 18.6453 1.61211 18.9874C1.65132 19.3295 1.8005 19.6507 2.03819 19.8991C2.27588 20.1475 2.59005 20.3108 2.93006 20.3653C3.27007 20.4198 3.61959 20.3626 3.92 20.2L12 16L20.08 20.2C20.3804 20.3626 20.7299 20.4198 21.0699 20.3653C21.4099 20.3108 21.7241 20.1475 21.9618 19.8991C22.1995 19.6507 22.3487 19.3295 22.3879 18.9874C22.4271 18.6453 22.3545 18.3024 22.18 18L13.71 3.86C13.5318 3.56631 13.2807 3.32312 12.9812 3.15447C12.6817 2.98582 12.3438 2.89725 12 2.89725C11.6562 2.89725 11.3183 2.98582 11.0188 3.15447C10.7193 3.32312 10.4682 3.56631 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {esiClass === 'esi-2' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {esiClass === 'esi-3' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {(esiClass === 'esi-4' || esiClass === 'esi-5') && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="priority-info">
              <div className="priority-level">
                {triageState.triage?.triage_level || 'Not Assessed'}
              </div>
              <div className="priority-description">
                {esiClass === 'esi-1' && 'Critical - Immediate attention required'}
                {esiClass === 'esi-2' && 'Urgent - High priority'}
                {esiClass === 'esi-3' && 'Moderate - Standard priority'}
                {esiClass === 'esi-4' && 'Low - Routine care'}
                {esiClass === 'esi-5' && 'Minimal - Non-urgent'}
                {!esiClass && 'Assessment pending'}
              </div>
            </div>
          </div>
          
          <div className="priority-badges">
            <span className={`priority-badge ${esiClass}`}>
              {triageState.triage?.triage_level || 'Pending'}
            </span>
            <span className="priority-badge secondary">
              {triageState.triage?.routing?.priority || 'TBD'}
            </span>
            <span className="priority-badge tertiary">
              {triageState.triage?.routing?.specialty || 'General'}
            </span>
          </div>
        </div>

        {/* Assessment Rationale */}
        <div className="rationale-section">
          <h4>Assessment Rationale</h4>
          <div className="rationale-content">
            {triageState.triage?.rationale_brief || 'No assessment available. Please complete the patient information and start the assessment.'}
          </div>
        </div>

        {/* Critical Findings */}
        <div className="findings-section">
          <h4>Critical Findings</h4>
          <div className="findings-content">
            {triageState.triage && Array.isArray(triageState.triage.red_flags) ? (
              triageState.triage.red_flags.length > 0 ? (
                <ul className="findings-list">
                  {triageState.triage.red_flags.map((item: any, index: number) => (
                    <li key={index} className="finding-item critical">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.29 3.86L1.82 18C1.64547 18.3024 1.5729 18.6453 1.61211 18.9874C1.65132 19.3295 1.8005 19.6507 2.03819 19.8991C2.27588 20.1475 2.59005 20.3108 2.93006 20.3653C3.27007 20.4198 3.61959 20.3626 3.92 20.2L12 16L20.08 20.2C20.3804 20.3626 20.7299 20.4198 21.0699 20.3653C21.4099 20.3108 21.7241 20.1475 21.9618 19.8991C22.1995 19.6507 22.3487 19.3295 22.3879 18.9874C22.4271 18.6453 22.3545 18.3024 22.18 18L13.71 3.86C13.5318 3.56631 13.2807 3.32312 12.9812 3.15447C12.6817 2.98582 12.3438 2.89725 12 2.89725C11.6562 2.89725 11.3183 2.98582 11.0188 3.15447C10.7193 3.32312 10.4682 3.56631 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-findings">No critical findings identified</div>
              )
            ) : (
              <div className="no-findings">Assessment not completed</div>
            )}
          </div>
        </div>

        {/* Immediate Actions */}
        <div className="actions-section">
          <h4>Immediate Actions</h4>
          <div className="actions-content">
            {triageState.triage && Array.isArray(triageState.triage.immediate_actions) ? (
              triageState.triage.immediate_actions.length > 0 ? (
                <ul className="actions-list">
                  {triageState.triage.immediate_actions.map((item: any, index: number) => (
                    <li key={index} className="action-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-actions">No immediate actions required</div>
              )
            ) : (
              <div className="no-actions">Assessment not completed</div>
            )}
          </div>
        </div>

        {/* Follow-up Questions */}
        <div className="questions-section">
          <h4>Follow-up Questions</h4>
          <div className="questions-content">
            {triageState.triage && Array.isArray(triageState.triage.questions_to_ask_next) ? (
              triageState.triage.questions_to_ask_next.length > 0 ? (
                <ul className="questions-list">
                  {triageState.triage.questions_to_ask_next.map((item: any, index: number) => (
                    <li key={index} className="question-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-questions">No additional questions needed</div>
              )
            ) : (
              <div className="no-questions">Assessment not completed</div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ResultsSection;
