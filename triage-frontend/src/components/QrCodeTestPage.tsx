import React from "react";
import TriageLabel from "./QrCodeGenerator";
import "./QrCodeTestPage.css";

export default function QrCodeTestPage() {
  // Örnek triaj verisi
  const triageData = {
    caseId: "TRJ-2024-001",
    status: "Hastanın 'bayılma' ifadesi ciddi ve acil müdahale gerektiren durumları düşündürür. Vital bulgular takip edilmeli.",
    area: "ACİL SERVİS",
    department: "GENEL CERRAHİ",
    baseUrl: "https://aitriaj.com",
    path: "/triage/case_id"
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
            🖨️ Yazdır
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
