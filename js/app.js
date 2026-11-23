'use strict';
/* ===== Giao diện chính ===== */
let tab = 'road', topicFilter = 'all', search = '';

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
    <div class="pills"><span class="pill fire" title="Chuỗi ngày học liên tiếp">🔥 ${effectiveStreak()}</span><span class="pill xp" title="Tổng điểm XP">⭐ ${p.xp}</span><button class="pill coin" id="coinpill" title="Cửa hàng">🪙 ${p.coins}</button><span class="pill sync" id="syncpill" hidden></span></div>`;
  setSyncStatus(Sync.cfg() ? (Sync.status === 'off' ? 'ok' : Sync.status) : 'off');
  $('#coinpill').onclick = () => go('shop');
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
  ${petCardHTML()}
  <button class="btn ghost" id="toshop">🛍️ Cửa hàng – mua thú cưng & vật phẩm</button>
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
  <section class="card grammar"><h2>✏️ Ngữ pháp & cách dùng từ</h2>
    <p class="muted">10 câu mỗi bài: chọn đáp án, xếp câu, nghe câu mẫu. Tự ưu tiên chủ đề bạn hay sai.</p>
    <select id="gtopic"><option value="all">Tất cả chủ đề ngữ pháp</option>${G_TOPICS.map(t => { const st = gStat(t), n = st.ok + st.bad; return `<option value="${esc(t)}">${esc(t)}${n ? ` (${Math.round(st.ok / n * 100)}% đúng)` : ''}</option>`; }).join('')}</select>
    <button class="btn blue" id="gstart">▶ Luyện ngữ pháp</button></section>
  <p class="tip">💡 Mỗi bài ~10–15 phút gồm: thẻ từ mới (ảnh, phiên âm, câu mẫu, video) → trắc nghiệm → nghe → điền từ → xếp câu → viết → nói. Từ sai sẽ được ôn lại sớm hơn (lặp lại ngắt quãng).</p>`;
  $('#topic')?.addEventListener('change', e => { topicFilter = e.target.value; });
  $$('[data-start]').forEach(b => b.onclick = () => startLesson(b.dataset.start));
  $('#toshop').onclick = () => go('shop');
  $('#gstart').onclick = () => startGrammar($('#gtopic').value);
  $('#chest')?.addEventListener('click', openChest);
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
    <h2>🤖 Giám khảo AI (tùy chọn)</h2>
    <p>Dán API key của Claude để: <b>tạo đề Reading/Listening mới theo chủ đề bạn chọn</b>, chấm <b>Writing & Speaking</b> như giám khảo thật, nhận xét chi tiết bằng tiếng Việt. Key chỉ lưu trong trình duyệt của bạn (không gửi đi đâu ngoài Anthropic). Mỗi lần dùng bị tính phí theo tài khoản Anthropic (thường vài cent). Lấy key ở console.anthropic.com – <b>không dùng trên máy dùng chung</b>.</p>
    <input id="ai-key" type="password" autocomplete="off" placeholder="sk-ant-…" value="${esc(AI.cfg().key)}">
    <select id="ai-model">${AI_MODELS.map(([v, n]) => `<option value="${v}" ${AI.cfg().model === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
    <div class="row2"><button class="btn blue" id="ai-save">Lưu & kiểm tra</button><button class="btn ghost" id="ai-clear">Xóa key</button></div>
    <p class="muted" id="ai-msg">${AI.has() ? '✅ Đã bật AI.' : 'Chưa bật – app vẫn dùng đề có sẵn và chấm ước lượng.'}</p>
  </section>
  <section class="card" id="voicecard">
    <h2>🔊 Giọng đọc tiếng Anh</h2>
    <p>Giọng nghe “dở” thường do thiết bị đang dùng giọng máy mặc định. App đã tự chọn giọng tốt nhất đang có; bạn có thể đổi bên dưới và bấm Nghe thử.</p>
    ${voiceSettingsHTML()}
  </section>
  <section class="card">
    <h2>🖼️ Ảnh minh họa đẹp hơn (tùy chọn)</h2>
    <p>Ảnh tự động đôi khi không sát nghĩa với từ trừu tượng. Bạn luôn có thể bấm <b>🔎 Tìm ảnh</b> ở thẻ từ để chọn ảnh khác. Thêm key Pixabay (miễn phí, pixabay.com/api/docs) để có nhiều ảnh đẹp, chuyên nghiệp hơn.</p>
    <input id="px-key" type="password" autocomplete="off" placeholder="Pixabay API key" value="${esc(LS.get('ielts.keys', {}).pixabay || '')}">
    <button class="btn blue" id="px-save">Lưu key Pixabay</button>
  </section>
  <section class="card">
    <h2>☁️ Đồng bộ iPad ↔ điện thoại</h2>
    <p>Học trên thiết bị nào cũng giữ nguyên tiến độ, XP, xu, thú cưng, lịch sử thi. Dữ liệu được <b>mã hóa trên máy bạn</b> bằng mật khẩu trước khi gửi đi. Cần 1 lần thiết lập máy chủ miễn phí (xem README, mục “Đồng bộ”). Ở mỗi thiết bị, nhập cùng một địa chỉ, ID và mật khẩu.</p>
    <input id="sy-url" type="url" placeholder="Địa chỉ máy chủ, ví dụ https://ielts-sync.ten-ban.workers.dev" value="${esc(Sync.cfg()?.url || '')}">
    <input id="sy-id" type="text" autocapitalize="none" placeholder="ID của bạn (3–64 ký tự, vd: lan-ielts-2026)" value="${esc(Sync.cfg()?.id || '')}">
    <input id="sy-pw" type="password" placeholder="Mật khẩu (ghi nhớ kỹ – mất là không khôi phục được)">
    <div class="row2"><button class="btn green" id="sy-go">${Sync.cfg() ? 'Kết nối lại' : 'Kết nối & đồng bộ'}</button><button class="btn ghost" id="sy-now" ${Sync.cfg() ? '' : 'disabled'}>Đồng bộ ngay</button></div>
    ${Sync.cfg() ? '<button class="btn ghost" id="sy-off">Ngắt kết nối thiết bị này</button>' : ''}
    <p class="sync-status" id="sy-msg">${Sync.cfg() ? (Sync.status === 'err' ? '⚠️ ' + esc(Sync.err) : '☁️ Đã kết nối ID “' + esc(Sync.cfg().id) + '”') : ''}</p>
    <h3>Cách không cần máy chủ: mã đồng bộ</h3>
    <p class="muted">Sao chép mã ở thiết bị này → gửi qua Zalo/Messenger/Ghi chú → dán vào thiết bị kia. Hai bên sẽ được gộp lại.</p>
    <div class="row2"><button class="btn blue" id="sy-copy">📋 Sao chép mã của tôi</button><button class="btn purple" id="sy-paste">📥 Nhập mã</button></div>
    <textarea id="sy-code" rows="2" placeholder="Dán mã IELTS1:… vào đây rồi bấm Nhập mã"></textarea>
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
  bindVoiceSettings();
  $('#ai-save').onclick = async () => {
    const key = $('#ai-key').value.trim(), m = $('#ai-msg'); AI.save({ key, model: $('#ai-model').value });
    if (!key) { m.textContent = 'Đã tắt AI.'; return; }
    m.textContent = 'Đang kiểm tra key…';
    try { await aiCall({ system: 'Reply with the single word OK.', user: 'ping', max: 50, effort: 'low' }); m.textContent = '✅ Key hợp lệ – đã bật AI.'; }
    catch (e) { m.textContent = '❌ Không dùng được: ' + e.message; }
  };
  $('#ai-clear').onclick = () => { AI.save({ key: '', model: $('#ai-model').value }); $('#ai-key').value = ''; $('#ai-msg').textContent = 'Đã xóa key.'; };
  $('#px-save').onclick = () => { const k = LS.get('ielts.keys', {}); k.pixabay = $('#px-key').value.trim(); LS.set('ielts.keys', k); clearCache(); toast('Đã lưu. Ảnh sẽ được tải lại khi học.'); };
  $('#sy-go').onclick = async () => {
    const url = $('#sy-url').value.trim(), id = $('#sy-id').value.trim(), pw = $('#sy-pw').value, m = $('#sy-msg');
    if (!/^https:\/\//.test(url) || !/^[A-Za-z0-9_.-]{3,64}$/.test(id) || pw.length < 6) { m.textContent = '⚠️ Cần địa chỉ https://…, ID 3–64 ký tự (chữ/số/-_.) và mật khẩu ≥ 6 ký tự.'; return; }
    m.textContent = 'Đang kết nối…';
    try { const ok = await connectSync(url, id, pw); m.textContent = ok ? '✅ Đã đồng bộ!' : '⚠️ ' + Sync.err; if (ok) viewSettings(); } catch (e) { m.textContent = '⚠️ ' + e.message; }
  };
  $('#sy-now').onclick = async () => { $('#sy-msg').textContent = 'Đang đồng bộ…'; const ok = await syncNow(); $('#sy-msg').textContent = ok ? '✅ Đã đồng bộ lúc ' + new Date().toLocaleTimeString() : '⚠️ ' + Sync.err; };
  $('#sy-off')?.addEventListener('click', () => { disconnectSync(); viewSettings(); });
  $('#sy-copy').onclick = async () => { const c = await packCode(); try { await navigator.clipboard.writeText(c); toast('Đã sao chép mã đồng bộ'); } catch { $('#sy-code').value = c; toast('Hãy sao chép mã trong ô bên dưới'); } };
  $('#sy-paste').onclick = async () => { try { await importCode($('#sy-code').value); toast('Đã nhập & gộp dữ liệu'); } catch (e) { toast('Mã không hợp lệ'); } };
  $('#reset').onclick = () => {
    if (!confirm('Xóa toàn bộ tiến độ, XP và chuỗi ngày học?')) return;
    LS.del('ielts.progress'); LS.del('ielts.profile'); location.reload();
  };
}

/* ---------- Cài đặt giọng đọc ---------- */
function voiceSettingsHTML() {
  const c = Voice.cfg(), vs = Voice.voices();
  const opt = (lang, cur) => { const r = Voice.ranked(lang);
    return `<option value="">Tự động chọn giọng tốt nhất${r[0] ? ' (hiện tại: ' + esc(r[0].name) + ')' : ''}</option>` + r.map(v => `<option value="${esc(v.name)}" ${cur === v.name ? 'selected' : ''}>${esc(v.name)} · ${esc(v.lang)}${Voice.score(v, lang) >= 100 ? ' ⭐' : ''}</option>`).join(''); };
  const best = Voice.ranked('en-US')[0];
  const weak = !best || Voice.score(best, 'en-US') < 50;
  return `
  ${vs.length ? '' : '<p class="bad">⚠️ Chưa thấy giọng tiếng Anh nào trên thiết bị/trình duyệt này.</p>'}
  ${weak ? `<div class="card warnc"><b>Máy bạn chưa có giọng tự nhiên.</b> Cách cải thiện (miễn phí):<ul>
    <li><b>iPhone/iPad:</b> Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Anh → tải giọng <i>Enhanced</i> hoặc <i>Premium</i> (vd: Ava, Samantha, Daniel).</li>
    <li><b>Windows/Mac/Android:</b> dùng trình duyệt <b>Microsoft Edge</b> – có sẵn giọng “Natural/Online” rất tự nhiên (Aria, Jenny, Guy, Sonia…). Chrome có giọng “Google US English”.</li>
    <li>Hoặc dùng giọng AI tự nhiên ở bên dưới.</li></ul></div>` : ''}
  <label class="field">Giọng Mỹ (US)<select id="vo-us">${opt('en-US', c.us)}</select></label><button class="btn ghost sm" id="vo-t-us">▶ Nghe thử giọng Mỹ</button>
  <label class="field">Giọng Anh (UK)<select id="vo-uk">${opt('en-GB', c.uk)}</select></label><button class="btn ghost sm" id="vo-t-uk">▶ Nghe thử giọng Anh</button>
  <label class="field">Tốc độ đọc<input id="vo-rate" type="range" min=".7" max="1.1" step=".05" value="${c.rate}"></label>
  <label class="field">Phát âm từ đơn<select id="vo-src"><option value="human" ${c.wordSrc === 'human' ? 'selected' : ''}>Ưu tiên giọng người thật của từ điển</option><option value="tts" ${c.wordSrc === 'tts' ? 'selected' : ''}>Luôn dùng giọng đã chọn ở trên (đều giọng)</option></select></label>
  <h3>Giọng AI tự nhiên (tùy chọn)</h3>
  <p class="muted">Dùng ElevenLabs (elevenlabs.io): giọng rất tự nhiên cho cả từ và câu. Có gói miễn phí giới hạn số ký tự mỗi tháng. Mỗi câu chỉ tính phí lần đầu, sau đó được lưu trong máy. Key chỉ lưu trên thiết bị này. Nếu lỗi, app tự quay lại giọng trình duyệt.</p>
  <label class="field">Dùng giọng<select id="vo-eng"><option value="browser" ${c.engine !== 'eleven' ? 'selected' : ''}>Giọng của thiết bị/trình duyệt</option><option value="eleven" ${c.engine === 'eleven' ? 'selected' : ''}>Giọng AI ElevenLabs</option></select></label>
  <input id="vo-ekey" type="password" autocomplete="off" placeholder="ElevenLabs API key" value="${esc(c.eleven.key)}">
  <div class="row2"><input id="vo-eus" placeholder="Voice ID giọng Mỹ" value="${esc(c.eleven.us)}"><input id="vo-euk" placeholder="Voice ID giọng Anh" value="${esc(c.eleven.uk)}"></div>
  <button class="btn blue sm" id="vo-t-el">▶ Nghe thử giọng AI</button>`;
}
function bindVoiceSettings() {
  if (!$('#vo-us')) return;
  const save = () => {
    const c = Voice.cfg();
    Voice.save({ ...c, us: $('#vo-us').value, uk: $('#vo-uk').value, rate: +$('#vo-rate').value, wordSrc: $('#vo-src').value, engine: $('#vo-eng').value,
      eleven: { key: $('#vo-ekey').value.trim(), us: $('#vo-eus').value.trim() || c.eleven.us, uk: $('#vo-euk').value.trim() || c.eleven.uk } });
  };
  $$('#voicecard select, #voicecard input').forEach(el => el.onchange = save);
  // Chọn giọng cụ thể thì áp dụng luôn cho từ đơn (không dùng file thu sẵn của từ điển nữa)
  ['#vo-us', '#vo-uk'].forEach(sel => $(sel).addEventListener('change', () => { if ($('#vo-src').value !== 'tts') $('#vo-src').value = 'tts'; save(); }));
  const demo = 'Governments must act now to mitigate the effects of climate change.';
  $('#vo-t-us').onclick = () => { save(); const c = Voice.cfg(); Voice.stop(); Voice.browserLine(demo, 'en-US', c.rate); };
  $('#vo-t-uk').onclick = () => { save(); const c = Voice.cfg(); Voice.stop(); Voice.browserLine(demo, 'en-GB', c.rate); };
  $('#vo-t-el').onclick = async () => {
    save(); const c = Voice.cfg(); if (!c.eleven.key) return toast('Hãy nhập ElevenLabs API key trước.');
    try { toast('Đang tạo giọng AI…'); Voice.stop(); await Voice.playBlob(await Voice.elevenBlob(demo, c.eleven.us)); }
    catch (e) { toast('Giọng AI lỗi: ' + e.message); }
  };
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { if (tab === 'settings' && $('#voicecard')) { $('#voicecard').innerHTML = '<h2>🔊 Giọng đọc tiếng Anh</h2>' + voiceSettingsHTML(); bindVoiceSettings(); } };
}

function renderAll() {
  renderTop();
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  ({ road: viewRoad, home: viewHome, speaking: viewSpeaking, exam: viewExam, words: viewWords, shop: viewShop, settings: viewSettings })[tab]();
}

/* ============ Thẻ từ vựng giàu nội dung (dùng cho bài học & xem chi tiết) ============ */
const hl = (en, word) => esc(en).replace(stemRe(word, 'i'), m => `<mark>${m}</mark>`);

function wordCardHTML(w) {
  const img = w.images?.[0];
  const q = encodeURIComponent(w.word);
  return `<div class="wcard">
  <div class="wimg">${img ? `<img src="${esc(img.src)}" alt="" referrerpolicy="no-referrer" data-i="0" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'noimg',textContent:'🖼️'}))">` : `<div class="noimg">${esc(w.word[0].toUpperCase())}</div>`}
    <div class="imgbtns">${w.images?.length > 1 ? `<button class="chip sm" data-act="nextimg">🔄 Ảnh khác</button>` : ''}<button class="chip sm" data-act="findimg">🔎 Tìm ảnh</button></div>
    <small class="credit">${img?.pinned ? '📌 Ảnh bạn đã chọn · ' : 'Ảnh gợi ý tự động (có thể chưa sát nghĩa – bấm “Tìm ảnh” để chọn ảnh khác) · '}${esc(img?.credit || '')}</small></div>
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
    } else if (act === 'findimg') {
      openImagePicker(w, im => { const el = $('.wimg img', root); if (el) el.src = im.src; else $('.noimg', root)?.replaceWith(Object.assign(document.createElement('img'), { src: im.src, referrerPolicy: 'no-referrer' })); $('.credit', root).textContent = '📌 Ảnh bạn đã chọn · ' + (im.credit || ''); });
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

/* ---------- Chọn ảnh minh họa cho 1 từ ---------- */
function pinImage(w, im) {
  const pk = LS.get('ielts.imgpick', {}); pk[w.key] = { src: im.local ? 'idb:' + w.key : im.src, credit: im.credit || '', link: im.link || '' };
  LS.set('ielts.imgpick', pk); window.onStoreSave?.();
  w.images = [{ ...pk[w.key], pinned: true }, ...(w.images || []).filter(i => i.src !== im.src && !i.pinned)];
}
function openImagePicker(w, onPick) {
  const d = document.createElement('div'); d.className = 'popup';
  d.innerHTML = `<div class="pbox wide"><h3>Chọn ảnh cho “${esc(w.word)}”</h3>
    <div class="searchbar"><input id="ip-q" value="${esc(w.word)}" placeholder="Từ khóa tiếng Anh"><button class="btn blue sm" id="ip-go">Tìm</button></div>
    <p class="muted">Mẹo: từ trừu tượng nên tìm bằng từ cụ thể hơn (vd: “flood”, “solar panel” cho <i>mitigate</i>). Bấm vào ảnh để chọn.</p>
    <div class="imggrid" id="ip-grid"><p class="muted">Đang tìm…</p></div>
    <h4>Dùng ảnh của bạn</h4>
    <div class="pastebox" id="ip-paste" contenteditable="true" inputmode="none" data-ph="📋 Dán ảnh vào đây: chạm vào ô này rồi chọn “Dán / Paste” (hoặc bấm Ctrl+V)"></div>
    <div class="row2"><button class="btn blue sm" id="ip-file-btn">📁 Chọn ảnh từ máy / chụp ảnh</button><button class="btn purple sm" id="ip-clip">📋 Dán từ bộ nhớ tạm</button></div>
    <input type="file" id="ip-file" accept="image/*" hidden>
    <input id="ip-url" placeholder="…hoặc dán link ảnh (https://…)"><div class="row2"><button class="btn green sm" id="ip-use">Dùng link này</button><button class="btn ghost sm" id="ip-close">Đóng</button></div>
    ${LS.get('ielts.imgpick', {})[w.key] ? '<button class="btn danger sm" id="ip-clear">Bỏ ảnh đã chọn (dùng ảnh tự động)</button>' : ''}</div>`;
  document.body.appendChild(d);
  const pick = im => { pinImage(w, im); onPick(im); close(); toast('Đã chọn ảnh này cho từ “' + w.word + '”'); };
  const search = async () => {
    const g = $('#ip-grid', d); g.innerHTML = '<p class="muted">Đang tìm…</p>';
    const list = (await searchImages($('#ip-q', d).value.trim() || w.word)).slice(0, 18);
    g.innerHTML = list.length ? list.map((im, i) => `<button class="gi" data-i="${i}"><img src="${esc(im.src)}" alt="" referrerpolicy="no-referrer" loading="lazy"></button>`).join('') : '<p class="muted">Không tìm thấy ảnh. Thử từ khóa khác (hoặc thêm khóa Pixabay ở Cài đặt để có nhiều ảnh đẹp hơn).</p>';
    $$('.gi', g).forEach(b => b.onclick = () => pick(list[+b.dataset.i]));
  };
  const useBlob = async blob => {
    try {
      if (!blob || !/^image\//.test(blob.type)) return toast('Đây không phải file ảnh.');
      const out = await Imgs.fromBlob(blob); await Imgs.put(w.key, out);
      pick({ src: Imgs.url(w.key), credit: 'Ảnh của bạn', link: '', local: true });
    } catch (e) { toast('Không đọc được ảnh này – thử ảnh khác (JPG/PNG).'); }
  };
  const fromClip = e => { const f = [...(e.clipboardData?.files || [])].find(x => /^image\//.test(x.type)) || [...(e.clipboardData?.items || [])].find(x => /^image\//.test(x.type))?.getAsFile(); if (f) { e.preventDefault(); useBlob(f); } };
  const docPaste = e => fromClip(e);
  document.addEventListener('paste', docPaste);
  const close = () => { document.removeEventListener('paste', docPaste); d.remove(); };
  $('#ip-paste', d).addEventListener('paste', fromClip);
  $('#ip-paste', d).addEventListener('input', e => { e.target.innerHTML = ''; });
  $('#ip-file-btn', d).onclick = () => $('#ip-file', d).click();
  $('#ip-file', d).onchange = e => { const f = e.target.files[0]; if (f) useBlob(f); };
  $('#ip-clip', d).onclick = async () => {
    try { for (const it of await navigator.clipboard.read()) { const t = it.types.find(x => /^image\//.test(x)); if (t) return useBlob(await it.getType(t)); } toast('Bộ nhớ tạm chưa có ảnh – hãy sao chép ảnh trước.'); }
    catch { toast('Trình duyệt chưa cho đọc bộ nhớ tạm – hãy chạm vào ô “Dán ảnh vào đây” rồi chọn Dán.'); }
  };
  $('#ip-clear', d)?.addEventListener('click', async () => { const pk = LS.get('ielts.imgpick', {}); delete pk[w.key]; LS.set('ielts.imgpick', pk); await Imgs.remove(w.key); w.images = (w.images || []).filter(i => !i.pinned); window.onStoreSave?.(); close(); toast('Đã bỏ ảnh bạn chọn.'); });
  $('#ip-go', d).onclick = search; $('#ip-q', d).onkeydown = e => { if (e.key === 'Enter') search(); };
  $('#ip-use', d).onclick = () => { const u = $('#ip-url', d).value.trim(); if (/^https?:\/\//.test(u)) pick({ src: u, credit: 'Ảnh của bạn', link: '' }); else toast('Link ảnh phải bắt đầu bằng https://'); };
  $('#ip-close', d).onclick = close;
  search();
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

/* ============ BÀI HỌC TỪ VỰNG ============ */
function planSession(mode) {
  const now = Date.now(), P = Store.progress;
  const list = Vocab.entries.filter(e => topicFilter === 'all' || e.topic === topicFilter);
  const due = list.filter(e => P[e.key] && P[e.key].due <= now).sort((a, b) => P[a.key].due - P[b.key].due);
  const fresh = list.filter(e => !P[e.key]).sort((a, b) => roadRank(a) - roadRank(b));   // ưu tiên theo thứ tự lộ trình
  let nNew = 3, nRev = 5;
  if (mode === 'new') { nNew = 6; nRev = 0; } else if (mode === 'review') { nNew = 0; nRev = 8; }
  let nw = fresh.slice(0, nNew), rev = due.slice(0, nRev);
  if (mode === 'mixed') {
    if (rev.length < nRev) nw = fresh.slice(0, Math.min(fresh.length, nNew + nRev - rev.length));
    if (nw.length < nNew) rev = due.slice(0, Math.min(due.length, nRev + nNew - nw.length));
  }
  if (!nw.length && !rev.length) rev = shuffle(list.filter(e => P[e.key])).slice(0, 8);   // hết từ đến hạn -> luyện thêm
  return { nw, rev };
}

async function startLesson(mode) {
  const { nw, rev } = planSession(mode);
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
  root.hidden = true; document.body.classList.remove('noscroll');
  runLesson({ queue: buildQueue(items, ctx), words: items.map(x => x.w), ctx, kind: 'vocab', mode, redo: startLesson });
}

/* ===== Khởi động ===== */
$$('#tabs button').forEach(b => b.onclick = () => { tab = b.dataset.tab; renderAll(); scrollTo(0, 0); });
function go(t) { tab = t; renderAll(); scrollTo(0, 0); }
(async () => {
  $('#view').innerHTML = '<p class="loading">⏳ Đang tải danh sách từ vựng…</p>';
  await Imgs.load().catch(() => { });
  await loadVocab();
  renderAll();
  if (Sync.cfg()) syncNow();
  if (!Vocab.entries.length) toast('Chưa có từ nào. Hãy mở app qua máy chủ web hoặc dùng "Tải file lên" ở tab Cài đặt.');
})();
