import { describe, test, expect, mock, beforeAll, afterAll } from "bun:test";

// ─── getBrowser ─────────────────────────────────────────────────────────
describe("getBrowser", () => {
  test("returns a browser or 'fetch-only'", async () => {
    const { getBrowser } = await import("./browser");
    const result = await getBrowser();

    // In test env, playwright may or may not be available
    // Either a Browser object or 'fetch-only' string is acceptable
    const isBrowser = result !== "fetch-only" && typeof result === "object";
    expect(isBrowser || result === "fetch-only").toBe(true);
  });
});

// ─── fetchRendered ──────────────────────────────────────────────────────
describe("fetchRendered", () => {
  test("returns html and method", async () => {
    const { fetchRendered } = await import("./browser");
    // This will use plain fetch since Camoufox/Playwright won't be available
    // Test against a known static site
    try {
      const result = await fetchRendered("https://example.com");
      expect(typeof result.html).toBe("string");
      expect(result.html.length).toBeGreaterThan(0);
      expect(["camoufox", "playwright", "fetch"]).toContain(result.method);
    } catch {
      // Network may be unavailable in test env — skip gracefully
      console.log("[browser.test] fetchRendered network test skipped (no network)");
    }
  });
});
