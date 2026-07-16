# grapple · scores worker

GitHub Pages is a static host — it serves files and accepts no writes, so the
leaderboard needs one small thing that can. This is it: a Cloudflare Worker
with a KV namespace, about 60 lines.

The game stays exactly as it is (a single static file on Pages); it just
`fetch`es this endpoint. The write credential never leaves Cloudflare.

## Deploy

```sh
cd 2026-07-14-grapple-swing/worker
npx wrangler login
npx wrangler kv namespace create SCORES   # → prints an id
# paste that id into wrangler.toml
npx wrangler deploy                       # → prints https://grapple-scores.<you>.workers.dev
```

Then open `../index.html` and set:

```js
const SCORES_URL = 'https://grapple-scores.<you>.workers.dev/scores';
```

Commit + push. Until that constant is filled in, the game falls back to
per-device `localStorage` and plays fine.

## API

```
GET  /scores   → { "0": [{ini,score,pct}, …], "1": […], "2": […] }   top 10 per level
POST /scores   ← { level, ini, score, pct }   → the level's new top list
```

## What this does and doesn't protect

The endpoint is public — it has to be, since the game has no login. Anyone who
finds the URL can POST a score, so the board is **not** cheat-proof. The Worker
validates shape (level in range, initials A–Z, score an integer 0–99999) so the
data stays well-formed and can't be used to inject anything, but it cannot tell
a real 1400 from a made-up one.

That's an acceptable trade for a toy leaderboard. If it ever matters, the fixes
are a rate limit (`Cf-Connecting-Ip` in KV with a TTL), a shared secret the game
signs with, or validating a replay server-side.
