'use strict';
/* ===== Sinh bài tập kiểu Duolingo từ dữ liệu của từng từ =====
   ctx = { vocab: [entries], viPool: [{key, vi}] }
   Mỗi bài: { kind: choice|type|speak|order|teach, type, w, title, promptHTML, ... } */

const INTERVALS = [0, 1, 2, 4, 8, 16, 32];           // ngày, theo "hộp" ghi nhớ (Leitner)
const norm = s => String(s).trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/* Hai từ "cùng gốc" (mitigate/mitigation, decline/declined…) => không được xuất hiện chung trong 1 câu hỏi */
const sameStem = (a, b) => {
  a = a.toLowerCase().trim(); b = b.toLowerCase().trim();
  if (a === b || a.startsWith(b) || b.startsWith(a)) return true;
  const n = Math.min(5, a.length, b.length);
  return n >= 4 && a.slice(0, n) === b.slice(0, n);
};

const wordDistractors = (w, ctx, n = 3) =>
  shuffle(ctx.vocab.filter(e => e.key !== w.key).map(e => e.word)).slice(0, n);

function choice(w, type, title, promptHTML, correct, wrong, extra = {}) {
  const seen = new Set([correct.toLowerCase()]);
  wrong = wrong.filter(x => x && !seen.has(x.toLowerCase()) && seen.add(x.toLowerCase())).slice(0, 3);
  if (wrong.length < 3) return null;
  return {
    kind: 'choice', type, w, title, promptHTML, reveal: correct, ...extra,
    options: shuffle([{ text: correct, correct: true }, ...wrong.map(text => ({ text, correct: false }))])
  };
}

const firstDef = w => w.meanings?.[0]?.defs?.[0]?.def || '';
const speakBtn = `<button class="bigspeak" data-act="say" aria-label="Nghe">🔊</button>`;
/* Thanh công cụ: nghe câu + dịch sang tiếng Việt (bấm mới hiện) */
const textTools = `<div class="qtools"><button class="chip" data-act="saytext">🔊 Nghe</button><button class="chip" data-act="slowtext">🐢 Chậm</button><button class="chip" data-act="trtext">🇻🇳 Dịch</button></div><div class="qtr"></div>`;
const maskFor = (text, word) => text.replace(stemRe(word, 'gi'), '_____');
const spokenMask = (text, word) => text.replace(stemRe(word, 'gi'), 'blank');

/* Chọn 1 câu ví dụ chứa từ, độ dài vừa phải */
function pickSentence(w, { max = 170, maxWords = 99 } = {}) {
  const re = stemRe(w.word);
  return shuffle(w.examples || []).find(e => re.test(e.en) && e.en.length < max && tokens(e.en).length <= maxWords);
}

const MAKE = {
  'mcq-vi': (w, ctx) => {
    if (!w.vi) return null;
    const wrong = shuffle(ctx.viPool.filter(p => p.key !== w.key && p.vi && p.vi !== w.vi)).map(p => p.vi);
    return choice(w, 'mcq-vi', 'Chọn nghĩa đúng của từ này',
      `<div class="qword">${esc(w.word)} ${speakBtn}</div><div class="qipa">${esc(w.phonetic || '')}</div>`, w.vi, wrong, { auto: true });
  },

  'mcq-def': (w, ctx) => {
    const def = firstDef(w); if (!def) return null;
    return choice(w, 'mcq-def', 'Từ nào phù hợp với định nghĩa này?',
      `<div class="qdef">“${esc(maskFor(def, w.word))}”</div>${textTools}${w.vi ? `<div class="qhint">Gợi ý: ${esc(w.vi)}</div>` : ''}`,
      w.word, wordDistractors(w, ctx),
      { sayText: spokenMask(def, w.word), trText: def, full: def });
  },

  listen: (w, ctx) => choice(w, 'listen', 'Nghe và chọn từ bạn nghe được',
    `<div class="qlisten">${speakBtn}<button class="chip" data-act="slow">🐢 Nghe chậm</button></div>`, w.word, wordDistractors(w, ctx), { auto: true }),

  /* Chỉ dùng ảnh do bạn chọn ("ghim") để tránh ảnh sai nghĩa làm bạn học nhầm */
  image: (w, ctx) => {
    const img = w.images?.find(i => i.pinned); if (!img) return null;
    return choice(w, 'image', 'Hình ảnh này gợi nhớ đến từ nào?',
      `<img class="qimg" src="${esc(img.src)}" alt="" referrerpolicy="no-referrer" onerror="window.__imgFail&&window.__imgFail()">`, w.word, wordDistractors(w, ctx));
  },

  cloze: (w, ctx) => cloze(w, ctx, false),
  'cloze-type': (w, ctx) => cloze(w, ctx, true),

  synonym: (w, ctx) => {
    const syns = (w.synonyms || []).filter(s => !sameStem(s, w.word) && /^[a-z' -]+$/i.test(s));
    if (!syns.length) return null;
    const correct = shuffle(syns)[0];
    const bad = new Set((w.synonyms || []).map(s => s.toLowerCase()));
    const wrong = shuffle(ctx.vocab.filter(e => e.key !== w.key && !bad.has(e.key) && !sameStem(e.word, w.word) && !sameStem(e.word, correct)).map(e => e.word));
    return choice(w, 'synonym', `Từ nào đồng nghĩa với “${w.word}”?`, `<div class="qword">${esc(w.word)} ${speakBtn}</div>${w.vi ? `<div class="qhint">${esc(w.vi)}</div>` : ''}`, correct, wrong);
  },

  /* Cách dùng từ: cụm từ hay đi cùng (collocation) */
  colloc: (w, ctx) => {
    const lw = w.word.toLowerCase(), list = shuffle((w.collocations || []).filter(c => c.toLowerCase().includes(lw)));
    for (const c of list) {
      const t = c.toLowerCase(), after = t.startsWith(lw);
      const partner = after ? c.slice(w.word.length).trim() : c.slice(0, c.length - w.word.length).trim();
      if (!partner || /\s/.test(partner)) continue;
      const wrong = shuffle(ctx.vocab.filter(e => e.key !== w.key && !/\s/.test(e.word) && !sameStem(e.word, partner)).map(e => e.word));
      const pattern = after ? `${w.word} <span class="blank">_____</span>` : `<span class="blank">_____</span> ${w.word}`;
      return choice(w, 'colloc', 'Từ nào thường đi cùng? (cách dùng tự nhiên)', `<div class="qword">${pattern}</div>`, partner, wrong,
        { reveal: c, full: c });
    }
    return null;
  },

  type: w => {
    if (!w.vi && !firstDef(w)) return null;
    const hint = `${w.word[0]}${'_ '.repeat(Math.max(0, w.word.replace(/\s/g, '').length - 1)).trim()}`;
    const prompt = w.vi ? `<div class="qdef">${esc(w.vi)}</div>` : `<div class="qdef">“${esc(maskFor(firstDef(w), w.word))}”</div>`;
    return { kind: 'type', type: 'type', w, title: 'Viết từ tiếng Anh tương ứng', promptHTML: prompt + `<div class="qhint">Gợi ý: ${esc(hint)}</div>`, answers: [norm(w.word)], reveal: w.word };
  },

  /* ---- Luyện nói kiểu Duolingo ---- */
  speak: w => SR ? ({ kind: 'speak', type: 'speak', w, title: 'Hãy đọc to từ này', promptHTML: `<div class="qword">${esc(w.word)}</div><div class="qipa">${esc(w.phonetic || '')}</div>`, target: w.word, pass: 1, reveal: w.word }) : null,

  'speak-sentence': w => {
    if (!SR) return null;
    const ex = pickSentence(w, { max: 120, maxWords: 16 }); if (!ex) return null;
    return {
      kind: 'speak', type: 'speak-sentence', w, title: 'Hãy đọc to câu này', target: ex.en, pass: .7, reveal: ex.en, sentence: true,
      promptHTML: `<div class="qdef">${esc(ex.en)}</div>${ex.vi ? `<div class="qhint">${esc(ex.vi)}</div>` : ''}`, sayText: ex.en
    };
  },

  /* ---- Nghe và gõ lại câu ---- */
  dictate: w => {
    const ex = pickSentence(w, { max: 110, maxWords: 14 }); if (!ex) return null;
    return {
      kind: 'type', type: 'dictate', w, title: 'Nghe và gõ lại câu bạn nghe được', sentence: true, sayText: ex.en, reveal: ex.en, answers: [norm(ex.en)], target: ex.en,
      promptHTML: `<div class="qlisten"><button class="bigspeak" data-act="saytext">🔊</button><button class="chip" data-act="slowtext">🐢 Nghe chậm</button></div>${ex.vi ? '<div class="qtools"><button class="chip" data-act="trtext">🇻🇳 Gợi ý nghĩa</button></div><div class="qtr"></div>' : ''}`,
      trText: ex.vi || '', trKnown: true, auto: 'text'
    };
  },

  /* ---- Xếp các từ thành câu hoàn chỉnh ---- */
  order: w => {
    const ex = pickSentence(w, { max: 110, maxWords: 14 }); if (!ex || tokens(ex.en).length < 4) return null;
    return orderEx(w, 'order', 'Xếp các từ thành câu hoàn chỉnh', ex.en, ex.vi);
  }
};

function orderEx(w, type, title, sentence, vi, extra = {}) {
  const words = sentence.trim().split(/\s+/);
  return {
    kind: 'order', type, w, title, reveal: sentence, answerTokens: words, tiles: shuffle(words.map((t, i) => ({ t, i }))),
    promptHTML: vi ? `<div class="qdef">${esc(vi)}</div>` : `<div class="qlisten"><button class="bigspeak" data-act="saytext">🔊</button><button class="chip" data-act="slowtext">🐢 Chậm</button></div><p class="muted center">Nghe rồi xếp lại thành câu</p>`,
    sayText: sentence, auto: vi ? false : 'text', ...extra
  };
}

function cloze(w, ctx, typed) {
  const re = stemRe(w.word);
  const ex = pickSentence(w);
  if (!ex) return null;
  const surface = ex.en.match(re)[0];
  const masked = esc(ex.en).replace(stemRe(w.word, 'i'), '<span class="blank">_____</span>');
  const prompt = `<div class="qdef">${masked}</div>${textTools}${w.vi ? `<div class="qhint">Nghĩa của từ: ${esc(w.vi)}</div>` : ''}`;
  const common = { sayText: spokenMask(ex.en, w.word), trText: ex.vi || ex.en, trKnown: !!ex.vi, full: ex.en };
  if (typed) return { kind: 'type', type: 'cloze-type', w, title: 'Điền từ còn thiếu vào câu', promptHTML: prompt, answers: [norm(surface), norm(w.word)], reveal: surface, ...common };
  return choice(w, 'cloze', 'Chọn từ điền vào chỗ trống (có thể cần chia dạng)', prompt, w.word, wordDistractors(w, ctx), { reveal: w.word, ...common });
}

const PLAN = [
  ['mcq-vi', 'mcq-def', 'listen', 'image'],                                              // hộp 0: nhận diện
  ['listen', 'cloze', 'mcq-def', 'synonym', 'mcq-vi', 'order', 'colloc'],                // hộp 1
  ['cloze', 'synonym', 'type', 'listen', 'order', 'dictate', 'colloc', 'speak-sentence'], // hộp 2
  ['type', 'cloze-type', 'synonym', 'speak', 'dictate', 'order', 'speak-sentence', 'colloc'] // hộp 3+: chủ động nhớ lại
];

function makeFor(w, box, ctx, exclude = []) {
  const types = shuffle(PLAN[Math.min(box, 3)].filter(t => !exclude.includes(t)));
  for (const t of types) { const e = MAKE[t](w, ctx); if (e) return e; }
  return MAKE.listen(w, ctx) || MAKE.type(w, ctx);
}

/* items: [{w, box, isNew}] -> hàng đợi bài tập */
function buildQueue(items, ctx) {
  const teach = [], steps = [];
  for (const { w, box, isNew } of items) {
    if (isNew) teach.push({ kind: 'teach', type: 'teach', w, title: 'Từ mới' });
    const used = [];
    for (let i = 0; i < 2; i++) {
      const e = makeFor(w, isNew ? i : box, ctx, used);
      if (e) { used.push(e.type); steps.push(e); }
    }
  }
  let best = shuffle(steps);       // tránh hai câu liên tiếp cùng một từ
  for (let t = 0; t < 30; t++) {
    if (best.every((e, i) => !i || e.w.key !== best[i - 1].w.key)) break;
    best = shuffle(steps);
  }
  return [...teach, ...best];
}

/* Mỗi từ nằm trong "hộp" 0..6. Đúng hết -> lên hộp, sai -> xuống hộp & ôn lại sớm */
function applyResult(key, bad) {
  const p = Store.progress[key] || { box: 0, due: 0, seen: 0, ok: 0, bad: 0 };
  p.seen++; bad ? p.bad++ : p.ok++;
  p.box = bad ? Math.max(0, p.box - 1) : Math.min(6, p.box + 1);
  p.due = bad ? Date.now() : Date.now() + INTERVALS[p.box] * DAY;
  p.ts = Date.now();
  Store.progress[key] = p;
}
