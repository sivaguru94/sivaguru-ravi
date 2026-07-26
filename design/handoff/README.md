# Handoff: Sivaguru Ravi Portfolio Website (Next.js)

## Target repo
Implement in the local repo at **`C:\Work\sivaguru-ravi-protfolio`** — all Next.js code, assets, and deployment config go there.

## Overview
A personal portfolio website for Sivaguru Ravi (Senior SDE, Bangalore), alias **shinigami-rog**, domain **shinigami-rog.cc** — replaces a traditional CV. Two visual variants exist; **the Terminal variant is the chosen direction to implement**. The Modern variant is an alternate reference only.

Goal for the developer: build this as a **Next.js app** (App Router, latest stable) and deploy (Vercel recommended, custom domain shinigami-rog.cc).

## About the Design Files
The `.dc.html` files in this bundle are **design references created in HTML** — high-fidelity prototypes showing intended look and behavior, NOT production code to copy directly. They use a proprietary runtime (`support.js`) that will not work outside this design tool. Your task is to **recreate the design in Next.js/React**, reading the markup and inline styles from the template section of the file and the behavior from the `class Component` logic at the bottom.

How to read a `.dc.html` file:
- Markup lives inside `<x-dc>…</x-dc>` — plain HTML with inline styles (translate to JSX/Tailwind/CSS modules as you prefer).
- Behavior lives in the `<script data-dc-script>` class — treat it like a React class component (`componentDidMount`, state, handlers). Reimplement as hooks.
- `{{ handle }}` template holes map to values returned by `renderVals()` in the class.
- CSS custom properties (`--bg`, `--fg`, `--accent`, `--dim`, `--line`, `--panel`, `--nav-bg`, `--glow`, `--accent-soft`) implement theming — keep this pattern; it maps cleanly to a `data-theme` attribute on `<html>` or a top wrapper.

## Fidelity
**High-fidelity.** Recreate pixel-perfectly: exact colors, typography, spacing, copy, and animations as specified below.

## Tech Recommendations
- Next.js (App Router) — single-page site: one route `/`, section anchors (`#about`, `#work`, `#skills`, `#ai`, `#projects`, `#contact`).
- Everything below the fold animates on scroll → page body is a client component (`"use client"`). Metadata/SEO stays in the server layout.
- Animations: prototype uses **anime.js v3** (`animejs`). Keep it, or reimplement with CSS + IntersectionObserver.
- Fonts: `next/font/google` — **JetBrains Mono** (weights 400–800). The ONLY font family on the site.
- Theme persistence: localStorage, default dark; apply before paint (inline script in layout) to avoid flash.
- Deploy: Vercel; add domain shinigami-rog.cc.

## Brand / Logo System (signed off — do not redesign)
All assets in `assets/`. Two marks, both pure SVG (also usable as inline JSX):
- **Primary mark — "Tapered Blade"** (`logo-blade.svg`): a filled, tapered `>` caret with a block cursor in its mouth. Geometry (viewBox 0 0 64 64): path `M12 8C34 17 48 25 51 32C48 39 34 47 12 56L12 45C25 40.5 31 36.5 34.5 32C31 27.5 25 23.5 12 19Z` + rect `13,26 13×12`. Accent-colored (`--accent`); `logo-blade-light.svg` is the light-theme `#25783d` version — in code just use `fill="var(--accent)"`.
- **Secondary mark — "Scythe"** (`mark-scythe.svg`): curved blade + vertical shaft: path `M46 6C24 5 8 16 4 34C13 21 27 17 46 20Z` + rect `37,6 9×52`. Used small, for meaning (shinigami), never as the primary lockup.

Placements (all implemented in the prototype — copy exactly):
1. **Favicon** = scythe on dark rounded tile (`favicon.svg`; the prototype inlines it as a data-URI `<link rel="icon">`). Use as `icon` in Next metadata; optionally generate .ico/PNG sizes from it.
2. **Nav** = 19px blade mark before the `shinigami-rog:~$` wordmark.
3. **Hero watermark** = 460px blade mark, `opacity:0.05`, absolutely positioned right of hero (right:-40px, vertically centered), pointer-events none, behind content.
4. **Shell title bar** = 13px scythe mark (dim color) before the shell title.
5. **Footer** = 14px blade mark (dim) before the © line.
6. **Theme-toggle flash** = on every theme toggle, a 120px blade mark appears centered full-screen (fixed overlay, pointer-events none) and fades out over ~450ms while scaling to 1.35.
7. **OG image** = `assets/og-image.png` (1200×630, ready to use as `openGraph.images`).

## Design Tokens (Terminal variant)
Dark theme (default):
- `--bg: #050705` (page), `--panel: rgba(255,255,255,0.015)` (card fill)
- `--fg: #e6efe6` (body text), `--dim: #6f7d6f` (secondary text)
- `--accent: #4af07a` (phosphor green), `--accent-soft: rgba(74,240,122,0.06)` (section tint)
- `--line: rgba(74,240,122,0.16)` (borders = accent @ 16%)
- `--nav-bg: rgba(5,7,5,0.85)`
- `--glow: 0 0 16px rgba(74,240,122,0.45)` (text-shadow on accent headings/prompts; dark mode only)

Light theme:
- `--bg: #f2f1ea`, `--panel: rgba(0,0,0,0.025)`, `--fg: #1c211c`, `--dim: #57605a`
- `--nav-bg: rgba(242,241,234,0.9)`, `--line: rgba(20,40,25,0.18)`
- Accent in light mode = dark accent × 0.5 per RGB channel → `#25783d`. Glow: none. Scanlines: hidden.

Alternate accent options (tweakable): `#4af07a` (green, default), `#ffb347` (amber), `#5ad7ff` (cyan), `#e6efe6` (white).

Typography: JetBrains Mono everywhere.
- H1 hero: `clamp(40px, 8vw, 96px)`, weight 800, letter-spacing -0.04em, uppercase, line-height 1
- Section H2: `clamp(24px, 3.5vw, 36px)` (about) / `clamp(28px, 4.5vw, 52px)` (AI) / `clamp(32px, 6vw, 72px)` (contact), weight 700–800
- Command lines: 14px, `--dim`; prompt `$` in `--accent` with glow
- Body: 14–15px, line-height 1.6–1.75; meta/labels: 11–12px, letter-spacing 0.06–0.12em

Other: radius 4px (cards/buttons), 6–10px (framed panels/windows); ::selection = accent bg + `#050705` text; max content width 1100px, side padding 24px; ~80px vertical section padding, 1px `--line` top border between sections.

## Global Effects
- **Scanlines**: fixed overlay, `repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0 1px, transparent 1px 3px)`, opacity 0.3, pointer-events none. Dark mode only. Toggleable.
- **Glow**: `text-shadow: var(--glow)` on accent prompt `$`, hero underscore, big numerals. Dark mode only.
- **Blink**: `@keyframes blink {0%,49%{opacity:1} 50%,100%{opacity:0}}` on cursors (▊, _), 1–1.4s infinite.
- **Reduce motion**: honor a toggle and `prefers-reduced-motion`.

## Screens / Sections (single page, in order)

### 1. Fixed Nav (terminal bar), 56px tall
- Left: 19px blade mark + `shinigami-rog` (accent, glow) + `:~$` (dim) + blinking `▊`. Links to `#top`.
- Center: links `./about ./work ./skills ./ai ./projects ./contact`, 12px, dim; hover → accent; active section highlighted via IntersectionObserver (rootMargin `-30% 0px -60% 0px`).
- Right: theme toggle `[ LIGHT ]` / `[ DARK ]`, 1px `--line` border. Also keyboard key `T` (ignored while typing in inputs).
- **≤760px**: nav links become a horizontally scrollable row under the bar (scrollbar hidden), 44px tap targets; bar wraps.
- Bar: backdrop-blur 12px, `--nav-bg`, bottom border `--line`.

### 2. Hero (min-height 96vh, centered column)
- Faint blade watermark behind (see Brand §3).
- Line 1: `$ whoami --verbose` types itself on load (~45ms/char), blinking accent cursor.
- H1: "SIVAGURU / RAVI_" (underscore accent + glow).
- Accent line: `> SENIOR SDE · 9+ YRS · JAVA SPRING BOOT · ANGULAR`, then a second line `> a.k.a. shinigami-rog · shinigami-rog.cc` (alias in `--fg`).
- Comment block (dim, # prefixed, 3 lines): architecting enterprise apps 9+ years / stock options Nov 2025 / building the org's AI-assisted engineering playbook.
- Buttons: `./contact --now` (solid accent, dark text) and `cat experience.log` (outline).
- **Stats terminal window**: framed panel with macOS traffic lights (#ff5f57 #febc2e #28c840) + label `shinigami-rog: ~/stats — $ stats --summary`. 4-col grid (min 150px): count-up numerals (1400ms easeOutExpo on scroll-in): `9+ YRS_EXPERIENCE`, `50+ ENGINEERS_MENTORED`, `70% FASTER_BUILDS`, `8 SECURITY_TOOLS`.
- Hero children stagger in on load: opacity 0→1, translateY 16→0, 850ms easeOutExpo, 130ms stagger, 300ms delay.

### 3. About (`#about`)
- Command: `$ cat about.md` (types on scroll-into-view, ~32ms/char).
- Two-col grid (min 300px, gap 40px): H2 "Nine years of shipping systems people rely on."; right: P1 (15px --fg) 9+ years / Java Spring Boot + Angular (bold accent) / microservices, security, healthcare, UI platforms; P2 (14px --dim) stock options Nov 2025, B.Tech CS Mahatma Gandhi University, Bangalore.

### 4. Work (`#work`)
- Command: `$ cat experience.log | sort -r`
- 4 cards (gap 14px): --panel fill, --line border, radius 4px, padding 24px. Current role card: 3px accent left border.
- Header: company (18px 700) + `· ROLE` (14px; accent if current) + `[2023-08 → PRESENT]` (12px dim, right). Location 12px dim. Bullets with accent `>` prefix.
- Content: (1) **Infrrd Inc · TECHNICAL_SPECIALIST** [2023-08 → PRESENT] — stock options Nov 2025; OSS security framework, 8 tools; Annie UI on Angular 16; builds -70% (20–30 min → <10 min); mentoring. (2) **Philips India · SOFTWARE_TECHNOLOGIST_1** [2021-12 → 2023-07] — healthcare product dev; role-based API security; Azure Pipelines. (3) **Infrrd Inc · SENIOR_SOFTWARE_ENGINEER** [2020-05 → 2021-11] — Python SDK for AWS automation (60% efficiency); third-party APIs; image processing SDK. (4) **Mindtree · SENIOR_SOFTWARE_ENGINEER** [2017-01 → 2019-10] — 3D Canvas UI for Bose VB1 (Angular 8, Electron); mentored 50+ engineers; BLE Mesh indoor localization.

### 5. Skills (`#skills`)
- Command: `$ ls skills/ --proficiency`
- 4-col responsive grid (min **340px**, gap 36px 48px). Column headers `/backend /frontend /cloud-devops /security` (12px accent).
- Each row is a 2-col grid `1fr auto` (gap 14px): name (14px) + **block bar**: 20 cells of `█` at 11px/line-height 1, split into two spans — filled cells `--accent`, remaining cells `--dim` @ 30% opacity. **Identical glyph for both parts** (never mix █ with ░/▌ — fallback fonts render them at different heights). No numeric score shown. Bars animate the split point on scroll-in (1300ms easeOutExpo). Filled cells = round(pct/5).
- Values: backend Java&Spring Boot 95, RESTful APIs 95, Microservices 90, Node.js&Python 85 · frontend Angular 2–16 95, RxJS 90, React&TypeScript 88, UI/UX 85 · cloud Build Optimization 92, Azure DevOps 90, Docker&CI/CD 88, AWS 85 · security OSS Vulnerability 90, Security Remediation 90, License Compliance 88, OWASP 85.
- Footer line: `/ai-assisted-dev → Claude/Cursor-based workflows · custom Claude skills · org-wide automation tooling`

### 6. AI Leadership (`#ai`)
- Full-width band tinted `--accent-soft`. Command: `$ ./ai-leadership --status` + `AI-NATIVE` badge.
- H2 "AI-ASSISTED ENGINEERING LEADERSHIP". Intro (dim, # prefixed): driving Claude & AI adoption org-wide.
- 4 cards (grid min 250px): `pr-review-council`, `epic-delivery`, `worktree`, `time-log` (copy in prototype). Hover: accent border, translateY(-3px).
- Highlight card (accent border): blinking dot + `PROCESS RUNNING · IN PROGRESS`; "org-level project-wide memory system for Claude".

### 7. Projects (`#projects`)
- Command: `$ ls -la projects/`. Framed table; rows grid `52px | minmax(180px,1.1fr) | 2fr | minmax(110px,auto)`; hover accent @ 8%.
- Rows 001–007 (copy in prototype); 007 claude-automation-skills highlighted (--accent-soft bg, accent index+name).
- **≤760px**: rows restack: `44px | 1fr | minmax(80px,auto)` with areas `idx name date / idx desc desc`.

### 8. Contact (`#contact`) + Footer
- Command: `$ ping shinigami-rog --all-channels`
- H2 "LET'S BUILD / SOMETHING_".
- 5 stacked rows (max 640px): EMAIL mailto:sivaguru94@gmail.com · PHONE +91 90207 08677 · LINKEDIN /in/sivaguru-ravi ↗ · **WEB shinigami-rog.cc ↗** · LOCATION Bangalore, India. Hover on links: accent border, accent @ 5% bg.
- Below rows: `>_ open interactive shell` outline button → opens the floating shell.
- Footer: blade mark + `© 2026 SIVAGURU_RAVI · shinigami-rog · uptime 9y+ · exit 0`; right `[T] toggle theme`.

## Floating Interactive Shell (major feature — full spec)
A draggable, resizable terminal window, plus a launcher.

**Launcher**: fixed bottom-right (20px), 48×48 button `>_` (accent, --bg fill, --line border, radius 8px; hover: accent border + lift). Shown when the shell is closed. The contact-section button also opens it.

**Window**: fixed, default bottom-right 20px, width `min(540px, 100vw-32px)`, height 340px, radius 10px, --bg fill, --line border, `0 24px 64px rgba(0,0,0,0.55)` shadow, column flex.
- **Title bar**: 14px traffic lights — red closes, yellow minimizes, green toggles maximize (16px inset fullscreen) — + 13px scythe mark + `guest@shinigami-rog — interactive shell — try 'help'`. Bar click toggles minimize; bar drag moves the window (pointer events, `touch-action:none`).
- **Minimize** docks the title bar to bottom-right regardless of position; restore returns to previous pos/size. No drag while minimized/maximized.
- **Drag** clamps to viewport and auto-shrinks the window when it would overflow right/bottom; min size 340×180.
- **Resize**: 28px `◢` handle bottom-right (pointer events, min 340×180, clamped to viewport).
- **Body**: 280px+ scrollable log (13.5px/1.6), click focuses input. Prompt `guest@shinigami-rog:~$` (accent) + transparent input (16px font on touch devices to prevent iOS zoom).

**Prompt/UX**:
- **Ghost autocomplete**: dim remainder of the first matching completion rendered inline after the caret (absolutely-positioned mirror span behind the input).
- **Tab**: completes command or argument; on ambiguity completes common prefix and prints candidates.
- **↑/↓**: with a prefix typed, cycles through matching completions (wraps, anchored to typed base); on empty input walks command history.
- Argument completion sets: `cat` (files), `cd` (sections), `open` (resume.pdf), `man` (all commands).

**Commands** (exact outputs in prototype logic):
- Info: `help`, `whoami` (includes alias + domain), `skills`, `experience`, `projects`, `ai`, `contact`, `stock` (Nov 2025 story)
- Unix: `ls` / `ls -a` (reveals `.secrets`), `cat <file>` (`cat me` → profile; `cat resume.pdf` → download), `cd <section>` (smooth-scrolls the page), `pwd` (`/home/guest/shinigami-rog`), `man <cmd>`, `history`, `echo`, `date`, `uname` (`shinigami-rog 9.2.0-lts …`), `exit`, `sudo` (denied)
- `resume` / `open resume.pdf` → downloads `/Sivaguru_Ravi_Resume.pdf` (ship the PDF from `assets/` in `public/`)
- `theme`, `clear`, `logo` (ASCII scythe + "the caret is the scythe")

**Easter-egg trail** (keep hidden from `help`): `help` hints "`ls -a` sees more than `ls`" → `.secrets` file → `cat .secrets` prints three riddles pointing to `matrix`, `snake`, `sudo`.
- `matrix`: fullscreen canvas digital rain in accent color; any key/click exits.
- `snake`: fullscreen 21×21 canvas game; arrows/WASD, R restart, ESC quit; touch = swipe steer, tap restart, visible ✕ quit button.

## Responsive / Touch
- Breakpoint 760px: nav row scroll, project row restack (above); everything else fluid via clamp/auto-fit grids.
- `pointer:coarse`: 44px min hit targets; 16px shell input.
- Shell drag/resize via Pointer Events (works with touch); snake has touch controls.
- Tested targets: iPhone, iPhone Max, iPad, desktop.

## State Management
- `theme` (localStorage) · `activeSection` (IntersectionObserver) · one-shot animation flags
- Shell: open/min/max flags, position, size, log lines, input value, command history, completion-cycle state
- No data fetching; all content static.

## SEO / Meta (Next.js layout)
- Title: "Sivaguru Ravi (shinigami-rog) — Senior SDE"; description from hero summary.
- OpenGraph: `assets/og-image.png` (1200×630); url https://shinigami-rog.cc.
- Icons: `favicon.svg` (+ generated .ico). Optional JSON-LD Person (name, alternateName "shinigami-rog", jobTitle, sameAs LinkedIn).

## Files in this bundle
- `Sivaguru Ravi Portfolio - Terminal.dc.html` — **the design to implement** (current, includes shell + brand)
- `Sivaguru Ravi Portfolio.dc.html` — alternate "modern" variant, reference only
- `support.js` — design-tool runtime, ignore (do not port)
- `assets/logo-blade.svg`, `assets/logo-blade-light.svg` — primary mark (dark/light accent)
- `assets/mark-scythe.svg` — secondary mark
- `assets/favicon.svg` — favicon source
- `assets/og-image.png` — 1200×630 OpenGraph image
- `assets/Sivaguru_Ravi_Resume.pdf` — serve at `/Sivaguru_Ravi_Resume.pdf` for the `resume` command
