'use strict';
/* ===== Phần thưởng: xu, cấp độ, rương quà, thú cưng, cửa hàng ===== */
const PETS = [
  { id: 'cat', e: '🐱', n: 'Mèo Mimi', p: 100 }, { id: 'dog', e: '🐶', n: 'Cún Bông', p: 120 },
  { id: 'frog', e: '🐸', n: 'Ếch Xanh', p: 150 }, { id: 'penguin', e: '🐧', n: 'Cánh cụt Pingu', p: 180 },
  { id: 'panda', e: '🐼', n: 'Gấu trúc Bao', p: 220 }, { id: 'fox', e: '🦊', n: 'Cáo Lửa', p: 260 },
  { id: 'owl', e: '🦉', n: 'Cú Thông Thái', p: 320 }, { id: 'unicorn', e: '🦄', n: 'Kỳ lân Cầu Vồng', p: 500 },
  { id: 'dragon', e: '🐉', n: 'Rồng Vàng', p: 800 }
];
const SHOP_ITEMS = [
  { id: 'freeze', e: '❄️', n: 'Băng đóng chuỗi', d: 'Giữ nguyên chuỗi ngày nếu bạn lỡ 1 ngày học', p: 50 },
  { id: 'hearts', e: '💗', n: 'Tim dự phòng', d: '+3 tim cho bài học kế tiếp', p: 40 },
  { id: 'box', e: '🎁', n: 'Hộp quà bí ẩn', d: 'Mở ngay: 20–150 xu hoặc vật phẩm hiếm', p: 60 }
];

const xpForLevel = l => 50 * l * (l - 1);                 // tổng XP cần để đạt cấp l
const levelOf = xp => { let l = 1; while (xp >= xpForLevel(l + 1)) l++; return l; };
const petOf = () => PETS.find(p => p.id === Store.profile.pet);
const daysBetween = (a, b) => { const f = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }; return Math.round((f(b) - f(a)) / DAY); };

function effectiveStreak() {
  const p = Store.profile; if (!p.lastDay) return 0;
  return daysBetween(p.lastDay, todayStr()) <= 1 + (p.items.freeze || 0) ? p.streak : 0;
}

/* Cập nhật chuỗi ngày (có dùng Băng đóng chuỗi nếu lỡ ngày) */
function touchStreak() {
  const p = Store.profile, t = todayStr(); if (p.lastDay === t) return { used: 0 };
  const gap = p.lastDay ? daysBetween(p.lastDay, t) : 99; let used = 0;
  if (gap === 1) p.streak++;
  else if (gap > 1 && gap - 1 <= p.items.freeze) { used = gap - 1; p.items.freeze -= used; p.streak++; }
  else p.streak = 1;
  p.lastDay = t; return { used };
}

/* Cộng XP, trả về quà lên cấp */
function grantXP(xp) {
  const p = Store.profile, before = levelOf(p.xp), t = todayStr();
  p.xp += xp; p.xpByDay[t] = (p.xpByDay[t] || 0) + xp;
  Object.keys(p.xpByDay).sort().slice(0, -60).forEach(k => delete p.xpByDay[k]);
  const after = levelOf(p.xp), gifts = [];
  for (let l = before + 1; l <= after; l++) { const c = 30 + l * 10; p.coins += c; gifts.push({ level: l, coins: c }); }
  p.level = after; return gifts;
}

/* ---- Popup quà ---- */
function popup(html, btn = 'TUYỆT!') {
  const d = document.createElement('div'); d.className = 'popup';
  d.innerHTML = `<div class="pbox">${html}<button class="btn green" id="pp-ok">${btn}</button></div>`;
  document.body.appendChild(d);
  return new Promise(res => { $('#pp-ok', d).onclick = () => { d.remove(); res(); }; });
}

const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function randomReward(kind) {                               // kind: 'chest' | 'box'
  const p = Store.profile, r = Math.random();
  if (kind === 'box') {
    if (r < .08) { p.items.freeze++; return { e: '❄️', t: 'Băng đóng chuỗi (hiếm!)' }; }
    if (r < .2) { p.items.hearts++; return { e: '💗', t: 'Tim dự phòng' }; }
    const c = rand(20, 150); p.coins += c; return { e: '🪙', t: `${c} xu` };
  }
  if (r < .15) { p.items.freeze++; return { e: '❄️', t: 'Băng đóng chuỗi' }; }
  if (r < .3) { p.items.hearts++; return { e: '💗', t: 'Tim dự phòng' }; }
  const c = rand(25, 70); p.coins += c; return { e: '🪙', t: `${c} xu` };
}

const chestReady = () => Store.xpToday() >= Store.profile.goal && Store.profile.chestDay !== todayStr();
async function openChest() {
  if (!chestReady()) return;
  Store.profile.chestDay = todayStr();
  const rw = randomReward('chest'); Store.save(); renderAll();
  await popup(`<div class="bigemoji bounce">🎁</div><h2>Rương quà hôm nay!</h2><p>Bạn đạt mục tiêu ${Store.profile.goal} XP nên nhận được:</p><div class="reward">${rw.e} ${esc(rw.t)}</div>`);
}

function petSay() {
  const s = stats(), name = petOf()?.n || '';
  const lines = [];
  if (s.due) lines.push(`Có ${s.due} từ đang chờ ôn đó!`);
  if (Store.xpToday() >= Store.profile.goal) lines.push('Hôm nay bạn quá xuất sắc! 🎉');
  else lines.push(`Còn ${Store.profile.goal - Store.xpToday()} XP nữa là xong mục tiêu hôm nay!`);
  if (effectiveStreak() >= 3) lines.push(`Chuỗi ${effectiveStreak()} ngày rồi, giữ vững nhé! 🔥`);
  lines.push('IELTS 6.5 không còn xa nữa đâu 💪');
  return `${name ? name + ': ' : ''}${lines[Math.floor(Math.random() * lines.length)]}`;
}

function petCardHTML() {
  const pet = petOf();
  const lv = Store.profile.level, a = xpForLevel(lv), b = xpForLevel(lv + 1), pct = Math.round((Store.profile.xp - a) / (b - a) * 100);
  return `<section class="card petcard">
    <div class="pet">${pet ? pet.e : '🥚'}</div>
    <div class="petinfo"><div class="bubble">${pet ? esc(petSay()) : 'Hãy học thật chăm để mua thú cưng đầu tiên trong Cửa hàng nhé!'}</div>
    <div class="lvl"><b>Cấp ${lv}</b><div class="pbar sm"><i style="width:${pct}%"></i></div><small>${Store.profile.xp - a}/${b - a} XP</small></div></div>
  </section>
  ${chestReady() ? '<button class="btn yellow big" id="chest">🎁 MỞ RƯƠNG QUÀ HÔM NAY</button>' : ''}`;
}

/* ---- Trang Cửa hàng ---- */
function viewShop() {
  const p = Store.profile;
  $('#view').innerHTML = `
  <section class="card wallet"><div class="coin">🪙</div><div><h2>${p.coins} xu</h2><p class="muted">Kiếm xu: +1 mỗi câu đúng, combo 5 câu liền +5, hoàn thành bài +10, bài hoàn hảo +10, lên cấp & mở rương quà.</p></div></section>
  <h3>🐾 Thú cưng</h3>
  <div class="pets">${PETS.map(x => {
    const own = p.pets[x.id], on = p.pet === x.id;
    return `<div class="card petitem ${on ? 'on' : ''}"><div class="pet sm">${x.e}</div><b>${esc(x.n)}</b>
      ${own ? `<button class="btn ${on ? 'ghost' : 'blue'} sm" data-eq="${x.id}">${on ? '✓ Đang chọn' : 'Chọn'}</button>` : `<button class="btn green sm" data-buy="pet:${x.id}" ${p.coins < x.p ? 'disabled' : ''}>🪙 ${x.p}</button>`}</div>`;
  }).join('')}</div>
  <h3>🎒 Vật phẩm</h3>
  ${SHOP_ITEMS.map(x => `<div class="card shopitem"><div class="pet sm">${x.e}</div><div class="grow"><b>${esc(x.n)}</b>${x.id !== 'box' ? ` <span class="pill">x${p.items[x.id] || 0}</span>` : ''}<div class="muted">${esc(x.d)}</div></div>
    <button class="btn green sm" data-buy="item:${x.id}" ${p.coins < x.p ? 'disabled' : ''}>🪙 ${x.p}</button></div>`).join('')}`;
  $$('[data-eq]').forEach(b => b.onclick = () => { p.pet = b.dataset.eq; Store.save(); viewShop(); });
  $$('[data-buy]').forEach(b => b.onclick = async () => {
    const [k, id] = b.dataset.buy.split(':');
    if (k === 'pet') {
      const x = PETS.find(z => z.id === id); if (p.coins < x.p) return;
      p.coins -= x.p; p.pets[id] = true; if (!p.pet) p.pet = id; Store.save(); renderTop(); viewShop();
      await popup(`<div class="bigemoji bounce">${x.e}</div><h2>Chào ${esc(x.n)}!</h2><p>Bạn vừa có một người bạn học mới.</p>`);
    } else {
      const x = SHOP_ITEMS.find(z => z.id === id); if (p.coins < x.p) return;
      p.coins -= x.p;
      if (id === 'box') { const rw = randomReward('box'); Store.save(); renderTop(); viewShop(); await popup(`<div class="bigemoji bounce">🎁</div><h2>Hộp quà bí ẩn</h2><div class="reward">${rw.e} ${esc(rw.t)}</div>`); }
      else { p.items[id] = (p.items[id] || 0) + 1; Store.save(); renderTop(); viewShop(); toast(`Đã mua ${x.n}`); }
    }
  });
}
