'use strict';
/* ===== Giọng đọc tốt hơn + ảnh do bạn tự dán/chọn ===== */

/* ---- IndexedDB nhỏ gọn: lưu ảnh của bạn và âm thanh giọng AI (cache) ---- */
const IDB = {
  db: null,
  open() {
    if (this.db) return this.db;
    return this.db = new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error('no idb'));
      const r = indexedDB.open('ielts-media', 1);
      r.onupgradeneeded = () => { r.result.createObjectStore('imgs'); r.result.createObjectStore('tts'); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  },
  async tx(store, mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => { const t = db.transaction(store, mode), s = t.objectStore(store), q = fn(s); t.oncomplete = () => res(q?.result); t.onerror = () => rej(t.error); });
  },
  get(store, key) { return this.tx(store, 'readonly', s => s.get(key)).catch(() => undefined); },
  put(store, key, val) { return this.tx(store, 'readwrite', s => s.put(val, key)).catch(() => undefined); },
  del(store, key) { return this.tx(store, 'readwrite', s => s.delete(key)).catch(() => undefined); },
  async all(store) {
    try {
      const db = await this.open();
      return await new Promise(res => { const out = []; const q = db.transaction(store).objectStore(store).openCursor(); q.onsuccess = () => { const c = q.result; if (c) { out.push([c.key, c.value]); c.continue(); } else res(out); }; q.onerror = () => res(out); });
    } catch { return []; }
  }
};

/* ---- Ảnh của bạn (dán / chọn từ máy) ---- */
const Imgs = {
  map: new Map(), ver: 0,
  async load() { for (const [k, blob] of await IDB.all('imgs')) this.map.set(k, URL.createObjectURL(blob)); this.ver++; },
  url(key) { return this.map.get(key) || ''; },
  async fromBlob(blob, max = 720) {              // thu nhỏ để nhẹ máy (≈ 30–80 KB)
    const bmp = await createImageBitmap(blob), k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('encode')), 'image/jpeg', .85));
  },
  async put(key, blob) {
    await IDB.put('imgs', key, blob);
    const old = this.map.get(key); if (old) URL.revokeObjectURL(old);
    this.map.set(key, URL.createObjectURL(blob)); this.ver++;
  },
  async remove(key) { await IDB.del('imgs', key); const old = this.map.get(key); if (old) URL.revokeObjectURL(old); this.map.delete(key); this.ver++; }
};

/* ---- Giọng đọc ---- */
const NOVELTY = /(fred|zarvox|whisper|bad news|good news|bells|boing|bubbles|cellos|deranged|hysterical|organ|trinoids|albert|junior|kathy|ralph|bahh|princess|jester|superstar|wobble|grandma|grandpa|rocko|eddy|flo|reed|sandy|shelley)/i;
const Voice = {
  cur: null, urls: [],
  cfg() {
    const d = { engine: 'browser', us: '', uk: '', wordSrc: 'human', rate: .95, eleven: { key: '', us: '21m00Tcm4TlvDq8ikWAM', uk: 'onwK4e9ZLuTAKqWW03F9' } };
    const s = LS.get('ielts.voice', {}); return { ...d, ...s, eleven: { ...d.eleven, ...(s.eleven || {}) } };
  },
  save(c) { LS.set('ielts.voice', c); },
  voices() { return ('speechSynthesis' in window ? speechSynthesis.getVoices() : []).filter(v => /^en[-_]/i.test(v.lang)); },
  score(v, lang) {                                  // điểm chất lượng ước lượng theo tên giọng
    const n = v.name.toLowerCase(); let s = 0;
    if (/natural|neural|online/.test(n)) s += 100;
    if (/premium/.test(n)) s += 80;
    if (/enhanced/.test(n)) s += 60;
    if (/google/.test(n)) s += 50;
    if (/siri/.test(n)) s += 45;
    if (/aria|jenny|guy|sonia|ryan|libby|emma|brian|samantha|ava|allison|susan|daniel|serena|oliver|karen|moira|tessa|nicky|evan|zoe/.test(n)) s += 15;
    if (/compact/.test(n)) s -= 40;
    if (/espeak|festival/.test(n)) s -= 90;
    if (NOVELTY.test(n)) s -= 120;
    if (!v.localService) s += 8;
    const l = v.lang.replace('_', '-').toLowerCase();
    if (l === lang.toLowerCase()) s += 110; else if (l.startsWith('en-')) s += (lang === 'en-GB' && ['en-au', 'en-ie', 'en-za'].includes(l)) ? 12 : 0;
    return s;
  },
  ranked(lang) { return this.voices().map(v => [this.score(v, lang), v]).sort((a, b) => b[0] - a[0]).map(x => x[1]); },
  pick(lang) {
    const c = this.cfg(), want = lang === 'en-GB' ? c.uk : c.us;
    const all = this.voices();
    return (want && all.find(v => v.name === want)) || this.ranked(lang)[0] || null;
  },
  stop() { try { speechSynthesis.cancel(); } catch { } if (this.cur) { try { this.cur.pause(); } catch { } this.cur = null; } },

  async hash(s) {
    try { const d = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join(''); }
    catch { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return String(h); }
  },
  /* Giọng AI tự nhiên (ElevenLabs): chỉ tốn phí lần đầu, sau đó lưu cache trong máy */
  async elevenBlob(text, voiceId) {
    const c = this.cfg(), key = await this.hash(text + '|' + voiceId);
    const cached = await IDB.get('tts', key); if (cached) return cached;
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
      method: 'POST', headers: { 'xi-api-key': c.eleven.key, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_turbo_v2_5' })
    });
    if (!r.ok) { let m = ''; try { m = (await r.json()).detail?.message || ''; } catch { } throw new Error(m || ('HTTP ' + r.status)); }
    const blob = await r.blob(); await IDB.put('tts', key, blob); return blob;
  },
  playBlob(blob) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(blob), a = new Audio(url); this.cur = a;
      a.onended = () => { URL.revokeObjectURL(url); res(); }; a.onerror = () => rej(new Error('audio'));
      a.play().catch(rej);
    });
  },
  playUrl(url) { return new Promise((res, rej) => { const a = new Audio(url); this.cur = a; a.onended = () => res(); a.onerror = () => rej(new Error('audio')); a.play().catch(rej); }); },

  /* Đọc 1 đoạn. idx = chỉ số người nói (dùng cho Listening nhiều người) */
  line(text, { lang = 'en-US', rate, idx = 0 } = {}) {
    const c = this.cfg();
    const useEleven = c.engine === 'eleven' && c.eleven.key;
    if (useEleven) {
      const useUK = idx === 0 ? lang === 'en-GB' : lang !== 'en-GB';       // người nói thứ 2 dùng giọng còn lại
      const vid = useUK ? c.eleven.uk : c.eleven.us;
      return this.elevenBlob(text, vid).then(b => this.playBlob(b)).catch(e => {
        if (!this.warned) { this.warned = true; if (typeof toast === 'function') toast('Giọng AI lỗi (' + e.message + ') – tạm dùng giọng trình duyệt'); }
        return this.browserLine(text, lang, rate, idx);
      });
    }
    return this.browserLine(text, lang, rate, idx);
  },
  browserLine(text, lang, rate, idx = 0) {
    return new Promise(res => {
      if (!('speechSynthesis' in window)) return res();
      const u = new SpeechSynthesisUtterance(text);
      let v = this.pick(lang);
      if (idx > 0) { const r = this.ranked(lang).filter(x => x.name !== v?.name); v = r[0] || v; }   // người nói khác -> giọng khác
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang;
      u.rate = rate ?? this.cfg().rate; u.pitch = 1;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
    });
  },
  say(text, o = {}) { this.stop(); this.line(text, o); }
};
if ('speechSynthesis' in window) speechSynthesis.addEventListener?.('voiceschanged', () => { Voice.voicesReady = true; });
