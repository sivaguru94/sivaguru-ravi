import { test, expect } from "@playwright/test";

test.describe("sections (M2 pixel pass)", () => {
  test("all section anchors exist in order", async ({ page }) => {
    await page.goto("/");
    for (const id of ["about", "work", "skills", "ai", "projects", "contact"]) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
  });

  test("hero renders full copy and stats", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Sivaguru");
    await expect(page.getByText("whoami --verbose")).toBeVisible();
    await expect(
      page.getByText("SENIOR SDE · 9+ YRS · JAVA SPRING BOOT · ANGULAR"),
    ).toBeVisible();
    for (const label of [
      "YRS_EXPERIENCE",
      "ENGINEERS_MENTORED",
      "FASTER_BUILDS",
      "SECURITY_TOOLS",
    ]) {
      await expect(page.getByText(label)).toBeVisible();
    }
    await expect(
      page.getByRole("banner").getByText("70%", { exact: true }),
    ).toBeVisible();
  });

  test("work: 4 cards, current role accented", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("#work h3");
    await expect(cards).toHaveCount(4);
    await expect(cards.first()).toContainText("Infrrd Inc");
    await expect(cards.first()).toContainText("TECHNICAL_SPECIALIST");
    await expect(page.locator("#work")).toContainText("[2023-08 → PRESENT]");
  });

  test("skills: 16 rows with exact bar splits", async ({ page }) => {
    await page.goto("/");
    const bars = page.locator("#skills [data-ascii]");
    await expect(bars).toHaveCount(16);
    // filled cells = round(pct/5): 95 -> 19 of 20
    const first = bars.first();
    await expect(first).toHaveAttribute("data-pct", "95");
    const fillLen = await first
      .locator("span")
      .first()
      .evaluate((el) => el.textContent!.length);
    const restLen = await first
      .locator("span")
      .nth(1)
      .evaluate((el) => el.textContent!.length);
    expect(fillLen).toBe(19);
    expect(restLen).toBe(1);
  });

  test("ai: badge, 4 skill cards, running highlight", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#ai").getByText("AI-NATIVE")).toBeVisible();
    await expect(page.locator("#ai").getByText("[skill]")).toHaveCount(4);
    await expect(
      page.getByText("PROCESS RUNNING · IN PROGRESS"),
    ).toBeVisible();
  });

  test("projects: 7 rows, 007 highlighted", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#projects").getByText("annie-ui-platform")).toBeVisible();
    await expect(
      page.locator("#projects").getByText("claude-automation-skills"),
    ).toBeVisible();
    await expect(page.locator("#projects").getByText("007")).toBeVisible();
  });

  test("contact: channel rows with safe external links", async ({ page }) => {
    await page.goto("/");
    const mail = page.locator('a[href="mailto:sivaguru94@gmail.com"]');
    await expect(mail).toBeVisible();
    const linkedin = page.locator(
      'a[href="https://www.linkedin.com/in/sivaguru-ravi/"]',
    );
    await expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
    await expect(linkedin).toHaveAttribute("target", "_blank");
    await expect(
      page.getByRole("button", { name: /open interactive shell/ }),
    ).toBeVisible();
  });

  test("mobile 390px: project rows restack into named areas", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const row = page.locator("#projects [class*=row]").first();
    const areas = await row.evaluate(
      (el) => getComputedStyle(el).gridTemplateAreas,
    );
    expect(areas).toContain("idx name date");
    expect(areas).toContain("idx desc desc");
  });
});
