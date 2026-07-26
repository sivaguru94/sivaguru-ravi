import { test, expect } from "@playwright/test";

test.describe("assets + SEO (M7)", () => {
  test("metadata: title, canonical, OG, twitter", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(
      "Sivaguru Ravi (shinigami-rog) — Senior SDE",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://shinigami-rog.cc",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /og-image\.png/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

  test("JSON-LD Person parses and carries the alias", async ({ page }) => {
    await page.goto("/");
    const raw = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = JSON.parse(raw!);
    expect(data["@type"]).toBe("Person");
    expect(data.alternateName).toBe("shinigami-rog");
    expect(data.sameAs).toContain("https://www.linkedin.com/in/sivaguru-ravi/");
  });

  test("security headers on every response", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toContain("camera=()");
  });

  test("robots.txt and sitemap.xml serve", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain(
      "https://shinigami-rog.cc/sitemap.xml",
    );
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("https://shinigami-rog.cc");
  });

  test("icons: svg + generated ico both serve", async ({ request }) => {
    const svg = await request.get("/icon.svg");
    expect(svg.status()).toBe(200);
    expect(svg.headers()["content-type"]).toContain("svg");
    const ico = await request.get("/favicon.ico");
    expect(ico.status()).toBe(200);
  });

  test("404 page renders the terminal screen", async ({ page }) => {
    const res = await page.goto("/no-such-page");
    expect(res!.status()).toBe(404);
    await expect(page.getByText("404: command not found")).toBeVisible();
    await expect(page.getByRole("link", { name: "cd ~" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("deep-link pages are noindex with canonical /", async ({ page }) => {
    await page.goto("/sivaguru-ravi/help");
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(robots).toContain("noindex");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://shinigami-rog.cc",
    );
  });
});
