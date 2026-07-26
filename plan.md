# Implementation Plan — shinigami-rog.cc Portfolio (Next.js)

**Source of truth:** `design_handoff/README.md` + `design_handoff/Sivaguru Ravi Portfolio - Terminal.dc.html` (Terminal variant, signed off).
**Target:** pixel-perfect recreation as a Next.js App Router app, deployed on Vercel at `shinigami-rog.cc`.
**Approved decisions:** CSS Modules · zero-dependency custom animation core (design-system-ready) · Playwright smoke + visual testing · Angular app deleted, handoff/docs files relocated into the new structure · conventions baked into `CLAUDE.md`.

---

## 0. Guiding constraint: future design system

The long-term goal is to extract a **terminal design system** from this site with both **React and Angular** component sets. Every architectural choice below follows one rule:

> **Framework-agnostic core, thin framework bindings.**

- **`src/core/`** — pure TypeScript, zero React imports, zero dependencies: tween/easing engine, typewriter, command registry, completion engine, matrix rain, snake game, theme utilities. This folder is the future `@shinigami-rog/terminal-core` package.
- **`src/styles/tokens.css`** — the CSS custom-property contract (`--bg`, `--fg`, `--accent`, `--dim`, `--line`, `--panel`, `--nav-bg`, `--glow`, `--accent-soft`). Both future React and Angular component sets consume the same token sheet. Never hardcode a themed color outside this file.
- **`src/components/`** — React bindings: hooks wrap the core engines, components own only JSX + CSS Modules. An Angular binding later re-wraps the same core (directives/services instead of hooks) without touching engine logic.
- Side effects (scrolling, downloads, theme toggling) reach the core via an injected **host-actions interface**, never via direct `document` calls inside command handlers — so the shell engine is portable and testable.

This is why we do **not** take anime.js: the prototype only uses `easeOutExpo` tweens + stagger, which a ~40-line rAF tween reproduces exactly, and the design system then has no animation peer-dependency.

---

## 1. Project setup

| Item | Choice |
|---|---|
| Framework | Next.js **15.x** (latest stable), App Router, React 19 |
| Language | TypeScript, `strict: true` |
| Styling | **CSS Modules** + global `tokens.css` / `globals.css`; design values copied verbatim from the prototype's inline styles |
| Fonts | `next/font/google` — JetBrains Mono, weights 400/500/600/700/800, `display: swap`, CSS variable `--font-mono`. Only font on the site |
| Animation | Custom core (see §4). No animation library |
| Lint/format | ESLint (next config) + Prettier |
| Package manager | npm (Vercel default; single lockfile) |
| Node | 20.x (Vercel default), pinned in `package.json` engines |

Scaffold: `create-next-app` at repo root (App Router, TS, ESLint, no Tailwind, `src/` dir, import alias `@/*`). The site is fully static — no route handlers, no data fetching; default output (static prerender) is kept so Vercel serves it from the edge cache.

### Repo reset (first milestone)
- **Delete:** `src/` (Angular), `angular.json`, `package.json`, `package-lock.json`, `yarn.lock`, `tsconfig.app.json`, `tsconfig.spec.json`, `.vscode/`, old `README.md` content (rewritten), `*Zone.Identifier` files.
- **Relocate:**
  - `design_handoff/` → `design/handoff/` (kept in-repo as design source of truth)
  - `personal-info.md`, `research-notes.md`, `cowork-prompt.md` → `docs/`
  - root `Sivaguru_Ravi_Resume.pdf` → deleted (canonical copy is `design/handoff/assets/`, shipped from `public/`)
- **Keep:** `LICENSE`, `.editorconfig`, `.gitignore` (extended for Next).
- **Create `CLAUDE.md`:** repo map, "design/handoff is source of truth — do not redesign", token/styling conventions, core-vs-bindings rule, dev/build/test commands, fidelity + QA expectations, design-system extraction intent.

---

## 2. Component breakdown & file structure

```
src/
  app/
    layout.tsx            # SERVER — metadata, JSON-LD, font, theme no-flash script
    page.tsx              # SERVER — composes the sections
    icon.svg              # favicon.svg (Next file convention)
    robots.ts / sitemap.ts
  styles/
    tokens.css            # custom properties: dark defaults + [data-theme="light"] overrides
    globals.css           # reset, ::selection, blink keyframes, scroll-behavior, media helpers
  core/                   # ── framework-agnostic (future terminal-core pkg) ──
    tween.ts              # rAF tween: {from,to,duration,easing,onUpdate}; easeOutExpo
    typewriter.ts         # types text into a callback at N ms/char, cancelable
    terminal/
      types.ts            # Line {text, tone}, CommandContext (host actions), Command
      commands.ts         # full registry: help/whoami/…/sudo — exact outputs from prototype
      completion.ts       # candidates(), common-prefix, ghost(), arg sets, cycle state
    games/
      matrix.ts           # canvas digital rain engine (start/stop, accent injected)
      snake.ts            # 21×21 snake engine (keyboard + swipe, restart, HUD)
    theme.ts              # theme type, storage key, accent math (darken ×0.5, rgba helper)
  components/
    Scanlines.tsx           (client)  fixed overlay, dark-only
    ThemeFlash.tsx          (client)  120px blade flash on toggle
    Nav.tsx / Nav.module.css (client) terminal bar, links, active section, toggle button
    Hero.tsx                (client)  typed `whoami --verbose`, H1, buttons, watermark
    StatsWindow.tsx         (client)  traffic-light frame + 4 count-ups
    About.tsx / Work.tsx / Skills.tsx / AiLeadership.tsx / Projects.tsx / Contact.tsx / Footer.tsx
    SkillBar.tsx            (client)  20-cell █ bar, animated split
    logos/BladeMark.tsx, ScytheMark.tsx   # inline SVG, size + fill props (default var(--accent))
    shell/
      ShellProvider.tsx     # open/min/max state + context; launcher visibility
      ShellLauncher.tsx     # fixed 48×48 `>_` button
      ShellWindow.tsx       # frame, title bar, traffic lights, drag/resize/min/max
      ShellBody.tsx         # log, prompt, input, ghost autocomplete
      useShellEngine.ts     # React binding over core/terminal (lines, history, keys)
      useWindowControls.ts  # pointer-event drag/resize/clamp/min-max logic
  hooks/
    useTheme.ts           # data-theme attr + localStorage + T key + flash
    useReveal.ts          # IO-driven reveal (opacity/translateX), one-shot, delay prop
    useTypewriter.ts      # binds core typewriter to a ref on view
    useCountUp.ts / useAsciiBar.ts
    useActiveSection.ts   # IO rootMargin -30%/-60%
    useReducedMotion.ts
public/
  favicon.ico  og-image.png  Sivaguru_Ravi_Resume.pdf
design/handoff/           # relocated design package (source of truth)
docs/                     # relocated notes
e2e/                      # Playwright specs + screenshots
```

**Server vs client:** `layout.tsx`/`page.tsx` stay server components (metadata, JSON-LD, static composition). Every section component is a client component (`"use client"`) because all of them carry reveal/typing/count animations — but their static JSX still prerenders to HTML, so SEO/first paint are unaffected. The shell tree mounts nothing until opened (launcher only).

**Section → component mapping** is 1:1 with the prototype's screen labels: Nav, Hero (+StatsWindow), About, Work (4 cards, current-role accent border), Skills (4 columns + footer line), AiLeadership (tinted band, 4 cards + highlight card), Projects (framed table, rows 001–007, 007 highlighted), Contact (5 rows + shell button), Footer. All copy transcribed **verbatim** from the prototype.

---

## 3. Theming (dark/light, no flash)

- `tokens.css`: dark values on `:root`, light overrides on `:root[data-theme="light"]`. Glow and scanline opacity are **derived tokens** (`--glow: none` and `--scanlines-opacity: 0` in light), so components never branch on theme in JS.
- Accent stays a token: dark `#4af07a`, light `#25783d` (prototype's ×0.5 darken, precomputed). Alternate accents (amber/cyan/white) documented in tokens.css as commented one-line swaps — no UI for switching (matches prototype defaults).
- **No-flash:** tiny inline `<script>` in `<head>` (rendered by layout, before body paint):
  `document.documentElement.dataset.theme = localStorage.getItem('theme') ?? 'dark'` (try/catch). `<html suppressHydrationWarning>`.
- `useTheme`: toggle updates `data-theme` + localStorage, fires `ThemeFlash`, listens for `T` key (ignored while typing in inputs — matches prototype). Button label `[ LIGHT ]` / `[ DARK ]`.
- `::selection`, nav backdrop blur, scanlines all resolve purely from tokens.

---

## 4. Animation strategy (custom core)

All timing/curves copied from the prototype:

| Effect | Mechanism | Spec |
|---|---|---|
| Hero stagger | `tween` per element, CSS `opacity/transform` | 850ms easeOutExpo, 130ms stagger, 300ms delay, y 16→0 |
| Hero `$ whoami --verbose` | `core/typewriter` on mount | 45ms/char, blinking accent cursor |
| Section command lines | `useTypewriter` + IO (`threshold: 0.15`), one-shot flag | 32ms/char |
| Reveals (`data-reveal` equivalents) | `useReveal`: IO + tween | 700ms easeOutExpo, x −14→0, per-element delay |
| Stat count-ups | `useCountUp` on IO | 0→N, 1400ms easeOutExpo, suffix (`+`, `%`) |
| Skill bars | `useAsciiBar`: tween 0→pct, filled = `round(v/5)` of 20 `█` cells | 1300ms easeOutExpo; identical glyph both spans (fill accent / rest dim @ 30%) |
| Cursor blink | CSS `@keyframes blink` | 1–1.4s per element, as in prototype |
| Card/row/contact hovers | Pure CSS (`:hover` in modules) — no JS listeners | border/translate/background per prototype |
| Theme flash | DOM overlay, opacity→0 + scale→1.35 over 450ms | matches `logoFlash()` |

**Reduced motion:** `useReducedMotion` (media query `prefers-reduced-motion: reduce`) short-circuits every hook → final state rendered immediately (bars full, counts final, text complete, no reveals). Also a hidden shell command `motion on|off` as the explicit toggle the README asks for (persisted alongside theme). Same for `scanlines on|off`.

---

## 5. Floating interactive shell

### State model
Two cleanly separated concerns:

1. **Window chrome** (`useWindowControls` + `ShellProvider`):
   `{ open, minimized, maximized, pos: {x,y} | null, size: {w,h} | null }`
   - `null` pos/size = default docked bottom-right 20px, `min(540px, 100vw−32px)` × 340px.
   - Drag: pointerdown on title bar (ignored on buttons / while min/max), pointermove writes `style` directly (no re-render per frame), pointerup commits to state — exactly the prototype's approach. Clamp to viewport; auto-shrink width/height when the window would overflow right/bottom; min 340×180. `touch-action: none`.
   - Resize: `◢` handle, same pattern, pins top-left first.
   - Minimize docks the title bar bottom-right regardless of position; restore returns previous pos/size. Maximize = 16px inset fullscreen. Bar click toggles minimize (suppressed when a drag occurred — `dragging` flag).
2. **Terminal engine** (`core/terminal` + `useShellEngine`):
   `{ lines: Line[], value, history: string[], histIdx, completionCycle: {base, idx} | null }`

### Command registry (core, framework-agnostic)
```ts
type CommandContext = {
  print(lines): void; clear(): void;
  host: { scrollTo(section); toggleTheme(); download(path); startMatrix(); startSnake(); }
}
type Command = { run(args, ctx): void; man?: string; hidden?: boolean }
```
- Full set transcribed from the prototype: `help, whoami, skills, experience, projects, ai, contact, stock, resume, ls (-a → .secrets), cat, cd, open, man, pwd, history, echo, date, uname, exit, sudo, theme, clear, logo, matrix, snake` — outputs **verbatim**, including the `help` hint line and the `.secrets` riddles.
- `resume` / `open resume.pdf` / `cat resume.pdf` → download `/Sivaguru_Ravi_Resume.pdf`.
- Adding a command later = one registry entry; `help`/`man`/completion derive from the registry (hidden flag keeps easter eggs out of `help`).

### Completion (`core/terminal/completion.ts`)
- `candidates(value)` → `{head, prefix, list}` for the token under edit; arg sets for `cat`/`cd`/`open`/`man` exactly as prototype.
- **Ghost**: first match's remainder rendered in the absolutely-positioned mirror span behind the input (dim, 0.55 opacity).
- **Tab**: unique → complete (+trailing space unless dir); ambiguous → extend to common prefix + print candidates into the log.
- **↑/↓**: with prefix → cycle matches (wraps, anchored to the typed base); empty input → walk history. Any edit resets the cycle base.

### Easter eggs
- `matrix`: canvas engine in `core/games/matrix.ts` — fullscreen, accent glyph rain (katakana+digits), any key/click exits, cleans up rAF + listeners.
- `snake`: `core/games/snake.ts` — 21×21 grid, cell size adaptive, 110ms tick, arrows/WASD, R restart, ESC quit, swipe steer / tap restart / visible `✕ quit` (44px) on touch. Both engines take `(accent, onExit)` and own their DOM — React only calls `start/stop` (portable to Angular unchanged).

### Maintainability
Engine logic is plain TS with no rendering assumptions → future unit tests and Angular reuse are trivial; React layer is ~4 small files. Prompt input gets `font-size: 16px` under `pointer: coarse` (iOS zoom guard), log body `13.5px/1.6`, click-to-focus.

---

## 6. Assets

| Asset | Handling |
|---|---|
| `favicon.svg` | `src/app/icon.svg` (Next serves + links it) |
| `favicon.ico` | Generated **once** from the SVG (sharp → png-to-ico script, output committed to `public/favicon.ico`); referenced via metadata for legacy UAs |
| `og-image.png` | `public/og-image.png`, wired in `metadata.openGraph.images` (1200×630) |
| Logo SVGs | React components `BladeMark` / `ScytheMark` with `size` and `fill` props (`fill="var(--accent)"` default) — used in nav 19px, watermark 460px @ 0.05, shell title 13px, footer 14px, theme flash 120px. `logo-blade-light.svg` not needed in code (token handles it) but kept in `design/handoff/assets/` |
| Resume | `design/handoff/assets/Sivaguru_Ravi_Resume.pdf` → `public/Sivaguru_Ravi_Resume.pdf` (exact path the `resume` command and README require) |

Note: the prototype footer's "view modern variant →" link points at the other design file — **dropped in production** (replaced by nothing; footer otherwise verbatim).

---

## 7. SEO / metadata / JSON-LD

In `layout.tsx` (server):
- `metadataBase: https://shinigami-rog.cc`
- Title: `Sivaguru Ravi (shinigami-rog) — Senior SDE`; description from hero summary (9+ yrs, Java Spring Boot, Angular, AI-assisted engineering, Bangalore).
- OpenGraph (type website, url, og-image 1200×630) + Twitter `summary_large_image`.
- Icons: svg + ico; `themeColor` `#050705`.
- JSON-LD `Person` via `<script type="application/ld+json">`: name, `alternateName: "shinigami-rog"`, `jobTitle: "Senior Software Development Engineer"`, `url`, `sameAs` [LinkedIn], `address` Bangalore.
- `app/robots.ts` (allow all, sitemap ref) + `app/sitemap.ts` (single URL).
- Contact email stays `sivaguru94@gmail.com` per the signed-off design.

---

## 8. Testing & QA

### Playwright (smoke + visual)
Projects: Desktop Chromium 1440×900 · iPhone 14/15 emulation · iPhone Pro Max · iPad · Desktop + `prefers-reduced-motion: reduce`.

Smoke specs:
1. **Boot/meta** — title, JSON-LD present, no console errors, fonts load.
2. **Theme** — toggle flips `data-theme` + persists across reload; **no-flash** (theme attr set before first paint); `T` key works, ignored while shell input focused; flash overlay appears/disappears.
3. **Nav** — anchors scroll, active link highlights per section, ≤760px scrollable row.
4. **Animations** — hero types `whoami --verbose`, counts reach 9+/50+/70%/8, skill bar split correct (filled cells = round(pct/5)); reduced-motion project renders final states with no animation.
5. **Shell** — open via launcher + contact button; `help`, `ls -a` → `.secrets`, `cat .secrets`, `cd skills` scrolls, `sudo` denied, `clear`, history walk, Tab unique + ambiguous + ghost text, completion cycling.
6. **Easter eggs** — `matrix` opens/exits on key; `snake` opens, ESC quits.
7. **Resume** — `resume` triggers download of `/Sivaguru_Ravi_Resume.pdf` (assert download event + 200).
8. **Window** — drag moves + clamps, resize respects 340×180 min, minimize docks, maximize insets, restore returns.
9. **Touch project** — 44px hit targets, 16px shell input, project rows restacked at ≤760px.

Visual regression: full-page + per-section screenshots with animations force-finished (reduced-motion flag), dark + light, desktop + iPhone. Baselines committed; run in CI (GitHub Action) and pre-deploy.

### Manual QA checklist (release gate)
- Real iPhone + iPad Safari pass (drag/resize/swipe snake, iOS no-zoom on shell focus, backdrop blur).
- 760px boundary sweep (759/760/761), 320px narrow, 4K wide.
- Keyboard-only pass; focus visibility; `aria-label`s on icon buttons (already specced).
- Lighthouse: Performance/SEO/Best-practices/A11y ≥ 95 on prod URL.
- OG preview (opengraph.xyz), favicon in light+dark tabs, `exit 0` footer verbatim 🙂

---

## 9. Vercel deployment + domain

1. Push repo to GitHub (`master` = production branch).
2. Vercel: import repo → framework auto-detect Next.js → default build (`next build`). Preview deploys on every PR/branch.
3. Domains: add `shinigami-rog.cc` (+ `www.shinigami-rog.cc` → redirect to apex).
4. DNS at the `.cc` registrar: apex `A 76.76.21.21` (or ALIAS `cname.vercel-dns.com` if supported), `www` `CNAME cname.vercel-dns.com`. Vercel auto-provisions TLS.
5. Env: none needed (fully static).
6. Post-deploy: run Playwright against prod URL, verify OG/robots/sitemap/resume download, submit to Google Search Console.

---

## 10. Milestones (each independently reviewable)

| # | Milestone | Contents | Done when |
|---|---|---|---|
| **M0** | Repo reset + scaffold | Delete Angular, relocate handoff/docs, create-next-app, tokens.css, fonts, CLAUDE.md, empty page renders | `npm run dev` shows blank themed page; repo clean |
| **M1** | Chrome + theming | Nav, Footer, Scanlines, theme toggle + no-flash + flash overlay + T key | Theme round-trips with zero flash; nav matches design |
| **M2** | Static sections (pixel pass) | Hero, Stats, About, Work, Skills, AI, Projects, Contact — full verbatim copy, no motion | Side-by-side vs prototype at 1440/760/390 matches |
| **M3** | Motion layer | core/tween + typewriter, all reveal/count/bar/typing hooks, active-nav, reduced motion | Timings match prototype; reduced-motion clean |
| **M4** | Shell engine (core) | Command registry (all commands, verbatim outputs), completion engine, host-actions | Engine drives a minimal inline harness correctly |
| **M5** | Shell window | Launcher, window frame, drag/resize/min/max, ghost autocomplete UI, touch rules | Full README shell spec satisfied on desktop + touch |
| **M6** | Easter eggs | matrix + snake engines, entry/exit, touch controls | Trail: help → ls -a → .secrets → all three doors work |
| **M7** | Assets + SEO | favicon svg+ico, og-image, resume in public/, metadata, JSON-LD, robots/sitemap | Rich-preview + icon checks pass |
| **M8** | Test suite + QA | Playwright projects/specs, visual baselines, CI workflow, manual checklist run, fixes | All green locally + CI |
| **M9** | Deploy | Vercel project, domain + DNS, prod smoke, Search Console | `https://shinigami-rog.cc` live and verified |

Suggested flow: one PR per milestone on a `next-rewrite` branch (or sequential commits to `master` if you prefer — repo currently has no CI to break).

---

## 11. Resolved ambiguities (decisions baked in above)

- **anime.js** → replaced by zero-dep core (design-system driver; identical curves).
- **Footer "view modern variant" link** → dropped (points at a design file, not a page).
- **Scanlines/motion toggles** (README: "toggleable") → hidden shell commands `scanlines on|off`, `motion on|off` + `prefers-reduced-motion` honored; no extra UI chrome.
- **Accent switching** → token-level only (documented swaps), no UI — matches shipped prototype.
- **Email** → `sivaguru94@gmail.com` per signed-off design (not the work address).
- **`date` command** → uses real `new Date()` client-side (client component, no hydration concern since it renders only on command).
- **Static export** → not forced; default Next static prerender on Vercel.
