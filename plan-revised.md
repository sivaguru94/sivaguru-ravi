# Implementation Plan — shinigami-rog.cc Portfolio (Next.js) — REVISED

**Source of truth:** `design/handoff/README.md` + `design/handoff/Sivaguru Ravi Portfolio - Terminal.dc.html` (Terminal variant, signed off).
**Target:** pixel-perfect recreation as a Next.js App Router app, deployed on Vercel at `shinigami-rog.cc`.
**Approved decisions:** CSS Modules · zero-dependency custom animation core (design-system-ready) · Playwright smoke + visual testing · Angular app deleted, handoff/docs files relocated · conventions baked into `CLAUDE.md`.

> **Revision note:** this version incorporates the plan-review council's accepted findings (see `plan-review.md`). Inline `> Changed:` notes mark the substantive edits.

> **✅ Author decisions (2026-07-26):**
> 1. **Canonical resume = the handoff assets copy** (`design_handoff/assets/Sivaguru_Ravi_Resume.pdf`, verified as a real 2-page resume). The root copy is retired to `docs-private/`.
> 2. **Design wins** — phone number and stock-option story are published as signed off.
> 3. **New feature — command deep links:** URLs like `shinigami-rog.cc/sivaguru-ravi/whoami` render the site, open the shell, and run the command (see §5 "Command deep links").

---

## 0. Guiding constraint: future design system

The long-term goal is to extract a **terminal design system** from this site with both **React and Angular** component sets. Every architectural choice below follows one rule:

> **Framework-agnostic core, thin framework bindings.**

- **`src/core/`** — pure TypeScript, zero React imports, zero dependencies: tween/easing engine, typewriter, command registry, completion engine, matrix rain, snake game, theme store. This folder is the future `@shinigami-rog/terminal-core` package.
- **`src/styles/tokens.css`** — the CSS custom-property contract (`--bg`, `--fg`, `--accent`, `--dim`, `--line`, `--panel`, `--nav-bg`, `--glow`, `--accent-soft`). Never hardcode a themed color outside this file.
- **`src/components/`** — React bindings: hooks wrap the core engines, components own only JSX + CSS Modules. An Angular binding later re-wraps the same core.
- Side effects (scrolling, downloads, theme toggling) reach the core via an injected **host-actions interface**, never via direct `document` calls inside command handlers.
- **Engine contract:** every animation engine (tween, typewriter) returns a **cancel handle**; every hook's cleanup cancels and resets its one-shot state (React StrictMode double-mount safe). All per-frame output goes to the DOM via refs (`el.style`, `textContent`) — **never through React state**; React state holds only start/done flags.
  > Changed: cancel-handle + ref-write rules added (council: Perf Major, Frontend Minor — prevents 60Hz re-render jank and dev/prod divergence).

No anime.js: the prototype only uses `easeOutExpo` tweens + stagger, which a ~40-line rAF tween reproduces exactly, and the design system then has no animation peer-dependency.

---

## 1. Project setup

| Item | Choice |
|---|---|
| Framework | Next.js **15.x** (latest stable), App Router, React 19 |
| Language | TypeScript, `strict: true` |
| Styling | **CSS Modules** + global `tokens.css` / `globals.css` |
| Fonts | `next/font/google` — JetBrains Mono 400/500/600/700/800, `display: swap`, variable `--font-mono` (M2 verifies all five weights are actually used in the pixel pass; drop any that aren't) |
| Animation | Custom core (§4). No animation library |
| Lint/format | ESLint (next config) + Prettier |
| Package manager | npm, committed `package-lock.json`, `npm ci` in CI |
| Node | 20.x, pinned in `package.json` engines |

### Repo reset (M0 — exact sequence matters)
> Changed: fully resequenced (council: 2 Ops Blockers, Ops Major, Security Major). The old order — delete → relocate → scaffold — fails mechanically (`create-next-app` refuses a non-empty dir), operates destructively on never-committed files, and would commit private notes into public history.

1. **Purge junk recursively:** `find . -name '*:Zone.Identifier' -delete` (they exist inside `design_handoff/` and `assets/` too; `:` filenames make the repo uncloneable on Windows). Add `*Zone.Identifier` to `.gitignore`.
2. **Prune the handoff:** delete `design_handoff/"Sivaguru Ravi's portfolio website.zip"` (unreviewed bundle) and `support.js` (proprietary design-tool runtime — handoff says ignore it). Keep README, both `.dc.html` references, `assets/`.
3. **Private notes out of the repo:** move `personal-info.md`, `research-notes.md`, `cowork-prompt.md` → `docs-private/`; add `docs-private/` to `.gitignore`. They contain comp-sensitive reasoning and must never enter public git history.
4. **Resume canonical:** the handoff assets copy is canonical (author-confirmed, content verified). Root `Sivaguru_Ravi_Resume.pdf` moves to `docs-private/` (retired, not deleted).
5. **Safety commit + tag:** relocate `design_handoff/` → `design/handoff/`, then commit everything above (handoff, `plan.md`, review files) and tag `pre-next-rewrite`. This is the rollback point; the design source of truth is currently untracked and one bad `rm` away from gone.
6. **Delete the Angular app:** `src/`, `angular.json`, `package.json`, lockfiles, `tsconfig.*`, `.vscode/`. Keep `LICENSE`, `.editorconfig`, `.gitignore` (extended). Commit.
7. **Scaffold via scratch dir:** `npx create-next-app@latest` into a temp dir (App Router, TS, ESLint, no Tailwind, `src/`, alias `@/*`), copy the generated tree into the repo root, reconcile `.gitignore`. (The CLI refuses non-empty targets — `design/`, `plan.md`, `.editorconfig` are not on its allowlist.)
8. **Branch + CI + Vercel:** create working branch `next-rewrite` (once Vercel is connected, `master` is production). Add the GitHub Actions skeleton (lint + build + Playwright boot smoke; `permissions: contents: read`, actions pinned to major versions, Dependabot for npm + actions). Connect the Vercel project now — preview deploys give every milestone a review URL; the custom domain still waits until M9.
   > Changed: CI + Vercel front-loaded from M8/M9 (council: Ops Major — "independently reviewable milestones" needs automation from day one).
9. **Create `CLAUDE.md`:** repo map, "design/handoff is source of truth — do not redesign", token/styling conventions, core-vs-bindings rule, engine contract (§0), text-only terminal rendering rule (§5), external-link `rel` convention (§7), commands, QA expectations.

---

## 2. Component breakdown & file structure

```
src/
  app/
    layout.tsx            # SERVER — metadata, viewport, JSON-LD, font, body-first theme script
    page.tsx              # SERVER — composes the sections
    not-found.tsx         # 404 as a terminal screen: `404: command not found`
    sivaguru-ravi/[cmd]/page.tsx  # command deep links (see §5); dynamicParams=false → 404
    icon.svg  favicon.ico # icon FILE CONVENTIONS only (no metadata.icons)
    robots.ts / sitemap.ts
  styles/
    tokens.css            # custom properties: dark defaults + [data-theme="light"] overrides
    globals.css           # reset, ::selection, blink keyframes, hero entrance keyframes,
                          # [data-js] animation initial states, media helpers
  core/                   # ── framework-agnostic (future terminal-core pkg) ──
    tween.ts              # rAF tween → returns cancel handle; easeOutExpo
    typewriter.ts         # types text via callback, cancelable
    theme.ts              # subscribable theme/motion/scanlines STORE + safeStorage
                          # (try/catch get/set, allowlisted values) + accent math
    terminal/
      types.ts            # Line {text, tone}, CommandContext, Command
      commands.ts         # full registry — exact outputs from prototype
      completion.ts       # candidates(), common-prefix, ghost(), arg sets, cycle state
    games/
      matrix.ts           # canvas rain: DPR capped ≤2, handles resize/orientationchange
      snake.ts            # 21×21 snake (keyboard + swipe, restart, HUD)
  components/
    anim/                 # ── client leaf wrappers (the ONLY animated client code in sections) ──
      Reveal.tsx          # <Reveal delay={n}>{children}</Reveal>
      TypedCommand.tsx    # <TypedCommand text="cat about.md"/> — SSR renders full text
      CountUp.tsx         # <CountUp to={70} suffix="%"/>
      AsciiBar.tsx        # <AsciiBar pct={95}/>
    Scanlines.tsx           (client)  single top-level fixed element, opacity via token
    ThemeFlash.tsx          (client)  120px blade flash on toggle
    ThemeProvider.tsx       (client)  mounts ONCE; owns core theme store, T key, flash
    Nav.tsx                 (client)  active-section IO + toggle button (reads store)
    Hero.tsx                (client)  self-starting typewriter + CSS entrance (see §4)
    StatsWindow.tsx         (server)  frame + 4 <CountUp/> leaves
    About/Work/Skills/AiLeadership/Projects/Contact/Footer  (SERVER — copy stays out of JS)
    logos/BladeMark.tsx, ScytheMark.tsx   # inline SVG, size + fill props
    shell/                # loaded via next/dynamic (ssr: false) on first open;
                          # preloaded on launcher hover/focus
      ShellProvider.tsx / ShellLauncher.tsx (client, in main bundle — tiny)
      ShellWindow.tsx / ShellBody.tsx / useShellEngine.ts / useWindowControls.ts
  hooks/
    useReveal.ts / useTypewriter.ts / useCountUp.ts / useAsciiBar.ts
    useActiveSection.ts   # IO rootMargin -30%/-60%
    useReducedMotion.ts   # media query + store; subscribes to `change`
public/
  og-image.png  Sivaguru_Ravi_Resume.pdf
design/handoff/           # relocated design package (source of truth)
docs-private/             # gitignored — personal notes never committed
e2e/                      # Playwright specs + Chromium screenshot baselines
```

> Changed: sections are now **server components** with tiny client leaf wrappers instead of whole-section `"use client"` (council: Perf Major — all-client sections double-ship every byte of résumé copy and gate animations on full-tree hydration). The §0 core/bindings architecture is unchanged — hooks live inside the wrappers.
> Changed: shell + games are code-split (`next/dynamic` + dynamic `import()` inside the `matrix`/`snake` command handlers) — "mounts nothing until opened" previously still shipped the whole module graph in first-load JS (council: Perf Major).
> Changed: added `not-found.tsx`; icons via file conventions only (council: Ops Minors).

**Section → component mapping** is 1:1 with the prototype's screen labels. All copy transcribed **verbatim** — and because sections are server components, that copy exists only in HTML, not the JS bundle.

---

## 3. Theming (dark/light, no flash)

- `tokens.css`: dark values on `:root`, light overrides on `:root[data-theme="light"]`. Glow and scanline opacity are **derived tokens** — components never branch on theme in JS. Accent: dark `#4af07a`, light `#25783d` (precomputed ×0.5 darken). Alternate accents documented as commented swaps; no switcher UI.
- **No-flash + JS gate:** an inline `<script dangerouslySetInnerHTML>` rendered as the **first child of `<body>`** in `layout.tsx` (App Router does not support hand-authored `<head>` children; body-first is parser-blocking and runs pre-paint — same effect):
  ```js
  try { var t = localStorage.getItem('theme'); } catch(e) {}
  document.documentElement.dataset.theme = t === 'light' ? 'light' : 'dark';  // allowlisted
  document.documentElement.dataset.js = '';   // gates animation initial states (§4)
  ```
  `<html suppressHydrationWarning>`.
  > Changed: placement moved from `<head>` (not implementable in App Router — would silently no-op and reintroduce the flash) to body-first; stored value allowlisted; script doubles as the `data-js` gate (council: Frontend Majors, Security Minor).
- **Single owner:** `core/theme.ts` is a subscribable store (theme, motion, scanlines) using a `safeStorage` wrapper (try/catch get **and set** — Safari private mode throws on `setItem`). `ThemeProvider` mounts once, registers the single `T` key listener (ignored while typing in inputs), fires `ThemeFlash`. Nav's button and the shell's `host.toggleTheme()` both call the store — no duplicate listeners, no double-toggle.
  > Changed: hook-per-component ownership replaced by one store + provider (council: Frontend Major — two `useTheme` instances meant two `T` listeners → double-toggle no-op with double flash). A framework-agnostic store also ports to Angular better than hook-owned state.

---

## 4. Animation strategy (custom core)

> Changed: hero entrance is now **pure CSS**, and all JS-driven animation follows the ref-write + geometry-reservation rules below (council: Perf Blocker + 2 Majors, Frontend Major). The hero H1 is the LCP element — it must paint without JavaScript.

**Hero (above the fold — no JS dependency):**
- Entrance stagger: CSS `@keyframes` + per-child `animation-delay` (850ms easeOutExpo-approximated curve, 130ms stagger, 300ms base delay), present in server HTML — starts at first paint, before hydration. The H1 is exempt from any JS-gated hidden state.
- `$ whoami --verbose` typewriter: self-starting on mount, begins after `document.fonts.ready` (capped at ~300ms wait) to avoid mono-font metric stutter; SSR HTML contains the full text (mismatch-safe: cleared and retyped in `useLayoutEffect`, prototype's own `data-text` pattern).

**Below the fold (JS/IO-driven):**
- Initial hidden states (`opacity:0; translateX(-14px)`) applied **only** under `html[data-js]` in CSS — set pre-paint by the §3 script. No JS → full content visible; JS → no paint-then-blank pop; SSR HTML always contains full content (SEO intact).
- `useReveal` (IO threshold 0.15, one-shot): tween 700ms easeOutExpo, x −14→0, per-element delay.
- `TypedCommand`: 32ms/char on scroll-in. **Zero-CLS rule:** the full command string is rendered invisibly (`visibility:hidden`) to fix the line box; typing reveals an overlaid copy — no reflow mid-typing (commands wrap at 320–390px otherwise).
- `CountUp`: 0→N, 1400ms easeOutExpo; numeral container gets `min-width` in `ch` sized to the final string — no layout shift as digits grow.
- `AsciiBar`: tween 0→pct, 1300ms; filled cells = `round(v/5)` of 20 `█`; **writes `textContent` only when the filled-cell count changes** (≤20 writes, not ~78).
- All per-frame writes via refs (§0 rule); cursor blink stays pure CSS.
- Hovers: pure CSS `:hover` in modules. Theme flash: DOM overlay, 450ms.

**Reduced motion:** effective-reduced-motion = `prefers-reduced-motion: reduce` **OR** persisted `motion off` (precedence defined; both live in the theme store). `useReducedMotion` subscribes to the matchMedia `change` event — flipping it mid-session cancels in-flight animations (cancel handles, §0) and jumps to final states. Shell commands `motion on|off`, `scanlines on|off` persist via `safeStorage`.

---

## 5. Floating interactive shell

Loaded on demand (§2). Two cleanly separated concerns:

### Window chrome (`useWindowControls` + `ShellProvider`)
`{ open, minimized, maximized, pos: {x,y} | null, size: {w,h} | null }` — `null` = docked bottom-right 20px, `min(540px, 100vw−32px)` × 340px.
- **Drag:** pointerdown on title bar (ignored on buttons / while min/max) with `setPointerCapture`; track the active `pointerId` and ignore other pointers (second-finger guard); `pointercancel` handled identically to `pointerup` (system-gesture interruption otherwise leaves listeners attached and the `dragging` flag stuck). During the gesture, move via `transform: translate3d()` on a compositor layer with viewport dims cached at pointerdown (no per-move layout reads); commit `left/top` to state once on pointerup. Clamp to viewport; auto-shrink when overflowing right/bottom (size writes only then); min 340×180; `touch-action: none`. **Invariant:** nothing but the drag handlers updates `pos`/`size` while a drag is active.
  > Changed: pointercancel/pointerId/capture, transform-during-drag, cached dims added (council: Frontend + Perf Minors).
- **Viewport re-clamp:** a `window` resize listener re-clamps committed `pos` and caps `size` with the same clamp math (rotate a tablet after dragging right and the title bar — including the only close button — would otherwise be unreachable off-screen).
  > Changed: added (council: Frontend Major).
- Resize handle `◢`: same pointer pattern, pins top-left. Minimize docks bar bottom-right; restore returns previous pos/size; maximize = 16px inset; bar click toggles minimize (suppressed after a drag).
- **Focus management:** input focused on open, restore, and maximize; refocused after matrix/snake exit (`onExit`); focus returns to the launcher on close.

### Terminal engine (`core/terminal` + `useShellEngine`)
- **State split:** `value` + ghost live in the input component's local state; `lines` is a separate memoized list (`React.memo` per line) — a keystroke never re-renders the log.
  > Changed: split specified (council: Perf Minor — INP tax on typing once the log grows).
- **Rendering rule:** log lines render as **React text nodes only** (`tone` → CSS class). `dangerouslySetInnerHTML` is banned in the shell tree — `echo`, the `logo` ASCII art (in `<pre>`), and Tab-candidate printing all reflect input/output as text. `host.download()`/`open` map **validated command names to fixed constant paths**; the raw argument never reaches an `href`.
  > Changed: made explicit (council: Security Minor — becomes a real sink the day a `?cmd=` deep link is added).
- **CommandContext:**
  ```ts
  type CommandContext = {
    print(lines): void; clear(): void;
    history: readonly string[];                    // `history` command needs it
    host: { scrollTo(section); toggleTheme(); download(): void; startMatrix(); startSnake(); }
  }
  type Command = { run(args, ctx): void; man?: string; hidden?: boolean; noEcho?: boolean }
  ```
  `clear` uses `noEcho` (prototype clears without echoing the prompt line). **`hidden` affects `help` output only** — completion, cycling, and `man` derive from the full registry, exactly like the prototype (`mat` + Tab discovering `matrix` is part of the easter-egg trail).
  > Changed: history/noEcho/hidden semantics fixed (council: Frontend Minors — the old context couldn't implement `history`, and hiding eggs from completion would break fidelity).
- Full command set transcribed verbatim: `help, whoami, skills, experience, projects, ai, contact, stock, resume, ls (-a → .secrets), cat, cd, open, man, pwd, history, echo, date, uname, exit, sudo, theme, clear, logo, matrix, snake` — including the `help` hint and `.secrets` riddles.
- **Completion:** `candidates(value)` → `{head, prefix, list}`; arg sets for `cat`/`cd`/`open`/`man` as prototype. Ghost = first match's remainder in the mirror span. Tab: unique → complete; ambiguous → common prefix + print candidates. ↑/↓: prefix → cycle matches (anchored, wraps); empty → history walk; any edit resets the cycle.
- **Easter eggs:** engines own their DOM, take `(accent, onExit)`, clean up rAF/listeners. Matrix: DPR ≤ 2 backing store, recomputes size + columns on resize/orientationchange. Snake: 110ms tick, arrows/WASD, R restart, ESC quit, swipe/tap + visible 44px `✕ quit` on touch.
- Input `font-size: 16px` under `pointer: coarse`; log `13.5px/1.6`; click-to-focus.

### Command deep links (`shinigami-rog.cc/sivaguru-ravi/<command>`)
> Changed: added per author request (2026-07-26) — shareable command URLs with the author's name in the path.
- Route `app/sivaguru-ravi/[cmd]/page.tsx` with `generateStaticParams` over the **fixed, argument-less command registry** (info + unix + easter eggs — a shared `/sivaguru-ravi/matrix` link is deliberate) and `dynamicParams = false`, so anything else hits the `command not found` 404 page — which is now literally accurate.
- Behavior: renders the same single page; after hydration it scrolls to the matching section (if the command has one), opens the shell (triggering its dynamic import), and runs the command through the normal engine. The allowlist means no arbitrary input ever reaches the registry from a URL, preserving the §5 text-only/no-injection posture.
- SEO: each cmd route sets `alternates.canonical: '/'` and `robots: { index: false }`; the sitemap lists only `/`. No duplicate-content dilution.

---

## 6. Assets

| Asset | Handling |
|---|---|
| `favicon.svg` | `src/app/icon.svg` (file convention) |
| `favicon.ico` | Generated once (sharp → png-to-ico script kept in repo, sharp as devDependency), committed as `src/app/favicon.ico` (file convention). No `metadata.icons`. |
| `og-image.png` | `public/og-image.png`, wired in `metadata.openGraph.images` (1200×630) |
| Logo SVGs | `BladeMark` / `ScytheMark` components, `fill="var(--accent)"` default — nav 19px, watermark 460px @ 0.05, shell title 13px, footer 14px, flash 120px |
| Resume | **canonical PDF (per open question #1)** → `public/Sivaguru_Ravi_Resume.pdf` |

Footer's "view modern variant →" link (points at a design file) — dropped in production.

---

## 7. SEO / metadata / JSON-LD

In `layout.tsx` (server):
- `metadataBase: https://shinigami-rog.cc`; title `Sivaguru Ravi (shinigami-rog) — Senior SDE`; description from hero summary.
- OpenGraph + Twitter `summary_large_image`; `alternates: { canonical: '/' }` (the `*.vercel.app` alias serves identical content — see §9).
- `export const viewport = { themeColor: '#050705' }` (Next 15 — `themeColor` in `metadata` is deprecated).
  > Changed: viewport export + canonical (council: Ops/Frontend Minors).
- JSON-LD `Person`: object built in TS, serialized with `JSON.stringify(data).replace(/</g, '\\u003c')` before `dangerouslySetInnerHTML` (`</script>`-breakout hygiene for future edits).
- **Convention:** all external links get `target="_blank" rel="noopener noreferrer"`.
- `app/robots.ts` + `app/sitemap.ts` (single URL). Contact email stays `sivaguru94@gmail.com` per the signed-off design.

---

## 8. Testing & QA

> Changed: visual regression rewritten for determinism; specs grow per milestone instead of landing big-bang at M8 (council: Ops Majors).

### Playwright
**Projects:** Desktop Chromium 1440×900 · Chromium mobile-viewport emulation (390×844, 430×932) · iPad + iPhone **WebKit** projects (functional specs only) · Desktop Chromium + `prefers-reduced-motion: reduce`.

**Smoke specs** (added at the milestone that builds the feature):
1. Boot/meta — title, JSON-LD, no console errors (M0/M1).
2. Theme — `data-theme` flips + persists; no-flash (attr set before first paint); `T` key incl. input-focus guard; single flash per toggle (M1).
3. Nav — anchors, active-link highlight, ≤760px scroll row (M2).
4. Animations — hero types, counts land, bar split = `round(pct/5)`; **hero H1 visible with JS disabled** (`javaScriptEnabled: false`); reduced-motion renders final states; **zero layout shift** from typewriter/count-up (CLS assertion) (M3).
5. Shell — open via launcher + contact button; commands, `.secrets` trail, `cd` scroll, history walk, Tab unique/ambiguous/ghost, cycling (M5).
6. Easter eggs — matrix opens/exits; snake opens, ESC quits (M6).
7. Resume — `download.suggestedFilename()` on Desktop Chromium only; separate `request.get('/Sivaguru_Ravi_Resume.pdf')` → 200 + `application/pdf` (M7).
8. Window — drag/clamp, resize min 340×180, minimize/maximize/restore, **re-clamp after viewport resize** (M5).
9. Touch — 44px targets, 16px input, project-row restack ≤760px (M5).
10. 404 page renders the terminal screen (M7).
11. Deep links — `/sivaguru-ravi/whoami` opens the shell and runs the command with output; unknown `/sivaguru-ravi/xyz` → 404 (M5).

**Visual regression (Chromium projects only):** full-page + per-section, dark + light, desktop + mobile viewport. Determinism: Playwright `animations: 'disabled'` (freezes CSS blink cursors — the JS reduced-motion path doesn't cover those), await `document.fonts.ready` before capture, `maxDiffPixelRatio` tolerance, **baselines generated in CI** (`--update-snapshots` workflow; local runs use the Playwright Docker image). WebKit rendering (backdrop-filter, glow) is covered by the manual device pass, not screenshots.

**Perf budgets early:** Lighthouse-CI step from M2/M3: LCP < 2s (moto-G throttling), CLS < 0.05, first-load JS < ~110KB gz — a ratchet, not an M8 hope.

### Manual QA checklist (release gate)
- Real iPhone + iPad Safari: drag/resize/swipe snake, no iOS zoom on shell focus, backdrop blur, glow rendering.
- 759/760/761px sweep, 320px, 4K. Keyboard-only pass (launcher focus return, shell focus cycle). DevTools: scanlines composited, no paint flashing on scroll (M1 criterion).
- Lighthouse ≥95 all categories on prod URL. OG preview, favicon light+dark tabs, `exit 0` footer verbatim.

---

## 9. Vercel deployment + domain

1. Vercel project connected at **M0** (§1 step 8); `master` = production branch, `next-rewrite` merges into it per milestone. Preview deploys: public + auto `X-Robots-Tag: noindex` — accepted as-is (Deployment Protection optional, not required).
2. **Security headers** in `next.config.ts` `headers()`: `X-Content-Type-Options: nosniff`, `Content-Security-Policy: frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin`, minimal `Permissions-Policy`. Full script-src CSP **deliberately deferred**: App Router inline hydration scripts + our body-first theme script would need hash/nonce plumbing — disproportionate here; recorded so a future "add CSP" doesn't silently break no-flash.
   > Changed: added (council: Security Major).
3. Domains: add `shinigami-rog.cc` (+ `www` → apex redirect). Enable "redirect deployment domain to primary" so `*.vercel.app` doesn't serve duplicate content.
4. DNS at the registrar: **use the exact records the Vercel domain screen shows for this project** (Vercel is rolling out per-project DNS values); expected defaults `A 76.76.21.21` / `www CNAME cname.vercel-dns.com`. TLS auto-provisions.
5. Post-deploy: Playwright against prod, OG/robots/sitemap/resume checks, Search Console via **DNS TXT domain property** (covers apex+www; you're already at the registrar).

---

## 10. Milestones (each independently reviewable — now with CI + preview URLs from M0)

| # | Milestone | Contents | Done when |
|---|---|---|---|
| **M0** | Repo reset + scaffold + rails | §1 sequence: junk purge → handoff prune → private notes out → resume verified → safety commit + tag → Angular deleted → scratch-dir scaffold → `next-rewrite` branch → CI skeleton → Vercel connect → tokens.css, fonts, CLAUDE.md | CI green on empty themed page; preview URL live; `pre-next-rewrite` tag exists |
| **M1** | Chrome + theming | ThemeProvider/store, body-first script, Nav, Footer, Scanlines, flash, `T` key | No-flash spec green; scanlines composited (paint-flashing check); single-toggle spec green |
| **M2** | Static sections (pixel pass) | Server-component sections, full verbatim copy, no motion; weight audit | Visual baselines (CI-generated) match prototype at 1440/760/390; Lighthouse budget green |
| **M3** | Motion layer | CSS hero entrance, anim leaf wrappers, ref-write hooks, reduced-motion (live), active-nav | Hero-paints-without-JS spec green; CLS assertion green; timings match prototype |
| **M4** | Shell engine (core) | Registry (verbatim outputs), completion, host-actions, history/noEcho/hidden semantics | Engine drives a minimal harness; text-only rendering rule enforced |
| **M5** | Shell window + deep links | Dynamic-loaded window, drag/resize/min/max (pointer lifecycle, re-clamp), ghost UI, focus mgmt, touch, `/sivaguru-ravi/[cmd]` routes | Shell + window + touch + deep-link specs green on all projects |
| **M6** | Easter eggs | matrix (DPR cap, resize) + snake, dynamic imports, entry/exit + focus return | Trail specs green; games not in first-load bundle (build output check) |
| **M7** | Assets + SEO | Icons via file conventions, og, resume, metadata + viewport, JSON-LD, robots/sitemap, 404, headers | Rich-preview, icon, 404, headers checks green |
| **M8** | Full QA hardening | Remaining specs, visual sweep, manual device checklist, fixes | All CI green; manual checklist signed off |
| **M9** | Deploy | Domain + DNS (dashboard values), redirects, prod smoke, Search Console TXT | `https://shinigami-rog.cc` live and verified |

---

## 11. Resolved ambiguities & recorded decisions

- **anime.js** → zero-dep core (design-system driver; identical curves).
- **Hero entrance** → pure CSS in server HTML; JS tween core is below-fold only (LCP protection).
- **Sections** → server components + client anim leaves (bundle/hydration).
- **Shell/games** → code-split, loaded on demand.
- **Footer "view modern variant" link** → dropped.
- **Scanlines/motion toggles** → hidden shell commands + `prefers-reduced-motion` (live-subscribed); precedence: OS preference OR persisted off.
- **Accent switching** → token-level only, no UI.
- **Email** → `sivaguru94@gmail.com` per signed-off design.
- **`hidden` commands** → hidden from `help` only; completion/`man` see all.
- **Full CSP** → deferred with rationale (§9.2).
- **Vercel previews** → public + noindex, accepted.
- **Private notes** (`personal-info.md`, `research-notes.md`, `cowork-prompt.md`) → never committed; live in gitignored `docs-private/`.
- **Static export** → not forced; default Next static prerender.
- **Command deep links** → `/sivaguru-ravi/<cmd>` routes run the command via the shell; canonical stays `/`.

## 12. Open questions — RESOLVED (2026-07-26)

1. **Canonical resume PDF** → the handoff assets copy (verified real, 2 pages); root copy retired to `docs-private/`.
2. **Phone + stock story** → design wins; both published.
