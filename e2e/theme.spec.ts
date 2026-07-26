import { test, expect, type Page } from "@playwright/test";

/* wait until ThemeProvider has wired listeners (post-hydration) */
async function gotoReady(page: Page) {
  await page.goto("/");
  await page.locator("html[data-ready]").waitFor();
}

test.describe("theming (M1)", () => {
  test("toggle button flips theme, flashes once, persists across reload", async ({
    page,
  }) => {
    await gotoReady(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    // exactly one flash overlay per toggle
    await expect(page.locator("[data-theme-flash]")).toHaveCount(1);
    // flash cleans itself up
    await expect(page.locator("[data-theme-flash]")).toHaveCount(0, {
      timeout: 2000,
    });

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const bg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(bg).toBe("rgb(242, 241, 234)");
  });

  test("T key toggles exactly once per press", async ({ page }) => {
    await gotoReady(page);
    await page.keyboard.press("t");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.keyboard.press("t");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("T is ignored while typing in an input", async ({ page }) => {
    await gotoReady(page);
    await page.evaluate(() => {
      const input = document.createElement("input");
      input.id = "probe";
      document.body.appendChild(input);
    });
    await page.locator("#probe").focus();
    await page.keyboard.press("t");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("scanlines visible in dark, hidden in light", async ({ page }) => {
    await gotoReady(page);
    const opacity = () =>
      page.evaluate(() => {
        const el = document.querySelector("[data-scanlines]")!;
        return getComputedStyle(el).opacity;
      });
    expect(await opacity()).toBe("0.3");
    await page.keyboard.press("t");
    expect(await opacity()).toBe("0");
  });

  test("nav renders brand, links, and toggle label", async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator("nav")).toContainText("shinigami-rog");
    for (const id of ["about", "work", "skills", "ai", "projects", "contact"]) {
      await expect(
        page.locator("nav").getByRole("link", { name: `./${id}` }),
      ).toBeVisible();
    }
    const toggle = page.getByRole("button", { name: "Toggle theme" });
    await expect(toggle).toHaveText("[ LIGHT ]");
    await toggle.click();
    await expect(toggle).toHaveText("[ DARK ]");
  });
});
