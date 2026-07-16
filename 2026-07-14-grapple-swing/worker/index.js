/* ══════════════════════════════════════════════════════
   GRAPPLE · scores worker
   A tiny Cloudflare Worker backing the global leaderboard. The game is a
   static file on GitHub Pages, which can't accept writes — this is the only
   piece that can. The KV binding holds one list per level.

     GET  /scores            → { "0": [...], "1": [...], "2": [...] }
     POST /scores            → { level, ini, score, pct }  → new top list

   Deploy:  cd worker && npx wrangler kv namespace create SCORES
            (paste the id into wrangler.toml, then)  npx wrangler deploy
   Then put the deployed URL into SCORES_URL in ../index.html
   ══════════════════════════════════════════════════════ */

const CORS = {
  'Access-Control-Allow-Origin': '*',          // public board; read+write by anyone
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const LEVELS = 3;      // keep in step with the game
const KEEP   = 10;     // rows stored per level (the game shows the top 5)

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' },
  });

const key = lv => `lv${lv}`;
const read = async (env, lv) => JSON.parse((await env.SCORES.get(key(lv))) || '[]');

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(req.url);
    if (url.pathname !== '/scores') return json({ error: 'not found' }, 404);

    if (req.method === 'GET') {
      const out = {};
      for (let lv = 0; lv < LEVELS; lv++) out[lv] = await read(env, lv);
      return json(out);
    }

    if (req.method === 'POST') {
      let body;
      try { body = await req.json(); }
      catch { return json({ error: 'bad json' }, 400); }

      // Never trust the client: this endpoint is public, so anyone can POST.
      // Validation keeps the data well-formed; it cannot make scores honest.
      const lv    = Number(body.level);
      const ini   = String(body.ini || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
      const score = Math.floor(Number(body.score));
      const pct   = Math.floor(Number(body.pct));

      if (!Number.isInteger(lv) || lv < 0 || lv >= LEVELS)   return json({ error: 'bad level' }, 400);
      if (ini.length < 1)                                    return json({ error: 'bad initials' }, 400);
      if (!Number.isFinite(score) || score < 0 || score > 99999)
        return json({ error: 'bad score' }, 400);

      const list = await read(env, lv);
      list.push({ ini, score, pct: Math.max(0, Math.min(100, pct || 0)) });
      list.sort((a, b) => b.score - a.score);
      const top = list.slice(0, KEEP);
      await env.SCORES.put(key(lv), JSON.stringify(top));
      return json(top);
    }

    return json({ error: 'method not allowed' }, 405);
  },
};
