'use strict';
/* ===== Giao diện chính ===== */
let tab = 'home', topicFilter = 'all', search = '';

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2800);
}
const stats = () => {
  const now = Date.now(), E = Vocab.entries, P = Store.progress;
  return {
    total: E.length,
    learned: E.filter(e => P[e.key]).length,
    due: E.filter(e => P[e.key] && P[e.key].due <= now).length,
    fresh: E.filter(e => !P[e.key]).length,
    mastered: E.filter(e => P[e.key]?.box >= 4).length
  };
};
const topics = () => [...new Set(Vocab.entries.map(e => e.topic))];

function renderTop() {
  const p = Store.profile;
  $('#top').innerHTML = `<div class="logo">IELTS <b>6.5</b></div>
    <div class="pills"><span class="pill fire" title="Chuỗi ngày học liên tiếp">🔥 ${p.streak}</span><span class="pill xp" title="Tổng điểm XP">⭐ ${p.xp}</span></div>`;
}

function ring(v, max) {
  const r = 38, c = 2 * Math.PI * r, f = Math.min(1, v / max);
  return `<svg viewBox="0 0 90 90" class="ring"><circle cx="45" cy="45" r="${r}" class="bg"/><circle cx="45" cy="45" r="${r}" class="fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - f)}" transform="rotate(-90 45 45)"/><text x="45" y="50" text-anchor="middle">${f >= 1 ? '✓' : Math.round(f * 100) + '%'}</text></svg>`;
}

/* ---------- Trang Học ---------- */
function viewHome() {
  const s = stats(), p = Store.profile, xt = Store.xpToday();
  const opts = ['<option value="all">Tất cả chủ đề</option>', ...topics().map(t => `<option ${t === topicFilter ? 'selected' : ''}>${esc(t)}</option>`)].join('');
  $('#view').innerHTML = `
  <section class="card goal">
    ${ring(xt, p.goal)}
    <div><h2>Mục tiêu hôm nay</h2><p>${xt}/${p.goal} XP${xt >= p.goal ? ' – tuyệt vời! 🎉' : ' – học 1 bài ≈ 80–120 XP'}</p>
    <p class="muted">Mục tiêu dài hạn: IELTS 6.5 🎯 · thành thạo ${s.mastered}/${s.total} từ</p></div>
  </section>
  <section class="stats">
    <div class="card"><b>${s.fresh}</b><span>Từ mới</span></div>
    <div class="card"><b>${s.due}</b><span>Cần ôn</span></div>
    <div class="card"><b>${s.learned}</b><span>Đã học</span></div>
    <div class="card"><b>${s.mastered}</b><span>Thành thạo</span></div>
  </section>
  ${s.total < 4 ? `<div class="card warn">Danh sách có ${s.total} từ. Cần tối thiểu 4 từ trong <code>vocab/tu-vung.txt</code> (hoặc thêm ở tab Cài đặt).</div>` : `
  <label class="sel">Chủ đề: <select id="topic">${opts}</select></label>
  <button class="btn green big" data-start="mixed">▶ HỌC BÀI HÔM NAY</button>
  <div class="row2">
    <button class="btn blue" data-start="new" ${s.fresh ? '' : 'disabled'}>✨ Chỉ học từ mới</button>
    <button class="btn purple" data-start="review" ${s.learned ? '' : 'disabled'}>🔁 Chỉ ôn tập</button>
  </div>`}
  <p class="tip">💡 Mỗi bài ~10–15 phút gồm: thẻ từ mới (ảnh, phiên âm, câu mẫu, video) → trắc nghiệm → nghe → điền từ → viết → nói. Từ sai sẽ được ôn lại sớm hơn (lặp lại ngắt quãng).</p>`;
  $('#topic')?.addEventListener('change', e => { topicFilter = e.target.value; });
  $$('[data-start]').forEach(b => b.onclick = () => startLesson(b.dataset.start));
}

/* ---------- Trang Từ vựng ---------- */
function viewWords() {
  const opts = ['<option value="all">Tất cả chủ đề</option>', ...topics().map(t => `<option ${t === topicFilter ? 'selected' : ''}>${esc(t)}</option>`)].join('');
  $('#view').innerHTML = `<div class="searchbar"><input id="q" type="search" placeholder="🔍 Tìm từ…" value="${esc(search)}"><select id="topic">${opts}</select></div><div id="wlist" class="wlist"></div>`;
  const draw = () => {
    const q = search.toLowerCase();
    const list = Vocab.entries.filter(e => (topicFilter === 'all' || e.topic === topicFilter) && (!q || e.key.includes(q) || e.vi.toLowerCase().includes(q)));
    $('#wlist').innerHTML = list.map(e => {
      const b = Store.progress[e.key]?.box;
      const dots = Array.from({ length: 5 }, (_, i) => `<i class="${b != null && i < Math.min(5, b + 1) ? 'on' : ''}"></i>`).join('');
      return `<button class="witem" data-k="${esc(e.key)}"><span><b>${esc(e.word)}</b><small>${esc(e.vi || cachedVi(e.key) || e.topic)}</small></span><span class="dots" title="Mức nhớ">${dots}</span></button>`;
    }).join('') || '<p class="muted">Không có từ nào.</p>';
    $$('.witem').forEach(b => b.onclick = () => openDetail(b.dataset.k));
  };
  draw();
  $('#q').oninput = e => { search = e.target.value; draw(); };
  $('#topic').onchange = e => { topicFilter = e.target.value; draw(); };
}

/* ---------- Trang Cài đặt ---------- */
function viewSettings() {
  const p = Store.profile;
  $('#view').innerHTML = `
  <section class="card">
    <h2>📄 File từ vựng của bạn</h2>
    <p>Mở file <code>vocab/tu-vung.txt</code> trong thư mục app, thêm mỗi dòng một từ rồi tải lại trang. App sẽ tự tìm phiên âm, audio, định nghĩa, câu mẫu, đồng nghĩa, ảnh, video và nghĩa tiếng Việt.</p>
    <p class="muted">Hiện có <b>${Vocab.entries.length}</b> từ.${LS.get('ielts.upload', null) != null ? ' (đang dùng file bạn đã tải lên)' : ''}</p>
    <div class="row2">
      <button class="btn blue" id="reload">🔄 Tải lại file</button>
      <label class="btn purple">⬆️ Tải file lên<input type="file" id="upload" accept=".txt,.csv,text/plain" hidden></label>
    </div>
    <button class="btn ghost" id="download">⬇️ Tải danh sách hiện tại</button>
    ${LS.get('ielts.upload', null) != null ? '<button class="btn ghost" id="unupload">↩️ Quay lại file mặc định</button>' : ''}
    <h3>Thêm nhanh từ mới</h3>
    <textarea id="extra" rows="4" placeholder="Mỗi dòng một từ, ví dụ:&#10;resilient&#10;mitigate | giảm nhẹ | Environment"></textarea>
    <button class="btn green" id="addextra">➕ Thêm vào danh sách</button>
  </section>
  <section class="card">
    <h2>🎛️ Tùy chỉnh</h2>
    <label class="field">Mục tiêu XP mỗi ngày
      <select id="goal">${[20, 50, 100, 150].map(g => `<option ${g === p.goal ? 'selected' : ''}>${g}</option>`).join('')}</select></label>
    <label class="field">Giọng đọc ưu tiên
      <select id="accent"><option value="us" ${p.accent === 'us' ? 'selected' : ''}>Anh – Mỹ (US)</option><option value="uk" ${p.accent === 'uk' ? 'selected' : ''}>Anh – Anh (UK)</option></select></label>
    <label class="field">Âm thanh hiệu ứng
      <select id="sound"><option value="1" ${p.sound ? 'selected' : ''}>Bật</option><option value="0" ${!p.sound ? 'selected' : ''}>Tắt</option></select></label>
  </section>
  <section class="card">
    <h2>🧹 Dữ liệu</h2>
    <button class="btn ghost" id="clrcache">Xóa bộ nhớ đệm từ điển (tải lại ảnh/định nghĩa)</button>
    <button class="btn danger" id="reset">Xóa toàn bộ tiến độ học</button>
  </section>`;
  const reloadAll = async () => { await loadVocab(); renderAll(); };
  $('#reload').onclick = async () => { await reloadAll(); toast(`Đã tải ${Vocab.entries.length} từ`); };
  $('#upload').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    LS.set('ielts.upload', await f.text()); await reloadAll(); toast('Đã dùng file bạn tải lên');
  };
  $('#unupload')?.addEventListener('click', async () => { LS.del('ielts.upload'); await reloadAll(); toast('Đã quay về file mặc định'); });
  $('#download').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([Vocab.text], { type: 'text/plain;charset=utf-8' })); a.download = 'tu-vung.txt'; a.click();
  };
  $('#addextra').onclick = async () => {
    const v = $('#extra').value.trim(); if (!v) return;
    LS.set('ielts.extra', (LS.get('ielts.extra', '') + '\n' + v).trim()); await reloadAll(); toast('Đã thêm từ mới');
  };
  $('#goal').onchange = e => { p.goal = +e.target.value; Store.save(); };
  $('#accent').onchange = e => { p.accent = e.target.value; Store.save(); };
  $('#sound').onchange = e => { p.sound = e.target.value === '1'; Store.save(); };
  $('#clrcache').onclick = () => { clearCache(); toast('Đã xóa bộ nhớ đệm'); };
  $('#reset').onclick = () => {
    if (!confirm('Xóa toàn bộ tiến độ, XP và chuỗi ngày học?')) return;
    LS.del('ielts.progress'); LS.del('ielts.profile'); location.reload();
  };
}

function renderAll() {
  renderTop();
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  ({ home: viewHome, words: viewWords, settings: viewSettings })[tab]();
}

/* ============ Thẻ từ vựng giàu nội dung (dùng cho bài học & xem chi tiết) ============ */
const hl = (en, word) => esc(en).replace(stemRe(word, 'i'), m => `<mark>${m}</mark>`);

function wordCardHTML(w) {
  const img = w.images?.[0];
  const q = encodeURIComponent(w.word);
  return `<div class="wcard">
  <div class="wimg">${img ? `<img src="${esc(img.src)}" alt="" referrerpolicy="no-referrer" data-i="0" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'noimg',textContent:'🖼️'}))">` : `<div class="noimg">${esc(w.word[0].toUpperCase())}</div>`}
    ${w.images?.length > 1 ? `<button class="chip sm" data-act="nextimg">🔄 Ảnh khác</button>` : ''}
    <small class="credit">${esc(img?.credit || '')}</small></div>
  <h2 class="wword">${esc(w.word)}</h2>
  <div class="wipa">${esc(w.phonetic || '')}</div>
  <div class="audiobar">
    <button class="chip" data-act="say" data-a="us">🔊 US</button><button class="chip" data-act="say" data-a="uk">🔊 UK</button>
    <button class="chip" data-act="slow">🐢 Chậm</button>${SR ? '<button class="chip" data-act="mic">🎤 Luyện nói</button>' : ''}</div>
  <div class="micres"></div>
  <p class="vi">🇻🇳 ${esc(w.vi || '(chưa có nghĩa – thêm ở cột 2 trong file)')}</p>
  ${w.meanings.length ? `<div class="sec"><h4>Định nghĩa</h4>${w.meanings.map(m => `<div class="mean"><span class="pos">${esc(m.pos)}</span> ${m.defs.map(d => esc(d.def)).join(' <i>/</i> ')}</div>`).join('')}</div>` : ''}
  ${w.examples.length ? `<div class="sec"><h4>Câu mẫu</h4><ul class="exs">${w.examples.slice(0, 4).map((e, i) => `<li><button class="mini" data-act="sayex" data-i="${i}" aria-label="Nghe câu">🔊</button><div><div>${hl(e.en, w.word)}</div><div class="exvi" data-i="${i}">${esc(e.vi || '')}</div>${e.vi ? '' : `<button class="link" data-act="tr" data-i="${i}">Dịch sang tiếng Việt</button>`}</div></li>`).join('')}</ul></div>` : ''}
  ${w.synonyms.length ? `<div class="sec"><h4>Từ đồng nghĩa</h4><div class="tags">${w.synonyms.map(s => `<span class="tag g">${esc(s)}</span>`).join('')}</div></div>` : ''}
  ${w.antonyms.length ? `<div class="sec"><h4>Từ trái nghĩa</h4><div class="tags">${w.antonyms.map(s => `<span class="tag r">${esc(s)}</span>`).join('')}</div></div>` : ''}
  ${w.collocations.length ? `<div class="sec"><h4>Cụm từ hay đi cùng</h4><div class="tags">${w.collocations.map(s => `<span class="tag b">${esc(s)}</span>`).join('')}</div></div>` : ''}
  <div class="sec"><h4>Video người bản xứ nói “${esc(w.word)}”</h4>
    <button class="btn blue sm" data-act="video">▶ Xem video</button><div class="vwrap"></div>
    <div class="links"><a target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${q}+meaning+pronunciation+IELTS">YouTube</a><a target="_blank" rel="noopener" href="https://youglish.com/pronounce/${q}/english">YouGlish</a><a target="_blank" rel="noopener" href="https://dictionary.cambridge.org/dictionary/english/${q}">Cambridge</a></div></div>
  </div>`;
}

let ygP;
function loadYG() {
  if (window.YG?.Widget) return Promise.resolve();
  return ygP ||= new Promise((res, rej) => {
    window.onYouglishAPIReady = res;
    const s = document.createElement('script'); s.src = 'https://youglish.com/public/emb/widget.js'; s.charset = 'utf-8';
    s.onerror = () => { ygP = null; rej(); }; document.head.appendChild(s);
    setTimeout(() => { ygP = null; rej(); }, 12000);
  });
}

function bindWordCard(root, w) {
  let imgI = 0;
  root.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b || !root.contains(b)) return;
    const act = b.dataset.act;
    if (act === 'say') pronounce(w, b.dataset.a || Store.profile.accent);
    else if (act === 'slow') pronounce(w, Store.profile.accent, true);
    else if (act === 'sayex') speak(w.examples[+b.dataset.i].en, { lang: Store.profile.accent === 'uk' ? 'en-GB' : 'en-US' });
    else if (act === 'tr') {
      const i = +b.dataset.i, box = $(`.exvi[data-i="${i}"]`, root);
      b.textContent = 'Đang dịch…';
      const t = await translateVi(w.examples[i].en); box.textContent = t || 'Không dịch được lúc này.'; b.remove();
    } else if (act === 'nextimg') {
      imgI = (imgI + 1) % w.images.length; const im = $('.wimg img', root), im2 = w.images[imgI];
      if (im) im.src = im2.src; $('.credit', root).textContent = im2.credit || '';
    } else if (act === 'mic') {
      const out = $('.micres', root); out.textContent = '🎙️ Hãy đọc to…';
      try {
        const alts = await listenOnce(), ok = alts.some(a => a.includes(w.key));
        out.innerHTML = ok ? '<b class="ok">✅ Phát âm rất tốt!</b>' : `<b class="bad">Chưa khớp</b> – nghe được: “${esc(alts[0] || '…')}”. Thử nghe lại rồi đọc tiếp nhé.`;
      } catch { out.textContent = 'Không dùng được micro (hãy cho phép quyền micro).'; }
    } else if (act === 'video') {
      const wrap = $('.vwrap', root); wrap.innerHTML = '<p class="muted">Đang tải video…</p>';
      try {
        await loadYG();
        const id = 'yg' + Date.now(); wrap.innerHTML = `<div id="${id}"></div>`;
        new YG.Widget(id, { width: Math.min(wrap.clientWidth || 480, 640), components: 8, events: { onError: () => { wrap.innerHTML = '<p class="muted">Không tìm thấy video – dùng các liên kết bên dưới.</p>'; } } }).fetch(w.word, 'english');
      } catch { wrap.innerHTML = '<p class="muted">Không tải được video (có thể do mạng) – dùng các liên kết bên dưới.</p>'; }
      b.remove();
    }
  });
}

/* ---------- Xem chi tiết 1 từ ---------- */
async function openDetail(key) {
  const entry = Vocab.entries.find(e => e.key === key); if (!entry) return;
  const body = $('#modal-body'); $('#modal').hidden = false;
  body.innerHTML = '<p class="loading">⏳ Đang tìm ảnh, âm thanh, câu mẫu…</p>';
  const w = await enrich(entry);
  body.innerHTML = wordCardHTML(w); bindWordCard(body, w);
}
$('#modal-x').onclick = () => { $('#modal').hidden = true; $('#modal-body').innerHTML = ''; };
$('#modal').onclick = e => { if (e.target.id === 'modal') $('#modal-x').click(); };

/* ============ BÀI HỌC ============ */
let L = null;

function planSession(mode) {
  const now = Date.now(), P = Store.progress;
  const list = Vocab.entries.filter(e => topicFilter === 'all' || e.topic === topicFilter);
  const due = list.filter(e => P[e.key] && P[e.key].due <= now).sort((a, b) => P[a.key].due - P[b.key].due);
  const fresh = list.filter(e => !P[e.key]);
  let nNew = 3, nRev = 5;
  if (mode === 'new') { nNew = 6; nRev = 0; } else if (mode === 'review') { nNew = 0; nRev = 8; }
  let nw = fresh.slice(0, nNew), rev = due.slice(0, nRev);
  if (mode === 'mixed') {
    if (rev.length < nRev) nw = fresh.slice(0, Math.min(fresh.length, nNew + nRev - rev.length));
    if (nw.length < nNew) rev = due.slice(0, Math.min(due.length, nRev + nNew - nw.length));
  }
  let practice = false;
  if (!nw.length && !rev.length) {          // hết từ đến hạn -> luyện thêm các từ đã học
    rev = shuffle(list.filter(e => P[e.key])).slice(0, 8); practice = rev.length > 0;
  }
  return { nw, rev, practice };
}

async function startLesson(mode) {
  const { nw, rev, practice } = planSession(mode);
  if (!nw.length && !rev.length) return toast(mode === 'review' ? 'Chưa có từ nào để ôn – hãy học từ mới trước!' : 'Không còn từ nào trong chủ đề này.');
  const root = $('#lesson'); root.hidden = false; document.body.classList.add('noscroll');
  root.innerHTML = `<div class="prep"><div class="spinner"></div><h3>Đang chuẩn bị bài học…</h3><p id="prepmsg" class="muted">Tìm ảnh, phát âm, câu mẫu cho ${nw.length + rev.length} từ</p></div>`;
  const entries = [...nw, ...rev];
  const full = await enrichMany(entries, (d, n) => { const m = $('#prepmsg'); if (m) m.textContent = `Đã chuẩn bị ${d}/${n} từ…`; });
  const byKey = Object.fromEntries(full.map(w => [w.key, w]));
  const ctx = {
    vocab: Vocab.entries,
    viPool: Vocab.entries.map(e => ({ key: e.key, vi: byKey[e.key]?.vi || e.vi || cachedVi(e.key) }))
  };
  const items = [...nw.map(e => ({ w: byKey[e.key], box: 0, isNew: true })), ...rev.map(e => ({ w: byKey[e.key], box: Store.progress[e.key]?.box || 0, isNew: false }))];
  const queue = buildQueue(items, ctx);
  L = { queue, i: 0, hearts: 5, xp: 0, done: 0, ok: 0, tries: 0, res: {}, ctx, words: items.map(x => x.w), practice, mode };
  window.__imgFail = () => { if (cur()?.type === 'image') { L.queue.splice(L.i, 1); toast('Ảnh không tải được – chuyển câu khác'); step(); } };
  step();
}

const cur = () => L?.queue[L.i];

function step() {
  const ex = cur();
  if (!ex) return finishLesson(false);
  L.answered = false; L.sel = null;
  const left = L.queue.length - L.i, pct = Math.round(L.done / (L.done + left) * 100);
  const root = $('#lesson');
  root.innerHTML = `
  <div class="lhead"><button class="x" id="lq" aria-label="Thoát">✕</button><div class="pbar"><i style="width:${pct}%"></i></div><div class="hearts">❤️ ${L.hearts}</div></div>
  <div class="lbody" id="lb"></div>
  <footer class="lfoot" id="lf"><div class="fb" id="fb"></div><div class="fbtns"><button class="btn ghost" id="lskip" hidden></button><button class="btn green" id="lcheck" disabled>KIỂM TRA</button></div></footer>`;
  $('#lq').onclick = () => { if (confirm('Thoát bài học? Tiến độ bài này sẽ không được lưu.')) closeLesson(); };
  const body = $('#lb'), check = $('#lcheck'), skip = $('#lskip');
  const w = ex.w;
  const sayHandler = e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    if (b.dataset.act === 'say') pronounce(w); else if (b.dataset.act === 'slow') pronounce(w, Store.profile.accent, true);
  };

  if (ex.kind === 'teach') {
    body.innerHTML = `<h3 class="ltitle">✨ Từ mới</h3>${wordCardHTML(w)}`;
    bindWordCard(body, w);
    check.textContent = 'TIẾP TỤC'; check.disabled = false;
    check.onclick = () => { L.i++; L.done++; step(); };
    setTimeout(() => pronounce(w), 300);
    return;
  }

  if (ex.kind === 'choice') {
    body.innerHTML = `<h3 class="ltitle">${esc(ex.title)}</h3><div class="prompt">${ex.promptHTML}</div>
      <div class="opts">${ex.options.map((o, i) => `<button class="opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o.text)}</span></button>`).join('')}</div>`;
    body.addEventListener('click', sayHandler);
    $$('.opt', body).forEach(b => b.onclick = () => { if (L.answered) return; L.sel = +b.dataset.i; $$('.opt', body).forEach(x => x.classList.toggle('sel', x === b)); check.disabled = false; });
    check.onclick = () => {
      if (L.answered) return next();
      const o = ex.options[L.sel];
      $$('.opt', body).forEach((b, i) => { if (ex.options[i].correct) b.classList.add('right'); else if (i === L.sel) b.classList.add('wrong'); b.disabled = true; });
      settle(o.correct);
    };
  } else if (ex.kind === 'type') {
    body.innerHTML = `<h3 class="ltitle">${esc(ex.title)}</h3><div class="prompt">${ex.promptHTML}</div>
      <input id="tin" class="tin" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="Gõ đáp án bằng tiếng Anh…">`;
    const inp = $('#tin'); setTimeout(() => inp.focus(), 50);
    inp.oninput = () => { check.disabled = !inp.value.trim(); };
    inp.onkeydown = e => { if (e.key === 'Enter' && !check.disabled) check.click(); };
    skip.hidden = false; skip.textContent = 'TÔI KHÔNG BIẾT';
    skip.onclick = () => { inp.disabled = true; settle(false); };
    check.onclick = () => {
      if (L.answered) return next();
      const v = norm(inp.value); inp.disabled = true;
      const exact = ex.answers.includes(v);
      const near = !exact && v.length >= 6 && ex.answers.some(a => lev(a, v) === 1);
      settle(exact || near, near ? `Gần đúng! Chính tả đúng là: ${ex.reveal}` : '');
    };
  } else if (ex.kind === 'speak') {
    body.innerHTML = `<h3 class="ltitle">${esc(ex.title)}</h3><div class="prompt">${ex.promptHTML}</div>
      <div class="qlisten"><button class="chip" data-act="say">🔊 Nghe mẫu</button><button class="micbtn" id="micbtn">🎤</button></div><p class="muted center" id="micmsg">Nhấn micro rồi đọc to từ trên</p>`;
    body.addEventListener('click', sayHandler);
    skip.hidden = false; skip.textContent = 'KHÔNG NÓI ĐƯỢC LÚC NÀY';
    skip.onclick = () => { L.queue.splice(L.i, 1); step(); };
    $('#micbtn').onclick = async () => {
      if (L.answered) return; $('#micmsg').textContent = '🎙️ Đang nghe…';
      try {
        const alts = await listenOnce(); const ok = alts.some(a => a.includes(w.key));
        if (!alts.length) { $('#micmsg').textContent = 'Không nghe thấy gì, thử lại nhé.'; return; }
        settle(ok, ok ? '' : `Nghe được: “${alts[0]}”`);
      } catch { toast('Không dùng được micro – bỏ qua câu này'); L.queue.splice(L.i, 1); step(); }
    };
    check.textContent = 'TIẾP TỤC'; check.disabled = true;
    check.onclick = () => next();
  }
  if (ex.auto) setTimeout(() => { if (cur() === ex) pronounce(w); }, 250);
}

function settle(ok, note = '') {
  const ex = cur(), w = ex.w; L.answered = true;
  const r = L.res[w.key] ||= { bad: false };
  beep(ok);
  if (!ex.retry) { L.tries++; if (ok) { L.ok++; L.xp += 10; } }
  if (!ok) {
    r.bad = true; L.hearts--;
    if (L.hearts > 0) { const again = makeFor(w, 0, L.ctx, [ex.type]); if (again) { again.retry = true; L.queue.push(again); } }
  }
  const fb = $('#fb'), lf = $('#lf'), check = $('#lcheck');
  lf.className = 'lfoot ' + (ok ? 'ok' : 'bad');
  fb.innerHTML = ok
    ? `<b>✅ Chính xác! ${note ? '' : '+10 XP'}</b>${note ? `<div>${esc(note)}</div>` : ''}<div class="fbw">${esc(w.word)} ${esc(w.phonetic || '')} – ${esc(w.vi || '')} <button class="mini" id="fbsay">🔊</button></div>`
    : `<b>❌ Đáp án đúng: ${esc(ex.reveal)}</b>${note ? `<div>${esc(note)}</div>` : ''}<div class="fbw">${esc(w.word)} ${esc(w.phonetic || '')} – ${esc(w.vi || '')} <button class="mini" id="fbsay">🔊</button></div>`;
  $('#fbsay').onclick = () => pronounce(w);
  $('#lskip').hidden = true;
  $('#lb').querySelectorAll('input').forEach(i => i.disabled = true);
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
  const p = Store.profile, today = todayStr();
  const perfect = !failed && Object.values(L.res).every(r => !r.bad);
  const bonus = perfect ? 10 : 0, gained = L.xp + bonus;
  for (const [key, r] of Object.entries(L.res)) applyResult(key, r.bad);
  if (gained > 0) {
    p.xp += gained; p.xpByDay[today] = (p.xpByDay[today] || 0) + gained;
    if (p.lastDay !== today) { p.streak = p.lastDay === todayStr(new Date(Date.now() - DAY)) ? p.streak + 1 : 1; p.lastDay = today; }
    p.lessons++;
    Object.keys(p.xpByDay).sort().slice(0, -60).forEach(k => delete p.xpByDay[k]);
  }
  Store.save();
  const acc = L.tries ? Math.round(L.ok / L.tries * 100) : 0;
  const good = L.words.filter(w => !L.res[w.key]?.bad), weak = L.words.filter(w => L.res[w.key]?.bad);
  $('#lesson').innerHTML = `<div class="done">
    <div class="trophy">${failed ? '💔' : perfect ? '🏆' : '🎉'}</div>
    <h2>${failed ? 'Hết tim rồi – đừng nản nhé!' : perfect ? 'Hoàn hảo!' : 'Hoàn thành bài học!'}</h2>
    <div class="sum"><div class="card"><b>+${gained}</b><span>XP</span></div><div class="card"><b>${acc}%</b><span>Chính xác</span></div><div class="card"><b>🔥 ${p.streak}</b><span>Chuỗi ngày</span></div></div>
    ${good.length ? `<p class="gl">✅ Nhớ tốt: ${good.map(w => esc(w.word)).join(', ')}</p>` : ''}
    ${weak.length ? `<p class="gl">🔁 Cần ôn lại sớm: ${weak.map(w => esc(w.word)).join(', ')}</p>` : ''}
    <button class="btn green big" id="again">TIẾP TỤC HỌC</button><button class="btn ghost" id="home">VỀ TRANG CHỦ</button></div>`;
  $('#again').onclick = () => { const m = L.mode; closeLesson(); startLesson(m); };
  $('#home').onclick = closeLesson;
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

/* ===== Khởi động ===== */
$$('#tabs button').forEach(b => b.onclick = () => { tab = b.dataset.tab; renderAll(); scrollTo(0, 0); });
(async () => {
  $('#view').innerHTML = '<p class="loading">⏳ Đang tải danh sách từ vựng…</p>';
  await loadVocab();
  renderAll();
  if (!Vocab.entries.length) toast('Chưa có từ nào. Hãy mở app qua máy chủ web hoặc dùng "Tải file lên" ở tab Cài đặt.');
})();
