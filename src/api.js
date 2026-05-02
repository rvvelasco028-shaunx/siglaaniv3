const API = "http://192.168.1.9:5000";

export async function apiScan() {
  const payload = {
    image:          window.__siglaani_capture__        ?? null,
    detected_fruit: window.__siglaani_detected_fruit__ ?? null, // <--- ADD THIS
    fruit_name:     window.__siglaani_fruit_name__     ?? null,
    hsv_key:        window.__siglaani_hsv_key__        ?? null,
    scientific:     window.__siglaani_scientific__     ?? null,
  };

  const r = await fetch(`${API}/api/scan`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Scan API error: ${r.status}`);
  return r.json();
}

export async function apiHistory() { 
  const r = await fetch(`${API}/api/history?limit=50&_t=${Date.now()}`, { cache: "no-store" });        
  if (!r.ok) throw new Error(); 
  return r.json(); 
}

export async function apiDelete(id)     { await fetch(`${API}/api/history/${id}`, { method:"DELETE" }); }
export async function apiClearHistory() { await fetch(`${API}/api/history`,       { method:"DELETE" }); }
