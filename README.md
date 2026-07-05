# Daily Build

One small game a day. This repo hosts the playable builds on GitHub Pages;
each build gets its own URL you paste into your shelf tracker.

## One-time setup
1. Create a repo (e.g. `daily-build`) and push these files.
2. **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)` → Save.**
3. Your site is live at `https://<user>.github.io/daily-build/`

## Every morning
1. Copy the `template/` folder and rename it to today's date + a short slug:
   `2026-07-05-walls-are-safe/`
2. Open that folder's `index.html`. Paste the day's prompt into the **Seed**
   comment at the top, then build in the **YOUR GAME** section.
3. Test locally — just open the file in a browser (or `python3 -m http.server`).
4. Commit + push.
5. Your build is live at
   `https://<user>.github.io/daily-build/2026-07-05-walls-are-safe/`
6. Paste that URL into the shelf tracker's link field. Done.

## What the template gives you
- **`g`** — a 320×180 pixel canvas, integer-scaled and crisp. Draw everything to it.
- **`reset()` / `update(dt)` / `render()`** — the only functions you fill in.
- **Input** — `down('left'|'right'|'up'|'down'|'space'|'a'…)`, `pressed('space')`,
  `mx()`, `my()`, `clicked()`. (Arrows and WASD both drive `down('left')` etc.)
- **Feel** — `tween(obj, {x:100}, 0.3, ease.outBack)`, `shake(px, secs)`,
  `beep(freq, dur)`, `sweep(f1, f2, dur)`.

`dt` is seconds since the last frame (clamped), so movement stays framerate-independent:
`p.x += speed * dt`.

## Optional: the auto-archive
`index.html` (root) lists every build. `.github/workflows/build-index.yml`
regenerates `days.json` on each push so the list stays current — zero extra
steps per day. Don't want a public archive? Delete both files and the workflow;
your shelf tracker is already your index.
