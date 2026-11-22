'use strict';
/* ===== Tiện ích ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
const todayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const DAY = 864e5;

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { } }
};

/* ===== Đọc file từ vựng =====
   từ | nghĩa Việt | chủ đề | câu ví dụ | link ảnh   (cột nào cũng có thể bỏ trống) */
function parseVocab(text) {
  const out = [], seen = new Set();
  for (let line of String(text).split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const p = (/[|\t]/.test(line) ? line.split(/\s*[|\t]\s*/) : line.split(/\s*,\s*/)).map(s => s.replace(/^"|"$/g, '').trim());
    const word = p[0];
    if (!word) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ word, key, vi: p[1] || '', topic: p[2] || 'Chung', example: p[3] || '', image: p[4] || '' });
  }
  return out;
}

/* ===== Lưu tiến độ ===== */
const PROFILE_DEFAULTS = () => ({ xp: 0, streak: 0, lastDay: '', xpByDay: {}, goal: 50, accent: 'us', sound: true, lessons: 0, coins: 0, pets: {}, pet: '', items: { freeze: 0, hearts: 0 }, level: 1, chestDay: '', updatedAt: 0 });
const Store = {
  progress: LS.get('ielts.progress', {}),   // key -> {box, due, seen, ok, bad, ts}
  profile: (() => { const d = PROFILE_DEFAULTS(), s = LS.get('ielts.profile', {}); return Object.assign(d, s, { items: Object.assign(d.items, s.items), pets: Object.assign({}, s.pets) }); })(),
  gstats: LS.get('ielts.gstats', {}),        // chủ đề ngữ pháp -> {ok, bad}
  exams: LS.get('ielts.exams', []),          // lịch sử thi thử
  save() {
    this.profile.updatedAt = Date.now();
    LS.set('ielts.progress', this.progress); LS.set('ielts.profile', this.profile);
    LS.set('ielts.gstats', this.gstats); LS.set('ielts.exams', this.exams);
    window.onStoreSave?.();
  },
  xpToday() { return this.profile.xpByDay[todayStr()] || 0; }
};

const Vocab = { entries: [], text: '' };
async function loadVocab() {
  let base = LS.get('ielts.upload', null);
  if (base == null) {
    try {
      const r = await fetch('vocab/tu-vung.txt?t=' + Date.now());
      if (r.ok) { base = await r.text(); LS.set('ielts.fileText', base); }
    } catch { }
    if (base == null) base = LS.get('ielts.fileText', '');
  }
  Vocab.text = base + '\n' + LS.get('ielts.extra', '');
  Vocab.entries = parseVocab(Vocab.text);
  return Vocab.entries;
}

/* ===== Gọi API miễn phí (không cần key) ===== */
async function jget(url, ms = 9000) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(url, { signal: c.signal }); return r.ok ? await r.json() : null; }
  catch { return null; } finally { clearTimeout(t); }
}

const CACHE_KEY = 'ielts.cache.v3';
let cache = LS.get(CACHE_KEY, {});
const MEM = new Map();
function saveCache() {
  if (LS.set(CACHE_KEY, cache)) return;
  const ks = Object.keys(cache); ks.slice(0, Math.ceil(ks.length / 2)).forEach(k => delete cache[k]); LS.set(CACHE_KEY, cache);
}
function clearCache() { cache = {}; MEM.clear(); LS.del(CACHE_KEY); }
const cachedVi = key => cache[key]?.vi || '';

const uniq = a => [...new Set(a.map(s => String(s).trim()).filter(Boolean))];

/* Tìm gốc từ để tô sáng / che trong câu (mitigate -> mitigating) */
function stemRe(word, flags = 'i') {
  const w = word.toLowerCase().trim();
  if (/\s/.test(w)) return new RegExp(escRe(w).replace(/\s+/g, '\\s+'), flags);
  const stem = w.length > 5 ? w.slice(0, w.length - 2) : w;
  return new RegExp('\\b' + escRe(stem) + '[a-z]*', flags);
}

const STOP = new Set('the a an of to in on at by for with from and or but not is are was were be been being has have had do does did it its this that these those as if than then so such can could will would shall should may might must about into over under after before more most very also just their there which who whom whose what when where why how all any both each few other some no nor only own same too out up off again further once here our your his her him them they you we i me my'.split(' '));

/* Tìm ảnh từ nhiều nguồn: Pixabay (nếu có key), Openverse, Wikimedia Commons, Wikipedia */
async function searchImages(query) {
  const e = encodeURIComponent(query), keys = LS.get('ielts.keys', {});
  const [px, ov, cm, wk] = await Promise.all([
    keys.pixabay ? jget(`https://pixabay.com/api/?key=${encodeURIComponent(keys.pixabay)}&q=${e}&image_type=photo&safesearch=true&per_page=9&order=popular`) : null,
    jget(`https://api.openverse.org/v1/images/?q=${e}&page_size=8&mature=false`),
    jget(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=${e}%20filetype:bitmap&prop=imageinfo&iiprop=url&iiurlwidth=500`),
    jget(`https://en.wikipedia.org/api/rest_v1/page/summary/${e}`)
  ]);
  const out = [];
  (px?.hits || []).forEach(h => out.push({ src: h.webformatURL, credit: 'Pixabay · ' + h.user, link: h.pageURL }));
  (ov?.results || []).filter(r => r.thumbnail || r.url).slice(0, 6).forEach(r => out.push({
    src: (r.thumbnail || r.url).replace(/^http:/, 'https:'),
    credit: [r.title, r.creator, r.license ? 'CC ' + r.license.toUpperCase() : ''].filter(Boolean).join(' · ').slice(0, 90), link: r.foreign_landing_url || ''
  }));
  Object.values(cm?.query?.pages || {}).forEach(p => { const ii = p.imageinfo?.[0]; if (ii?.thumburl) out.push({ src: ii.thumburl, credit: 'Wikimedia Commons', link: ii.descriptionurl || '' }); });
  if (wk?.thumbnail?.source) out.push({ src: wk.thumbnail.source, credit: 'Wikipedia', link: wk.content_urls?.desktop?.page || '' });
  const seen = new Set();
  return out.filter(i => i.src && !seen.has(i.src) && seen.add(i.src));
}

async function fetchEnrichment(word) {
  const q = encodeURIComponent(word);
  const [dict, syn, ant, bga, bgb, tr, images, , tat] = await Promise.all([
    jget(`https://api.dictionaryapi.dev/api/v2/entries/en/${q}`),
    jget(`https://api.datamuse.com/words?rel_syn=${q}&max=10`),
    jget(`https://api.datamuse.com/words?rel_ant=${q}&max=6`),
    jget(`https://api.datamuse.com/words?rel_bga=${q}&max=6`),
    jget(`https://api.datamuse.com/words?rel_bgb=${q}&max=6`),
    jget(`https://api.mymemory.translated.net/get?q=${q}&langpair=en|vi`),
    searchImages(word),
    Promise.resolve(null),
    jget(`https://tatoeba.org/en/api_v0/search?from=eng&to=vie&query=${q}&orphans=no&sort=relevance`)
  ]);

  let phonetic = '', audio = { us: '', uk: '', any: '' }, meanings = [], examples = [], synonyms = [], antonyms = [];
  if (Array.isArray(dict)) for (const e of dict) {
    phonetic ||= e.phonetic || (e.phonetics || []).find(p => p.text)?.text || '';
    for (const p of e.phonetics || []) {
      if (!p.audio) continue;
      if (/-us\./i.test(p.audio)) audio.us ||= p.audio; else if (/-uk\./i.test(p.audio)) audio.uk ||= p.audio; else audio.any ||= p.audio;
    }
    for (const m of e.meanings || []) {
      const defs = (m.definitions || []).slice(0, 2).map(d => ({ def: d.definition, example: d.example || '' }));
      if (defs.length) meanings.push({ pos: m.partOfSpeech, defs });
      defs.forEach(d => d.example && examples.push({ en: d.example, vi: '' }));
      synonyms.push(...(m.synonyms || []), ...(m.definitions || []).flatMap(d => d.synonyms || []));
      antonyms.push(...(m.antonyms || []), ...(m.definitions || []).flatMap(d => d.antonyms || []));
    }
  }
  synonyms.push(...(syn || []).map(x => x.word));
  antonyms.push(...(ant || []).map(x => x.word));
  const lw = word.toLowerCase();
  synonyms = uniq(synonyms).filter(s => s.toLowerCase() !== lw).slice(0, 8);
  antonyms = uniq(antonyms).filter(s => s.toLowerCase() !== lw).slice(0, 5);

  // Cụm từ hay đi cùng (collocations) từ thống kê Datamuse
  const good = x => x.word.length > 2 && !STOP.has(x.word.toLowerCase()) && /^[a-z-]+$/i.test(x.word);
  const collocations = uniq([
    ...(bgb || []).filter(good).slice(0, 4).map(x => `${x.word} ${word}`),
    ...(bga || []).filter(good).slice(0, 4).map(x => `${word} ${x.word}`)
  ]).slice(0, 7);

  // Câu mẫu thật (kèm bản dịch tiếng Việt) từ Tatoeba
  for (const r of (tat?.results || []).slice(0, 12)) {
    const vi = (r.translations || []).flat().find(t => t && t.lang === 'vie')?.text || '';
    if (r.text && r.text.length > 20 && r.text.length < 130) examples.push({ en: r.text, vi });
    if (examples.length >= 7) break;
  }

  // Dịch nghĩa
  let vi = '';
  const t = tr?.responseData?.translatedText;
  if (t && tr.responseStatus == 200 && !/MYMEMORY|QUERY LENGTH/i.test(t) && t.toLowerCase() !== lw) vi = t.toLowerCase();

  return { ok: !!(dict || images.length || tr), phonetic, audio, meanings, examples, synonyms, antonyms, collocations, vi, images };
}

/* Gộp dữ liệu người dùng (file) + dữ liệu tự động. Dữ liệu người dùng luôn được ưu tiên. */
function merge(entry, d) {
  const examples = [...(entry.example ? [{ en: entry.example, vi: '' }] : []), ...(d.examples || [])];
  const seen = new Set();
  return {
    ...entry, ...d,
    vi: entry.vi || d.vi || '',
    audio: d.audio || { us: '', uk: '', any: '' },
    meanings: d.meanings || [], synonyms: d.synonyms || [], antonyms: d.antonyms || [], collocations: d.collocations || [],
    examples: examples.filter(e => e.en && !seen.has(e.en) && seen.add(e.en)),
    images: [...(LS.get('ielts.imgpick', {})[entry.key] ? [{ ...LS.get('ielts.imgpick', {})[entry.key], pinned: true }] : []),
      ...(entry.image ? [{ src: entry.image, credit: '', link: '', pinned: true }] : []), ...(d.images || [])]
  };
}

async function enrich(entry) {
  const mk = entry.key + '|' + entry.vi + '|' + entry.example + '|' + entry.image + '|' + (LS.get('ielts.imgpick', {})[entry.key]?.src || '');
  if (MEM.has(mk)) return MEM.get(mk);
  let d = cache[entry.key];
  if (!d) {
    d = await fetchEnrichment(entry.word);
    if (d.ok) { cache[entry.key] = d; saveCache(); }
  }
  const full = merge(entry, d);
  MEM.set(mk, full);
  return full;
}

async function enrichMany(entries, onProgress, limit = 4) {
  const out = new Array(entries.length); let next = 0, done = 0;
  await Promise.all(Array.from({ length: Math.min(limit, entries.length) }, async () => {
    while (next < entries.length) {
      const i = next++; out[i] = await enrich(entries[i]); onProgress?.(++done, entries.length);
    }
  }));
  return out;
}

const trMem = {};
async function translateVi(text) {
  if (trMem[text]) return trMem[text];
  const r = await jget(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`);
  const t = r?.responseData?.translatedText;
  return (trMem[text] = t && !/MYMEMORY/i.test(t) ? t : '');
}

/* ===== Phát âm ===== */
let curAudio;
function speak(text, { lang = 'en-US', rate = .9 } = {}) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = rate;
  const v = speechSynthesis.getVoices().find(v => v.lang.replace('_', '-') === lang);
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
function pronounce(w, accent = Store.profile.accent, slow = false) {
  if (curAudio) curAudio.pause();
  const url = slow ? '' : (w.audio?.[accent] || (accent === 'us' ? w.audio?.any : '') || '');
  const tts = () => speak(w.word, { lang: accent === 'uk' ? 'en-GB' : 'en-US', rate: slow ? .55 : .9 });
  if (!url) return tts();
  curAudio = new Audio(url); curAudio.play().catch(tts);
}
let AC;
function beep(ok) {
  if (!Store.profile.sound) return;
  try {
    AC ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.connect(g); g.connect(AC.destination);
    o.frequency.setValueAtTime(ok ? 660 : 180, t); if (ok) o.frequency.setValueAtTime(880, t + .1);
    g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .3);
    o.start(t); o.stop(t + .3);
  } catch { }
}

/* ===== Nhận dạng giọng nói (Chrome/Edge/Safari) ===== */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listenOnce() {
  return new Promise((res, rej) => {
    const r = new SR(); r.lang = 'en-US'; r.maxAlternatives = 5;
    r.onresult = e => res([...e.results[0]].map(a => a.transcript.toLowerCase()));
    r.onerror = e => rej(e.error); r.onend = () => res([]);
    try { r.start(); } catch (e) { rej(e); }
  });
}

/* ===== So sánh câu (nói / nghe-chép) ===== */
const tokens = s => String(s).toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9'\s-]/g, ' ').split(/\s+/).filter(Boolean);
function lcsMarks(target, said) {            // trả về mảng đúng/sai cho từng từ của câu mẫu
  const a = tokens(target), b = tokens(said), m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] + 1 : Math.max(d[i - 1][j], d[i][j - 1]);
  const hit = new Array(m).fill(false); let i = m, j = n;
  while (i > 0 && j > 0) { if (a[i - 1] === b[j - 1]) { hit[i - 1] = true; i--; j--; } else if (d[i - 1][j] >= d[i][j - 1]) i--; else j--; }
  return { words: a, hit, ratio: m ? d[m][n] / m : 0 };
}
