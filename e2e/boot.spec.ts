import { test, expect } from "@playwright/test";

test.describe("boot smoke", () => {
  test("page renders themed with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");

    await expect(page).toHaveTitle("Sivaguru Ravi (shinigami-rog) — Senior SDE");

    // no-flash script ran pre-paint: theme + js gate stamped on <html>
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute("data-js", "");

    // token sheet applied to the body
    const bg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(bg).toBe("rgb(5, 7, 5)");

    await expect(
      page.locator("main").getByText("shinigami-rog"),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("stored light theme applies before paint", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("theme", "light");
      } catch {}
    });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const bg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(bg).toBe("rgb(242, 241, 234)");
  });

  test("invalid stored theme falls back to dark", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("theme", "banana");
      } catch {}
    });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
