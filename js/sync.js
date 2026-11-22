'use strict';
/* ===== Đồng bộ tiến độ giữa điện thoại / iPad bằng ID + mật khẩu =====
   Dữ liệu được mã hóa AES-GCM ngay trên máy bạn (khóa sinh từ mật khẩu), server chỉ thấy dữ liệu mã hóa. */
const Sync = { busy: false, applying: false, status: 'off', err: '', last: 0, cfg() { return LS.get('ielts.sync', null); } };

const b64 = u8 => btoa(String.fromCharCode(...u8));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const te = new TextEncoder(), td = new TextDecoder();

async function deriveKeys(id, password) {
  const k = await crypto.subtle.importKey('raw', te.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: te.encode('ielts65:' + id), iterations: 150000, hash: 'SHA-256' }, k, 512));
  return { key: b64(bits.slice(0, 32)), auth: b64(bits.slice(32)) };
}
async function encryptObj(obj, keyB64) {
  const key = await crypto.subtle.importKey('raw', unb64(keyB64), 'AES-GCM', false, ['encrypt']), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(obj))));
  const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12); return b64(out);
}
async function decryptObj(s, keyB64) {
  const u = unb64(s), key = await crypto.subtle.importKey('raw', unb64(keyB64), 'AES-GCM', false, ['decrypt']);
  return JSON.parse(td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.slice(0, 12) }, key, u.slice(12))));
}

function snapshot() {
  return { v: 1, t: Date.now(), progress: Store.progress, profile: Store.profile, gstats: Store.gstats, exams: Store.exams,
    extra: LS.get('ielts.extra', ''), upload: LS.get('ielts.upload', null), imgpick: LS.get('ielts.imgpick', {}) };
}

function mergeSnap(a, b) {
  const progress = {};
  for (const k of new Set([...Object.keys(a.progress || {}), ...Object.keys(b.progress || {})])) {
    const pa = a.progress?.[k], pb = b.progress?.[k];
    progress[k] = !pa ? pb : !pb ? pa : ((pb.ts || 0) > (pa.ts || 0) ? pb : pa);
  }
  const pa = a.profile || {}, pb = b.profile || {}, newer = (pb.updatedAt || 0) > (pa.updatedAt || 0) ? pb : pa, older = newer === pa ? pb : pa;
  const profile = { ...older, ...newer };
  profile.xpByDay = { ...(older.xpByDay || {}) }; for (const [d, v] of Object.entries(newer.xpByDay || {})) profile.xpByDay[d] = Math.max(v, profile.xpByDay[d] || 0);
  profile.xp = Math.max(pa.xp || 0, pb.xp || 0); profile.lessons = Math.max(pa.lessons || 0, pb.lessons || 0);
  profile.pets = { ...(older.pets || {}), ...(newer.pets || {}) }; profile.items = { ...(newer.items || {}) };
  const later = (pa.lastDay || '') >= (pb.lastDay || '') ? pa : pb; profile.lastDay = later.lastDay; profile.streak = later.streak;
  profile.level = levelOf(profile.xp);
  const gstats = {}; for (const t of new Set([...Object.keys(a.gstats || {}), ...Object.keys(b.gstats || {})])) {
    const x = a.gstats?.[t] || { ok: 0, bad: 0 }, y = b.gstats?.[t] || { ok: 0, bad: 0 }; gstats[t] = (x.ok + x.bad) >= (y.ok + y.bad) ? x : y;
  }
  const exams = [...new Map([...(a.exams || []), ...(b.exams || [])].map(e => [e.id, e])).values()].sort((x, y) => x.id - y.id).slice(-100);
  const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const extra = [...new Set([...lines(a.extra), ...lines(b.extra)])].join('\n');
  return { v: 1, t: Math.max(a.t || 0, b.t || 0), progress, profile, gstats, exams, extra, upload: (b.t || 0) > (a.t || 0) ? b.upload : a.upload, imgpick: { ...(b.imgpick || {}), ...(a.imgpick || {}) } };
}

function applySnap(s) {
  Sync.applying = true;
  Object.keys(Store.progress).forEach(k => delete Store.progress[k]); Object.assign(Store.progress, s.progress);
  Object.assign(Store.profile, s.profile);
  Object.keys(Store.gstats).forEach(k => delete Store.gstats[k]); Object.assign(Store.gstats, s.gstats);
  Store.exams.length = 0; Store.exams.push(...s.exams);
  LS.set('ielts.extra', s.extra || ''); s.upload == null ? LS.del('ielts.upload') : LS.set('ielts.upload', s.upload); LS.set('ielts.imgpick', s.imgpick || {});
  Store.save(); Sync.applying = false;
}

function setSyncStatus(st) {
  Sync.status = st; const p = $('#syncpill'); if (!p) return;
  p.hidden = st === 'off'; p.textContent = { busy: '☁️ …', ok: '☁️ ✓', err: '☁️ ⚠️' }[st] || ''; p.title = st === 'err' ? Sync.err : 'Đã đồng bộ';
}

async function syncNow() {
  const c = Sync.cfg(); if (!c || Sync.busy) return false;
  Sync.busy = true; setSyncStatus('busy');
  try {
    const url = `${c.url.replace(/\/+$/, '')}/s/${encodeURIComponent(c.id)}`;
    const r = await fetch(url, { headers: { 'x-auth': c.auth } });
    let remote = null;
    if (r.status === 200) remote = await decryptObj((await r.json()).data, c.key);
    else if (r.status === 401) throw new Error('Sai mật khẩu (hoặc ID này đã có người khác dùng).');
    else if (r.status !== 404) throw new Error('Máy chủ lỗi ' + r.status);
    if (remote) {
      const before = JSON.stringify([LS.get('ielts.extra', ''), LS.get('ielts.upload', null)]);
      applySnap(mergeSnap(snapshot(), remote));
      if (before !== JSON.stringify([LS.get('ielts.extra', ''), LS.get('ielts.upload', null)])) await loadVocab();
      renderAll();
    }
    const w = await fetch(url, { method: 'PUT', headers: { 'x-auth': c.auth, 'content-type': 'application/json' }, body: JSON.stringify({ data: await encryptObj(snapshot(), c.key) }) });
    if (!w.ok) throw new Error('Không lưu được lên máy chủ (' + w.status + ')');
    Sync.last = Date.now(); Sync.err = ''; setSyncStatus('ok'); return true;
  } catch (e) { Sync.err = e.message === 'Failed to fetch' ? 'Không kết nối được máy chủ đồng bộ.' : e.message; setSyncStatus('err'); return false; }
  finally { Sync.busy = false; }
}

async function connectSync(url, id, password) {
  if (!crypto?.subtle) throw new Error('Cần mở app qua https (ví dụ GitHub Pages) hoặc localhost để mã hóa.');
  const k = await deriveKeys(id, password);
  LS.set('ielts.sync', { url, id, key: k.key, auth: k.auth });
  return syncNow();
}
function disconnectSync() { LS.del('ielts.sync'); setSyncStatus('off'); }

let syncTimer;
window.onStoreSave = () => { if (Sync.applying || !Sync.cfg()) return; clearTimeout(syncTimer); syncTimer = setTimeout(syncNow, 4000); };
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Sync.cfg() && Date.now() - Sync.last > 60000) syncNow(); });

/* ---- Mã đồng bộ thủ công (không cần máy chủ): sao chép từ máy này, dán sang máy kia ---- */
async function packCode() {
  const json = JSON.stringify(snapshot());
  if (window.CompressionStream) {
    const s = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
    return 'IELTS1:' + b64(new Uint8Array(await new Response(s).arrayBuffer()));
  }
  return 'IELTS0:' + b64(te.encode(json));
}
async function importCode(code) {
  code = code.trim(); const kind = code.slice(0, 7), raw = unb64(code.slice(7));
  let json;
  if (kind === 'IELTS1:') json = await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  else if (kind === 'IELTS0:') json = td.decode(raw); else throw new Error('Mã không hợp lệ.');
  const remote = JSON.parse(json);
  applySnap(mergeSnap(snapshot(), remote)); await loadVocab(); renderAll();
}
