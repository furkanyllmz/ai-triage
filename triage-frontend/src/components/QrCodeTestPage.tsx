import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TriageLabel from "./QrCodeGenerator";
// import { triageApi } from '../services/triageApi';
import "./QrCodeTestPage.css";
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

export default function QrCodeTestPage() {
  const location = useLocation();
  const [triageData, setTriageData] = useState({
    caseId: "TRJ-2024-001",
    status: "Hastanın 'bayılma' ifadesi ciddi ve acil müdahale gerektiren durumları düşündürür. Vital bulgular takip edilmeli.",
    area: "ACİL SERVİS",
    department: "GENEL CERRAHİ",
    baseUrl: "https://aitriaj.com",
    path: "/triage/case_id"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const caseId = searchParams.get('caseId');
    
    if (caseId) {
      fetchTriageData(caseId);
    }
  }, [location.search]);

  const fetchTriageData = async (caseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/triage/alltriages/byCase/${caseId}`);
      if (!response.ok) {
        throw new Error('Veri alınamadı');
      }
      const data = await response.json();
      
      // API array döndürüyor, ilk elemanı al
      const triageRecord = Array.isArray(data) ? data[0] : data;
      
      setTriageData({
        caseId: triageRecord.case_id || caseId,
        status: triageRecord.rationale || "Değerlendirme bilgisi bulunamadı",
        area: triageRecord.triage_level,
        department: triageRecord.routing?.specialty || "GENEL CERRAHİ",
        baseUrl: "https://aitriaj.com",
        path: `/triage/${caseId}`
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintDownload = () => {
    // Sadece yazdırma dialogunu aç
    window.print();
  };

  return (
    <div className="qr-test-page">
      <div className="qr-test-container">
        <h1 className="qr-test-title">
          Triaj Etiket Çıktısı
        </h1>
        
        {isLoading && (
          <div className="qr-loading">
            <p>Triaj verileri yükleniyor...</p>
          </div>
        )}
        
        {error && (
          <div className="qr-error">
            <p>Hata: {error}</p>
          </div>
        )}
        
        <div className="qr-label-container">
          <TriageLabel
            caseId={triageData.caseId}
            status={triageData.status}
            area={triageData.area}
            department={triageData.department}
            baseUrl={triageData.baseUrl}
            path={triageData.path}
          />
        </div>

        <div className="qr-actions">
          <button
            onClick={handlePrintDownload}
            className="qr-action-btn qr-action-btn-primary"
          >
            Yazdır
          </button>
        </div>

        <div className="qr-info">
          <h3 className="qr-info-title">Etiket Bilgileri</h3>
          <div className="qr-info-list">
            <div className="qr-info-item">
              <strong>Case ID:</strong> {triageData.caseId}
            </div>
            <div className="qr-info-item">
              <strong>Alan:</strong> {triageData.area}
            </div>
            <div className="qr-info-item">
              <strong>Bölüm:</strong> {triageData.department}
            </div>
            <div className="qr-info-item">
              <strong>QR Link:</strong> {triageData.baseUrl}{triageData.path.replace("case_id", triageData.caseId)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
