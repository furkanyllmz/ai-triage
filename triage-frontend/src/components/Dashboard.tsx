import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

export type TriageStatus = "queued" | "processing" | "completed" | "failed";
export type ESILevel = "ESI-1" | "ESI-2" | "ESI-3" | "ESI-4" | "ESI-5";

export interface TriageQuery {
  id: number;
  case_id: string;
  age: number;
  sex: string;
  complaint_text: string;
  vitals?: any;
  triage_level: ESILevel;
  rationale?: string;
  red_flags?: string[];
  immediate_actions?: string[];
  questions_to_ask_next?: string[];
  routing?: any;
  evidence_ids?: string[];
  created_at: string; // ISO
}

function fmtMs(ms?: number) {
  if (ms == null) return "-";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}
function fmtSex(sex: string) {
  return sex === "M" ? "Erkek" : sex === "F" ? "Kadın" : sex;
}
function esiBadge(esi: ESILevel) {
  const cls = {
    "ESI-1": "badge badge-esi-1",
    "ESI-2": "badge badge-esi-2",
    "ESI-3": "badge badge-esi-3",
    "ESI-4": "badge badge-esi-4",
    "ESI-5": "badge badge-esi-5",
  }[esi];
  return <span className={cls}>{esi}</span>;
}
function statusBadge(s: TriageStatus) {
  const cls = {
    queued: "badge badge-status-queued",
    processing: "badge badge-status-processing",
    completed: "badge badge-status-completed",
    failed: "badge badge-status-failed",
  }[s];
  return <span className={cls}>{s}</span>;
}

// No mock data - using real API

// --- API integration ---
async function fetchQueries(params: {
  page: number; pageSize: number; search: string; status: string; esi: string; source: string; from?: string; to?: string;
}) {
  try {
    // Gerçek API endpoint'i
    const offset = (params.page - 1) * params.pageSize;
    const queryParams = new URLSearchParams({
      limit: params.pageSize.toString(),
      offset: offset.toString(),
      sort: "desc"
    });
    
    // Triage API endpointi kullan
    const res = await fetch(`http://localhost:9000/triage/alltriages?${queryParams}`);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    
    const data = await res.json();
    return { total: data.length, items: data };
  } catch (error) {
    console.error("API hatası:", error);
    return { total: 0, items: [] }; // Hata durumunda boş liste dön
  }
}

export default function Dashboard() {
  // state
  const [rows, setRows] = useState<TriageQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<TriageQuery | null>(null);

  // filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TriageStatus>("all");
  const [esi, setEsi] = useState<"all" | "ESI-1" | "ESI-2" | "ESI-3" | "ESI-4" | "ESI-5">("all");
  const [source, setSource] = useState<"all" | "web" | "mobile" | "kiosk" | "api">("all");
  const [from, setFrom] = useState<string>(""); // yyyy-mm-dd
  const [to, setTo] = useState<string>("");

  // pagination (basit)
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // initial fetch and refresh on filter changes
  useEffect(() => {
    setLoading(true);
    fetchQueries({ page, pageSize, search, status, esi, source, from, to }).then((d) => {
      setRows(d.items);
      setLoading(false);
    });
  }, [page, pageSize, search, status, esi, source, from, to]); // Re-fetch when filters change

  // filtered view
  const filtered = useMemo(() => {
    const fromTs = from ? new Date(from + "T00:00:00").getTime() : null;
    const toTs = to ? new Date(to + "T23:59:59").getTime() : null;

    return rows
      .filter(r => (status === "all" ? true : "completed" === status))
      .filter(r => (esi === "all" ? true : r.triage_level === esi))
      .filter(r => (source === "all" ? true : "web" === source))
      .filter(r => {
        if (!fromTs && !toTs) return true;
        const t = new Date(r.created_at).getTime();
        if (fromTs && t < fromTs) return false;
        if (toTs && t > toTs) return false;
        return true;
      })
      .filter(r => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
          r.case_id.toLowerCase().includes(s) ||
          r.complaint_text.toLowerCase().includes(s) ||
          r.rationale?.toLowerCase().includes(s) || false
        );
      });
  }, [rows, status, esi, source, from, to, search]);

  // KPIs
  const kpis = useMemo(() => {
    const count = filtered.length;
    const critical = filtered.filter(r => r.triage_level === "ESI-1" || r.triage_level === "ESI-2").length;
    const avgAge = Math.round(
      filtered.reduce((acc, r) => acc + r.age, 0) / Math.max(1, filtered.length)
    );
    return { count, critical, avgAge };
  }, [filtered]);

  // paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  // actions
  const clearFilters = () => {
    setSearch(""); setStatus("all"); setEsi("all"); setSource("all"); setFrom(""); setTo("");
    setPage(1);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Tüm triyaj sorguları burada listelenir.</p>
          </div>
          <div className="actions-right">
            <button onClick={() => window.location.reload()}>Yenile</button>
            <button onClick={() => exportCSV(filtered)}>CSV</button>
          </div>
        </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h2>Toplam</h2>
          <div className="value">{kpis.count}</div>
        </div>
        <div className="kpi-card">
          <h2>Kritik (ESI 1–2)</h2>
          <div className="value">{kpis.critical}</div>
        </div>
        <div className="kpi-card">
          <h2>Ortalama Yaş</h2>
          <div className="value">{kpis.avgAge}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <input
          className="input"
          placeholder="Ara (Case ID, şikayet)"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="select" value={status} onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}>
          <option value="all">Durum: Hepsi</option>
          <option value="queued">Sırada</option>
          <option value="processing">İşleniyor</option>
          <option value="completed">Tamamlandı</option>
          <option value="failed">Hatalı</option>
        </select>
        <select className="select" value={esi} onChange={(e) => { setEsi(e.target.value as any); setPage(1); }}>
          <option value="all">ESI: Hepsi</option>
          <option value="ESI-1">ESI-1</option>
          <option value="ESI-2">ESI-2</option>
          <option value="ESI-3">ESI-3</option>
          <option value="ESI-4">ESI-4</option>
          <option value="ESI-5">ESI-5</option>
        </select>
        <select className="select" value={source} onChange={(e) => { setSource(e.target.value as any); setPage(1); }}>
          <option value="all">Kaynak: Hepsi</option>
          <option value="web">Web</option>
          <option value="mobile">Mobil</option>
          <option value="kiosk">Kiosk</option>
          <option value="api">API</option>
        </select>

        <div className="date-group">
          <label>Başlangıç</label>
          <input className="input" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
        </div>
        <div className="date-group">
          <label>Bitiş</label>
          <input className="input" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
        </div>

        <div className="filters-actions">
          <button className="btn-secondary" onClick={clearFilters}>Temizle</button>
        </div>
      </div>

      {/* Table */}
      <div className="kpi-card">
        {pageRows.length === 0 ? (
          <div className="empty-state">
            <h3>Kayıt bulunamadı</h3>
            <p>Filtreleri değiştirin veya sorgu arayın.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Case ID</th>
                    <th>Zaman</th>
                    <th>Yaş/Cinsiyet</th>
                    <th>Şikayet</th>
                    <th>ESI</th>
                    <th>Durum</th>
                    <th>Kaynak</th>
                    <th style={{ textAlign: "right" }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.id}</td>
                      <td className="mono">{r.case_id}</td>
                      <td>{fmtDate(r.created_at)}</td>
                      <td>{r.age}/{fmtSex(r.sex)}</td>
                      <td className="truncate" title={r.complaint_text}>{r.complaint_text}</td>
                      <td>{esiBadge(r.triage_level)}</td>
                      <td>{statusBadge("completed")}</td>
                      <td><span className="badge outline">web</span></td>
                      <td style={{ textAlign: "right" }}>
                        <button className="link" onClick={() => setActive(r)}>Detay</button>
                        {" • "}
                        <button className="link" onClick={() => navigator.clipboard.writeText(r.case_id)}>Case ID Kopyala</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <div>{filtered.length} kayıt • Sayfa {page}/{totalPages}</div>
              <div className="pagination-controls">
                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Önceki</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Sonraki</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Dialog */}
      {active && (
        <div className="dialog" onClick={() => setActive(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Sorgu Detayı — {active.case_id}</h2>
            </div>
            <div className="details-grid">
              <div>
                <div className="label">Hasta</div>
                <div className="muted">{active.age} yaşında {fmtSex(active.sex)}</div>
              </div>
              <div>
                <div className="label">Zaman</div>
                <div className="muted">{fmtDate(active.created_at)}</div>
              </div>
              <div>
                <div className="label">Şikayet</div>
                <div className="muted">{active.complaint_text}</div>
              </div>
              <div>
                <div className="label">Gerekçe</div>
                <div className="muted">{active.rationale}</div>
              </div>
              <div className="chips">
                {esiBadge(active.triage_level)} {statusBadge("completed")} <span className="badge outline">web</span>
              </div>
            </div>
            <div className="details-grid full-width">
              <div>
                <div className="label">Red Flags</div>
                <div className="muted">{active.red_flags?.join(", ") || "—"}</div>
              </div>
              <div>
                <div className="label">Acil Aksiyonlar</div>
                <div className="muted">{active.immediate_actions?.join(", ") || "—"}</div>
              </div>
            </div>
            <pre className="payload">{JSON.stringify({
              vitals: active.vitals,
              routing: active.routing,
              evidence_ids: active.evidence_ids
            }, null, 2)}</pre>
            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(active.case_id)}>Case ID Kopyala</button>
              <button onClick={() => setActive(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="loader">Veriler yükleniyor…</div>}
      </div>
    </div>
  );
}

// CSV export
function exportCSV(rows: TriageQuery[]) {
  const headers = ["id", "case_id", "age", "sex", "complaint_text", "triage_level", "rationale", "created_at"];
  const lines = [headers.join(",")].concat(
    rows.map(r => headers.map(h => JSON.stringify((r as any)[h] ?? "")).join(","))
  );
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `ai-triage-export-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}