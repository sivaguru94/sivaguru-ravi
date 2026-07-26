import { test, expect, type Page } from "@playwright/test";

async function openShell(page: Page) {
  await page.goto("/");
  await page.locator("html[data-ready]").waitFor();
  await page
    .getByRole("button", { name: "Open interactive shell", exact: true })
    .click();
  await page.locator("[data-term-input]").waitFor();
}

async function run(page: Page, cmd: string) {
  await page.locator("[data-term-input]").fill(cmd);
  await page.locator("[data-term-input]").press("Enter");
}

test.describe("easter eggs (M6)", () => {
  test("the full trail: help → ls -a → .secrets → three doors", async ({
    page,
  }) => {
    await openShell(page);
    const log = page.locator("[data-term-body]");

    await run(page, "help");
    await expect(log).toContainText("`ls -a` sees more than `ls`");
    await run(page, "ls -a");
    await expect(log).toContainText(".secrets");
    await run(page, "cat .secrets");
    await expect(log).toContainText("three doors remain");

    // door 3: sudo
    await run(page, "sudo su");
    await expect(log).toContainText("nice try. permission denied.");
  });

  test("matrix: canvas rain opens, any key exits, prompt refocuses", async ({
    page,
  }) => {
    await openShell(page);
    await run(page, "matrix");
    await expect(
      page.locator("[data-term-body]"),
    ).toContainText("the matrix has you");
    // fullscreen canvas overlay appears (z-120, fixed)
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(canvas).toHaveCount(0);
    await expect(page.locator("[data-term-input]")).toBeFocused();
  });

  test("matrix exits on click too", async ({ page }) => {
    await openShell(page);
    await run(page, "matrix");
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
    await canvas.click({ position: { x: 20, y: 20 } });
    await expect(canvas).toHaveCount(0);
  });

  test("snake: board + HUD open, ESC quits, prompt refocuses", async ({
    page,
  }) => {
    await openShell(page);
    await run(page, "snake");
    await expect(
      page.locator("[data-term-body]"),
    ).toContainText("loading snake.exe");
    await expect(page.getByText("SNAKE — score 0")).toBeVisible();
    await expect(page.getByRole("button", { name: "✕ quit" })).toBeVisible();
    // steer once (must not crash), then quit
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Escape");
    await expect(page.getByText("SNAKE — score 0")).toHaveCount(0);
    await expect(page.locator("[data-term-input]")).toBeFocused();
  });

  test("snake quit button works", async ({ page }) => {
    await openShell(page);
    await run(page, "snake");
    await page.getByRole("button", { name: "✕ quit" }).click();
    await expect(page.getByText(/SNAKE — score/)).toHaveCount(0);
  });

  test("deep link /sivaguru-ravi/matrix rains immediately", async ({
    page,
  }) => {
    await page.goto("/sivaguru-ravi/matrix");
    await expect(page.locator("canvas")).toBeVisible({ timeout: 10000 });
    await page.keyboard.press("Enter");
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
