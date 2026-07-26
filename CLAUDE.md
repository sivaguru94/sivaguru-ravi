# shinigami-rog.cc — portfolio (Next.js)

Personal portfolio for Sivaguru Ravi (alias **shinigami-rog**), a pixel-perfect
recreation of the signed-off "Terminal" design, deployed on Vercel at
https://shinigami-rog.cc.

@AGENTS.md

## Source of truth — do not redesign

`design/handoff/` is the signed-off design package:
- `README.md` — the full spec (tokens, typography, sections, shell, SEO).
- `Sivaguru Ravi Portfolio - Terminal.dc.html` — high-fidelity reference.
  Markup in `<x-dc>`, behavior in the `class Component` at the bottom.
  It is NOT production code — recreate, don't copy.
- Copy, colors, spacing, timings are **verbatim** from the prototype.

The working plan is `plan-revised.md` (council-reviewed; `plan-review.md` has
the reasoning). Milestones M0–M9; keep the plan's decisions unless the author
overrides them.

## Architecture rules

- **Framework-agnostic core, thin React bindings.** `src/core/` is pure TS —
  zero React imports, zero deps (future `@shinigami-rog/terminal-core`, will
  also get Angular bindings). Side effects reach core commands only via the
  injected host-actions interface.
- **Tokens:** every themed value lives in `src/styles/tokens.css` as a CSS
  custom property. Never hardcode a themed color elsewhere. Light theme =
  `:root[data-theme="light"]` overrides; glow/scanlines are derived tokens —
  no theme branching in JS.
- **Theming:** single owner — the store in `src/core/theme.ts` via one
  `ThemeProvider`. The no-flash script is the first child of `<body>` in
  `layout.tsx`; it also stamps `html[data-js]`, which gates animation initial
  states in CSS.
- **Animation:** custom rAF tween core, easeOutExpo, no animation libraries.
  Engines return cancel handles; hook cleanup cancels + resets one-shot state
  (StrictMode-safe). Per-frame output goes through refs/`textContent` —
  never React state. The hero is CSS-driven and must paint without JS (LCP).
  Typewriters/count-ups reserve final geometry (zero CLS).
- **Sections are server components**; only the animation leaf wrappers
  (`src/components/anim/`) and chrome (Nav, providers, shell) are client.
  Shell + games are code-split (`next/dynamic` / dynamic `import()`).
- **Shell rendering is text-only.** No `dangerouslySetInnerHTML` in the shell
  tree; command output renders as React text nodes; downloads map allowlisted
  names to fixed constant paths.
- **External links:** `target="_blank" rel="noopener noreferrer"`.
- **localStorage:** only via the `safeStorage` helper (try/catch both ways,
  allowlisted values).

## Privacy

`docs-private/` is gitignored and must NEVER be committed — it holds personal
notes with comp-sensitive content.

**Author overrides (2026-07-26, supersede the design):** the phone number and
the stock-option story are REMOVED site-wide (sections, shell commands, deep
links). Do not reintroduce them from the design reference. The published
email (`sivaguru94@gmail.com`) stays. Note: the downloadable resume PDF
still contains the phone number (author's own file — flagged, their call).

## Content

ALL personal/section/shell copy lives in `src/content/me.json` — the single
source of truth, typed and exposed via `getMe()` in `src/content/index.ts`.
Server components `await getMe()`; when content moves to a DB/CMS, only
`index.ts` changes. Never hardcode copy in components; the only supported
markup in content strings is `**bold**` (rendered by `common/Rich.tsx`).

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (must stay green)
- `npm run lint` — ESLint
- `npx playwright test` — full suite. Projects: desktop-chromium (all specs),
  mobile-chromium (responsive + visual), iPhone/iPad WebKit (responsive; CI
  or `ALL_BROWSERS=1` only). Visual baselines live in
  `e2e/visual.spec.ts-snapshots/`; regenerate with
  `npx playwright test e2e/visual.spec.ts --update-snapshots` after
  intentional visual changes (Linux-generated; 3% diff tolerance absorbs
  CI rasterization drift).
- `node scripts/check-budget.mjs` — first-load JS budget for `/` (runs in
  CI after build; fails if the lazy shell/games ever leak into first-load)
- `node scripts/gen-favicon.mjs` — regenerate favicon.ico if icon.svg changes

## Known trap: npm lockfile desync

npm 11 drops optional wasm branches (`@emnapi/*`, `@napi-rs/*`) from the
lockfile when installing new packages into an existing `node_modules` —
`npm ci` then fails in CI while working locally (cache masks it). After
adding ANY dependency: `rm -rf node_modules package-lock.json && npm install`,
then verify with a clean `npm ci` before pushing.

## Git / delivery

- Branch `next-rewrite` is the working branch; `master` is production
  (Vercel). Tag `pre-next-rewrite` = last pre-rewrite state.
- CI (GitHub Actions): lint + build + Playwright; `permissions:
  contents: read`; actions pinned to major versions.
- QA gates before deploy: breakpoint 760px, `pointer: coarse` targets,
  iPhone/iPad manual pass, reduced motion, Lighthouse ≥ 95.
