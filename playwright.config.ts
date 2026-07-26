import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/* WebKit needs system libs that WSL dev boxes usually lack — those projects
 * run in CI (which installs --with-deps). Set ALL_BROWSERS=1 to force them
 * locally. */
const webkitProjects =
  process.env.CI || process.env.ALL_BROWSERS
    ? [
        {
          name: "iphone-webkit",
          use: { ...devices["iPhone 14"] },
          testMatch: /responsive\.spec\.ts/,
        },
        {
          name: "ipad-webkit",
          use: { ...devices["iPad (gen 7)"] },
          testMatch: /responsive\.spec\.ts/,
        },
      ]
    : [];

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  expect: {
    toHaveScreenshot: {
      /* absorbs freetype/AA differences between local Linux and CI runners;
       * baselines regenerated in CI via the update-snapshots workflow */
      maxDiffPixelRatio: 0.03,
    },
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    port: PORT,
    // never reuse: a stale `next start` from an older build serves dead
    // asset hashes and poisons the whole suite (bitten twice)
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
      testIgnore: /responsive\.spec\.ts/,
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
      testMatch: /(responsive|visual)\.spec\.ts/,
    },
    ...webkitProjects,
  ],
});
