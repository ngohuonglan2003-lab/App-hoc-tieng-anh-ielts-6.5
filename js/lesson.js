'use strict';
/* ===== Bộ máy bài học (dùng chung cho từ vựng & ngữ pháp) ===== */
let L = null;
const cur = () => L?.queue[L.i];
const accentLang = () => Store.profile.accent === 'uk' ? 'en-GB' : 'en-US';
const normTok = t => t.toLowerCase().replace(/[^a-z0-9'-]/g, '');

function runLesson({ queue, words, ctx, kind = 'vocab', mode, redo }) {
  if (!queue.length) return toast('Chưa tạo được bài tập – hãy thử lại.');
  const p = Store.profile; let hearts = 5, boosted = false;
  if (p.items.hearts > 0) { p.items.hearts--; hearts += 3; boosted = true; Store.save(); }
  $('#lesson').hidden = false; document.body.classList.add('noscroll');
  L = { queue, i: 0, hearts, xp: 0, coins: 0, done: 0, ok: 0, tries: 0, res: {}, ctx, words, kind, mode, redo, combo: 0, bestCombo: 0, boosted };
  window.__imgFail = () => { if (cur()?.type === 'image') { L.queue.splice(L.i, 1); toast('Ảnh không tải được – chuyển câu khác'); step(); } };
  if (boosted) toast('💗 Đã dùng Tim dự phòng: +3 tim');
  step();
}

/* Xử lý các nút nghe / dịch nằm trong đề bài */
async function toolHandler(e) {
  const b = e.target.closest('[data-act]'); if (!b || !L) return;
  const ex = cur(), a = b.dataset.act;
  if (a === 'say') pronounce(ex.w);
  else if (a === 'slow') pronounce(ex.w, Store.profile.accent, true);
  else if (a === 'saytext') speak(ex.sayText, { lang: accentLang(), rate: .92 });
  else if (a === 'slowtext') speak(ex.sayText, { lang: accentLang(), rate: .6 });
  else if (a === 'trtext') {
    const out = $('.qtr'); if (!out) return;
    if (out.dataset.done) { out.hidden = !out.hidden; return; }
    out.textContent = 'Đang dịch…'; out.dataset.done = '1';
    const t = ex.trKnown ? ex.trText : await translateVi(ex.trText);
    out.textContent = t ? '🇻🇳 ' + t : 'Không dịch được lúc này.';
  }
}

function step() {
  const ex = cur();
  if (!ex) return finishLesson(false);
  L.answered = false; L.sel = null; L.order = [];
  const left = L.queue.length - L.i, pct = Math.round(L.done / (L.done + left) * 100), pet = petOf();
  const root = $('#lesson');
  root.innerHTML = `
  <div class="lhead"><button class="x" id="lq" aria-label="Thoát">✕</button><div class="pbar"><i style="width:${pct}%"></i></div><div class="hearts">${pet ? pet.e + ' ' : ''}❤️ ${L.hearts}</div></div>
  <div class="lbody" id="lb"></div>
  <footer class="lfoot" id="lf"><div class="fb" id="fb"></div><div class="fbtns"><button class="btn ghost" id="lskip" hidden></button><button class="btn green" id="lcheck" disabled>KIỂM TRA</button></div></footer>`;
  $('#lq').onclick = () => { if (confirm('Thoát bài học? Tiến độ bài này sẽ không được lưu.')) closeLesson(); };
  const body = $('#lb'), check = $('#lcheck'), skip = $('#lskip'), w = ex.w;

  if (ex.kind === 'teach') {
    body.innerHTML = `<h3 class="ltitle">✨ Từ mới</h3>${wordCardHTML(w)}`;
    bindWordCard(body, w);
    check.textContent = 'TIẾP TỤC'; check.disabled = false;
    check.onclick = () => { L.i++; L.done++; step(); };
    setTimeout(() => pronounce(w), 300);
    return;
  }
  body.addEventListener('click', toolHandler);

  if (ex.kind === 'choice') {
    body.innerHTML = `<h3 class="ltitle">${esc(ex.title)}</h3><div class="prompt">${ex.promptHTML}</div>
      <div class="opts">${ex.options.map((o, i) => `<button class="opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o.text)}</span></button>`).join('')}</div>`;
    $$('.opt', body).forEach(b => b.onclick = () => { if (L.answered) return; L.sel = +b.dataset.i; $$('.opt', body).forEach(x => x.classList.toggle('sel', x === b)); check.disabled = false; });
    check.onclick = () => {
      if (L.answered) return next();
      const o = ex.options[L.sel];
      $$('.opt', body).forEach((b, i) => { if (ex.options[i].correct) b.classList.add('right'); else if (i === L.sel) b.classList.add('wrong'); b.disabled = true; });
      settle(o.correct);
    };
  } else if (ex.kind === 'type') {
    body.innerHTML = `<h3 class="ltitle">${esc(ex.title)}</h3><div class="prompt">${ex.promptHTML}</div>
      <input id="tin" class="tin" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="${ex.sentence ? 'Gõ lại cả câu…' : 'Gõ đáp án bằng tiếng Anh…'}">`;
    const inp = $('#tin'); setTimeout(() => inp.focus(), 50);
    inp.oninput = () => { check.disabled = !inp.value.trim(); };
    inp.onkeydown = e => { if (e.key === 'Enter' && !check.disabled) check.click(); };
    skip.hidden = false; skip.textContent = 'TÔI KHÔNG BIẾT';
    skip.onclick = () => { inp.disabled = true; settle(false); };
    check.onclick = () => {
      if (L.answered) return next();
      const v = norm(inp.value); inp.disabled = true;
      if (ex.sentence) {                       // nghe-chép: chấp nhận sai sót nhỏ
        const m = lcsMarks(ex.target, v), full = m.ratio === 1 && tokens(v).length === m.words.length;
        return settle(full || (m.ratio >= .9 && tokens(v).length <= m.words.length + 1), full ? '' : (m.ratio >= .9 ? 'Gần đúng – kiểm tra lại chính tả!' : ''));
      }
      const exact = ex.answers.includes(v);
      const near = !exact && v.length >= 6 && ex.answers.some(a => lev(a, v) === 1);
      settle(exact || near, near ? `Gần đúng! Chính tả đúng là: ${esc(ex.reveal)}` : '');
    };
  } else if (ex.kind === 'order') {
    body.innerHTML = `<h3 class="ltitle">${esc(ex.title)}</h3><div class="prompt">${ex.promptHTML}</div>
      <div class="answerline" id="al"></div><div class="tilebank" id="tb"></div>`;
    const draw = () => {
      $('#al').innerHTML = L.order.map(t => `<button class="tile" data-i="${t.i}">${esc(t.t)}</button>`).join('');
      $('#tb').innerHTML = ex.tiles.map(t => L.order.includes(t) ? `<span class="tile ghosty">${esc(t.t)}</span>` : `<button class="tile" data-i="${t.i}">${esc(t.t)}</button>`).join('');
      check.disabled = !L.order.length;
      $$('#al .tile, #tb button.tile').forEach(b => b.onclick = () => {
        if (L.answered) return;
        const t = ex.tiles.find(x => x.i === +b.dataset.i);
        if (L.order.includes(t)) L.order = L.order.filter(x => x !== t); else L.order.push(t);
        draw();
      });
    };
    draw();
    skip.hidden = false; skip.textContent = 'TÔI KHÔNG BIẾT'; skip.onclick = () => settle(false);
    check.onclick = () => {
      if (L.answered) return next();
      const got = L.order.map(t => normTok(t.t)).join(' '), want = ex.answerTokens.map(normTok).join(' ');
      settle(got === want);
    };
  } else if (ex.kind === 'speak') {
    body.innerHTML = `<h3 class="ltitle">${esc(ex.title)}</h3><div class="prompt">${ex.promptHTML}</div>
      <div class="qlisten"><button class="chip" data-act="${ex.sentence ? 'saytext' : 'say'}">🔊 Nghe mẫu</button><button class="micbtn" id="micbtn">🎤</button></div><p class="muted center" id="micmsg">Nhấn micro rồi đọc to</p>`;
    skip.hidden = false; skip.textContent = 'KHÔNG NÓI ĐƯỢC LÚC NÀY';
    skip.onclick = () => { L.queue.splice(L.i, 1); step(); };
    $('#micbtn').onclick = async () => {
      if (L.answered) return; $('#micmsg').textContent = '🎙️ Đang nghe…';
      try {
        const alts = await listenOnce();
        if (!alts.length) { $('#micmsg').textContent = 'Không nghe thấy gì, thử lại nhé.'; return; }
        if (ex.sentence) {
          const best = alts.map(a => lcsMarks(ex.target, a)).sort((x, y) => y.ratio - x.ratio)[0];
          const colored = best.words.map((wd, i) => `<span class="${best.hit[i] ? 'ok' : 'bad'}">${esc(wd)}</span>`).join(' ');
          settle(best.ratio >= ex.pass, `${Math.round(best.ratio * 100)}% khớp: ${colored}`);
        } else {
          const ok = alts.some(a => tokens(a).includes(normTok(ex.target)) || a.includes(normTok(ex.target)));
          settle(ok, ok ? '' : `Nghe được: “${esc(alts[0])}”`);
        }
      } catch { toast('Không dùng được micro – bỏ qua câu này'); L.queue.splice(L.i, 1); step(); }
    };
    check.textContent = 'TIẾP TỤC'; check.disabled = true; check.onclick = () => next();
  }
  if (ex.auto) setTimeout(() => { if (cur() !== ex) return; ex.auto === 'text' ? speak(ex.sayText, { lang: accentLang(), rate: .92 }) : pronounce(w); }, 250);
}

function comboBanner(n) {
  const d = document.createElement('div'); d.className = 'combo'; d.textContent = `🔥 Combo x${n}! +5 🪙`;
  $('#lesson').appendChild(d); setTimeout(() => d.remove(), 1600);
}

/* note: HTML đã được escape sẵn */
function settle(ok, note = '') {
  const ex = cur(), w = ex.w; L.answered = true;
  const key = ex.rk || w.key, r = L.res[key] ||= { bad: false };
  beep(ok);
  if (!ex.retry) {
    L.tries++;
    if (ex.topic) { const s = Store.gstats[ex.topic] ||= { ok: 0, bad: 0 }; ok ? s.ok++ : s.bad++; }
    if (ok) { L.ok++; L.xp += 10; L.coins += 1; L.combo++; L.bestCombo = Math.max(L.bestCombo, L.combo); if (L.combo % 5 === 0) { L.coins += 5; comboBanner(L.combo); } }
  }
  if (!ok) {
    L.combo = 0; r.bad = true; L.hearts--;
    if (L.hearts > 0) { const again = ex.again ? ex.again() : (w ? makeFor(w, 0, L.ctx, [ex.type]) : null); if (again) { again.retry = true; L.queue.push(again); } }
  }
  const fb = $('#fb'), lf = $('#lf'), check = $('#lcheck');
  lf.className = 'lfoot ' + (ok ? 'ok' : 'bad');
  const wline = w ? `<div class="fbw">${esc(w.word)} ${esc(w.phonetic || '')} – ${esc(w.vi || '')} <button class="mini" id="fbsay">🔊</button></div>` : '';
  const full = ex.full ? `<div class="fbw fbfull">📝 ${esc(ex.full)} <button class="mini" id="fbsay2">🔊</button> <button class="link" id="fbtr">Dịch</button><div id="fbtrout"></div></div>` : '';
  const why = ex.explain ? `<div class="fbw why">💡 ${esc(ex.explain)}</div>` : '';
  fb.innerHTML = (ok ? `<b>✅ Chính xác!${note || ex.retry ? '' : ' +10 XP'}</b>` : `<b>❌ Đáp án đúng: ${esc(ex.reveal)}</b>`) + (note ? `<div>${note}</div>` : '') + wline + full + why;
  $('#fbsay')?.addEventListener('click', () => pronounce(w));
  $('#fbsay2')?.addEventListener('click', () => speak(ex.full, { lang: accentLang(), rate: .92 }));
  $('#fbtr')?.addEventListener('click', async e => { e.target.remove(); $('#fbtrout').textContent = 'Đang dịch…'; const t = ex.trKnown ? ex.trText : await translateVi(ex.full); $('#fbtrout').textContent = t ? '🇻🇳 ' + t : 'Không dịch được lúc này.'; });
  $('#lskip').hidden = true;
  $$('#lb input').forEach(i => i.disabled = true);
  check.disabled = false; check.textContent = L.hearts <= 0 ? 'KẾT THÚC' : 'TIẾP TỤC';
  check.className = 'btn ' + (ok ? 'green' : 'red');
  check.onclick = next;
  check.focus();
}

function next() {
  if (!L.answered) return;
  L.i++; L.done++;
  if (L.hearts <= 0) return finishLesson(true);
  step();
}

function finishLesson(failed) {
  const p = Store.profile, vocab = L.kind === 'vocab';
  const perfect = !failed && Object.values(L.res).every(r => !r.bad);
  const gainedXP = L.xp + (perfect ? 10 : 0), coins = L.coins + (failed ? 0 : 10) + (perfect ? 10 : 0);
  if (vocab) for (const [key, r] of Object.entries(L.res)) applyResult(key, r.bad);
  let gifts = [], freezeUsed = 0;
  if (gainedXP > 0) {
    gifts = grantXP(gainedXP); freezeUsed = touchStreak().used; p.coins += coins; p.lessons++;
    gifts.forEach(g => { /* xu quà đã được cộng trong grantXP */ });
  }
  Store.save();
  const acc = L.tries ? Math.round(L.ok / L.tries * 100) : 0, pet = petOf();
  const good = (L.words || []).filter(w => !L.res[w.key]?.bad), weak = (L.words || []).filter(w => L.res[w.key]?.bad);
  const m = L.mode, redo = L.redo;
  $('#lesson').innerHTML = `<div class="done">
    <div class="trophy">${failed ? '💔' : perfect ? '🏆' : '🎉'}</div>${pet ? `<div class="petcheer">${pet.e}</div>` : ''}
    <h2>${failed ? 'Hết tim rồi – đừng nản nhé!' : perfect ? 'Hoàn hảo!' : 'Hoàn thành bài học!'}</h2>
    <div class="sum"><div class="card"><b>+${gainedXP}</b><span>XP</span></div><div class="card"><b>+${gainedXP > 0 ? coins : 0} 🪙</b><span>Xu</span></div><div class="card"><b>${acc}%</b><span>Chính xác</span></div></div>
    <p>🔥 Chuỗi ${effectiveStreak()} ngày${L.bestCombo >= 5 ? ` · Combo cao nhất x${L.bestCombo}` : ''}${freezeUsed ? ` · ❄️ đã dùng ${freezeUsed} Băng đóng chuỗi` : ''}</p>
    ${gifts.map(g => `<div class="card gift">🎊 Lên cấp ${g.level}! Quà: +${g.coins} 🪙</div>`).join('')}
    ${chestReady() ? '<button class="btn yellow" id="chest2">🎁 Bạn đã đạt mục tiêu ngày – MỞ RƯƠNG QUÀ</button>' : ''}
    ${good.length ? `<p class="gl">✅ Nhớ tốt: ${good.map(w => esc(w.word)).join(', ')}</p>` : ''}
    ${weak.length ? `<p class="gl">🔁 Cần ôn lại sớm: ${weak.map(w => esc(w.word)).join(', ')}</p>` : ''}
    <button class="btn green big" id="again">TIẾP TỤC HỌC</button><button class="btn ghost" id="home">VỀ TRANG CHỦ</button></div>`;
  $('#again').onclick = () => { closeLesson(); redo?.(m); };
  $('#home').onclick = closeLesson;
  $('#chest2')?.addEventListener('click', async e => { e.target.remove(); await openChest(); });
}

function closeLesson() {
  $('#lesson').hidden = true; $('#lesson').innerHTML = ''; document.body.classList.remove('noscroll');
  L = null; window.__imgFail = null; renderAll();
}

document.addEventListener('keydown', e => {
  if (!L || $('#lesson').hidden || e.target.tagName === 'INPUT') return;
  const ex = cur();
  if (e.key === 'Enter') { const c = $('#lcheck'); if (c && !c.disabled) c.click(); }
  else if (ex?.kind === 'choice' && !L.answered && /^[1-4]$/.test(e.key)) $$('.opt')[+e.key - 1]?.click();
});
