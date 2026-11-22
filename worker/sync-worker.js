/* Máy chủ đồng bộ siêu nhỏ cho app IELTS (Cloudflare Workers + KV, gói miễn phí).
   - Chỉ lưu DỮ LIỆU ĐÃ MÃ HÓA từ trình duyệt (server không đọc được nội dung).
   - Mỗi ID được "khóa" bằng mã xác thực sinh từ mật khẩu của bạn: ai không có mật khẩu thì không đọc/ghi được. */
export default {
  async fetch(req, env) {
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type,x-auth', 'access-control-allow-methods': 'GET,PUT,OPTIONS' };
    const reply = (body, status = 200, extra = {}) => new Response(body, { status, headers: { ...cors, ...extra } });
    if (req.method === 'OPTIONS') return reply(null, 204);
    const m = new URL(req.url).pathname.match(/^\/s\/([A-Za-z0-9_.-]{3,64})$/);
    if (!m) return reply('IELTS sync server OK');
    const id = m[1], auth = req.headers.get('x-auth') || '';
    if (auth.length < 20 || auth.length > 200) return reply('auth required', 401);
    const raw = await env.SYNC.get(id), rec = raw ? JSON.parse(raw) : null;
    if (rec && !same(rec.auth, auth)) return reply('wrong password', 401);
    if (req.method === 'GET') {
      if (!rec) return reply('not found', 404);
      return reply(JSON.stringify({ data: rec.data, t: rec.t }), 200, { 'content-type': 'application/json' });
    }
    if (req.method === 'PUT') {
      let body; try { body = await req.json(); } catch { return reply('bad json', 400); }
      if (typeof body.data !== 'string' || body.data.length > 4_000_000) return reply('bad data', 413);
      await env.SYNC.put(id, JSON.stringify({ auth, data: body.data, t: Date.now() }));
      return reply('saved');
    }
    return reply('method not allowed', 405);
  }
};
function same(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
