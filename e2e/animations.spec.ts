import { test, expect } from "@playwright/test";

test.describe("motion layer (M3)", () => {
  test("hero typewriter completes and counts reach final values", async ({
    page,
  }) => {
    await page.goto("/");
    // typing: 45ms/char over "whoami --verbose" (~0.8s after fonts)
    await expect(
      page.locator("[data-hero-type] [data-typed-overlay]"),
    ).toHaveText("whoami --verbose", { timeout: 5000 });
    // count-ups run on scroll-in; stats are in the hero viewport
    await expect(
      page.getByRole("banner").getByText("70%", { exact: true }),
    ).toHaveText("70%", { timeout: 5000 });
    await expect(
      page.getByRole("banner").getByText("50+", { exact: true }),
    ).toBeVisible();
  });

  test("section command types on scroll-in; skill bars land on exact split", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("html[data-ready]").waitFor();
    await page.locator("#skills").scrollIntoViewIfNeeded();
    const firstBar = page.locator("#skills [data-ascii]").first();
    await expect
      .poll(
        async () =>
          firstBar.locator("span").first().evaluate((el) => el.textContent!.length),
        { timeout: 5000 },
      )
      .toBe(19);
    // typed command completed
    await expect(
      page.locator("#skills [data-cmd]").first(),
    ).toContainText("ls skills/ --proficiency", { timeout: 5000 });
  });

  test("reveals become visible after scroll-in", async ({ page }) => {
    await page.goto("/");
    await page.locator("html[data-ready]").waitFor();
    const heading = page.locator("#about h2");
    await heading.scrollIntoViewIfNeeded();
    await expect
      .poll(
        async () => heading.evaluate((el) => getComputedStyle(el).opacity),
        { timeout: 5000 },
      )
      .toBe("1");
  });

  test("active nav link highlights the section in view", async ({ page }) => {
    await page.goto("/");
    await page.locator("html[data-ready]").waitFor();
    await page.locator("#skills").scrollIntoViewIfNeeded();
    await expect(
      page.locator('nav a[href="#skills"]'),
    ).toHaveAttribute("data-active", "true", { timeout: 5000 });
  });

  test("layout shift stays near zero through a full scroll", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("html[data-ready]").waitFor();
    // walk the page so every IO trigger fires while observed
    await page.evaluate(async () => {
      const step = window.innerHeight / 2;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 250));
      }
    });
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const e = entry as unknown as {
                hadRecentInput: boolean;
                value: number;
              };
              if (!e.hadRecentInput) total += e.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 500);
        }),
    );
    expect(cls).toBeLessThan(0.05);
  });
});

test.describe("no-JS fallback", () => {
  test.use({ javaScriptEnabled: false });

  test("hero and all content fully visible without JavaScript", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    const opacity = await page
      .locator("h1")
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe("1");
    // typed text present, bars at final split
    await expect(page.locator("[data-hero-type]")).toContainText(
      "whoami --verbose",
    );
    const fillLen = await page
      .locator("#skills [data-ascii]")
      .first()
      .locator("span")
      .first()
      .evaluate((el) => el.textContent!.length);
    expect(fillLen).toBe(19);
    // about heading not stuck hidden
    const aboutOpacity = await page
      .locator("#about h2")
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(aboutOpacity).toBe("1");
  });
});

test.describe("reduced motion", () => {
  test("final states render immediately, nothing animates", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("html[data-ready]").waitFor();
    await expect(
      page.locator("[data-hero-type] [data-typed-overlay]"),
    ).toHaveText("whoami --verbose");
    await expect(
      page.getByRole("banner").getByText("70%", { exact: true }),
    ).toBeVisible();
    const aboutOpacity = await page
      .locator("#about h2")
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(aboutOpacity).toBe("1");
    const fillLen = await page
      .locator("#skills [data-ascii]")
      .first()
      .locator("span")
      .first()
      .evaluate((el) => el.textContent!.length);
    expect(fillLen).toBe(19);
  });
});
