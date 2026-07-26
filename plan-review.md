# Plan Review — shinigami-rog.cc Portfolio (Next.js rewrite)

**Reviewed:** 2026-07-26 · **Stack:** Next.js 15 App Router, React 19, TypeScript, CSS Modules, Playwright, Vercel (fully static, no backend) · **Repos in scope:** `/home/shinigami-rog/work/sivaguru-ravi`

## Verdict

**Ready with changes.** The architecture is sound — the framework-agnostic core + thin React bindings is the right shape for both pixel-perfect fidelity and the future React/Angular design system, and no reviewer proposed a redesign. But the plan breaks in its opening moves (M0 as sequenced mechanically fails and risks unrecoverable data loss), is silent at exactly the seams where this design's performance risk lives (LCP gating, CLS, bundle composition), leaves its two self-flagged riskiest areas (hydration vs. animation initial state; no-flash script placement) undecided, and would commit private comp-sensitive notes into a public repo's permanent history. All of it is fixable on paper — the revised plan incorporates every accepted change without altering the plan's intent or milestones' shape. **Findings: 3 Blockers, 13 Major, ~20 Minor.** All three Blockers and all Majors accepted; a handful of Minors partially accepted or resolved as explicit decisions.

Two items need **the author's input** (not code changes):
1. **Resume PDFs differ** — root copy is 70,899 bytes, the handoff `assets/` copy is 8,606 bytes. The plan assumed they were duplicates and deleted the root one. Which is the real resume must be confirmed before M0.
2. **Phone number + stock-option story** — `research-notes.md` records explicit earlier decisions to *hide* both from the public site; the signed-off design *publishes* both. The design is treated as the override, but this should be a conscious confirmation, not an accident.

## Grounding Brief

The plan replaces a legacy Angular scaffold with a pixel-perfect Next.js 15 recreation of the signed-off "Terminal" portfolio design (single static page, CSS-custom-property theming with no-flash dark/light, scroll-triggered terminal animations — typewriter command lines, count-ups, 20-cell ASCII skill bars — plus a draggable/resizable floating shell with a command registry, ghost autocomplete, and hidden matrix/snake easter eggs), deployed to Vercel at `shinigami-rog.cc`. It additionally architects for a future terminal design system: `src/core/` pure TS (tween, typewriter, terminal engine, games, theme), token CSS contract, React bindings now, Angular later.

Verified against the repo: all referenced handoff files exist; the prototype's behavior class matches what the plan transcribes; git state confirmed — **everything the plan relies on (design handoff, plan, resume PDFs) is currently untracked**, branch is `master` with old Angular history. Reviewers had full code access; nothing material was unverifiable. Pre-identified risk areas (hydration vs. initial animation states, no-flash script in App Router, drag state vs. React, visual-test determinism, repo-reset mechanics, DNS specifics) were each confirmed as real by the council.

## Council Findings

### Blockers

- **[Ops] `create-next-app` at repo root will refuse to scaffold** — §1/M0. After the reset the root still holds `design/`, `plan.md`, `.editorconfig` — not on the CLI's conflict allowlist; it aborts and M0 fails as sequenced. *Fix:* scaffold into a scratch dir and copy the tree in (or relocate the handoff only after scaffolding); state the mechanism in M0.
- **[Ops] The two resume PDFs are different files; the plan deletes the wrong-sized one unverified** — §1. 70,899 B (root) vs 8,606 B (assets); both untracked, so deletion is unrecoverable, and the `resume` command could ship a stub. *Fix:* open both, designate the canonical one with the author, then delete the duplicate.
- **[Perf] Hero LCP is JS-gated** — §2/§4. Opacity-0 stagger on an all-client page means the LCP H1 waits for JS + hydration + 300ms delay (2.5–4s LCP on mid-tier mobile), or flashes then re-animates. Discovered only at M8 as planned. *Fix:* hero entrance via pure CSS keyframes present in server HTML — the hero must paint without JS; reserve the JS tween core for below-fold IO work.

### Major

- **[Security] Private planning docs with PII/comp-sensitive notes committed to a public repo** — §1 moves `personal-info.md`, `research-notes.md`, `cowork-prompt.md` into `docs/`. The notes contain comp-sensitive reasoning and decisions ("hide phone", "hide stock story — reveals comp info") that the shipped design contradicts. Untracked today — last cheap moment to keep them out. *Fix:* gitignored `docs-private/` (or move outside the repo); confirm the publish-phone/stock override with the author.
- **[Security] No security headers anywhere in the plan** — §9. No `headers()` config; Vercel adds none by default. Framing/impersonation and referrer leakage are unowned. *Fix:* `X-Content-Type-Options`, `frame-ancestors 'none'`, `Referrer-Policy`, minimal `Permissions-Policy` in `next.config`; full CSP explicitly deferred (App Router inline hydration scripts + the theme script make it non-trivial — don't let a later "add CSP" break no-flash).
- **[Frontend] Hydration/animation initial-state strategy flagged but never decided** — §2/§4. Hidden-in-JSX kills SEO/no-JS and risks React 19 mismatch warnings; hide-in-useEffect causes paint→blank→re-animate pop. *Fix:* server-render full content; the pre-paint inline script also sets `data-js` on the root; CSS gated on `data-js` applies hidden initial states; hooks animate in `useLayoutEffect`; typewriter keeps full text in SSR HTML (prototype's `data-text` pattern).
- **[Frontend] "Inline script in `<head>`" is not implementable as written in App Router** — §3. Metadata API owns the head; `beforeInteractive` inline has app-dir caveats — the no-flash script would silently no-op. *Fix:* render it via `dangerouslySetInnerHTML` as the **first child of `<body>`** in `layout.tsx` (parser-blocking, pre-paint); keep `suppressHydrationWarning`.
- **[Frontend] Theme (and motion/scanlines) state has no single owner** — §2/§5. `useTheme` as a plain hook in Nav + shell host-actions → two `T` listeners → double-toggle no-op with double flash; persisted `motion`/`scanlines` have no distribution path to animation hooks. *Fix:* subscribable store in `core/theme.ts` + one provider; define effective-reduced-motion = OS preference OR persisted `motion off`.
- **[Frontend] Committed window pos/size never re-clamped on viewport resize/orientation change** — §5. Rotate tablet after dragging right → title bar fully off-screen, window unclosable (launcher hidden while open). *Fix:* resize listener re-clamps pos/size with the same clamp math.
- **[Perf] Animation hooks don't specify ref-writes vs setState** — §2/§4. Naive setState-per-frame: 16 SkillBars re-rendering at 60Hz during scroll-in. *Fix:* architecture rule — per-frame output via refs/`textContent`/`el.style` only; React state only for start/done flags; AsciiBar writes only when the filled-cell count changes.
- **[Perf] CLS from typewriter lines and count-ups — no geometry reservation** — §4. Commands wrap mid-typing at 320–390px, shifting everything below; count-ups grow 1→3 glyphs. *Fix:* reserve final line box (invisible full string + overlay typing), `min-width` in `ch` for numerals; zero-layout-shift added to M3 done-criteria.
- **[Perf] All-client sections double-ship every byte of copy and inflate hydration** — §2. All résumé copy lands in the JS bundle in addition to HTML; hydration of the whole tree gates every hook. *Fix:* sections become **server components**; only animated leaves are client wrappers (`<Reveal>`, `<TypedCommand>`, `<CountUp>`, `<AsciiBar>`).
- **[Perf] Shell + games ship in the initial bundle** — §2/§5. "Mounts nothing" ≠ "loads nothing": static import chain pulls the registry, completion, matrix and snake into first-load JS. *Fix:* `next/dynamic` (no SSR) for the shell on first open (preload on launcher hover/focus); dynamic `import()` for matrix/snake inside their command handlers.
- **[Ops] No safety commit before the destructive reset** — §1/M0. The design source of truth has never been committed; one overbroad `rm`/`mv` destroys the only copy. *Fix:* commit + tag (`pre-next-rewrite`) before any deletion — see conflict resolution below for what that commit includes.
- **[Ops] Visual baselines will be flaky as specced** — §8. Blink keyframes aren't covered by the JS reduced-motion short-circuit (random cursor phase), local-WSL vs `ubuntu-latest` font rasterization differs (worst on █ bars), WebKit headless renders backdrop-filter/glow differently. *Fix:* Playwright `animations: 'disabled'`, await `document.fonts.ready`, generate baselines in CI (or the Playwright Docker image), small `maxDiffPixelRatio`, scope visual specs to Chromium.
- **[Ops] CI and Vercel arrive only at M8/M9, contradicting "independently reviewable milestones"** — §10. Test suite lands big-bang against seven milestones of accumulated UI. *Fix:* CI skeleton (lint+build+boot smoke) and Vercel preview connect at M0/M1; specs grow per milestone; work on a `next-rewrite` branch since `master` becomes prod once Vercel is connected.

### Minor

- **[Security]** Terminal log must render as React text nodes only (`echo`, ASCII `logo`, completion candidates); `dangerouslySetInnerHTML` banned in the shell tree; `host.download()` maps validated names to fixed constant paths.
- **[Security]** Validate the stored theme value (allowlist `light`/`dark`) and guard localStorage **writes** too — one `safeStorage` helper in `core/theme.ts` (also raised by Frontend).
- **[Security]** JSON-LD: build object in TS, `JSON.stringify(...).replace(/</g,'\\u003c')`.
- **[Security]** External links: `target="_blank" rel="noopener noreferrer"` as a stated convention (also a Lighthouse item).
- **[Security]** CI hygiene: top-level `permissions: contents: read`, pinned actions, Dependabot (npm + actions), `npm ci`.
- **[Security]** Don't commit the unreviewed 180KB zip or the proprietary `support.js` from the handoff; commit only README + the two `.dc.html` + assets.
- **[Security]** Vercel preview visibility: previews are `X-Robots-Tag: noindex`; accept the default publicly (decision recorded), Deployment Protection optional.
- **[Frontend]** Pointer lifecycle: treat `pointercancel` as `pointerup`, track active `pointerId`, prefer `setPointerCapture`; invariant: nothing but drag handlers update pos/size mid-drag.
- **[Frontend]** `CommandContext` can't implement `history` as specced; `clear` needs echo suppression — add `history: readonly string[]` and a `noEcho` path.
- **[Frontend]** `hidden` flag = excluded from `help` **only**; completion and `man` derive from the full registry (prototype behavior — `mat`+Tab is part of the fun).
- **[Frontend]** StrictMode double-mount: engines return cancel handles; hook cleanup cancels + resets one-shot state.
- **[Frontend]** Reduced-motion: subscribe to matchMedia `change`; on transition, cancel in-flight animations and jump to final state.
- **[Frontend]** Focus management: focus input on open/restore/maximize and after matrix/snake exit; return focus to launcher on close.
- **[Frontend]/[Ops]** `themeColor` belongs in the `viewport` export (Next 15); use icon **file conventions only** (`app/icon.svg`, `app/favicon.ico`) — no `metadata.icons` (duplicate-link risk).
- **[Perf]** Audit actually-used font weights; start hero typewriter after `document.fonts.ready` (~300ms cap).
- **[Perf]** Drag via `transform: translate3d` during gesture (commit `left/top` on pointerup); cache viewport dims at pointerdown; size writes only when clamping shrinks.
- **[Perf]** Split shell input state from log lines (memoized lines) to avoid full-log re-render per keystroke.
- **[Perf]** Matrix canvas: cap DPR ≤ 2, handle resize/orientationchange.
- **[Perf]** Scanlines: single top-level fixed element, verify layerization at M1; "no non-composited repaints during scroll" in M1 done-criteria.
- **[Perf]** Add a Lighthouse budget check at M2/M3 (LCP < 2s throttled, CLS < 0.05, first-load JS < ~110KB gz) rather than first measuring at M8.
- **[Ops]** Zone.Identifier files exist **recursively** (incl. inside `design_handoff/assets/`); `:` in filenames makes the repo uncloneable on Windows — delete recursively before the safety commit + `.gitignore` guard. Decide the zip's fate (security already says drop it).
- **[Ops]** DNS: use the values the Vercel dashboard shows for this project (per-project DNS rollout); current documented defaults kept as expectation.
- **[Ops]** Add `app/not-found.tsx` (`404: command not found` terminal screen) + one smoke assertion.
- **[Ops]** SEO: `alternates: { canonical: '/' }`, enable deployment-domain→primary redirect, Search Console via DNS TXT domain property.
- **[Ops]** Resume download: assert via `download.suggestedFilename()` on Desktop Chromium only + separate `request.get()` for 200/`application/pdf`; don't add immutable cache headers to the PDF later.

## Senior SDE Adjudication

**Accepted** (all three Blockers, all thirteen Majors, and most Minors — each is grounded in the actual repo state or a concrete failure scenario):
- The two ops Blockers are verified facts (CLI allowlist behavior; `wc -c` on both PDFs), not speculation.
- The perf Blocker + the frontend hydration/no-flash Majors are the same seam attacked from two sides; the combined fix (CSS-driven hero, `data-js` gate for below-fold, body-first inline script) resolves all three coherently.
- Server-sections-with-client-leaves is accepted even though the frontend reviewer called all-client sections "idiomatic" — the leaf-wrapper structure is strictly better for bundle, hydration, and the LCP fix, and doesn't disturb the §0 core/bindings architecture.
- The PII finding is the highest-value catch in the review: cheap now (`.gitignore` line), effectively irreversible after one push.

**Rejected / deferred:**
- **Full CSP (`script-src`) — deferred, not adopted.** App Router's inline hydration scripts plus our own inline theme script make a strict CSP hash/nonce dance disproportionate for a static personal site. The frame-ancestors/nosniff/referrer subset is adopted; the plan records *why* full CSP is out so a future "harden CSP" commit doesn't break no-flash naively.
- **Font-weight trimming — downgraded to a verification note.** The prototype markup uses 400/500/600/700/800 (500 on role suffixes, 600 on the nav wordmark), so the "phantom weights" hypothesis is likely wrong; M2 verifies rather than pre-trims. The `document.fonts.ready` gate for the hero typewriter is adopted.
- **Vercel Deployment Protection for previews — rejected as a requirement.** Previews are noindex, content is public by design; recorded as an accepted default instead.
- **SHA-pinning GitHub Actions — softened to major-version pinning.** Proportionate for a solo personal repo with `contents: read` permissions.

**Conflicts resolved:**
- **Ops "safety-commit the current tree as-is" vs Security "never commit the private notes"** → the safety commit **excludes** `personal-info.md`, `research-notes.md`, `cowork-prompt.md` (moved to gitignored `docs-private/` first) and the Zone.Identifier junk, but **includes** the design handoff (minus zip/support.js), `plan.md`, and both PDFs-pending-verification. Rationale: the safety net exists for the irreplaceable design source of truth; the private notes get their safety by leaving the repo, not by entering history.
- **Perf "CSS-drive the hero" vs Frontend "data-js gate + useLayoutEffect tween everywhere"** → hero entrance and its typewriter are pure CSS/self-starting (paints without JS, LCP-safe); the `data-js` + `useLayoutEffect` pattern governs everything below the fold where IO timing needs JS anyway.
- **Plan's WebKit/mobile visual screenshots vs Ops flakiness finding** → visual regression runs on Chromium projects only (desktop + mobile viewport emulation); WebKit/device projects keep **functional** specs. Real-Safari rendering is covered by the manual device pass that was already in the plan.

## What changed in the revised plan

See [plan-revised.md](plan-revised.md). Substantive edits:
- **§1/M0 fully resequenced:** recursive Zone.Identifier purge → handoff pruned (zip/support.js dropped) → private notes out of the repo (gitignored `docs-private/`) → resume canonical verification (author input) → safety commit + `pre-next-rewrite` tag → scratch-dir scaffold copied into root → `next-rewrite` working branch → CI skeleton + Vercel preview connect.
- **§2 restructured:** sections are server components; new client leaf wrappers (`Reveal`, `TypedCommand`, `CountUp`, `AsciiBar`); shell loaded via `next/dynamic` on demand; games dynamically imported; `not-found.tsx` added; icons via file conventions.
- **§3 rewritten:** body-first inline script (theme allowlist + `data-js` gate), `safeStorage`, single theme store in core with one provider.
- **§4 rewritten:** hero is CSS-driven and paints without JS; ref-write rule for all per-frame animation; CLS geometry reservation; cancel handles + StrictMode discipline; live reduced-motion subscription with defined precedence.
- **§5 extended:** pointer lifecycle (cancel/pointerId/capture), viewport re-clamp, transform-during-drag, input/log state split, `CommandContext.history` + `noEcho`, `hidden`=help-only, focus management, matrix DPR cap.
- **§7/§9 extended:** `viewport` export, canonical URL, JSON-LD escaping, link `rel` convention, security headers block (CSP deferral recorded), DNS from dashboard, deployment-domain redirect, Search Console TXT.
- **§8 rewritten for determinism:** Chromium-only visual baselines generated in CI, `animations: 'disabled'`, fonts.ready, download-assertion split, early Lighthouse budgets.
- **§10 milestones updated** to front-load CI/Vercel and grow specs per milestone; **§11/§12** record the new decisions and the two open author questions (resume canonical, phone/stock publishing confirmation).
