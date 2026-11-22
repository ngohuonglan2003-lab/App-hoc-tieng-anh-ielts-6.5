'use strict';
/* ===== Luyện nói IELTS: giám khảo hỏi – bạn trả lời bằng giọng nói – chấm 4 tiêu chí ===== */

/* ---- Tiện ích dùng chung với phần Thi thử ---- */
function fsRoot() {
  let d = $('#fs');
  if (!d) { d = document.createElement('div'); d.id = 'fs'; d.className = 'lesson'; d.style.zIndex = 35; document.body.appendChild(d); }
  d.hidden = false; document.body.classList.add('noscroll'); return d;
}
function fsClose() { const d = $('#fs'); if (d) { d.hidden = true; d.innerHTML = ''; } document.body.classList.remove('noscroll'); }

const pickOne = a => a[Math.floor(Math.random() * a.length)];
function learnedTopics() {
  const set = new Set(Vocab.entries.filter(e => Store.progress[e.key]).map(e => e.topic));
  return BANK_TOPICS.filter(t => set.has(t));
}
function topicPickerHTML(id) {
  return `<label class="field">Chủ đề <select id="${id}-mode">
      <option value="learned">📘 Chủ đề tôi đã học</option><option value="new">🆕 Chủ đề hoàn toàn mới (ngẫu nhiên)</option><option value="any">🎲 Ngẫu nhiên</option>
      ${BANK_TOPICS.map(t => `<option value="t:${t}">${t}</option>`).join('')}</select></label>
    ${AI.has() ? `<input id="${id}-free" placeholder="Hoặc nhập chủ đề bất kỳ (AI sẽ tạo đề), ví dụ: space exploration">` : '<p class="muted">Muốn tự nhập chủ đề bất kỳ & đề luôn mới? Bật AI ở tab Cài đặt.</p>'}`;
}
function resolveTopic(id) {
  const free = $(`#${id}-free`)?.value.trim(); if (free) return free;
  const mode = $(`#${id}-mode`).value, learned = learnedTopics();
  if (mode === 'learned') return pickOne(learned.length ? learned : BANK_TOPICS);
  if (mode === 'new') { const rest = BANK_TOPICS.filter(t => !learned.includes(t)); return pickOne(rest.length ? rest : BANK_TOPICS); }
  if (mode === 'any') return pickOne(BANK_TOPICS);
  return mode.slice(2);
}
const bankTopic = t => BANK_TOPICS.includes(t) ? t : pickOne(BANK_TOPICS);
const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function saveExam(rec) {
  Store.exams.push({ id: Date.now(), date: todayStr(), ...rec }); Store.exams = Store.exams.slice(-100); Store.save();
}

/* ---- Màn hình tab "Nói" ---- */
function viewSpeaking() {
  const hist = Store.exams.filter(e => e.skill === 'S').slice(-5).reverse();
  $('#view').innerHTML = `
  <section class="card"><h2>🎤 Luyện nói IELTS</h2>
    <p>Giám khảo (giọng đọc máy) hỏi theo đúng cấu trúc IELTS. Bạn trả lời bằng giọng nói, app ghi lại và <b>chấm 4 tiêu chí</b> (Fluency, Lexical, Grammar, Pronunciation) kèm nhận xét và câu mẫu.</p>
    <p class="muted">${AI.has() ? '🤖 Đang dùng AI giám khảo (' + esc(AI.cfg().model) + ').' : '📋 Chưa bật AI: dùng đề có sẵn + chấm ước lượng thô. Bật AI ở Cài đặt để được chấm như giám khảo thật.'}${SR ? '' : ' ⚠️ Trình duyệt này không hỗ trợ ghi âm nhận dạng – bạn sẽ gõ câu trả lời (nên dùng Chrome/Edge hoặc Safari).'}</p>
    <label class="field">Phần thi <select id="sp-part">
      <option value="1,2,3">Cả 3 phần (≈ 11–14 phút)</option><option value="1">Part 1 – Phỏng vấn (4 câu)</option><option value="2">Part 2 – Nói về 1 chủ đề (1 phút chuẩn bị + 2 phút nói)</option><option value="3">Part 3 – Thảo luận chuyên sâu (4 câu)</option></select></label>
    ${topicPickerHTML('sp')}
    <button class="btn green big" id="sp-go">🎙️ BẮT ĐẦU</button></section>
  ${hist.length ? `<section class="card"><h3>Lần luyện gần đây</h3>${hist.map(h => `<div class="hrow"><span>${esc(h.date)} · ${esc(h.topic || '')}</span><b>Band ${esc(h.band)}${h.est ? ' ~' : ''}</b></div>`).join('')}</section>` : ''}`;
  $('#sp-go').onclick = () => runSpeaking({ parts: $('#sp-part').value.split(',').map(Number), topic: resolveTopic('sp') });
}

async function buildSpeakingSet(topic) {
  if (AI.has()) {
    try { return { topic, ...(await aiJSON({ system: SYS_EXAMINER, user: speakingGenPrompt(topic), max: 3000, effort: 'low' })) }; }
    catch (e) { toast('AI chưa tạo được đề (' + e.message + ') – dùng đề có sẵn'); }
  }
  const t = bankTopic(topic), b = SPEAK_BANK[t];
  return { topic: t, part1: shuffle(b.p1).slice(0, 4), part2: pickOne(b.p2), part3: shuffle(b.p3).slice(0, 4) };
}

/* ---- Ghi âm & nhận dạng giọng nói liên tục ---- */
class Recorder {
  constructor(onText, onErr) { this.onText = onText; this.onErr = onErr; this.final = ''; this.confs = []; this.on = false; }
  start() {
    if (!SR) return;
    this.on = true; this.rec = new SR(); const r = this.rec;
    r.lang = 'en-US'; r.continuous = true; r.interimResults = true;
    r.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const x = e.results[i];
        if (x.isFinal) { this.final += x[0].transcript.trim() + ' '; this.confs.push(x[0].confidence || 0); } else interim += x[0].transcript;
      }
      this.onText(this.final, interim);
    };
    r.onerror = e => { if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(e.error)) { this.on = false; this.onErr(e.error); } };
    r.onend = () => { if (this.on) { try { r.start(); } catch { } } };
    try { r.start(); } catch (e) { this.on = false; this.onErr(e.name); }
  }
  stop() { this.on = false; try { this.rec?.stop(); } catch { } }
  conf() { return this.confs.length ? this.confs.reduce((a, b) => a + b, 0) / this.confs.length : 0; }
}

const SPK_LIMIT = { 1: 60, 2: 120, 3: 90 }, SPK_HINT = { 1: 'Trả lời 2–4 câu (khoảng 20–40 giây).', 2: 'Nói liên tục 1–2 phút theo các gợi ý.', 3: 'Nêu quan điểm + lý do + ví dụ (khoảng 40–60 giây).' };

async function runSpeaking({ parts, topic, onDone }) {
  const root = fsRoot();
  root.innerHTML = `<div class="prep"><div class="spinner"></div><h3>Giám khảo đang chuẩn bị đề…</h3><p class="muted">Chủ đề: ${esc(topic)}</p></div>`;
  const set = await buildSpeakingSet(topic);
  const items = [];
  if (parts.includes(1)) (set.part1 || []).slice(0, 4).forEach(q => items.push({ part: 1, q }));
  if (parts.includes(2) && set.part2) items.push({ part: 2, q: set.part2.topic, points: set.part2.points || [] });
  if (parts.includes(3)) (set.part3 || []).slice(0, 4).forEach(q => items.push({ part: 3, q }));
  if (!items.length) { fsClose(); return toast('Không tạo được đề – thử lại nhé.'); }
  const S = { items, i: 0, answers: [], topic: set.topic || topic, onDone };
  speakItem(S);
}

function speakItem(S) {
  const it = S.items[S.i], root = fsRoot();
  if (!it) return gradeSpeaking(S);
  const pct = Math.round(S.i / S.items.length * 100);
  let rec = null, secs = 0, tick = null, stage = it.part === 2 ? 'prep' : 'speak';
  const stopAll = () => { clearInterval(tick); rec?.stop(); };
  const finish = (skip) => {
    stopAll(); speechSynthesis?.cancel?.();
    S.answers.push({ part: it.part, q: it.q, answer: skip ? '' : ($('#tr')?.value || '').trim(), seconds: secs, conf: rec?.conf() || 0 });
    S.i++; speakItem(S);
  };

  const render = () => {
    root.innerHTML = `
    <div class="lhead"><button class="x" id="sx" aria-label="Thoát">✕</button><div class="pbar"><i style="width:${pct}%"></i></div><div class="hearts">Part ${it.part}</div></div>
    <div class="lbody">
      <div class="examiner"><div class="avatar">🧑‍🏫</div><div class="ebubble">${esc(it.q)}</div></div>
      <div class="qlisten"><button class="chip" id="hear">🔊 Nghe giám khảo</button></div>
      ${it.part === 2 ? `<div class="cue card"><b>You should say:</b><ul>${it.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
      ${stage === 'prep' ? `<div class="center"><p>⏱️ Thời gian chuẩn bị: <b id="tm">1:00</b></p><textarea id="notes" rows="4" placeholder="Ghi chú nhanh các ý chính (không bắt buộc)…"></textarea></div>`
        : `<div class="speakctl">${SR ? '<button class="micbtn" id="mic">🎤</button>' : ''}<div class="timer" id="tm">0:00 / ${fmtTime(SPK_LIMIT[it.part])}</div></div>
           <p class="muted center" id="hint">${SR ? 'Nhấn micro để bắt đầu nói, nhấn lần nữa để dừng. ' : 'Gõ câu trả lời của bạn bên dưới. '}${SPK_HINT[it.part]}</p>
           <textarea id="tr" rows="5" placeholder="Lời bạn nói sẽ hiện ở đây – bạn có thể sửa lại cho đúng…"></textarea>`}
    </div>
    <footer class="lfoot"><div class="fbtns"><button class="btn ghost" id="skip">BỎ QUA CÂU NÀY</button><button class="btn green" id="done" ${stage === 'prep' ? '' : 'disabled'}>${stage === 'prep' ? 'BẮT ĐẦU NÓI' : 'XONG – CÂU TIẾP'}</button></div></footer>`;
    $('#sx').onclick = () => { if (confirm('Thoát phần nói? Kết quả sẽ không được lưu.')) { stopAll(); fsClose(); } };
    $('#hear').onclick = () => speak(it.q, { lang: 'en-GB', rate: .9 });
    $('#skip').onclick = () => finish(true);
    if (stage === 'prep') {
      let left = 60; tick = setInterval(() => { left--; const t = $('#tm'); if (t) t.textContent = fmtTime(left); if (left <= 0) { clearInterval(tick); stage = 'speak'; render(); } }, 1000);
      $('#done').onclick = () => { clearInterval(tick); stage = 'speak'; render(); };
    } else {
      const tr = $('#tr'); tr.oninput = () => { $('#done').disabled = !tr.value.trim(); };
      $('#done').onclick = () => finish(false);
      const mic = $('#mic');
      if (mic) mic.onclick = () => {
        if (rec?.on) { rec.stop(); clearInterval(tick); mic.classList.remove('rec'); mic.textContent = '🎤'; return; }
        rec = rec || new Recorder((fin, interim) => { tr.value = fin + interim; $('#done').disabled = !tr.value.trim(); }, err => { toast('Không dùng được micro (' + err + ') – hãy cho phép quyền micro hoặc gõ câu trả lời.'); mic.classList.remove('rec'); });
        if (rec.final) rec.final = tr.value.trim() + ' ';
        rec.start(); mic.classList.add('rec'); mic.textContent = '⏹️';
        tick = setInterval(() => { secs++; $('#tm').textContent = `${fmtTime(secs)} / ${fmtTime(SPK_LIMIT[it.part])}`; if (secs >= SPK_LIMIT[it.part]) mic.click(); }, 1000);
      };
    }
  };
  render();
  speak(it.q, { lang: 'en-GB', rate: .9 });
}

async function gradeSpeaking(S) {
  const root = fsRoot(), answered = S.answers.filter(a => a.answer);
  if (!answered.length) { fsClose(); return toast('Bạn chưa trả lời câu nào.'); }
  root.innerHTML = `<div class="prep"><div class="spinner"></div><h3>Giám khảo đang chấm bài…</h3><p class="muted">${AI.has() ? 'AI đang phân tích câu trả lời (khoảng 20–40 giây)' : 'Đang tính điểm ước lượng'}</p></div>`;
  const learned = learnedWords(); let fb, err = '';
  if (AI.has()) { try { fb = await aiJSON({ system: SYS_EXAMINER, user: speakingPrompt(answered, learned), max: 5000 }); } catch (e) { err = e.message; } }
  if (!fb) { fb = heuristicSpeaking(answered, learned); if (err) fb.note = 'AI báo lỗi: ' + err + '. ' + fb.note; }
  saveExam({ skill: 'S', band: fb.overall, est: !!fb.estimated, topic: S.topic });
  const copyText = speakingPrompt(answered, learned);
  root.innerHTML = `<div class="lhead"><button class="x" id="sx">✕</button><div class="pbar"><i style="width:100%"></i></div><div></div></div>
    <div class="lbody"><h2>Kết quả phần Nói – ${esc(S.topic)}</h2>${feedbackHTML(fb, 'speaking')}
    <details class="card"><summary>Xem lại câu trả lời của bạn</summary>${answered.map(a => `<p><b>Part ${a.part}: ${esc(a.q)}</b><br>${esc(a.answer)}<br><small class="muted">${Math.round(a.seconds)} giây · ${tokens(a.answer).length} từ</small></p>`).join('')}</details>
    <button class="btn blue" id="cp">📋 Sao chép nhờ Claude chấm (miễn phí)</button>
    <button class="btn green" id="again">LUYỆN LẠI</button><button class="btn ghost" id="home">ĐÓNG</button></div>`;
  $('#sx').onclick = $('#home').onclick = () => { fsClose(); S.onDone?.(fb); renderAll(); };
  $('#cp').onclick = () => copyForClaude(copyText);
  $('#again').onclick = () => { fsClose(); renderAll(); };
}
