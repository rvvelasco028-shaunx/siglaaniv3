import { useState, useEffect, useCallback } from 'react';
import LeafSVG from './shared/LeafSVG';
import FruitBall from './shared/FruitBall';
import MetricBar from './shared/MetricBar';
import { badge } from '../constants';
import { apiHistory, apiDelete, apiClearHistory } from '../api';

function HistoryRow({ row, onDelete, isSelected, onClick }) {
  const b  = badge(row.condition);
  const dt = new Date(row.scanned_at);
  const ts = isNaN(dt) ? row.scanned_at : dt.toLocaleString("en-PH", {
    month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"
  });

  return (
    <div className={`hist-row ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <div className="hist-thumb-wrap">
        {row.thumbnail
          ? <img src={`data:image/jpeg;base64,${row.thumbnail}`} className="hist-thumb" alt=""/>
          : <FruitBall size={44}/>
        }
      </div>
      <div className="hist-info">
        <div className="hist-fruit">{row.fruit}</div>
        <div className="hist-sci">{row.condition_label ?? row.conditionLabel}</div>
        <div className="hist-ts">{ts}</div>
      </div>
      <div className="hist-right">
        <div className={`hist-badge ${b.cls}`}>{b.label}</div>
        <div className="hist-conf">{row.confidence}%</div>
      </div>
      <button className="hist-del" onClick={e => { e.stopPropagation(); onDelete(row.id); }} title="Delete">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5l.5-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

function HistoryDetail({ row, onClose }) {
  if (!row) return (
    <div className="hist-detail hist-detail--empty">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ opacity:.25 }}>
        <rect x="5" y="8"  width="26" height="3" rx="1.5" fill="#888"/>
        <rect x="5" y="16" width="26" height="3" rx="1.5" fill="#888"/>
        <rect x="5" y="24" width="16" height="3" rx="1.5" fill="#888"/>
      </svg>
      <span>Pumili ng scan para makita ang detalye</span>
    </div>
  );

  const b = badge(row.condition);
  return (
    <div className="hist-detail">
      <div className="hist-detail-header">
        <div>
          <div className="hist-d-name">{row.fruit}</div>
          <div className="hist-d-sci">{row.scientific}</div>
        </div>
        <button className="hist-close" onClick={onClose}>✕</button>
      </div>
      <div className="hist-d-img-wrap">
        {row.thumbnail
          ? <img src={`data:image/jpeg;base64,${row.thumbnail}`} className="hist-d-img" alt="scan"/>
          : <FruitBall size={90}/>
        }
        <div className={`result-badge ${b.cls}`} style={{ marginTop:8 }}>{b.label}</div>
      </div>
      <div className="hist-d-metrics">
        <div className="metrics-title" style={{ marginBottom:8 }}>Mga Sukatan</div>
        <MetricBar label="Pagkahinog" value={row.ripe     ?? 0} color="#5cb83a" small/>
        <MetricBar label="Katatagan"  value={row.firmness ?? 0} color="#4db6ac" small/>
        <MetricBar label="Pagkasira"  value={row.decay    ?? 0} color="#ef5350" small/>
      </div>
      <div className="hist-d-rec">
        <div className="rec-title">Rekomendasyon</div>
        <div className="rec-text" style={{ fontSize:11 }}>{row.recommendation}</div>
      </div>
    </div>
  );
}

export default function HistoryScreen({ onBack, onScanAgain }) {
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selRow,   setSelRow]   = useState(null);
  const [filter,   setFilter]   = useState("all");
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await apiHistory()); }
    catch { setRows([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    await apiDelete(id);
    setRows(r => r.filter(x => x.id !== id));
    if (selRow?.id === id) setSelRow(null);
  };

  const handleClear = async () => {
    if (!window.confirm("Burahin ang lahat ng scan history?")) return;
    setClearing(true);
    await apiClearHistory();
    setRows([]);
    setSelRow(null);
    setClearing(false);
  };

  const FILTERS = ["all","ripe","overripe","unripe","rotten"];
  const visible  = filter === "all" ? rows : rows.filter(r => r.condition === filter);

  return (
    <div className="screen hist-screen">
      <div className="topbar" style={{ background:"#0b1f0d" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button className="btn-back" onClick={onBack}>← Bumalik</button>
          <div className="tb-logo"><LeafSVG size={22}/><span className="tb-title">SIGLA ANI</span></div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span className="tb-right">{rows.length} scan{rows.length !== 1 ? "s" : ""}</span>
          {rows.length > 0 && (
            <button className="hist-clear-btn" onClick={handleClear} disabled={clearing}>
              {clearing ? "Binubura..." : "Clear All"}
            </button>
          )}
          <button className="scan-now-btn" onClick={onScanAgain}>+ Mag-scan</button>
        </div>
      </div>

      <div className="hist-body">
        <div className="hist-filters">
          {FILTERS.map(f => (
            <button key={f} className={`hist-filter ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "Lahat" : badge(f).label}
            </button>
          ))}
        </div>

        <div className="hist-content">
          <div className="hist-list">
            {loading && (
              <div className="hist-empty">
                <div className="hist-spinner"/>
                <span>Naglo-load...</span>
              </div>
            )}
            {!loading && visible.length === 0 && (
              <div className="hist-empty">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ opacity:.2 }}>
                  <circle cx="20" cy="20" r="17" stroke="#888" strokeWidth="2"/>
                  <path d="M20 12v9" stroke="#888" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="20" cy="27" r="1.5" fill="#888"/>
                </svg>
                <span>Walang mga scan pa</span>
              </div>
            )}
            {!loading && visible.map(r => (
              <HistoryRow key={r.id} row={r}
                isSelected={selRow?.id === r.id}
                onClick={() => setSelRow(r)}
                onDelete={handleDelete}/>
            ))}
          </div>
          <HistoryDetail row={selRow} onClose={() => setSelRow(null)}/>
        </div>
      </div>
    </div>
  );
}
