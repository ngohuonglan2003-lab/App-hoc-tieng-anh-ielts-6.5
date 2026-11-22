'use strict';
/* ===== Sinh bài tập kiểu Duolingo từ dữ liệu của từng từ =====
   ctx = { vocab: [entries], viPool: [{key, vi}] } */

const INTERVALS = [0, 1, 2, 4, 8, 16, 32];           // ngày, theo "hộp" ghi nhớ (Leitner)
const norm = s => String(s).trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

const wordDistractors = (w, ctx, n = 3) =>
  shuffle(ctx.vocab.filter(e => e.key !== w.key).map(e => e.word)).slice(0, n);

function choice(w, type, title, promptHTML, correct, wrong, extra = {}) {
  wrong = [...new Set(wrong)].filter(x => x && x !== correct).slice(0, 3);
  if (wrong.length < 3) return null;
  return {
    kind: 'choice', type, w, title, promptHTML, reveal: correct, ...extra,
    options: shuffle([{ text: correct, correct: true }, ...wrong.map(text => ({ text, correct: false }))])
  };
}

const firstDef = w => w.meanings?.[0]?.defs?.[0]?.def || '';
const speakBtn = `<button class="bigspeak" data-act="say" aria-label="Nghe">🔊</button>`;

const MAKE = {
  'mcq-vi': (w, ctx) => {
    if (!w.vi) return null;
    const wrong = shuffle(ctx.viPool.filter(p => p.key !== w.key && p.vi && p.vi !== w.vi)).map(p => p.vi);
    return choice(w, 'mcq-vi', 'Chọn nghĩa đúng của từ này',
      `<div class="qword">${esc(w.word)} ${speakBtn}</div><div class="qipa">${esc(w.phonetic || '')}</div>`, w.vi, wrong, { auto: true });
  },
  'mcq-def': (w, ctx) => {
    const def = firstDef(w); if (!def) return null;
    const masked = def.replace(stemRe(w.word, 'gi'), '_____');
    return choice(w, 'mcq-def', 'Từ nào phù hợp với định nghĩa này?',
      `<div class="qdef">“${esc(masked)}”</div>${w.vi ? `<div class="qhint">Gợi ý: ${esc(w.vi)}</div>` : ''}`, w.word, wordDistractors(w, ctx));
  },
  listen: (w, ctx) => choice(w, 'listen', 'Nghe và chọn từ bạn nghe được',
    `<div class="qlisten">${speakBtn}<button class="chip" data-act="slow">🐢 Nghe chậm</button></div>`, w.word, wordDistractors(w, ctx), { auto: true }),
  image: (w, ctx) => {
    const img = w.images?.[0]; if (!img) return null;
    return choice(w, 'image', 'Hình ảnh này gợi nhớ đến từ nào?',
      `<img class="qimg" src="${esc(img.src)}" alt="" referrerpolicy="no-referrer" onerror="window.__imgFail&&window.__imgFail()">`, w.word, wordDistractors(w, ctx));
  },
  cloze: (w, ctx) => cloze(w, ctx, false),
  'cloze-type': (w, ctx) => cloze(w, ctx, true),
  synonym: (w, ctx) => {
    if (!w.synonyms?.length) return null;
    const bad = new Set(w.synonyms.map(s => s.toLowerCase()));
    const wrong = shuffle(ctx.vocab.filter(e => e.key !== w.key && !bad.has(e.key)).map(e => e.word));
    const correct = shuffle(w.synonyms)[0];
    return choice(w, 'synonym', `Từ nào đồng nghĩa với “${w.word}”?`, `<div class="qword">${esc(w.word)} ${speakBtn}</div>`, correct, wrong);
  },
  type: w => {
    if (!w.vi && !firstDef(w)) return null;
    const hint = `${w.word[0]}${'_ '.repeat(Math.max(0, w.word.replace(/\s/g, '').length - 1)).trim()}`;
    const prompt = w.vi ? `<div class="qdef">${esc(w.vi)}</div>` : `<div class="qdef">“${esc(firstDef(w).replace(stemRe(w.word, 'gi'), '_____'))}”</div>`;
    return { kind: 'type', type: 'type', w, title: 'Viết từ tiếng Anh tương ứng', promptHTML: prompt + `<div class="qhint">Gợi ý: ${esc(hint)}</div>`, answers: [norm(w.word)], reveal: w.word };
  },
  speak: w => SR ? ({ kind: 'speak', type: 'speak', w, title: 'Hãy đọc to từ này', promptHTML: `<div class="qword">${esc(w.word)}</div><div class="qipa">${esc(w.phonetic || '')}</div>`, reveal: w.word }) : null
};

function cloze(w, ctx, typed) {
  const re = stemRe(w.word);
  const ex = shuffle(w.examples || []).find(e => re.test(e.en) && e.en.length < 170);
  if (!ex) return null;
  const surface = ex.en.match(re)[0];
  const masked = esc(ex.en).replace(stemRe(w.word, 'i'), '<span class="blank">_____</span>');
  const prompt = `<div class="qdef">${masked}</div>${ex.vi ? `<div class="qhint">${esc(ex.vi)}</div>` : ''}${w.vi ? `<div class="qhint">Nghĩa: ${esc(w.vi)}</div>` : ''}`;
  if (typed) return { kind: 'type', type: 'cloze-type', w, title: 'Điền từ còn thiếu vào câu', promptHTML: prompt, answers: [norm(surface), norm(w.word)], reveal: surface };
  return choice(w, 'cloze', 'Chọn từ điền vào chỗ trống (có thể cần chia dạng)', prompt, w.word, wordDistractors(w, ctx), { reveal: w.word });
}

const PLAN = [
  ['mcq-vi', 'mcq-def', 'listen', 'image'],                 // hộp 0: nhận diện
  ['listen', 'cloze', 'mcq-def', 'synonym', 'mcq-vi'],       // hộp 1
  ['cloze', 'synonym', 'type', 'listen', 'mcq-def'],         // hộp 2
  ['type', 'cloze-type', 'synonym', 'speak', 'cloze']        // hộp 3+: chủ động nhớ lại
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
  // xáo trộn nhưng tránh hai câu liên tiếp cùng một từ
  let best = shuffle(steps);
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
  Store.progress[key] = p;
}
