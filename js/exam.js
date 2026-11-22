'use strict';
/* ===== Thi thử IELTS: Listening · Reading · Writing · Speaking + thi đầy đủ ===== */
let CHAIN = null;           // trạng thái thi đầy đủ: { steps, i, bands }

/* ---------- Trang tab "Thi thử" ---------- */
function viewExam() {
  const last = {}; Store.exams.forEach(e => last[e.skill] = e);
  const names = { L: 'Listening', R: 'Reading', W: 'Writing', S: 'Speaking' };
  const vals = Object.keys(names).map(k => last[k]?.band).filter(x => x != null);
  const overall = vals.length === 4 ? roundBand(vals.reduce((a, b) => a + b, 0) / 4) : null;
  const hist = Store.exams.slice(-8).reverse();
  $('#view').innerHTML = `
  <section class="card"><h2>📝 Thi thử IELTS Academic</h2>
    <div class="bands">${Object.entries(names).map(([k, n]) => `<div class="bandtile"><b>${last[k] ? last[k].band : '–'}</b><span>${n}</span></div>`).join('')}</div>
    <p class="center">${overall != null ? `<b>Overall ước lượng: ${overall}</b> · mục tiêu 6.5 ${overall >= 6.5 ? '✅' : '🎯'}` : 'Làm đủ 4 kỹ năng để có Band tổng ước lượng (mục tiêu 6.5).'}</p>
    <p class="muted">Cấu trúc theo bài thi thật: Listening (4 phần, nghe 1 lần) · Reading (3 bài: True/False/Not Given, trắc nghiệm, điền từ, nối tiêu đề) · Writing Task 1 + 2 · Speaking 3 phần. Điểm Listening/Reading quy đổi theo bảng Academic (thang 40 câu). Writing/Speaking chấm bởi AI (nếu bật) hoặc ước lượng thô.</p></section>
  <section class="card"><h3>Chọn đề</h3>
    ${topicPickerHTML('ex')}
    <label class="field">Reading / Listening <select id="ex-n"><option value="all">Làm đủ bộ (3 bài đọc / 4 phần nghe)</option><option value="one">Chỉ 1 bài / 1 phần</option></select></label>
    <label class="field">Chế độ thi thật (Listening chỉ nghe 1 lần) <select id="ex-strict"><option value="1">Bật</option><option value="0">Tắt (nghe lại thoải mái)</option></select></label>
    <p class="muted">${AI.has() ? '🤖 AI sẽ tạo đề MỚI theo chủ đề (độ khó tăng dần như thi thật) và chấm Writing/Speaking.' : '📚 Đề Reading/Listening đang dùng bộ đề có sẵn (3 bài đọc, 4 phần nghe); Writing/Speaking có nhiều chủ đề. Bật AI ở Cài đặt để mỗi lần có đề mới theo chủ đề bạn chọn.'}</p>
    <div class="row2"><button class="btn blue" id="ex-r">📖 Reading</button><button class="btn blue" id="ex-l">🎧 Listening</button></div>
    <div class="row2"><button class="btn purple" id="ex-w1">✍️ Writing Task 1</button><button class="btn purple" id="ex-w2">✍️ Writing Task 2</button></div>
    <button class="btn purple" id="ex-s">🎤 Speaking (3 phần)</button>
    <button class="btn green big" id="ex-full">⭐ THI THỬ ĐẦY ĐỦ (L → R → W → S)</button></section>
  ${hist.length ? `<section class="card"><h3>Lịch sử</h3>${hist.map(h => `<div class="hrow"><span>${esc(h.date)} · ${names[h.skill]}${h.topic ? ' · ' + esc(String(h.topic).slice(0, 24)) : ''}${h.raw != null ? ` · ${h.raw}/${h.total}` : ''}</span><b>${h.band}${h.est ? ' ~' : ''}</b></div>`).join('')}</section>` : ''}`;
  const opt = () => ({ topic: resolveTopic('ex'), all: $('#ex-n').value === 'all', strict: $('#ex-strict').value === '1' });
  $('#ex-r').onclick = () => startReading(opt());
  $('#ex-l').onclick = () => startListening(opt());
  $('#ex-w1').onclick = () => startWriting({ ...opt(), tasks: [1] });
  $('#ex-w2').onclick = () => startWriting({ ...opt(), tasks: [2] });
  $('#ex-s').onclick = () => runSpeaking({ parts: [1, 2, 3], topic: opt().topic });
  $('#ex-full').onclick = () => { const o = opt(); o.all = true; startChain(o); };
}

/* ---------- Thi đầy đủ ---------- */
function startChain(o) {
  if (!confirm('Thi thử đầy đủ gồm Listening → Reading → Writing (Task 1 + 2) → Speaking, khoảng 2 giờ 30 phút nếu làm đúng thời gian thật. Bạn có thể thoát giữa chừng. Bắt đầu?')) return;
  CHAIN = { steps: ['L', 'R', 'W', 'S'], i: 0, bands: {}, o };
  chainRun();
}
function chainRun() {
  const o = CHAIN.o, s = CHAIN.steps[CHAIN.i];
  if (!s) return chainDone();
  ({ L: () => startListening(o), R: () => startReading(o), W: () => startWriting({ ...o, tasks: [1, 2] }), S: () => runSpeaking({ parts: [1, 2, 3], topic: o.topic, onDone: fb => skillDone('S', fb.overall) }) })[s]();
}
function skillDone(skill, band) {
  if (!CHAIN) return;
  CHAIN.bands[skill] = band; CHAIN.i++;
  const next = CHAIN.steps[CHAIN.i];
  if (!next) return chainDone();
  const label = { L: 'Listening', R: 'Reading', W: 'Writing', S: 'Speaking' }[next];
  fsRoot().innerHTML = `<div class="prep"><div class="trophy">☕</div><h3>Nghỉ giải lao 1 phút!</h3><p>Phần tiếp theo: <b>${label}</b></p><button class="btn green big" id="cn">TIẾP TỤC</button><button class="btn ghost" id="cq">Dừng ở đây</button></div>`;
  $('#cn').onclick = chainRun; $('#cq').onclick = () => { CHAIN = null; fsClose(); renderAll(); };
}
function chainDone() {
  const b = CHAIN.bands, vals = ['L', 'R', 'W', 'S'].map(k => b[k]).filter(x => x != null);
  const overall = roundBand(vals.reduce((a, c) => a + c, 0) / vals.length); CHAIN = null;
  if (typeof markNode === 'function') markNode('M:full', { stars: overall >= 6.5 ? 3 : overall >= 6 ? 2 : 1 });
  fsRoot().innerHTML = `<div class="done"><div class="trophy">🏅</div><h2>Hoàn thành bài thi thử!</h2><div class="bandbig">${overall}</div><div class="center muted">Band tổng ước lượng</div>
    <div class="bands">${[['L', 'Listening'], ['R', 'Reading'], ['W', 'Writing'], ['S', 'Speaking']].map(([k, n]) => `<div class="bandtile"><b>${b[k] ?? '–'}</b><span>${n}</span></div>`).join('')}</div>
    <p>${overall >= 6.5 ? '🎉 Bạn đã đạt mục tiêu 6.5 trong bài thi thử này!' : `Còn cách mục tiêu 6.5 khoảng ${(6.5 - overall).toFixed(1)} band – hãy xem kỹ kỹ năng thấp nhất và ôn thêm.`}</p>
    <button class="btn green big" id="cd">XONG</button></div>`;
  $('#cd').onclick = () => { fsClose(); renderAll(); };
}

/* ---------- Dựng câu hỏi ---------- */
const TFNG_OPTS = ['TRUE', 'FALSE', 'NOT GIVEN'];
function fixOpts(opts) { return (opts || []).map((o, i) => /^[A-D][\s.)]/.test(o) ? o : `${'ABCD'[i]} ${o}`); }

function groupsHTML(groups, start) {
  let n = start; const list = [];
  const html = groups.map(g => {
    const first = n, qs = g.qs.map(q => {
      const no = n++; list.push({ no, type: g.type, q });
      if (g.type === 'tfng') return `<div class="q"><p><b>${no}.</b> ${esc(q.q)}</p><div class="rad">${TFNG_OPTS.map(o => `<label><input type="radio" name="q${no}" value="${o}"><span>${o}</span></label>`).join('')}</div></div>`;
      if (g.type === 'mcq') return `<div class="q"><p><b>${no}.</b> ${esc(q.q)}</p>${fixOpts(q.options).map(o => `<label class="mcqo"><input type="radio" name="q${no}" value="${esc(o[0])}"><span>${esc(o)}</span></label>`).join('')}</div>`;
      if (g.type === 'match') return `<div class="q"><p><b>${no}.</b> ${esc(q.q)}</p><select name="q${no}"><option value="">– chọn –</option>${g.options.map(o => `<option value="${esc(o.trim().split(/\s+/)[0])}">${esc(o)}</option>`).join('')}</select></div>`;
      return `<div class="q"><p><b>${no}.</b> ${esc(q.q).replace('______', '<input class="fillin" name="q' + no + '" autocomplete="off" autocapitalize="none" spellcheck="false">')}${q.q.includes('______') ? '' : `<input class="fillin" name="q${no}" autocomplete="off" autocapitalize="none" spellcheck="false">`}</p></div>`;
    }).join('');
    return `<div class="qgroup"><h4>Questions ${first}–${n - 1}</h4><p class="instr">${esc(g.instruction).replace(/\n/g, '<br>')}</p>${g.type === 'match' ? `<div class="hlist">${g.options.map(o => `<div>${esc(o)}</div>`).join('')}</div>` : ''}${qs}</div>`;
  }).join('');
  return { html, list };
}
const readVal = no => { const r = document.querySelector(`#fs [name="q${no}"]:checked`); return r ? r.value : (document.querySelector(`#fs [name="q${no}"]`)?.value || ''); };
const normAns = s => String(s).toLowerCase().replace(/[£$%]/g, '').replace(/(\d),(\d)/g, '$1$2').replace(/[^a-z0-9.:' -]/g, '').replace(/\s+/g, ' ').trim();
function gradeQ(t, v) {
  v = String(v || '').trim(); if (!v) return false;
  if (t.type === 'tfng') return v.toUpperCase() === String(t.q.a).toUpperCase();
  if (t.type === 'mcq' || t.type === 'match') return v.toLowerCase() === String(t.q.a).toLowerCase();
  return [t.q.a, ...(t.q.alts || [])].some(a => normAns(a) === normAns(v));
}

/* ---------- Bộ chạy bài Reading / Listening ---------- */
function runTest({ skill, title, sections, minutes, topic, strict, source }) {
  const root = fsRoot();
  let n = 1; const all = [];
  const secHTML = sections.map((s, si) => {
    const g = groupsHTML(s.groups, n); n += g.list.length; all.push(...g.list);
    const body = skill === 'R'
      ? `<div class="passage"><h3>${esc(s.title)}</h3>${s.paragraphs.map(p => `<p><b>${esc(p.label)}</b> ${esc(p.text)}</p>`).join('')}</div>`
      : `<div class="player card"><b>${esc(s.title)}</b><p class="muted">${esc(s.context || '')}</p><button class="btn blue sm" data-play="${si}">▶ Phát bài nghe</button> <span class="pst muted" id="pst${si}">${strict ? 'Chỉ phát 1 lần – như thi thật' : 'Có thể nghe lại'}</span><div class="pbar sm"><i id="pp${si}"></i></div></div>`;
    return `<section class="tsec"><h2>${skill === 'R' ? `READING PASSAGE ${si + 1}` : `SECTION ${s.section || si + 1}`}</h2>${body}${g.html}</section>`;
  }).join('');
  const total = all.length; let left = minutes * 60, timer = null, player = null, submitted = false;
  root.innerHTML = `<div class="lhead"><button class="x" id="ex-x" aria-label="Thoát">✕</button><div class="pbar"><i id="ex-pb" style="width:0"></i></div><div class="timer" id="ex-t">${fmtTime(left)}</div></div>
    <div class="lbody"><p class="muted">${esc(title)} · ${total} câu · ${source}</p>${secHTML}<button class="btn green big" id="ex-submit">NỘP BÀI</button></div>`;
  const stop = () => { clearInterval(timer); player?.stop(); };
  $('#ex-x').onclick = () => { if (confirm('Thoát bài thi? Kết quả sẽ không được lưu.')) { stop(); CHAIN = null; fsClose(); } };
  timer = setInterval(() => {
    left--; const t = $('#ex-t'); if (t) t.textContent = fmtTime(Math.max(0, left)); $('#ex-pb').style.width = (100 - left / (minutes * 60) * 100) + '%';
    if (left <= 0) { toast('Hết giờ – bài được nộp tự động'); submit(); }
  }, 1000);
  const played = new Set();
  $$('[data-play]').forEach(b => b.onclick = () => {
    const si = +b.dataset.play; if (strict && played.has(si)) return toast('Chế độ thi thật: mỗi phần chỉ nghe 1 lần.');
    player?.stop(); played.add(si);
    $$('[data-play]').forEach(x => x.disabled = true);
    player = speakSeq(sections[si].script, {
      onLine: (i, t) => { $('#pp' + si).style.width = (i / t * 100) + '%'; $('#pst' + si).textContent = `Đang phát… (${i}/${t})`; },
      onEnd: () => { $('#pst' + si).textContent = strict ? 'Đã phát xong (không nghe lại được).' : 'Đã phát xong.'; $$('[data-play]').forEach((x, k) => x.disabled = strict && played.has(k)); }
    });
  });
  function submit() {
    if (submitted) return; submitted = true; stop();
    const res = all.map(t => { const v = readVal(t.no); return { ...t, v, ok: gradeQ(t, v) }; });
    showResults({ skill, title, sections, res, total, topic, source });
  }
  $('#ex-submit').onclick = () => { const blank = all.filter(t => !readVal(t.no)).length; if (!blank || confirm(`Còn ${blank} câu chưa trả lời. Vẫn nộp bài?`)) submit(); };
}

function showResults({ skill, title, sections, res, total, topic, source }) {
  const raw = res.filter(r => r.ok).length, band = rawToBand(skill, raw, total);
  saveExam({ skill, band, raw, total, topic, est: false });
  const root = fsRoot(), correctText = t => [t.q.a, ...(t.q.alts || []).slice(0, 1)].join(' / ');
  root.innerHTML = `<div class="lhead"><button class="x" id="ex-x">✕</button><div class="pbar"><i style="width:100%"></i></div><div></div></div>
  <div class="lbody"><h2>Kết quả ${skill === 'R' ? 'Reading' : 'Listening'}</h2>
    <div class="card center"><div class="bandbig">${band}</div><div class="muted">Band ước lượng · ${raw}/${total} câu đúng${total !== 40 ? ` (quy đổi sang thang 40: ≈ ${Math.round(raw / total * 40)}/40)` : ''}</div>
    <p class="muted">${source}. Bảng quy đổi Academic ${skill === 'R' ? 'Reading' : 'Listening'}; đề rút gọn nên chỉ mang tính tham khảo.</p></div>
    ${res.map(r => `<div class="rv ${r.ok ? 'ok' : 'bad'}"><b>${r.no}. ${r.ok ? '✅' : '❌'}</b> ${esc(r.q.q).slice(0, 140)}<div>Bạn chọn: <b>${esc(r.v || '(bỏ trống)')}</b>${r.ok ? '' : ` · Đáp án: <b>${esc(correctText(r))}</b>`}</div>${r.q.explain ? `<div class="muted">💡 ${esc(r.q.explain)}</div>` : ''}</div>`).join('')}
    ${skill === 'L' ? `<details class="card"><summary>Xem transcript (lời thoại)</summary>${sections.map(s => `<h4>${esc(s.title)}</h4>${s.script.map(l => `<p><b>${esc(l.speaker)}:</b> ${esc(l.text)}</p>`).join('')}`).join('')}</details>` : ''}
    <button class="btn green big" id="ex-ok">${CHAIN ? 'TIẾP TỤC' : 'XONG'}</button></div>`;
  const out = () => { if (CHAIN) { skillDone(skill, band); } else { fsClose(); renderAll(); } };
  $('#ex-x').onclick = $('#ex-ok').onclick = out;
}

/* ---------- Giọng đọc nhiều người cho Listening ---------- */
function speakSeq(lines, { onLine, onEnd } = {}) {
  Voice.stop();
  const speakers = [...new Set(lines.map(l => l.speaker))]; let i = 0, stopped = false;
  const next = async () => {
    if (stopped) return; if (i >= lines.length) return onEnd?.();
    const l = lines[i++]; onLine?.(i, lines.length);
    try { await Voice.line(l.text, { lang: 'en-GB', idx: speakers.indexOf(l.speaker) % 2 }); } catch { }
    if (!stopped) setTimeout(next, 400);
  };
  next(); return { stop() { stopped = true; Voice.stop(); } };
}

/* ---------- Tạo đề bằng AI (có kiểm tra cấu trúc) ---------- */
function checkSection(j, kind) {
  if (!j || !Array.isArray(j.groups) || !j.groups.length) throw new Error('AI trả về đề không đúng cấu trúc.');
  j.groups = j.groups.filter(g => ['tfng', 'mcq', 'fill', 'match'].includes(g.type) && Array.isArray(g.qs) && g.qs.length);
  j.groups.forEach(g => g.qs = g.qs.filter(q => q.q && q.a != null));
  if (!j.groups.length) throw new Error('AI trả về đề không có câu hỏi.');
  if (kind === 'R' && !Array.isArray(j.paragraphs)) throw new Error('Thiếu đoạn văn.');
  if (kind === 'L' && !Array.isArray(j.script)) throw new Error('Thiếu lời thoại.');
  return j;
}
function progressScreen(msg) { fsRoot().innerHTML = `<div class="prep"><div class="spinner"></div><h3>${esc(msg)}</h3><p class="muted" id="pgm">Vui lòng chờ…</p></div>`; }

async function startReading({ topic, all }) {
  const learned = learnedWords(); let sections, source;
  if (AI.has()) {
    progressScreen('AI đang soạn đề Reading…'); $('#pgm').textContent = `Chủ đề: ${topic} · ${all ? '3 bài, độ khó tăng dần' : '1 bài'} (khoảng 30–60 giây)`;
    try {
      const levels = all ? [1, 2, 3] : [2];
      sections = await Promise.all(levels.map(l => aiJSON({ system: SYS_EXAMINER, user: readingGenPrompt(topic, l, learned), max: 12000, effort: 'low' }).then(j => checkSection(j, 'R'))));
      source = `Đề do AI tạo · chủ đề ${topic}`;
    } catch (e) { toast('AI chưa tạo được đề: ' + e.message + ' – dùng đề có sẵn'); sections = null; }
  }
  if (!sections) {
    const pool = all ? READING_BANK : [READING_BANK.find(r => r.topic === topic) || pickOne(READING_BANK)];
    sections = pool; source = 'Đề có sẵn'; if (!BANK_TOPICS.includes(topic) || (!all && pool[0].topic !== topic)) source += ' (chưa có đề đúng chủ đề này – bật AI để tạo)';
  }
  runTest({ skill: 'R', title: 'IELTS Academic Reading', sections, minutes: sections.length * 20, topic, strict: false, source });
}

async function startListening({ topic, all, strict }) {
  const learned = learnedWords(); let sections, source;
  if (AI.has()) {
    progressScreen('AI đang soạn đề Listening…'); $('#pgm').textContent = `Chủ đề: ${topic} · ${all ? '4 phần' : '1 phần'} (khoảng 30–60 giây)`;
    try {
      const secs = all ? [1, 2, 3, 4] : [pickOne([1, 2, 3, 4])];
      sections = await Promise.all(secs.map(s => aiJSON({ system: SYS_EXAMINER, user: listeningGenPrompt(s, topic, learned), max: 12000, effort: 'low' }).then(j => ({ ...checkSection(j, 'L'), section: s }))));
      source = `Đề do AI tạo · chủ đề ${topic}`;
    } catch (e) { toast('AI chưa tạo được đề: ' + e.message + ' – dùng đề có sẵn'); sections = null; }
  }
  if (!sections) { sections = all ? LISTENING_BANK : [LISTENING_BANK.find(l => l.topic === topic) || pickOne(LISTENING_BANK)]; source = 'Đề có sẵn'; }
  if (!('speechSynthesis' in window)) toast('Trình duyệt không có giọng đọc – Listening cần giọng đọc của trình duyệt.');
  runTest({ skill: 'L', title: 'IELTS Listening (giọng đọc máy)', sections, minutes: sections.length * 6 + 2, topic, strict, source });
}

/* ---------- Writing ---------- */
async function startWriting({ topic, tasks }) {
  const learned = learnedWords(); const items = [];
  progressScreen('Đang chuẩn bị đề Writing…');
  for (const t of tasks) {
    let it = null;
    if (AI.has()) { try { const j = await aiJSON({ system: SYS_EXAMINER, user: writingGenPrompt(t, topic), max: 2000, effort: 'low' }); if (j.prompt) it = { task: t, prompt: j.prompt, chart: j.chart }; } catch (e) { toast('AI chưa tạo được đề Writing – dùng đề có sẵn'); } }
    if (!it) {
      if (t === 1) { const p = WRITING_T1.find(x => x.topic === topic) || pickOne(WRITING_T1); it = { task: 1, prompt: p.prompt, chart: p.chart }; }
      else it = { task: 2, prompt: pickOne(WRITING_T2[bankTopic(topic)]) };
    }
    items.push(it);
  }
  writeStep(items, 0, [], topic);
}

function writeStep(items, i, done, topic) {
  const it = items[i], root = fsRoot(), min = it.task === 1 ? 20 : 40, need = it.task === 1 ? 150 : 250;
  const hints = shuffle(learnedWords()).slice(0, 8);
  root.innerHTML = `<div class="lhead"><button class="x" id="wx">✕</button><div class="pbar"><i id="wpb" style="width:0"></i></div><div class="timer" id="wt">${fmtTime(min * 60)}</div></div>
  <div class="lbody"><h2>WRITING TASK ${it.task}</h2><p class="muted">Gợi ý thời gian: ${min} phút · tối thiểu ${need} từ</p>
    <div class="card wprompt">${esc(it.prompt).replace(/\n/g, '<br>')}${it.chart ? chartHTML(it.chart) : ''}</div>
    ${hints.length ? `<p class="muted">💡 Thử dùng từ bạn đã học: ${hints.map(h => `<span class="tag b">${esc(h)}</span>`).join(' ')}</p>` : ''}
    <textarea id="wtxt" class="essay" rows="14" placeholder="Viết bài của bạn ở đây…"></textarea>
    <div class="wc"><span id="wcn">0</span> từ <span class="muted">(tối thiểu ${need})</span></div>
    <button class="btn green big" id="wsub">NỘP BÀI</button></div>`;
  let left = min * 60;
  const timer = setInterval(() => { left--; $('#wt').textContent = fmtTime(Math.max(0, left)); $('#wpb').style.width = (100 - left / (min * 60) * 100) + '%'; if (left === 0) toast('Hết thời gian gợi ý – bạn vẫn có thể viết tiếp.'); }, 1000);
  $('#wtxt').oninput = e => { $('#wcn').textContent = tokens(e.target.value).length; };
  $('#wx').onclick = () => { if (confirm('Thoát phần Writing? Bài viết sẽ không được lưu.')) { clearInterval(timer); CHAIN = null; fsClose(); } };
  $('#wsub').onclick = async () => {
    const text = $('#wtxt').value.trim(); if (tokens(text).length < 30) return toast('Bài viết quá ngắn để chấm (tối thiểu ~30 từ).');
    clearInterval(timer);
    const rec = { it, text };
    done.push(rec);
    if (i + 1 < items.length) return writeStep(items, i + 1, done, topic);
    gradeWriting(done, topic);
  };
}

async function gradeWriting(done, topic) {
  const root = fsRoot(), learned = learnedWords();
  root.innerHTML = `<div class="prep"><div class="spinner"></div><h3>Giám khảo đang chấm bài viết…</h3><p class="muted">${AI.has() ? 'AI đang phân tích (khoảng 20–40 giây)' : 'Đang tính điểm ước lượng'}</p></div>`;
  const out = []; let err = '';
  for (const d of done) {
    let fb = null;
    if (AI.has()) { try { fb = await aiJSON({ system: SYS_EXAMINER, user: writingPrompt(d.it.task, d.it.prompt, d.text, learned, d.it.chart), max: 6000 }); } catch (e) { err = e.message; } }
    if (!fb) { fb = heuristicWriting(d.text, d.it.task, learned); if (err) fb.note = 'AI báo lỗi: ' + err + '. ' + fb.note; }
    out.push({ ...d, fb });
  }
  // Writing band: Task 2 tính gấp đôi Task 1
  const band = out.length === 2 ? roundBand((out[0].fb.overall + 2 * out[1].fb.overall) / 3) : out[0].fb.overall;
  saveExam({ skill: 'W', band, est: out.some(o => o.fb.estimated), topic });
  root.innerHTML = `<div class="lhead"><button class="x" id="wx">✕</button><div class="pbar"><i style="width:100%"></i></div><div></div></div>
  <div class="lbody"><h2>Kết quả Writing</h2>${out.length === 2 ? `<div class="card center"><div class="bandbig">${band}</div><div class="muted">Band Writing (Task 2 tính gấp đôi)</div></div>` : ''}
  ${out.map(o => `<h3>Task ${o.it.task}</h3>${feedbackHTML(o.fb, o.it.task === 1 ? 'w1' : 'w2')}
    <details class="card"><summary>Bài viết của bạn (${tokens(o.text).length} từ)</summary><p>${esc(o.text).replace(/\n/g, '<br>')}</p></details>
    <button class="btn blue sm" data-cp="${o.it.task}">📋 Sao chép nhờ Claude chấm</button>`).join('')}
  <button class="btn green big" id="wok">${CHAIN ? 'TIẾP TỤC' : 'XONG'}</button></div>`;
  $$('[data-cp]').forEach(b => b.onclick = () => { const o = out.find(x => x.it.task === +b.dataset.cp); copyForClaude(writingPrompt(o.it.task, o.it.prompt, o.text, learned, o.it.chart)); });
  const fin = () => { if (CHAIN) skillDone('W', band); else { fsClose(); renderAll(); } };
  $('#wok').onclick = $('#wx').onclick = fin;
}
