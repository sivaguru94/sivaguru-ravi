import { test, expect } from "@playwright/test";

/* Runs on mobile-chromium + iPhone/iPad WebKit projects (touch contexts). */

test.describe("responsive / touch", () => {
  test("nav: brand visible, link row scrollable, 44px tap targets", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toContainText("shinigami-rog");
    const link = page.locator('nav a[href="#about"]');
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    const vw = page.viewportSize()!.width;
    if (vw <= 760) {
      // link row is its own horizontally scrollable strip
      const overflow = await page
        .locator("nav a[href='#about']")
        .evaluate((el) => getComputedStyle(el.parentElement!).overflowX);
      expect(overflow).toBe("auto");
    }
  });

  test("project rows restack below 760px", async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > 760, "restack applies only below the 760px breakpoint");
    await page.goto("/");
    const areas = await page
      .locator("#projects [class*=row]")
      .first()
      .evaluate((el) => getComputedStyle(el).gridTemplateAreas);
    expect(areas).toContain("idx name date");
  });

  test("shell: opens on tap, 16px input (no iOS zoom), runs a command", async ({
    page,
  }) => {
    // reduced motion: the hero entrance's in-flight transforms make touch
    // hit-testing transiently flaky; this test is about input + commands
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("html[data-ready]").waitFor();
    await page
      .getByRole("button", { name: "Open interactive shell", exact: true })
      .click();
    const input = page.locator("[data-term-input]");
    await input.waitFor();
    const fontSize = await input.evaluate(
      (el) => getComputedStyle(el).fontSize,
    );
    expect(fontSize).toBe("16px");
    await input.fill("whoami");
    await input.press("Enter");
    await expect(page.locator("[data-term-body]")).toContainText(
      "alias: shinigami-rog",
    );
  });

  test("launcher meets the 44px touch target", async ({ page }) => {
    await page.goto("/");
    await page.locator("html[data-ready]").waitFor();
    const box = await page
      .getByRole("button", { name: "Open interactive shell", exact: true })
      .boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
