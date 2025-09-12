import React from "react";
import { QRCodeSVG } from "qrcode.react";
import "./QrCodeGenerator.css";

interface TriageLabelProps {
  caseId: string;
  status?: string;
  area?: string;
  department?: string;
  baseUrl?: string;
  path?: string;
}

export default function TriageLabel({
  caseId,
  status,
  area,
  department,
  baseUrl = "https://aitriaj.com",
  path = "/triage/case_id",
}: TriageLabelProps) {
  const qrPath = path.replace("case_id", caseId || "no-id");
  const qrLink = `${baseUrl}${qrPath}`;

  return (
    <div className="qr-label">
      <div className="qr-label-header">
        <h2 className="qr-label-title">
          TRİAJ ETİKET ÇIKTISI
        </h2>
      </div>
      <div className="qr-label-content">
        <div className="qr-case-id">case_id: {caseId}</div>
        <div className="qr-code-container">
          <QRCodeSVG value={qrLink} size={56} />
        </div>
      </div>
      <div className="qr-status">
        {status ||
          "Hastanın 'bayılma' ifadesi ciddi ve acil müdahale gerektiren durumları düşündürür."}
      </div>
      <div className="qr-label-footer">
        <div className="qr-area-badge">
          {area || "ALAN BİLGİSİ"}
        </div>
        <div className="qr-department">{department || "BÖLÜM"}</div>
      </div>
    </div>
  );
}
