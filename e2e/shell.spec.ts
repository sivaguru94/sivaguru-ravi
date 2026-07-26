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

const log = (page: Page) => page.locator("[data-term-body]");

test.describe("floating shell (M5)", () => {
  test("launcher opens the shell with greeting; close returns focus", async ({
    page,
  }) => {
    await openShell(page);
    await expect(log(page)).toContainText("sivaguru-shell v1.0");
    await expect(page.locator("[data-term-input]")).toBeFocused();
    await page.getByRole("button", { name: "Close shell" }).click();
    await expect(page.locator("[data-term-win]")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Open interactive shell", exact: true }),
    ).toBeFocused();
  });

  test("contact-section button opens the shell", async ({ page }) => {
    await page.goto("/");
    await page.locator("html[data-ready]").waitFor();
    await page
      .getByRole("button", { name: /open interactive shell/i })
      .last()
      .click();
    await expect(page.locator("[data-term-win]")).toBeVisible();
  });

  test("core commands: help hint, ls -a trail, .secrets, sudo, unknown", async ({
    page,
  }) => {
    await openShell(page);
    await run(page, "help");
    await expect(log(page)).toContainText("`ls -a` sees more than `ls`");
    await run(page, "ls");
    await expect(log(page)).not.toContainText(".secrets");
    await run(page, "ls -a");
    await expect(log(page)).toContainText(".secrets");
    await run(page, "cat .secrets");
    await expect(log(page)).toContainText("follow the white rabbit");
    await run(page, "sudo make me a sandwich");
    await expect(log(page)).toContainText("nice try. permission denied.");
    await run(page, "blorp");
    await expect(log(page)).toContainText("command not found: blorp");
  });

  test("cd scrolls the page and clear wipes the log", async ({ page }) => {
    await openShell(page);
    await run(page, "cd skills");
    await expect(log(page)).toContainText("→ /skills");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(
      100,
    );
    await run(page, "clear");
    await expect(log(page)).not.toContainText("→ /skills");
    await expect(log(page)).not.toContainText("sivaguru-shell");
  });

  test("theme command toggles the site theme", async ({ page }) => {
    await openShell(page);
    await run(page, "theme");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(log(page)).toContainText("theme toggled.");
  });

  test("tab completion: unique, ambiguous, ghost, cycling", async ({
    page,
  }) => {
    await openShell(page);
    const input = page.locator("[data-term-input]");

    // ghost shows the remainder of the first match
    await input.fill("wh");
    await expect(page.locator("[data-term-ghost]")).toContainText("oami");

    // unique completion appends a space
    await input.fill("mat");
    await input.press("Tab");
    await expect(input).toHaveValue("matrix ");

    // ambiguous completion prints candidates
    await input.fill("s");
    await input.press("Tab");
    await expect(log(page)).toContainText("skills");
    await expect(log(page)).toContainText("snake");

    // argument completion for cd
    await input.fill("cd sk");
    await input.press("Tab");
    await expect(input).toHaveValue("cd skills ");

    // ↑ cycles matches for a typed prefix
    await input.fill("s");
    await input.press("ArrowDown");
    const v1 = await input.inputValue();
    expect(v1.startsWith("s")).toBe(true);
    expect(v1.length).toBeGreaterThan(1);
  });

  test("history walk with arrows on empty input", async ({ page }) => {
    await openShell(page);
    // note: recalled values that prefix a command name re-enter completion
    // cycling (prototype-faithful) — echo args exercise pure history walking
    await run(page, "echo one");
    await run(page, "echo two");
    const input = page.locator("[data-term-input]");
    await input.press("ArrowUp");
    await expect(input).toHaveValue("echo two");
    await input.press("ArrowUp");
    await expect(input).toHaveValue("echo one");
    await input.press("ArrowDown");
    await expect(input).toHaveValue("echo two");
  });

  test("resume command downloads the PDF", async ({ page }) => {
    await openShell(page);
    const downloadPromise = page.waitForEvent("download");
    await run(page, "resume");
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("Sivaguru_Ravi_Resume.pdf");
    await expect(log(page)).toContainText("download started ✓");
  });

  test("resume PDF is served with the right content type", async ({
    request,
  }) => {
    const res = await request.get("/Sivaguru_Ravi_Resume.pdf");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
  });

  test("window: drag moves and commits; resize respects minimum", async ({
    page,
  }) => {
    await openShell(page);
    const win = page.locator("[data-term-win]");
    const bar = win.locator("div").first();

    const before = await win.boundingBox();
    await bar.hover({ position: { x: 200, y: 18 } });
    await page.mouse.down();
    await page.mouse.move(before!.x + 200 - 150, before!.y + 18 + 40, {
      steps: 5,
    });
    await page.mouse.up();
    const after = await win.boundingBox();
    expect(Math.round(after!.x)).toBeLessThan(Math.round(before!.x));
    expect(Math.round(after!.y)).toBeGreaterThan(Math.round(before!.y));

    // resize far below the minimum → clamps to 340×180
    const handle = page.locator("[data-term-win] div", { hasText: "◢" }).last();
    const hb = await handle.boundingBox();
    await page.mouse.move(hb!.x + 14, hb!.y + 14);
    await page.mouse.down();
    await page.mouse.move(hb!.x - 600, hb!.y - 600, { steps: 5 });
    await page.mouse.up();
    const small = await win.boundingBox();
    expect(Math.round(small!.width)).toBe(340);
    expect(Math.round(small!.height)).toBe(180);
  });

  test("minimize docks, restore returns, maximize insets", async ({
    page,
  }) => {
    await openShell(page);
    const win = page.locator("[data-term-win]");
    await page.getByRole("button", { name: "Minimize shell" }).click();
    await expect(page.locator("[data-term-body]")).toHaveCount(0);
    // restore via bar click
    await win.locator("div").first().click();
    await expect(page.locator("[data-term-body]")).toBeVisible();
    await page.getByRole("button", { name: "Maximize shell" }).click();
    const box = await win.boundingBox();
    const vp = page.viewportSize()!;
    expect(Math.round(box!.x)).toBe(16);
    expect(Math.round(box!.y)).toBe(16);
    expect(Math.round(box!.width)).toBe(vp.width - 32);
  });

  test("committed position re-clamps when the viewport shrinks", async ({
    page,
  }) => {
    await openShell(page);
    const win = page.locator("[data-term-win]");
    const bar = win.locator("div").first();
    // drag near the right edge
    const b = await win.boundingBox();
    await bar.hover({ position: { x: 200, y: 18 } });
    await page.mouse.down();
    await page.mouse.move(b!.x + 900, b!.y + 18, { steps: 5 });
    await page.mouse.up();
    // shrink the viewport; re-clamp happens in a resize-listener state commit
    await page.setViewportSize({ width: 700, height: 500 });
    await expect
      .poll(async () => (await win.boundingBox())!.x + 10, { timeout: 3000 })
      .toBeLessThan(700); // title bar reachable
    expect((await win.boundingBox())!.y).toBeGreaterThanOrEqual(0);
  });
});

test.describe("command deep links (M5)", () => {
  test("/sivaguru-ravi/whoami opens the shell and runs the command", async ({
    page,
  }) => {
    await page.goto("/sivaguru-ravi/whoami");
    await expect(page.locator("[data-term-win]")).toBeVisible();
    await expect(log(page)).toContainText(
      "guest@shinigami-rog:~$ whoami",
    );
    await expect(log(page)).toContainText("alias: shinigami-rog");
  });

  test("unknown command 404s", async ({ page }) => {
    const res = await page.goto("/sivaguru-ravi/frobnicate");
    expect(res!.status()).toBe(404);
  });
});
