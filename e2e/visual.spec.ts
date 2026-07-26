import { test, expect } from "@playwright/test";

/*
 * Visual regression — Chromium projects only (WebKit's backdrop-filter/glow
 * rendering differs headless vs real Safari; real devices are covered by
 * the manual QA pass). Determinism: reduced-motion emulation renders final
 * states, screenshots freeze CSS animations (blink cursors), and capture
 * waits for the mono font.
 */

for (const theme of ["dark", "light"] as const) {
  test(`full page — ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (theme === "light") {
      await page.addInitScript(() => {
        try {
          localStorage.setItem("theme", "light");
        } catch {}
      });
    }
    await page.goto("/");
    await page.locator("html[data-ready]").waitFor();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`page-${theme}.png`, {
      fullPage: true,
      animations: "disabled",
    });
  });
}
