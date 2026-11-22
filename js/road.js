'use strict';
/* ===== Lộ trình dạng game: bản đồ 5 chặng, test đầu vào, kiểm tra định kỳ ===== */

const NODES = [];
STAGES.forEach(st => st.nodes.forEach((id, idx) => NODES.push({ id, stage: st.id, idx, type: id[0], arg: id.slice(2) })));
const nodeById = id => NODES.find(n => n.id === id);
const RS = () => Store.road;
const nst = id => RS().nodes[id] || {};
const TYPE_LABEL = { L: 'Bài kỹ năng', V: 'Gói từ vựng', T: 'Từ vựng chủ đề', G: 'Ngữ pháp', B: 'Thử thách cuối chặng', M: 'Thi thử đầy đủ' };

function nodeTitle(n) {
  return ({ L: () => LESSONS[n.arg].title, V: () => PACKS[n.arg].title, T: () => `Chủ đề ${n.arg}`, G: () => n.arg, B: () => `Thử thách chặng ${n.arg}`, M: () => 'Thi thử IELTS đầy đủ' })[n.type]();
}
const nodeIcon = n => ({ L: LESSONS[n.arg]?.icon, V: '🔤', T: '🗂️', G: '✏️', B: '👑', M: '📝' })[n.type] || '⭐';

/* Từ vựng của 1 node */
function packEntries(n) {
  if (n.type === 'V') return PACKS[n.arg].words.map(w => Vocab.entries.find(e => e.key === w.word.toLowerCase())).filter(Boolean);
  if (n.type === 'T') return Vocab.entries.filter(e => e.topic === n.arg);
  return [];
}
function vocabRatio(n) {
  const es = packEntries(n); if (!es.length) return 1;
  return es.filter(e => (Store.progress[e.key]?.box || 0) >= 1).length / es.length;
}
function nodeDone(n) {
  if (nst(n.id).done) return true;
  if (n.type === 'V' || n.type === 'T') return vocabRatio(n) >= .8;
  return false;
}
function nodeStars(n) {
  const s = nst(n.id);
  if (n.type === 'V' || n.type === 'T') {
    const es = packEntries(n); if (!es.length) return 3;
    const avg = es.reduce((a, e) => a + (Store.progress[e.key]?.box || 0), 0) / es.length;
    return Math.max(s.stars || 0, avg >= 3 ? 3 : avg >= 2 ? 2 : nodeDone(n) ? 1 : 0);
  }
  return s.stars || (nodeDone(n) ? 1 : 0);
}
const passable = n => n.type === 'M' || nodeDone(n);
function stageCleared(sid) { return STAGES[sid - 1].nodes.every(id => passable(nodeById(id))); }
function stageUnlocked(sid) { return sid === 1 || stageCleared(sid - 1) || !!RS().unlocked?.[sid]; }
function nodeUnlocked(n) {
  if (!stageUnlocked(n.stage)) return false;
  if (n.idx === 0) return true;
  return passable(nodeById(STAGES[n.stage - 1].nodes[n.idx - 1]));
}
const currentNode = () => NODES.find(n => nodeUnlocked(n) && !nodeDone(n) && n.type !== 'M') || null;
const doneCount = () => NODES.filter(n => n.type !== 'M' && nodeDone(n)).length;
const weakNodes = () => NODES.filter(n => nst(n.id).weak);

/* Thứ tự ưu tiên từ mới theo lộ trình (dùng cho "Học bài hôm nay") */
let RANK = null;
function roadRank(e) {
  if (!RANK) { RANK = {}; NODES.forEach((n, i) => packEntries(n).forEach(x => { if (RANK[x.key] == null) RANK[x.key] = i; })); }
  return RANK[e.key] ?? 999;
}
const resetRank = () => { RANK = null; };

function markNode(id, { stars = 2, skipped = false } = {}) {
  const prev = nst(id), first = !prev.done;
  RS().nodes[id] = { ...prev, done: true, stars: Math.max(prev.stars || 0, stars), skipped: prev.done ? prev.skipped && skipped : skipped, weak: false, at: prev.at || Date.now(), checkAt: Date.now() };
  if (first && !skipped) Store.profile.coins += 5;
  Store.save();
}
/* Đánh dấu từ "đã biết" (từ test) để không phải học lại từ đầu */
function markKnown(key) {
  const p = Store.progress[key];
  if (!p) Store.progress[key] = { box: 3, due: Date.now() + 4 * DAY, seen: 1, ok: 1, bad: 0, ts: Date.now() };
  else applyResult(key, false);
}

/* ---------- Câu hỏi cho từng node ---------- */
function skillEx(n, [q, opts, ci, why]) {
  return {
    kind: 'choice', type: 'skill', w: null, rk: 's:' + n.id, node: n.id, title: `${LESSONS[n.arg].icon} ${LESSONS[n.arg].title}`,
    promptHTML: `<div class="qdef">${esc(q)}</div>`, reveal: opts[ci], explain: why || '',
    options: shuffle(opts.map((t, i) => ({ text: t, correct: i === ci }))),
    again() { return { ...this, options: shuffle(this.options), retry: true }; }
  };
}
function vocabQ(n, e, pool) {
  const others = shuffle(pool.filter(x => x.key !== e.key && x.vi && x.vi !== e.vi));
  if (others.length < 3) return null;
  const toVi = Math.random() < .5;
  const correct = toVi ? e.vi : e.word, wrong = others.slice(0, 3).map(x => toVi ? x.vi : x.word);
  return {
    kind: 'choice', type: 'vocabq', w: e, node: n.id, title: toVi ? 'Chọn nghĩa đúng' : 'Từ tiếng Anh nào có nghĩa này?',
    promptHTML: toVi ? `<div class="qword">${esc(e.word)} <button class="bigspeak" data-act="say">🔊</button></div>` : `<div class="qdef">${esc(e.vi)}</div>`,
    reveal: correct, options: shuffle([{ text: correct, correct: true }, ...wrong.map(t => ({ text: t, correct: false }))]), auto: toVi
  };
}
function nodeQuestions(n, k = 1, preferLearned = false) {
  if (n.type === 'L') return shuffle(LESSONS[n.arg].quiz).slice(0, k).map(q => skillEx(n, q));
  if (n.type === 'G') return shuffle(G_ITEMS.filter(i => i.topic === n.arg)).slice(0, k).map(it => ({ ...grammarChoice(it), node: n.id }));
  if (n.type === 'V' || n.type === 'T') {
    let es = packEntries(n).filter(e => e.vi || cachedVi(e.key));
    es = es.map(e => e.vi ? e : { ...e, vi: cachedVi(e.key) });
    if (preferLearned) { const l = es.filter(e => Store.progress[e.key]); if (l.length >= k) es = l; }
    const pool = [...es, ...Vocab.entries.filter(e => e.vi)];
    return shuffle(es).slice(0, k).map(e => vocabQ(n, e, pool)).filter(Boolean);
  }
  return [];
}
const testable = n => ['L', 'G', 'V', 'T'].includes(n.type) && packOk(n);
const packOk = n => !(n.type === 'V' || n.type === 'T') || packEntries(n).some(e => e.vi || cachedVi(e.key));

/* Chấm theo từng node từ nhật ký bài test */
function evalLog(log) {
  const by = {};
  for (const r of log) {
    if (!r.node) continue;
    const b = by[r.node] ||= { ok: 0, n: 0 }; b.n++; if (r.ok) b.ok++;
    const n = nodeById(r.node);
    if (r.key && n && (n.type === 'V' || n.type === 'T')) r.ok ? markKnown(r.key) : applyResult(r.key, true);
  }
  return by;
}

/* ================= BẢN ĐỒ ================= */
function estBand() {
  let b = 'dưới 4.5';
  for (const s of STAGES) if (stageCleared(s.id)) b = s.band; else break;
  return b;
}
const ZIG = [0, 46, 78, 46, 0, -46, -78, -46];

function viewRoad() {
  const total = NODES.filter(n => n.type !== 'M').length, dc = doneCount(), cur = currentNode(), r = RS();
  const now = Date.now(), weak = weakNodes();
  const weekDue = dc >= 5 && now - (r.lastWeekly || 0) >= 7 * DAY, monthDue = dc >= 10 && now - (r.lastMonthly || 0) >= 30 * DAY;
  const lastCheck = r.checks?.[r.checks.length - 1];
  $('#view').innerHTML = `
  <section class="card roadhead">
    <div><h2>🗺️ Lộ trình IELTS 6.5</h2><p class="muted">5 chặng từ dễ đến khó · mỗi chặng mở khóa khi hoàn thành chặng trước.</p></div>
    <div class="pbar"><i style="width:${Math.round(dc / total * 100)}%"></i></div>
    <p><b>${dc}/${total}</b> bài hoàn thành · Trình độ ước tính: <b>${estBand()}</b>${cur ? ` · Tiếp theo: <b>${esc(nodeTitle(cur))}</b>` : ' · 🎉 Đã hoàn thành lộ trình!'}</p>
    ${cur ? `<button class="btn green big" id="rd-next">▶ HỌC TIẾP: ${esc(nodeTitle(cur)).toUpperCase()}</button>` : ''}
  </section>
  ${!r.placement ? `<section class="card callout"><h3>🎯 Làm bài test đầu vào</h3><p>Khoảng 5–15 phút. App kiểm tra từ chặng 1 trở lên, <b>tự bỏ qua những phần bạn đã biết</b> để bạn không phải học lại – tiết kiệm tối đa thời gian. Không chắc thì bấm “Tôi không biết” để kết quả chính xác.</p><button class="btn blue" id="rd-place">BẮT ĐẦU TEST ĐẦU VÀO</button></section>` : ''}
  ${weekDue || monthDue ? `<section class="card callout warnc"><h3>📅 Đến hạn kiểm tra ${monthDue ? 'tháng' : 'tuần'}</h3><p>Kiểm tra lại những gì đã học để tìm chỗ bị quên – phần quên sẽ được đánh dấu để ôn lại.</p><button class="btn yellow" id="rd-due">LÀM BÀI KIỂM TRA ${monthDue ? 'THÁNG (30 câu)' : 'TUẦN (15 câu)'}</button></section>` : ''}
  ${weak.length ? `<section class="card callout badc"><h3>⚠️ ${weak.length} phần kiến thức cần ôn lại</h3><div class="weaklist">${weak.map(n => `<button class="chip" data-node="${esc(n.id)}">${nodeIcon(n)} ${esc(nodeTitle(n))}</button>`).join('')}</div></section>` : ''}
  ${STAGES.map(st => stageHTML(st)).join('')}
  <section class="card"><h3>🔁 Kiểm tra định kỳ</h3>
    <p class="muted">Kiểm tra tuần (15 câu) và tháng (30 câu) lấy ngẫu nhiên từ những phần bạn đã học, ưu tiên phần lâu chưa ôn.${lastCheck ? ` Lần gần nhất (${esc(lastCheck.date)}): nhớ ${lastCheck.remembered}/${lastCheck.remembered + lastCheck.forgot.length} phần.` : ''}</p>
    <div class="row2"><button class="btn purple" id="rd-week" ${dc < 3 ? 'disabled' : ''}>Kiểm tra tuần</button><button class="btn purple" id="rd-month" ${dc < 3 ? 'disabled' : ''}>Kiểm tra tháng</button></div>
    ${r.placement ? '<button class="btn ghost sm" id="rd-replace">Làm lại test đầu vào</button>' : ''}</section>
  <section class="card"><h3>📚 Sách & tài liệu nên dùng</h3>
    <p class="muted">Cẩm nang đầy đủ (định dạng đề, sách theo từng chặng, lịch học, toàn bộ bài lý thuyết): <a href="docs/cam-nang-ielts-6.5.pdf" target="_blank" rel="noopener"><b>📄 Mở file PDF</b></a></p>
    ${RESOURCES.map(x => `<div class="res"><b>${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a>` : esc(x.name)}</b> <span class="tag ${x.paid ? 'r' : 'g'}">${x.paid ? 'sách' : 'miễn phí'}</span><div class="muted">${esc(x.by)} · ${esc(x.stage)} – ${esc(x.use)}</div></div>`).join('')}
  </section>`;
  $('#rd-next')?.addEventListener('click', () => openNode(cur));
  $('#rd-place')?.addEventListener('click', startPlacement);
  $('#rd-replace')?.addEventListener('click', () => { if (confirm('Làm lại test đầu vào? Các phần đã học vẫn được giữ.')) startPlacement(); });
  $('#rd-due')?.addEventListener('click', () => startCheck(monthDue ? 'month' : 'week'));
  $('#rd-week').onclick = () => startCheck('week');
  $('#rd-month').onclick = () => startCheck('month');
  $$('[data-node]').forEach(b => b.onclick = () => openNode(nodeById(b.dataset.node)));
  $$('[data-jump]').forEach(b => b.onclick = () => startJump(+b.dataset.jump));
}

function stageHTML(st) {
  const ul = stageUnlocked(st.id), nodes = st.nodes.map(nodeById), d = nodes.filter(n => n.type !== 'M' && nodeDone(n)).length, tot = nodes.filter(n => n.type !== 'M').length;
  const cur = currentNode();
  return `<section class="stage ${ul ? '' : 'locked'}" style="--c:${st.color}">
    <div class="stagehead"><div class="se">${st.emoji}</div><div class="grow"><b>Chặng ${st.id} · ${esc(st.name)}</b><div class="muted">Mục tiêu band ${st.band} · ${d}/${tot} bài</div></div>
      ${stageCleared(st.id) ? '<span class="tag g">✓ Xong</span>' : `<button class="chip sm" data-jump="${st.id}">⚡ Vượt chặng</button>`}</div>
    <p class="muted stdesc">${esc(st.desc)}</p>
    <div class="path">${nodes.map((n, i) => {
      const done = nodeDone(n), open = nodeUnlocked(n), s = nst(n.id), isCur = cur && cur.id === n.id;
      const cls = ['node', n.type === 'B' ? 'boss' : '', done ? 'done' : '', open ? '' : 'lock', s.weak ? 'weak' : '', isCur ? 'cur' : '', s.skipped ? 'skip' : ''].join(' ');
      const stars = done ? '★'.repeat(nodeStars(n)) + '☆'.repeat(Math.max(0, 3 - nodeStars(n))) : '';
      return `<div class="nwrap" style="transform:translateX(${ZIG[i % ZIG.length]}px)">${isCur ? '<div class="startbub">BẮT ĐẦU</div>' : ''}
        <button class="${cls}" data-node="${esc(n.id)}" title="${esc(nodeTitle(n))}">${open || done ? nodeIcon(n) : '🔒'}${s.weak ? '<i class="wk">!</i>' : ''}</button>
        <div class="nlabel">${esc(nodeTitle(n))}${stars ? `<div class="stars">${stars}</div>` : ''}</div></div>`;
    }).join('')}</div></section>`;
}

/* ---------- Mở 1 node ---------- */
function openNode(n) {
  if (!n) return;
  const open = nodeUnlocked(n) || nodeDone(n), s = nst(n.id), done = nodeDone(n);
  let info = '';
  if (n.type === 'V' || n.type === 'T') {
    const es = packEntries(n);
    info = es.length ? `<p>${es.length} từ · đã thuộc ${Math.round(vocabRatio(n) * 100)}% (cần 80%).</p><p class="muted">${es.slice(0, 15).map(e => esc(e.word)).join(', ')}</p>` : '<p class="muted">Chủ đề này chưa có từ trong file của bạn – tự động tính là xong.</p>';
  } else if (n.type === 'L') info = `<p class="muted">Đọc lý thuyết ngắn rồi làm quiz 4 câu (đúng ≥ 3 câu để qua).</p>`;
  else if (n.type === 'G') info = `<p class="muted">10 câu ngữ pháp chủ đề “${esc(n.arg)}” (đúng ≥ 80% để qua).</p>`;
  else if (n.type === 'B') info = `<p class="muted">Bài kiểm tra tổng hợp cả chặng (đúng ≥ 70% để mở chặng tiếp theo). Thưởng 50 🪙.</p>`;
  else if (n.type === 'M') info = `<p class="muted">Thi thử đủ 4 kỹ năng Listening → Reading → Writing → Speaking (tab Thi thử). Không bắt buộc để mở khóa, nhưng rất nên làm.</p>`;
  const d = document.createElement('div'); d.className = 'popup';
  d.innerHTML = `<div class="pbox"><div class="bigemoji">${nodeIcon(n)}</div><div class="muted">${TYPE_LABEL[n.type]} · Chặng ${n.stage}</div><h2>${esc(nodeTitle(n))}</h2>
    ${done ? `<div class="stars big">${'★'.repeat(nodeStars(n))}${'☆'.repeat(3 - nodeStars(n))}</div>` : ''}${s.weak ? '<p class="bad"><b>⚠️ Bài kiểm tra định kỳ cho thấy bạn đã quên phần này – hãy ôn lại!</b></p>' : ''}${s.skipped ? '<p class="muted">⚡ Đã bỏ qua nhờ bài test (bạn đã biết phần này).</p>' : ''}
    ${info}
    ${open ? `<button class="btn green" id="nd-go">${done ? (s.weak ? 'ÔN LẠI' : 'HỌC LẠI') : 'BẮT ĐẦU'}</button>` : '<p class="muted">🔒 Hoàn thành bài trước để mở khóa, hoặc dùng “⚡ Vượt chặng”.</p>'}
    <button class="btn ghost" id="nd-x">ĐÓNG</button></div>`;
  document.body.appendChild(d);
  $('#nd-x', d).onclick = () => d.remove();
  $('#nd-go', d)?.addEventListener('click', () => { d.remove(); runNode(n); });
}

function afterNode(n, ok, ratio) {
  const wasDone = nst(n.id).done;
  if (ok) markNode(n.id, { stars: ratio >= .99 ? 3 : ratio >= .85 ? 2 : 1 });
  else if (nst(n.id).weak) Store.save();
  resetRank();
  if (ok && !wasDone) toast(`✅ Hoàn thành: ${nodeTitle(n)} (+5 🪙)`);
  else if (!ok) toast(`Chưa đạt (${Math.round(ratio * 100)}%). Thử lại nhé!`);
}

function runNode(n) {
  if (n.type === 'L') return showLessonNode(n);
  if (n.type === 'G') return startGrammar(n.arg, sum => { const r = sum.tries ? sum.ok / sum.tries : 0; afterNode(n, r >= .8 && !sum.failed, r); });
  if (n.type === 'V' || n.type === 'T') return startPack(n);
  if (n.type === 'B') return startBoss(n);
  if (n.type === 'M') { go('exam'); toast('Bấm “THI THỬ ĐẦY ĐỦ” để làm bài thi 4 kỹ năng.'); }
}

/* Bài lý thuyết + quiz */
function showLessonNode(n) {
  const ls = LESSONS[n.arg], root = fsRoot();
  root.innerHTML = `<div class="lhead"><button class="x" id="ln-x">✕</button><div class="pbar"><i style="width:30%"></i></div><div class="hearts">${ls.icon}</div></div>
  <div class="lbody theory"><h2>${esc(ls.title)}</h2>${ls.body}<div class="card muted">💡 Đọc xong, làm quiz 4 câu để mở khóa bài tiếp theo.</div></div>
  <footer class="lfoot"><div class="fbtns"><button class="btn green" id="ln-quiz">LÀM QUIZ</button></div></footer>`;
  $('#ln-x').onclick = fsClose;
  $('#ln-quiz').onclick = () => {
    fsClose();
    runLesson({ queue: shuffle(ls.quiz).map(q => skillEx(n, q)), words: [], ctx: null, kind: 'skill', mode: n.id, redo: () => showLessonNode(n),
      onDone: sum => { const r = sum.tries ? sum.ok / sum.tries : 0; afterNode(n, r >= .75 && !sum.failed, r); } });
  };
}

/* Học 1 gói từ vựng */
async function startPack(n) {
  const es = packEntries(n); if (!es.length) { markNode(n.id); return renderAll(); }
  const now = Date.now(), P = Store.progress;
  const fresh = es.filter(e => !P[e.key]), due = es.filter(e => P[e.key] && (P[e.key].due <= now || (P[e.key].box || 0) < 1));
  let nw = fresh.slice(0, 6), rev = due.slice(0, 8 - nw.length);
  if (!nw.length && !rev.length) rev = shuffle(es).slice(0, 6);
  const root = $('#lesson'); root.hidden = false; document.body.classList.add('noscroll');
  root.innerHTML = `<div class="prep"><div class="spinner"></div><h3>Đang chuẩn bị “${esc(nodeTitle(n))}”…</h3><p id="prepmsg" class="muted">Tìm ảnh, phát âm, câu mẫu…</p></div>`;
  const full = await enrichMany([...nw, ...rev], (d, t) => { const m = $('#prepmsg'); if (m) m.textContent = `Đã chuẩn bị ${d}/${t} từ…`; });
  const byKey = Object.fromEntries(full.map(w => [w.key, w]));
  const ctx = { vocab: Vocab.entries, viPool: Vocab.entries.map(e => ({ key: e.key, vi: byKey[e.key]?.vi || e.vi || cachedVi(e.key) })) };
  const items = [...nw.map(e => ({ w: byKey[e.key], box: 0, isNew: true })), ...rev.map(e => ({ w: byKey[e.key], box: P[e.key]?.box || 0, isNew: false }))];
  root.hidden = true;
  runLesson({ queue: buildQueue(items, ctx), words: items.map(x => x.w), ctx, kind: 'vocab', mode: n.id, redo: () => startPack(n),
    onDone: sum => {
      const r = vocabRatio(n), acc = sum.tries ? sum.ok / sum.tries : 0;
      if (nst(n.id).weak && acc >= .8) { RS().nodes[n.id].weak = false; Store.save(); }
      if (r >= .8) afterNode(n, true, acc); else toast(`Đã thuộc ${Math.round(r * 100)}% gói này – học tiếp để đạt 80%.`);
    } });
}

/* Boss cuối chặng */
function bossQueue(sid, perNode = 1, cap = 14) {
  const nodes = STAGES[sid - 1].nodes.map(nodeById).filter(testable);
  return shuffle(nodes.flatMap(n => nodeQuestions(n, perNode))).slice(0, cap);
}
function startBoss(n) {
  const sid = +n.arg, q = bossQueue(sid);
  runLesson({ queue: q, words: [], ctx: null, kind: 'test', test: true, mode: n.id, onDone: sum => {
    evalLog(sum.log); const r = sum.tries ? sum.ok / sum.tries : 0, ok = r >= .7;
    if (ok) { markNode(n.id, { stars: r >= .95 ? 3 : r >= .85 ? 2 : 1 }); Store.profile.coins += 50; Store.save(); }
    testReport({ title: ok ? `👑 Hoàn thành chặng ${sid}!` : `Chưa qua thử thách chặng ${sid}`, sum, extra: ok ? `<p>🎁 Thưởng 50 🪙. ${sid < 5 ? `Chặng ${sid + 1} “${esc(STAGES[sid].name)}” đã mở khóa!` : 'Bạn đã hoàn thành toàn bộ lộ trình!'}</p>` : '<p>Cần đúng ≥ 70%. Xem lại các phần sai bên dưới rồi thử lại nhé.</p>' });
  } });
}

/* Vượt chặng: làm bài khó hơn, đạt ≥ 85% thì bỏ qua cả chặng (và các chặng trước) */
function startJump(sid) {
  if (!confirm(`⚡ Vượt chặng ${sid}: làm bài kiểm tra ${Math.min(20, STAGES[sid - 1].nodes.length * 2)} câu. Đúng ≥ 85% thì bỏ qua toàn bộ chặng ${sid}${sid > 1 ? ' và các chặng trước' : ''}. Bắt đầu?`)) return;
  const q = bossQueue(sid, 2, 20);
  runLesson({ queue: q, words: [], ctx: null, kind: 'test', test: true, mode: 'jump' + sid, onDone: sum => {
    const by = evalLog(sum.log), r = sum.tries ? sum.ok / sum.tries : 0, ok = r >= .85;
    if (ok) { for (let s = 1; s <= sid; s++) STAGES[s - 1].nodes.forEach(id => { if (!nodeDone(nodeById(id)) && id[0] !== 'M') markNode(id, { stars: 2, skipped: true }); }); }
    else Object.entries(by).forEach(([id, b]) => { if (b.ok === b.n) markNode(id, { stars: 2, skipped: true }); });
    resetRank();
    testReport({ title: ok ? `⚡ Vượt chặng ${sid} thành công!` : `Chưa vượt được chặng ${sid}`, sum, extra: ok ? `<p>Bạn đã bỏ qua chặng ${sid} – tiết kiệm thời gian để học phần mới.</p>` : `<p>Đạt ${Math.round(r * 100)}% (cần 85%). Những bài bạn trả lời đúng hết đã được đánh dấu là đã biết.</p>` });
  } });
}

/* ================= TEST ĐẦU VÀO (thích ứng) ================= */
function placementQueue(sid) {
  const nodes = STAGES[sid - 1].nodes.map(nodeById).filter(testable);
  return shuffle(nodes.flatMap(n => nodeQuestions(n, n.type === 'V' || n.type === 'T' ? 2 : 1)));
}
async function startPlacement() {
  const d = document.createElement('div'); d.className = 'popup';
  d.innerHTML = `<div class="pbox"><div class="bigemoji">🎯</div><h2>Test đầu vào</h2>
    <p>Bài test đi lần lượt từ chặng 1 → 5, mỗi chặng ~10–16 câu (từ vựng, ngữ pháp, kỹ năng làm bài).</p>
    <ul style="text-align:left"><li>Phần nào bạn trả lời đúng hết sẽ được <b>đánh dấu đã biết</b> và bỏ qua.</li><li>Chặng nào đạt ≥ 85% sẽ được <b>bỏ qua cả chặng</b>.</li><li>Nếu một chặng dưới 60%, test dừng lại – đó là điểm xuất phát của bạn.</li><li>Không chắc thì bấm <b>“TÔI KHÔNG BIẾT”</b> – đừng đoán, để kết quả chính xác.</li></ul>
    <button class="btn green" id="pl-go">BẮT ĐẦU</button><button class="btn ghost" id="pl-x">ĐỂ SAU</button></div>`;
  document.body.appendChild(d);
  $('#pl-x', d).onclick = () => d.remove();
  $('#pl-go', d).onclick = () => { d.remove(); placementStage(1, []); };
}
function placementStage(sid, results) {
  const q = placementQueue(sid);
  if (!q.length) return placementDone(results);
  runLesson({ queue: q, words: [], ctx: null, kind: 'test', test: true, mode: 'place' + sid, onDone: sum => {
    const by = evalLog(sum.log), r = sum.tries ? sum.ok / sum.tries : 0;
    let skipped = 0;
    if (r >= .85) STAGES[sid - 1].nodes.forEach(id => { if (id[0] !== 'M' && !nodeDone(nodeById(id))) { markNode(id, { stars: 2, skipped: true }); skipped++; } });
    else Object.entries(by).forEach(([id, b]) => { if (b.ok === b.n && !nodeDone(nodeById(id))) { markNode(id, { stars: 2, skipped: true }); skipped++; } });
    results.push({ sid, ok: sum.ok, n: sum.tries, r, skipped });
    const more = r >= .6 && sid < 5;
    $('#lesson').innerHTML = `<div class="done"><div class="trophy">${r >= .85 ? '🚀' : r >= .6 ? '👍' : '🧭'}</div>
      <h2>Chặng ${sid} · ${esc(STAGES[sid - 1].name)}: ${sum.ok}/${sum.tries} đúng (${Math.round(r * 100)}%)</h2>
      <p>${r >= .85 ? 'Xuất sắc! Bỏ qua toàn bộ chặng này.' : `Đã bỏ qua ${skipped} phần bạn đã biết.`}</p>
      ${more ? `<p>Tiếp tục kiểm tra chặng ${sid + 1} “${esc(STAGES[sid].name)}”?</p><button class="btn green big" id="pl-next">TIẾP TỤC CHẶNG ${sid + 1}</button><button class="btn ghost" id="pl-stop">DỪNG & XEM KẾT QUẢ</button>`
        : '<button class="btn green big" id="pl-stop">XEM KẾT QUẢ</button>'}</div>`;
    $('#pl-next')?.addEventListener('click', () => placementStage(sid + 1, results));
    $('#pl-stop').onclick = () => placementDone(results);
  } });
}
function placementDone(results) {
  resetRank();
  const skipped = results.reduce((a, x) => a + x.skipped, 0);
  RS().placement = { date: todayStr(), results: results.map(x => ({ sid: x.sid, ok: x.ok, n: x.n })), skipped };
  RS().lastWeekly = Date.now(); RS().lastMonthly = Date.now(); Store.save();
  const cur = currentNode();
  $('#lesson').hidden = false;
  $('#lesson').innerHTML = `<div class="done"><div class="trophy">🎯</div><h2>Kết quả test đầu vào</h2>
    ${results.map(x => `<div class="hrow"><span>Chặng ${x.sid} · ${esc(STAGES[x.sid - 1].name)}</span><b>${x.ok}/${x.n} (${Math.round(x.r * 100)}%)</b></div>`).join('')}
    <div class="card"><p>⚡ Bỏ qua <b>${skipped}</b> phần bạn đã biết.</p><p>📈 Trình độ ước tính: <b>${estBand()}</b></p><p>▶ Bắt đầu học từ: <b>${cur ? esc(nodeTitle(cur)) : '—'}</b></p></div>
    <p class="muted">Các từ bạn trả lời đúng đã được đánh dấu “đã biết” và sẽ chỉ được ôn nhẹ. Kiểm tra tuần/tháng sẽ phát hiện nếu bạn quên.</p>
    <button class="btn green big" id="pl-ok">ĐẾN LỘ TRÌNH</button></div>`;
  $('#pl-ok').onclick = () => { closeLesson(); go('road'); };
}

/* ================= KIỂM TRA ĐỊNH KỲ (tuần / tháng) ================= */
function startCheck(kind) {
  const N = kind === 'month' ? 30 : 15;
  const done = NODES.filter(n => testable(n) && nodeDone(n));
  if (done.length < 3) return toast('Cần hoàn thành ít nhất 3 bài trên lộ trình trước.');
  const order = done.map(n => ({ n, t: (nst(n.id).checkAt || nst(n.id).at || 0) + Math.random() * DAY })).sort((a, b) => a.t - b.t).map(x => x.n);
  let q = [];
  for (let round = 0; q.length < N && round < 3; round++) for (const n of order) { if (q.length >= N) break; q.push(...nodeQuestions(n, 1, true)); }
  q = shuffle(q.slice(0, N));
  runLesson({ queue: q, words: [], ctx: null, kind: 'test', test: true, mode: 'check-' + kind, onDone: sum => {
    const by = evalLog(sum.log), forgot = [], kept = [];
    for (const [id, b] of Object.entries(by)) {
      const s = RS().nodes[id] ||= { done: true, stars: 1 };
      if (b.ok === b.n) { s.weak = false; s.checkAt = Date.now(); kept.push(id); }
      else { s.weak = true; s.stars = Math.max(1, (s.stars || 1) - 1); forgot.push(id); }
    }
    RS().checks = [...(RS().checks || []), { date: todayStr(), kind, ok: sum.ok, n: sum.tries, remembered: kept.length, forgot }].slice(-30);
    if (kind === 'month') RS().lastMonthly = Date.now();
    RS().lastWeekly = Date.now(); Store.save();
    testReport({ title: `Kết quả kiểm tra ${kind === 'month' ? 'tháng' : 'tuần'}`, sum,
      extra: `<div class="card"><p>✅ Còn nhớ tốt: <b>${kept.length}</b> phần</p>${kept.length ? `<p class="muted">${kept.map(id => esc(nodeTitle(nodeById(id)))).join(' · ')}</p>` : ''}
        <p>⚠️ Đã quên: <b>${forgot.length}</b> phần</p>${forgot.map(id => { const n = nodeById(id); return `<button class="chip" data-review="${esc(id)}">${nodeIcon(n)} ${esc(nodeTitle(n))} – ôn ngay</button>`; }).join(' ')}</div>
        <p class="muted">Phần đã quên được đánh dấu ⚠️ trên bản đồ; từ vựng trả lời sai sẽ được đưa vào lượt ôn sớm nhất. Hẹn bạn ${kind === 'month' ? 'tháng sau' : 'tuần sau'}!</p>` });
    $$('[data-review]').forEach(b => b.onclick = () => { closeLesson(); runNode(nodeById(b.dataset.review)); });
  } });
}

/* Màn hình kết quả dùng chung cho test */
function testReport({ title, sum, extra = '' }) {
  const r = sum.tries ? Math.round(sum.ok / sum.tries * 100) : 0;
  $('#lesson').innerHTML = `<div class="done"><div class="trophy">${r >= 70 ? '🏅' : '📘'}</div><h2>${title}</h2>
    <div class="sum"><div class="card"><b>${sum.ok}/${sum.tries}</b><span>Câu đúng</span></div><div class="card"><b>${r}%</b><span>Chính xác</span></div><div class="card"><b>+${sum.xp}</b><span>XP</span></div></div>
    ${extra}<button class="btn green big" id="tr-ok">VỀ LỘ TRÌNH</button></div>`;
  $('#tr-ok').onclick = () => { closeLesson(); go('road'); };
}
