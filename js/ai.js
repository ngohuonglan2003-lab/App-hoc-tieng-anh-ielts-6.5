'use strict';
/* ===== Giám khảo AI (tùy chọn) + chấm điểm ước lượng không cần AI + quy đổi band =====
   Có API key Claude: tạo đề mới theo chủ đề + chấm Nói/Viết như giám khảo.
   Không có key: dùng ngân hàng đề có sẵn + chấm ước lượng thô (hoặc sao chép nhờ Claude chấm). */

const AI_MODELS = [
  ['claude-opus-5-5', 'Claude Opus 5.5 – chính xác nhất (mặc định)'],
  ['claude-sonnet-5-5', 'Claude Sonnet 5.5 – cân bằng, rẻ hơn'],
  ['claude-haiku-5-5', 'Claude Haiku 5.5 – nhanh & rẻ nhất']
];
const AI = {
  cfg() { return Object.assign({ key: '', model: 'claude-opus-5-5' }, LS.get('ielts.ai', {})); },
  has() { return !!this.cfg().key; },
  save(c) { LS.set('ielts.ai', c); }
};

/* Gọi trực tiếp Messages API từ trình duyệt (key nằm trong máy bạn) */
async function aiCall({ system, user, max = 12000, effort = 'medium' }) {
  const c = AI.cfg(); if (!c.key) throw new Error('NO_KEY');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': c.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: c.model, max_tokens: max, system, output_config: { effort }, messages: [{ role: 'user', content: user }] })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error?.message || ('Lỗi HTTP ' + r.status));
  if (j.stop_reason === 'refusal') throw new Error('Mô hình từ chối yêu cầu này. Hãy thử chủ đề khác.');
  if (j.stop_reason === 'max_tokens') throw new Error('Câu trả lời bị cắt do quá dài – hãy thử lại.');
  return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
}
function extractJSON(t) {
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('Không đọc được kết quả từ AI.');
  return JSON.parse(t.slice(a, b + 1));
}
async function aiJSON(opts) {
  for (let i = 0; ; i++) {
    try { return extractJSON(await aiCall(opts)); }
    catch (e) { if (i >= 1 || !(e instanceof SyntaxError || /Không đọc được/.test(e.message))) throw e; }
  }
}

/* ---------- Quy đổi điểm thô -> band (bảng Academic công bố rộng rãi) ---------- */
const BAND_L = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5]];
const BAND_R = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5]];
function rawToBand(skill, raw, total) {
  const s = Math.round(raw / total * 40);
  for (const [m, b] of (skill === 'L' ? BAND_L : BAND_R)) if (s >= m) return b;
  return 2;
}
const roundBand = x => Math.round(x * 2) / 2;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ---------- Ước lượng thô khi không có AI ---------- */
function textStats(text, learned = []) {
  const toks = tokens(text), n = toks.length, types = new Set(toks).size, lo = text.toLowerCase();
  const sentences = Math.max(1, text.split(/[.!?]+/).filter(s => s.trim()).length);
  const cnt = re => (lo.match(re) || []).length;
  return {
    n, guiraud: n ? types / Math.sqrt(n) : 0, sentences, avgSent: n / sentences,
    fillers: cnt(/\b(um+|uh+|er+|erm|ah+|you know|i mean|kind of|sort of|basically)\b/g),
    linkers: cnt(/\b(however|moreover|furthermore|therefore|in addition|for example|for instance|on the other hand|although|whereas|nevertheless|as a result|in conclusion|firstly|secondly|finally|consequently|despite|while|because|so that|in contrast)\b/g),
    longRatio: n ? toks.filter(t => t.length >= 8).length / n : 0,
    learnedUsed: learned.filter(w => lo.includes(w.toLowerCase()))
  };
}
const ESTIMATE_NOTE = 'Đây là ước lượng THÔ dựa trên số liệu văn bản (độ dài, đa dạng từ, từ nối, tốc độ nói…), không thể đánh giá ngữ pháp/ý tưởng như giám khảo thật. Để chấm chính xác hãy dùng AI (Cài đặt) hoặc bấm “Sao chép nhờ Claude chấm”.';

function heuristicSpeaking(answers, learned) {
  const all = answers.map(a => a.answer).join(' '), s = textStats(all, learned);
  const secs = answers.reduce((a, x) => a + (x.seconds || 0), 0), wpm = secs > 5 ? s.n / secs * 60 : 0;
  const per = s.n ? s.fillers / s.n * 100 : 0;
  const avgLen = s.n / Math.max(1, answers.length);
  let fluency = 5 + clamp(avgLen / 40, 0, 1.5) + (wpm ? clamp((Math.min(wpm, 160) - 80) / 80, 0, 1) : .3) - clamp(per / 4, 0, 1.2) + clamp(s.linkers / 6, 0, .5);
  let lexical = 4.5 + clamp((s.guiraud - 4.5) / 4, 0, 1) * 1.6 + clamp(s.longRatio * 6, 0, .8) + clamp(s.learnedUsed.length * .15, 0, .6);
  let grammar = 5 + clamp((s.avgSent - 6) / 14, 0, 1) * 1 + clamp(s.linkers / 8, 0, .6) + (avgLen > 25 ? .3 : 0);
  const conf = answers.map(a => a.conf).filter(Boolean), ac = conf.length ? conf.reduce((a, b) => a + b, 0) / conf.length : 0;
  let pron = ac ? 4.5 + clamp((ac - .5) / .45, 0, 1) * 2.5 : (fluency + lexical) / 2;
  [fluency, lexical, grammar, pron] = [fluency, lexical, grammar, pron].map(x => roundBand(clamp(x, 3.5, 6.5)));   // ước lượng thô không cho điểm cao hơn 6.5
  if (avgLen < 15) fluency = Math.min(fluency, 5);
  const overall = roundBand((fluency + lexical + grammar + pron) / 4);
  const improve = [];
  if (avgLen < 25) improve.push('Câu trả lời còn ngắn – mỗi câu Part 1 nên 2–4 câu (25–40 từ), Part 2 nên nói đủ 1,5–2 phút (≈ 200 từ).');
  if (per > 3) improve.push('Còn nhiều từ đệm (um, uh, you know…) – hãy thay bằng cụm nghĩ thời gian như “Well, let me think…”, “That’s an interesting question”.');
  if (s.linkers < 2) improve.push('Dùng thêm từ nối (however, for example, as a result, on the other hand) để bài nói mạch lạc hơn.');
  if (!s.learnedUsed.length && learned.length) improve.push('Chưa dùng từ vựng nào bạn đã học – hãy chủ động lồng từ mới vào câu trả lời!');
  return {
    estimated: true, fluency, lexical, grammar, pronunciation: pron, overall,
    summary: `Ước lượng khoảng ${overall} (±0.5). ${wpm ? `Tốc độ nói ≈ ${Math.round(wpm)} từ/phút. ` : ''}Dùng ${s.learnedUsed.length} từ vựng đã học.`,
    strengths: [s.learnedUsed.length ? `Đã dùng từ đã học: ${s.learnedUsed.slice(0, 6).join(', ')}` : '', s.linkers >= 3 ? 'Có sử dụng từ nối' : ''].filter(Boolean),
    improve, corrections: [], note: ESTIMATE_NOTE
  };
}

function heuristicWriting(text, task, learned) {
  const s = textStats(text, learned), min = task === 1 ? 150 : 250;
  const paras = text.split(/\n\s*\n/).filter(x => x.trim()).length;
  const lenFactor = clamp(s.n / min, 0, 1);
  let ta = 4 + lenFactor * 2 + (paras >= (task === 1 ? 3 : 4) ? .5 : 0);
  let cc = 4.5 + clamp(s.linkers / (s.n / 100 * 1.2 || 1), 0, 1) * 1.2 + (paras >= 4 ? .5 : 0) + lenFactor * .5;
  let lr = 4.5 + clamp((s.guiraud - 5) / 4, 0, 1) * 1.5 + clamp(s.longRatio * 5, 0, .7) + clamp(s.learnedUsed.length * .12, 0, .5);
  let gra = 5 + clamp((s.avgSent - 10) / 12, 0, 1) * 1.2 + clamp(s.linkers / 8, 0, .5) + lenFactor * .3;
  [ta, cc, lr, gra] = [ta, cc, lr, gra].map(x => roundBand(clamp(x, 3.5, 6.5)));
  if (s.n < min) [ta, cc, lr, gra] = [ta, cc, lr, gra].map(x => Math.min(x, 5.5));   // thiếu số từ tối thiểu bị trừ điểm
  const improve = [];
  if (s.n < min) improve.push(`Bài mới ${s.n} từ, cần tối thiểu ${min} từ – thiếu từ sẽ bị trừ điểm Task ${task === 1 ? 'Achievement' : 'Response'}.`);
  if (paras < (task === 1 ? 3 : 4)) improve.push(`Chia bài thành ${task === 1 ? '3–4' : '4–5'} đoạn rõ ràng (mở bài, thân bài, kết luận).`);
  if (s.linkers < 3) improve.push('Ít từ nối – thêm However, Moreover, As a result, For instance…');
  if (s.avgSent < 12) improve.push('Câu còn ngắn – thử dùng câu phức (mệnh đề quan hệ, although/while).');
  if (!s.learnedUsed.length && learned.length) improve.push('Chưa dùng từ vựng nào bạn đã học – hãy lồng vào bài viết!');
  return {
    estimated: true, ta, cc, lr, gra, overall: roundBand((ta + cc + lr + gra) / 4),
    summary: `Ước lượng khoảng ${roundBand((ta + cc + lr + gra) / 4)} (±0.5). ${s.n} từ, ${paras} đoạn, dùng ${s.learnedUsed.length} từ đã học.`,
    strengths: [s.learnedUsed.length ? `Đã dùng từ đã học: ${s.learnedUsed.slice(0, 6).join(', ')}` : ''].filter(Boolean), improve, corrections: [], note: ESTIMATE_NOTE
  };
}

/* ---------- Prompt cho AI ---------- */
const SYS_EXAMINER = `You are a certified, strict-but-fair IELTS examiner and teacher. Score with the official IELTS public band descriptors in 0.5 steps and DO NOT inflate scores: most learners score 5.0-6.5. Write all feedback (summary, strengths, improve, why) in Vietnamese, but keep quoted learner sentences and corrections in English. Reply with ONE valid JSON object only, no markdown.`;

function speakingPrompt(answers, learned) {
  const conf = answers.map(a => a.conf).filter(Boolean), ac = conf.length ? (conf.reduce((a, b) => a + b, 0) / conf.length).toFixed(2) : 'n/a';
  return `Grade this IELTS Speaking test. The transcripts come from browser speech recognition (no punctuation/capitalisation - never penalise that). Pronunciation cannot be heard, so estimate it provisionally from the average recognition confidence (${ac}) and say it is provisional.
Target vocabulary the learner is studying (reward natural use): ${learned.slice(0, 40).join(', ') || 'none'}.

ANSWERS (JSON):
${JSON.stringify(answers.map(a => ({ part: a.part, question: a.q, seconds: Math.round(a.seconds || 0), answer: a.answer })))}

Return JSON: {"fluency":number,"lexical":number,"grammar":number,"pronunciation":number,"overall":number,"summary":"2-3 sentences Vietnamese","strengths":["..."],"improve":["actionable Vietnamese tips"],"corrections":[{"original":"learner sentence","better":"improved English sentence","why":"short Vietnamese reason"}],"model_answer":"a band-7 model answer in English to the learner's weakest question","vocab_suggestions":[{"word":"upgrade word/collocation","use":"example sentence"}]}`;
}

function writingPrompt(task, prompt, text, learned, chart) {
  const crit = task === 1 ? 'Task Achievement' : 'Task Response';
  return `Grade this IELTS Academic Writing Task ${task} response using the four criteria: ${crit}, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy. Word count: ${tokens(text).length}. Penalise if under ${task === 1 ? 150 : 250} words.
Target vocabulary the learner is studying (reward natural use): ${learned.slice(0, 40).join(', ') || 'none'}.
TASK: ${prompt}${chart ? '\nDATA: ' + JSON.stringify(chart) : ''}

ESSAY:
${text}

Return JSON: {"ta":number,"cc":number,"lr":number,"gra":number,"overall":number,"summary":"2-3 sentences Vietnamese","strengths":["..."],"improve":["actionable Vietnamese tips"],"corrections":[{"original":"sentence from essay","better":"improved sentence","why":"short Vietnamese reason"}],"upgrade_paragraph":"rewrite the weakest paragraph at band 7+ in English"}`;
}

/* Tạo bài đọc/nghe */
const GROUPS_SCHEMA = `"groups":[
 {"type":"tfng","instruction":"Do the following statements agree with the information given in the passage? Write TRUE, FALSE or NOT GIVEN.","qs":[{"q":"statement","a":"TRUE","explain":"Vietnamese explanation citing the evidence"}]},
 {"type":"mcq","instruction":"Choose the correct letter, A, B, C or D.","qs":[{"q":"question","options":["A ...","B ...","C ...","D ..."],"a":"B","explain":"..."}]},
 {"type":"fill","instruction":"Complete the sentences. Write NO MORE THAN TWO WORDS.","qs":[{"q":"sentence with ______","a":"answer","alts":[],"explain":"..."}]}
]`;

function readingGenPrompt(topic, level, learned) {
  const band = ['5.0-6.0', '6.0-7.0', '7.0-8.0'][level - 1];
  return `Write ONE original IELTS Academic Reading passage (about 750 words, 5-6 paragraphs labelled A-F) on the topic "${topic}", at difficulty equivalent to IELTS band ${band} (passage ${level} of 3 in a real test). Use academic register, abstract ideas, and paraphrase between text and questions like the real exam. Naturally weave in several of these words if suitable: ${learned.slice(0, 15).join(', ') || 'none'}.
Then write 13 questions in the real IELTS style: 5 True/False/Not Given, 4 multiple choice (4 options), 4 sentence completion (NO MORE THAN TWO WORDS, answer must appear in passage). Answers must be unambiguous. "explain" in Vietnamese.
Return JSON only: {"title":"...","paragraphs":[{"label":"A","text":"..."}],${GROUPS_SCHEMA}}`;
}

function listeningGenPrompt(section, topic, learned) {
  const kinds = ['a phone conversation between two people about a practical booking or enquiry (form completion)', 'a monologue by a guide or announcer giving information about a place/event', 'a discussion between two or three students and a tutor about an academic assignment', 'an academic lecture / monologue on a university subject'];
  return `Write an original IELTS Listening Section ${section} script: ${kinds[section - 1]}. Topic area: "${topic}". About ${section < 3 ? 280 : 360} words, natural spoken English, realistic details (names/numbers/dates spelled clearly, with a self-correction distractor). Then 10 questions in IELTS style (mix of form/note completion with NO MORE THAN TWO WORDS AND/OR A NUMBER and multiple choice with 3-4 options), answers must be heard in the script. "explain" in Vietnamese. Try to include some of these words if natural: ${learned.slice(0, 10).join(', ') || 'none'}.
Return JSON only: {"title":"...","context":"one-line situation description","script":[{"speaker":"Name","text":"..."}],${GROUPS_SCHEMA}}`;
}

function writingGenPrompt(task, topic) {
  return task === 1
    ? `Create an original IELTS Academic Writing Task 1 prompt about "${topic}" with small realistic data. Return JSON only: {"prompt":"The chart below shows ... Summarise the information by selecting and reporting the main features, and make comparisons where relevant.","chart":{"type":"bar"|"line"|"table","title":"...","unit":"%","labels":["2000","2010","2020"],"series":[{"name":"...","values":[1,2,3]}]}}`
    : `Create an original IELTS Writing Task 2 essay question on the topic "${topic}". Choose one real question type (opinion, discussion, advantages/disadvantages, problem/solution, two-part). Return JSON only: {"prompt":"..."}`;
}

function speakingGenPrompt(topic) {
  return `Create an original IELTS Speaking test on the topic "${topic}": Part 1 (4 short personal questions), Part 2 (one cue card: statement + 4 bullet prompts starting with You should say), Part 3 (4 abstract discussion questions). Return JSON only: {"part1":["..."],"part2":{"topic":"Describe ...","points":["what/who...","...","...","and explain ..."]},"part3":["..."]}`;
}

/* Sao chép prompt để dán vào ứng dụng Claude (không cần API key) */
async function copyForClaude(text) {
  const full = SYS_EXAMINER + '\n\n' + text;
  try { await navigator.clipboard.writeText(full); toast('Đã sao chép! Dán vào Claude để nhận kết quả chấm.'); }
  catch { prompt('Sao chép nội dung này rồi dán vào Claude:', full); }
}

/* ---------- Hiển thị phản hồi ---------- */
function feedbackHTML(fb, kind) {
  const rows = kind === 'speaking'
    ? [['Fluency & Coherence', fb.fluency], ['Lexical Resource', fb.lexical], ['Grammar', fb.grammar], ['Pronunciation (tạm tính)', fb.pronunciation]]
    : [[kind === 'w1' ? 'Task Achievement' : 'Task Response', fb.ta], ['Coherence & Cohesion', fb.cc], ['Lexical Resource', fb.lr], ['Grammar', fb.gra]];
  const li = a => (a || []).map(x => `<li>${esc(x)}</li>`).join('');
  return `<div class="card fbcard">
    <div class="bandbig">${esc(fb.overall)}</div><div class="center muted">Band tổng ${fb.estimated ? '(ước lượng thô)' : '(AI chấm)'}</div>
    <div class="crit">${rows.map(([n, v]) => `<div><span>${n}</span><b>${esc(v)}</b></div>`).join('')}</div>
    <p>${esc(fb.summary || '')}</p>
    ${fb.strengths?.length ? `<h4>👍 Điểm tốt</h4><ul>${li(fb.strengths)}</ul>` : ''}
    ${fb.improve?.length ? `<h4>🎯 Cần cải thiện</h4><ul>${li(fb.improve)}</ul>` : ''}
    ${fb.corrections?.length ? `<h4>✏️ Sửa câu</h4>${fb.corrections.map(c => `<div class="corr"><div class="bad">✗ ${esc(c.original)}</div><div class="ok">✓ ${esc(c.better)}</div><div class="muted">${esc(c.why || '')}</div></div>`).join('')}` : ''}
    ${fb.vocab_suggestions?.length ? `<h4>📚 Nâng cấp từ vựng</h4><ul>${fb.vocab_suggestions.map(v => `<li><b>${esc(v.word)}</b> – ${esc(v.use)}</li>`).join('')}</ul>` : ''}
    ${fb.model_answer ? `<h4>⭐ Câu trả lời mẫu (band 7)</h4><p class="model">${esc(fb.model_answer)}</p>` : ''}
    ${fb.upgrade_paragraph ? `<h4>⭐ Đoạn viết nâng cấp (band 7+)</h4><p class="model">${esc(fb.upgrade_paragraph)}</p>` : ''}
    ${fb.note ? `<p class="muted">ℹ️ ${esc(fb.note)}</p>` : ''}
  </div>`;
}

const learnedWords = () => Vocab.entries.filter(e => Store.progress[e.key]).map(e => e.word);

/* Biểu đồ đơn giản cho Writing Task 1 (SVG) */
function chartHTML(c) {
  if (!c?.labels || !c?.series) return '';
  if (c.type === 'table') return `<div class="chart"><b>${esc(c.title || '')}</b><table class="dt"><tr><th></th>${c.labels.map(l => `<th>${esc(l)}</th>`).join('')}</tr>${c.series.map(s => `<tr><th>${esc(s.name)}</th>${s.values.map(v => `<td>${esc(v)}${esc(c.unit || '')}</td>`).join('')}</tr>`).join('')}</table></div>`;
  const W = 340, H = 190, pad = 30, all = c.series.flatMap(s => s.values), max = Math.max(...all) * 1.1 || 1;
  const cols = ['#58cc02', '#1cb0f6', '#ff9600', '#ce82ff', '#ff4b4b'], n = c.labels.length, gw = (W - pad) / n;
  let g = '';
  if (c.type === 'line') {
    c.series.forEach((s, si) => {
      const pts = s.values.map((v, i) => `${pad + gw * i + gw / 2},${H - pad - (v / max) * (H - pad * 1.5)}`).join(' ');
      g += `<polyline fill="none" stroke="${cols[si % 5]}" stroke-width="3" points="${pts}"/>` + s.values.map((v, i) => `<circle cx="${pad + gw * i + gw / 2}" cy="${H - pad - (v / max) * (H - pad * 1.5)}" r="3.5" fill="${cols[si % 5]}"/>`).join('');
    });
  } else {
    const bw = gw / (c.series.length + 1);
    c.series.forEach((s, si) => s.values.forEach((v, i) => { const h = (v / max) * (H - pad * 1.5); g += `<rect x="${pad + gw * i + bw * (si + .5)}" y="${H - pad - h}" width="${bw * .9}" height="${h}" fill="${cols[si % 5]}" rx="3"/>`; }));
  }
  const labs = c.labels.map((l, i) => `<text x="${pad + gw * i + gw / 2}" y="${H - 10}" text-anchor="middle" font-size="10" fill="currentColor">${esc(l)}</text>`).join('');
  return `<div class="chart"><b>${esc(c.title || '')}</b> <small>${esc(c.unit || '')}</small><svg viewBox="0 0 ${W} ${H}"><line x1="${pad}" y1="${H - pad}" x2="${W}" y2="${H - pad}" stroke="currentColor" opacity=".4"/>${g}${labs}</svg><div class="legend">${c.series.map((s, i) => `<span><i style="background:${cols[i % 5]}"></i>${esc(s.name)}</span>`).join('')}</div></div>`;
}
