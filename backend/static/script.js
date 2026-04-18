/* script.js — SecureEye Dashboard Logic */

const API   = '';          // same origin
const TOKEN = () => localStorage.getItem('se_token');
const HEADERS = () => ({ 'Authorization': `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' });

const TYPE_META = {
  motion:         { label: 'Motion Detected',   emoji: '🏃', cls: 'motion' },
  human_detected: { label: 'Human Detected',    emoji: '👤', cls: 'human_detected' },
  intrusion:      { label: 'Intrusion Alert',   emoji: '🚨', cls: 'intrusion' },
};

let _pollTimer   = null;
let _alertsCache = [];
let _lastAlertId = 0;

// ── Bootstrap ──────────────────────────────────────────────────────────────────
(function init() {
  if (!TOKEN()) { window.location.href = '/login'; return; }

  const user = localStorage.getItem('se_user') || 'User';
  document.getElementById('userLabel').textContent = user;
  document.getElementById('userAvatar').textContent = user[0].toUpperCase();

  loadAlerts(true); // firstLoad = true
  loadRecordings();
  _pollTimer = setInterval(() => loadAlerts(false), 5000);
})();

// ── Auth ───────────────────────────────────────────────────────────────────────
function logout() {
  clearInterval(_pollTimer);
  localStorage.removeItem('se_token');
  localStorage.removeItem('se_user');
  window.location.href = '/login';
}

// ── API Helpers ────────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Authorization': `Bearer ${TOKEN()}` },
    ...opts,
  });
  if (res.status === 401) { logout(); return null; }
  return res;
}

// ── Alerts ─────────────────────────────────────────────────────────────────────
async function loadAlerts(firstLoad = false) {
  try {
    const res = await apiFetch('/api/alerts');
    if (!res) return;
    const data = await res.json();
    const alerts = data.alerts || [];
    
    _alertsCache = alerts;
    renderAlerts(_alertsCache);
    updateStats(_alertsCache);
    updateLastRefresh();

    if (alerts.length > 0) {
      const latest = alerts[0];
      // If we have a new alert ID, automatically show it in the feed
      if (latest.id > _lastAlertId) {
        _lastAlertId = latest.id;
        showInFeed(latest);
        
        // Show a toast for the new alert if it's not the initial page load
        if (!firstLoad) {
          const meta = TYPE_META[latest.type] || { label: latest.type, emoji: '🚨' };
          showToast(`NEW ALERT: ${meta.label}`, 'error');
        }
      }
    }
  } catch (e) { console.error('loadAlerts error:', e); }
}

function renderAlerts(alerts) {
  const list = document.getElementById('alertsList');
  if (!alerts.length) {
    list.innerHTML = '<p class="alerts-empty">No alerts yet. Waiting for activity…</p>';
    return;
  }
  list.innerHTML = alerts.map(a => {
    const meta = TYPE_META[a.type] || { label: a.type, emoji: '⚠️', cls: 'motion' };
    const time = formatTime(a.timestamp);
    const thumb = a.media_path
      ? `<div class="alert-thumb"><img src="${a.media_path}" alt="" loading="lazy" /></div>`
      : `<div class="alert-thumb">${meta.emoji}</div>`;
    return `
      <div class="alert-item ${a.status}" id="alert-${a.id}" onclick="onAlertClick(${a.id})">
        <div class="alert-status-dot ${a.status}"></div>
        <div class="alert-body">
          <div class="alert-type-row">
            <span class="alert-emoji">${meta.emoji}</span>
            <span class="alert-type-label">${meta.label}</span>
            <span class="alert-status-tag ${a.status}">${a.status}</span>
          </div>
          <div class="alert-time">${time}</div>
        </div>
        ${thumb}
      </div>`;
  }).join('');
}

async function onAlertClick(id) {
  const alert = _alertsCache.find(a => a.id === id);
  if (!alert) return;

  // Mark seen
  if (alert.status === 'unseen') {
    await apiFetch(`/api/alerts/${id}/seen`, { method: 'PATCH' });
    alert.status = 'seen';
    renderAlerts(_alertsCache);
    updateStats(_alertsCache);
  }

  // Show in feed
  showInFeed(alert);
}

// ── Stats ──────────────────────────────────────────────────────────────────────
function updateStats(alerts) {
  const unseen = alerts.filter(a => a.status === 'unseen').length;
  document.getElementById('statTotal').textContent   = alerts.length;
  document.getElementById('statUnseen').textContent  = unseen;
  const badge = document.getElementById('unseenBadge');
  badge.style.display = unseen > 0 ? 'block' : 'none';
}

// ── Recordings ────────────────────────────────────────────────────────────────
async function loadRecordings() {
  try {
    const res = await apiFetch('/api/recordings');
    if (!res) return;
    const data = await res.json();
    const recs = data.recordings || [];
    document.getElementById('statRecordings').textContent = recs.length;
    renderRecordings(recs);
  } catch (e) { console.error('loadRecordings error:', e); }
}

function renderRecordings(recs) {
  const grid = document.getElementById('recordingsGrid');
  if (!recs.length) {
    grid.innerHTML = '<p class="rec-no-media">No recordings yet.</p>';
    return;
  }
  grid.innerHTML = recs.map(r => {
    const meta = TYPE_META[r.type] || { label: r.type, emoji: '📁', cls: 'motion' };
    const isVideo = r.media_filename && /\.(mp4|avi|mov|webm)$/i.test(r.media_filename);
    const preview = r.media_path
      ? (isVideo
          ? `<div class="rec-preview" style="font-size:2.2rem;background:#050709;">🎬</div>`
          : `<div class="rec-preview"><img src="${r.media_path}" alt="" loading="lazy"/></div>`)
      : `<div class="rec-preview">${meta.emoji}</div>`;
    return `
      <div class="rec-thumb" onclick="openModal(${r.id})" title="${meta.label} — ${formatTime(r.timestamp)}">
        ${preview}
        <div class="rec-meta">
          <span class="rec-type-tag feed-tag ${meta.cls}">${meta.emoji} ${meta.label.split(' ')[0]}</span>
          <div class="rec-time">${formatTime(r.timestamp)}</div>
        </div>
      </div>`;
  }).join('');
}

// ── Feed Viewer ───────────────────────────────────────────────────────────────
function showInFeed(alert) {
  const placeholder = document.getElementById('feedPlaceholder');
  const img         = document.getElementById('feedImage');
  const vid         = document.getElementById('feedVideo');
  const infoBar     = document.getElementById('feedInfoBar');
  const meta        = TYPE_META[alert.type] || { label: alert.type, emoji: '⚠️', cls: 'motion' };

  placeholder.style.display = 'none';
  img.style.display  = 'none';
  vid.style.display  = 'none';

  if (alert.media_path) {
    const isVideo = alert.media_filename && /\.(mp4|avi|mov|webm)$/i.test(alert.media_filename);
    if (isVideo) {
      vid.src = alert.media_path;
      vid.style.display = 'block';
      vid.play().catch(() => {});
    } else {
      img.src = alert.media_path;
      img.style.display = 'block';
    }
  } else {
    placeholder.style.display = 'flex';
    placeholder.querySelector('.feed-placeholder-icon').textContent = meta.emoji;
    placeholder.querySelector('p').textContent = meta.label;
  }

  // Update info bar
  infoBar.className = 'feed-info-bar active';
  document.getElementById('feedTypeTag').textContent  = `${meta.emoji} ${meta.label}`;
  document.getElementById('feedTypeTag').className    = `feed-tag ${meta.cls}`;
  document.getElementById('feedTimestamp').textContent = formatTime(alert.timestamp);
  document.getElementById('feedAlertId').textContent   = `Alert #${alert.id}`;
  document.getElementById('feedLabel').textContent     = `Alert #${alert.id}`;
}

// ── Modal ──────────────────────────────────────────────────────────────────────
async function openModal(id) {
  const alert = _alertsCache.find(a => a.id === id);
  if (!alert) return;

  const meta    = TYPE_META[alert.type] || { label: alert.type, emoji: '⚠️', cls: 'motion' };
  const isVideo = alert.media_filename && /\.(mp4|avi|mov|webm)$/i.test(alert.media_filename);

  let mediaHTML = '';
  if (alert.media_path) {
    mediaHTML = isVideo
      ? `<video controls style="max-width:100%;max-height:60vh;"><source src="${alert.media_path}"></video>`
      : `<img src="${alert.media_path}" alt="Recording" style="max-width:100%;max-height:60vh;object-fit:contain;" />`;
  } else {
    mediaHTML = `<div style="padding:60px;color:var(--text-3);font-size:3rem;">${meta.emoji}</div>`;
  }

  document.getElementById('modalTitle').textContent = `${meta.emoji} ${meta.label} — Alert #${id}`;
  document.getElementById('modalMedia').innerHTML   = mediaHTML;
  document.getElementById('modalInfo').innerHTML    = `
    <div class="modal-info-item"><div class="modal-info-label">Alert ID</div><div class="modal-info-value">#${alert.id}</div></div>
    <div class="modal-info-item"><div class="modal-info-label">Type</div><div class="modal-info-value">${meta.label}</div></div>
    <div class="modal-info-item"><div class="modal-info-label">Timestamp</div><div class="modal-info-value">${formatTime(alert.timestamp)}</div></div>
    <div class="modal-info-item"><div class="modal-info-label">Status</div><div class="modal-info-value">${alert.status}</div></div>
    <div class="modal-info-item"><div class="modal-info-label">File</div><div class="modal-info-value">${alert.media_filename || 'None'}</div></div>
  `;

  document.getElementById('modalOverlay').classList.add('active');

  // Mark seen
  if (alert.status === 'unseen') {
    await apiFetch(`/api/alerts/${id}/seen`, { method: 'PATCH' });
    alert.status = 'seen';
    renderAlerts(_alertsCache);
    updateStats(_alertsCache);
  }
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('modalMedia').innerHTML = '';
}

// ── Simulate Pi Upload ────────────────────────────────────────────────────────
async function simulateUpload() {
  const btn   = document.getElementById('simBtn');
  const types = ['motion']; // Only motion as requested
  const type  = types[Math.floor(Math.random() * types.length)];
  btn.disabled = true;
  btn.textContent = '⏳ Sending…';

  try {
    // Build a tiny synthetic coloured JPEG via Canvas
    const canvas  = document.createElement('canvas');
    canvas.width  = 320; canvas.height = 240;
    const ctx     = canvas.getContext('2d');
    const colours = { motion: '#14502a', human_detected: '#14285a', intrusion: '#5a1414' };
    ctx.fillStyle = colours[type] || '#222';
    ctx.fillRect(0, 0, 320, 240);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let x = 0; x < 320; x += 20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,240); ctx.stroke(); }
    for (let y = 0; y < 240; y += 20) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(320,y); ctx.stroke(); }

    // Labels
    ctx.fillStyle = '#00d4aa'; ctx.font = 'bold 13px monospace';
    ctx.fillText('SecureEye — SIMULATED', 10, 24);
    ctx.fillStyle = '#fff'; ctx.font = '11px monospace';
    ctx.fillText(`TYPE: ${type.toUpperCase()}`, 10, 46);
    ctx.fillText(`TIME: ${new Date().toISOString()}`, 10, 62);

    // Detection box
    ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 2;
    ctx.strokeRect(80 + Math.random()*40, 60 + Math.random()*30, 120, 100);
    ctx.fillStyle = '#00ff88'; ctx.font = 'bold 10px monospace';
    ctx.fillText('TARGET', 82 + Math.random()*40, 74 + Math.random()*30);

    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.85));
    const fd   = new FormData();
    fd.append('file', blob, `sim_${Date.now()}.jpg`);
    fd.append('type', type);
    fd.append('timestamp', new Date().toISOString());

    const res = await fetch(`${API}/api/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN()}` },
      body: fd,
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');

    showToast(`✅ Simulated: ${TYPE_META[type]?.label || type}`, 'success');
    await loadAlerts();
    await loadRecordings();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🤖 Simulate Pi Upload';
  }
}

// ── Live Camera Capture ──────────────────────────────────────────────────────
async function captureLiveCamera() {
  const btn = document.getElementById('camBtn');
  btn.disabled = true;
  btn.textContent = '📸 Accessing…';

  let video = null;
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video = document.createElement('video');
    video.srcObject = stream;
    await video.play();

    // Small delay to let the camera adjust exposure
    await new Promise(r => setTimeout(r, 600));

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Stop stream
    stream.getTracks().forEach(t => t.stop());

    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
    const fd = new FormData();
    fd.append('file', blob, `cam_${Date.now()}.jpg`);
    fd.append('type', 'motion');
    fd.append('timestamp', new Date().toISOString());

    const res = await fetch(`${API}/api/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN()}` },
      body: fd,
    });
    
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
    
    showToast(`📸 Camera Alert Sent!`, 'success');
    await loadAlerts();
  } catch (err) {
    showToast(`❌ Camera Error: ${err.message}`, 'error');
  } finally {
    if (stream) stream.getTracks().forEach(t => t.stop());
    btn.disabled = false;
    btn.innerHTML = '📸 Live Camera Alert';
  }
}

// ── Utilities ──────────────────────────────────────────────────────────────────
function formatTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)   return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff/60)}m ago`;
  if (diff < 86400) return `${Math.round(diff/3600)}h ago`;
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric',
                                          hour:'2-digit', minute:'2-digit' });
}

function updateLastRefresh() {
  const el = document.getElementById('lastUpdate');
  if (el) el.textContent = `Updated ${new Date().toLocaleTimeString()}`;
}

function showToast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `toast ${type} show`;
  setTimeout(() => { el.className = `toast ${type}`; }, 3500);
}

// Close modal on Escape
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModalDirect(); });
