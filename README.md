# shinigami-rog.cc

Personal portfolio of **Sivaguru Ravi** (a.k.a. `shinigami-rog`) — Senior SDE,
Bangalore. A terminal-styled single-page site with an interactive shell,
built with Next.js (App Router) and deployed on Vercel.

```
$ whoami --verbose
Sivaguru Ravi — Senior SDE · 9+ yrs · Java Spring Boot · Angular
alias: shinigami-rog · web: shinigami-rog.cc
```

## Stack

- Next.js (App Router) + React + TypeScript
- CSS Modules over a CSS-custom-property token sheet (dark/light theming)
- Zero-dependency animation core (rAF tween + IntersectionObserver)
- Playwright (smoke + visual regression)

## Develop

```bash
npm ci
npm run dev
```

`npm run build` for production, `npx playwright test` for e2e.

## Repo map

- `src/app` — routes, layout, metadata
- `src/core` — framework-agnostic terminal/animation engines
- `src/components` — React bindings
- `src/styles/tokens.css` — the design-token contract
- `design/handoff` — signed-off design package (source of truth)
- `plan-revised.md` — implementation plan (council-reviewed)
