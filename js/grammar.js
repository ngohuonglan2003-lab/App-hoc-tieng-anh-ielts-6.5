'use strict';
/* ===== Ngữ pháp & cách dùng từ cho IELTS =====
   [chủ đề, câu có ___, đáp án đúng, [3 đáp án sai], giải thích] */
const G = {
  'Thì động từ': [
    ['By the time the report was published, the experts ___ the data for months.', 'had been analysing', ['have been analysing', 'were analysing', 'analysed'], 'Hành động kéo dài đến một mốc trong quá khứ (“by the time … was published”) → quá khứ hoàn thành tiếp diễn.'],
    ['The number of visitors ___ steadily since 2015.', 'has risen', ['rose', 'is rising', 'will rise'], '“since 2015” (từ mốc quá khứ đến nay) → hiện tại hoàn thành. Rất hay gặp trong Writing Task 1.'],
    ['In 2010, the unemployment rate ___ 8 per cent.', 'was', ['has been', 'had been', 'is'], 'Mốc thời gian xác định trong quá khứ (“In 2010”) → quá khứ đơn.'],
    ['Scientists believe the climate ___ significantly by 2050.', 'will have changed', ['changes', 'has changed', 'changed'], '“by + mốc tương lai” → tương lai hoàn thành (will have + V3).'],
    ['While she ___ for the exam, her phone rang.', 'was studying', ['studied', 'has studied', 'studies'], 'Hành động đang diễn ra (quá khứ tiếp diễn) thì bị một hành động ngắn (rang) xen vào.']
  ],
  'Mạo từ': [
    ['She is ___ honest person who always tells the truth.', 'an', ['a', 'the', '(không cần mạo từ)'], '“honest” bắt đầu bằng âm nguyên âm /ɒ/ (h câm) → dùng “an”.'],
    ['___ education is the key to reducing poverty.', '(không cần mạo từ)', ['The', 'An', 'A'], 'Danh từ không đếm được nói chung chung → không dùng mạo từ.'],
    ['The Internet has changed ___ way we communicate.', 'the', ['a', 'an', '(không cần mạo từ)'], '“the way (we communicate)” – danh từ được xác định bởi mệnh đề đi sau → dùng “the”.'],
    ['He is ___ university student.', 'a', ['an', 'the', '(không cần mạo từ)'], '“university” bắt đầu bằng âm /j/ (phụ âm) → dùng “a”.'],
    ['___ sun rises in the east.', 'The', ['A', 'An', '(không cần mạo từ)'], 'Vật duy nhất (the sun, the moon, the world) → dùng “the”.']
  ],
  'Hòa hợp chủ–vị': [
    ['The number of students studying abroad ___ increased.', 'has', ['have', 'are', 'were'], '“The number of …” là số ít → has. (“A number of …” mới là số nhiều.)'],
    ['A number of students ___ studying abroad.', 'are', ['is', 'has', 'was'], '“A number of + danh từ số nhiều” = “nhiều” → động từ số nhiều.'],
    ['Neither the teacher nor the students ___ happy about the decision.', 'were', ['was', 'is', 'has been'], 'Với neither…nor, động từ chia theo chủ ngữ gần nhất (the students → số nhiều).'],
    ['Everyone ___ entitled to a good education.', 'is', ['are', 'were', 'have been'], '“Everyone/everybody/each” luôn đi với động từ số ít.'],
    ['The research on climate change ___ been published widely.', 'has', ['have', 'are', 'were'], '“research” là danh từ không đếm được → động từ số ít.']
  ],
  'Câu điều kiện': [
    ['If governments ___ stricter laws, pollution would fall.', 'introduced', ['introduce', 'will introduce', 'had introduced'], 'Điều kiện loại 2 (giả định ít khả năng): If + quá khứ đơn, would + V.'],
    ['If I ___ harder last year, I would have passed the exam.', 'had studied', ['studied', 'study', 'would study'], 'Điều kiện loại 3 (không có thật trong quá khứ): If + had + V3, would have + V3.'],
    ['Unless people ___ their habits, the situation will worsen.', 'change', ['changed', 'will change', "don't change"], '“Unless” đã mang nghĩa phủ định (= if … not) nên động từ để dạng khẳng định.'],
    ['If you heat ice, it ___.', 'melts', ['would melt', 'will have melted', 'melted'], 'Điều kiện loại 0 (chân lý, sự thật hiển nhiên): If + hiện tại, hiện tại.'],
    ['I wish I ___ more time to study.', 'had', ['have', 'would have', 'had had'], '“wish” + quá khứ đơn để ước điều trái với hiện tại.']
  ],
  'Câu bị động': [
    ['The new law ___ last year.', 'was passed', ['passed', 'has passing', 'is passed'], 'Hành động xảy ra trong quá khứ, chủ ngữ là vật bị tác động → was + V3.'],
    ['Many species ___ by climate change at the moment.', 'are being threatened', ['are threatening', 'threaten', 'have threatened'], '“at the moment” → bị động hiện tại tiếp diễn: am/is/are being + V3.'],
    ['The results ___ in the next issue of the journal.', 'will be published', ['will publish', 'will be publishing', 'are publishing'], 'Bị động tương lai: will be + V3.'],
    ['It is believed that the problem ___ by poor planning.', 'was caused', ['caused', 'was causing', 'has cause'], 'Vấn đề “bị gây ra” bởi kế hoạch kém → bị động quá khứ.'],
    ['The building ___ when the earthquake struck.', 'was being repaired', ['was repairing', 'repaired', 'had repair'], 'Đang được sửa (bị động quá khứ tiếp diễn): was/were being + V3.']
  ],
  'So sánh': [
    ['Online learning is ___ than traditional classes for many adults.', 'more flexible', ['flexibler', 'most flexible', 'as flexible'], 'Tính từ dài (≥ 3 âm tiết) → more + adj + than.'],
    ['The ___ the temperature, the faster the ice melts.', 'higher', ['high', 'highest', 'more high'], 'So sánh kép: The + so sánh hơn, the + so sánh hơn.'],
    ["This year's figures are not as high ___ last year's.", 'as', ['than', 'like', 'that'], 'Cấu trúc not as … as.'],
    ['Of all the options, public transport is ___ eco-friendly.', 'the most', ['more', 'most', 'the more'], 'So sánh nhất trong nhóm (of all …) → the most + adj.'],
    ['Cities are becoming ___ crowded every year.', 'more and more', ['more more', 'most and most', 'much more and'], '“more and more + adj” diễn tả sự tăng dần – hay dùng khi mô tả xu hướng.']
  ],
  'Giới từ': [
    ['The government is responsible ___ providing healthcare.', 'for', ['of', 'to', 'in'], 'responsible for + V-ing/danh từ.'],
    ['Many people depend ___ social media for news.', 'on', ['of', 'in', 'at'], 'depend on.'],
    ['There has been a sharp increase ___ house prices.', 'in', ['of', 'on', 'at'], 'an increase/decrease in + danh từ.'],
    ['She is interested ___ environmental issues.', 'in', ['on', 'at', 'for'], 'be interested in.'],
    ['The population rose ___ 5 million to 7 million.', 'from', ['of', 'since', 'at'], 'rise from A to B (tăng từ A lên B).']
  ],
  'Mệnh đề quan hệ': [
    ['The woman ___ lives next door is a doctor.', 'who', ['which', 'whose', 'whom'], 'Chỉ người, làm chủ ngữ → who.'],
    ['The book ___ I borrowed was fascinating.', 'that', ['who', 'whose', 'what'], 'Chỉ vật, làm tân ngữ → that/which (có thể lược bỏ).'],
    ['Students ___ parents work abroad often live with grandparents.', 'whose', ['who', 'which', 'whom'], 'Chỉ sở hữu (bố mẹ của học sinh) → whose.'],
    ['The city, ___ is the capital, attracts millions of tourists.', 'which', ['that', 'who', 'what'], 'Mệnh đề không xác định (có dấu phẩy) không dùng “that” → which.'],
    ['This is the reason ___ many people move to cities.', 'why', ['which', 'what', 'where'], 'the reason why …: lý do mà …']
  ],
  'Từ nối': [
    ['Many people drive to work. ___, public transport is cheaper.', 'However', ['Because', 'Although', 'Therefore'], '“However” nối hai ý tương phản và đứng đầu câu mới.'],
    ['___ it was raining, they continued the match.', 'Although', ['Despite', 'However', 'Because'], 'Although + mệnh đề (S + V). Despite đi với danh từ/V-ing.'],
    ['___ the heavy traffic, he arrived on time.', 'Despite', ['Although', 'However', 'Because'], 'Despite + danh từ/cụm danh từ (the heavy traffic).'],
    ['Pollution levels have fallen. ___, the air is still unsafe in some areas.', 'Nevertheless', ['Therefore', 'For example', 'In addition'], 'Nevertheless = tuy vậy, chỉ sự tương phản.'],
    ['Exercise reduces stress; ___, it improves sleep.', 'moreover', ['whereas', 'despite', 'unless'], 'Moreover = hơn nữa, bổ sung ý cùng hướng.']
  ],
  'Danh từ đếm được': [
    ['There is too much ___ in the city centre.', 'traffic', ['traffics', 'a traffic', 'many traffic'], '“traffic” không đếm được: much traffic (không thêm s, không có a).'],
    ['Can you give me some ___ on studying abroad?', 'advice', ['advices', 'an advice', 'a advice'], '“advice” không đếm được. Nói “a piece of advice”.'],
    ['How ___ money do students spend on books?', 'much', ['many', 'few', 'a number of'], 'money không đếm được → how much.'],
    ['There is ___ evidence that sugar harms health.', 'little', ['few', 'many', 'a few'], '“evidence” không đếm được → little (ít) / much.'],
    ['The research provides ___ useful information.', 'some', ['a', 'many', 'an'], '“information” không đếm được → some, không dùng a/an hay many.']
  ],
  'Dạng từ': [
    ['The ___ of online shopping has grown rapidly.', 'popularity', ['popular', 'popularly', 'popularise'], 'Sau “The” và trước “of” cần danh từ → popularity.'],
    ['Governments must take ___ action to cut emissions.', 'effective', ['effect', 'effectively', 'effectiveness'], 'Trước danh từ “action” cần tính từ → effective.'],
    ['She spoke ___ about her experience abroad.', 'confidently', ['confident', 'confidence', 'confide'], 'Bổ nghĩa cho động từ “spoke” cần trạng từ → confidently.'],
    ['There has been a ___ decline in birth rates.', 'significant', ['significance', 'significantly', 'signify'], 'Trước danh từ “decline” cần tính từ → significant.'],
    ['Economic ___ depends on education.', 'growth', ['grow', 'grown', 'growing'], '“Economic growth” là cụm danh từ cố định (growth là danh từ).']
  ],
  'To-V / V-ing': [
    ['Many students avoid ___ questions in class.', 'asking', ['to ask', 'ask', 'asked'], 'avoid + V-ing.'],
    ['She decided ___ abroad after graduating.', 'to study', ['studying', 'study', 'studied'], 'decide + to V.'],
    ['I look forward to ___ from you.', 'hearing', ['hear', 'to hear', 'heard'], 'look forward to + V-ing (to ở đây là giới từ).'],
    ['Governments should encourage people ___ public transport.', 'to use', ['using', 'use', 'used'], 'encourage somebody to V.'],
    ['He suggested ___ the deadline.', 'extending', ['to extend', 'extend', 'extended'], 'suggest + V-ing.']
  ],
  'Hedging & Modal': [
    ['It ___ that online learning will become more popular.', 'is likely', ['likely is', 'is liking', 'likes'], 'It is likely that … là cấu trúc “nói giảm” (hedging) rất ăn điểm trong Writing.'],
    ['Young people ___ to spend more time online than older adults.', 'tend', ['tends', 'tending', 'tended'], 'Chủ ngữ số nhiều → tend to (xu hướng, không khẳng định tuyệt đối).'],
    ['This trend ___ continue for the next decade.', 'is expected to', ['expects to', 'is expecting', 'expected'], 'be expected to + V = được dự đoán sẽ.'],
    ['You ___ see a doctor if the symptoms continue.', 'should', ['would', 'ought', 'must to'], 'should + V dùng để khuyên. (ought cần “to”; must không đi với “to”.)'],
    ["She ___ have missed the bus; she's usually here by now.", 'must', ['should', 'would', 'will'], 'must have + V3 = chắc hẳn đã (suy đoán chắc chắn về quá khứ).']
  ]
};
const G_TOPICS = Object.keys(G);
const G_ITEMS = G_TOPICS.flatMap(t => G[t].map(([q, a, wrong, why]) => ({ topic: t, q, a, wrong, why })));

function gStat(t) { return Store.gstats[t] || { ok: 0, bad: 0 }; }

function grammarChoice(it) {
  const sentence = it.q.replace('___', '<span class="blank">_____</span>');
  const full = it.q.replace('___', it.a);
  return {
    kind: 'choice', type: 'grammar', w: null, rk: 'g:' + it.topic, topic: it.topic, title: `Ngữ pháp · ${it.topic}`,
    promptHTML: `<div class="qdef">${sentence}</div>${textTools}`, sayText: full, trText: full, full, explain: it.why, reveal: it.a,
    options: shuffle([{ text: it.a, correct: true }, ...it.wrong.map(text => ({ text, correct: false }))]),
    again() { return { ...this, options: shuffle(this.options), retry: true }; }
  };
}

function grammarOrder(it) {
  const full = it.q.replace('___', it.a);
  const ex = orderEx(null, 'order', `Ngữ pháp · Xếp thành câu đúng`, full, '', { rk: 'g:' + it.topic, topic: it.topic, explain: it.why, grammar: true });
  ex.promptHTML = `<div class="qlisten"><button class="bigspeak" data-act="saytext">🔊</button></div><p class="muted center">Nghe câu mẫu rồi xếp lại các từ cho đúng ngữ pháp.</p>`;
  ex.auto = false;
  ex.again = function () { return { ...this, tiles: shuffle(this.tiles), retry: true }; };
  return ex;
}

/* Chọn 10 câu, ưu tiên chủ đề bạn hay sai */
function buildGrammarQueue(topic = 'all', n = 10) {
  const pool = G_ITEMS.filter(i => topic === 'all' || i.topic === topic);
  const weight = i => { const s = gStat(i.topic); return 1 + 3 * s.bad / (s.ok + s.bad + 1); };
  const picked = [], left = [...pool];
  while (picked.length < Math.min(n, pool.length)) {
    const tot = left.reduce((a, i) => a + weight(i), 0); let r = Math.random() * tot, k = 0;
    for (; k < left.length - 1; k++) { r -= weight(left[k]); if (r <= 0) break; }
    picked.push(left.splice(k, 1)[0]);
  }
  return picked.map(it => (it.q.split(' ').length <= 14 && Math.random() < .25) ? grammarOrder(it) : grammarChoice(it));
}

function startGrammar(topic = 'all') {
  runLesson({ queue: buildGrammarQueue(topic), words: [], ctx: null, kind: 'grammar', mode: topic, redo: () => startGrammar(topic) });
}
