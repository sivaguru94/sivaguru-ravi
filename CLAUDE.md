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
notes with comp-sensitive content. The published phone number, email
(`sivaguru94@gmail.com`), and stock-option story are deliberate (author
confirmed 2026-07-26; design wins).

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (must stay green)
- `npm run lint` — ESLint
- `npx playwright test` — e2e/smoke (visual baselines are CI-generated;
  locally use the Playwright Docker image if updating them)

## Git / delivery

- Branch `next-rewrite` is the working branch; `master` is production
  (Vercel). Tag `pre-next-rewrite` = last pre-rewrite state.
- CI (GitHub Actions): lint + build + Playwright; `permissions:
  contents: read`; actions pinned to major versions.
- QA gates before deploy: breakpoint 760px, `pointer: coarse` targets,
  iPhone/iPad manual pass, reduced motion, Lighthouse ≥ 95.
