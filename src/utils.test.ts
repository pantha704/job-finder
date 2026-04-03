import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import {
  delay,
  retry,
  parseRelativeDate,
  normalizeCompany,
  checkRobotstxt,
  getRandomUserAgent,
} from "./utils";

// ─── delay ──────────────────────────────────────────────────────────────
describe("delay", () => {
  test("delay(100) completes in approximately 100ms", async () => {
    const start = Date.now();
    await delay(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90);
    expect(elapsed).toBeLessThan(500);
  });

  test("delay(0) resolves immediately", async () => {
    const start = Date.now();
    await delay(0);
    expect(Date.now() - start).toBeLessThan(100);
  });
});

// ─── retry ──────────────────────────────────────────────────────────────
describe("retry", () => {
  test("succeeds on first attempt", async () => {
    let calls = 0;
    const result = await retry(async () => {
      calls++;
      return "ok";
    });
    expect(result).toBe("ok");
    expect(calls).toBe(1);
  });

  test("retries on failure and succeeds on second attempt", async () => {
    let calls = 0;
    const result = await retry(async () => {
      calls++;
      if (calls === 1) throw new Error("first fail");
      return "ok";
    }, 3, 10); // 10ms backoff for fast test
    expect(result).toBe("ok");
    expect(calls).toBe(2);
  });

  test("throws after max attempts exhausted", async () => {
    let calls = 0;
    await expect(
      retry(
        async () => {
          calls++;
          throw new Error("always fails");
        },
        3,
        10
      )
    ).rejects.toThrow("always fails");
    expect(calls).toBe(3);
  });

  test("uses exponential backoff (3s, 6s, 9s)", async () => {
    const timestamps: number[] = [];
    await retry(
      async () => {
        timestamps.push(Date.now());
        if (timestamps.length <= 2) throw new Error("retry");
        return "ok";
      },
      3,
      50 // 50ms backoff for test speed
    );
    // Verify backoff increases: gap2 > gap1
    const gap1 = timestamps[1]! - timestamps[0]!;
    const gap2 = timestamps[2]! - timestamps[1]!;
    expect(gap2).toBeGreaterThan(gap1); // 100ms > 50ms
  });

  test("skips retry on captcha error", async () => {
    let calls = 0;
    await expect(
      retry(
        async () => {
          calls++;
          throw new Error("CAPTCHA detected");
        },
        3,
        10
      )
    ).rejects.toThrow("CAPTCHA");
    expect(calls).toBe(1); // only 1 call, no retries
  });
});

// ─── parseRelativeDate ──────────────────────────────────────────────────
describe("parseRelativeDate", () => {
  const now = new Date();

  test("today returns now", () => {
    const result = parseRelativeDate("today");
    expect(result.getTime()).toBeCloseTo(now.getTime(), -3);
  });

  test("yesterday returns ~24h ago", () => {
    const result = parseRelativeDate("yesterday");
    const expected = now.getTime() - 24 * 60 * 60 * 1000;
    expect(Math.abs(result.getTime() - expected)).toBeLessThan(5000);
  });

  test("parses '3 days ago'", () => {
    const result = parseRelativeDate("3 days ago");
    const expected = now.getTime() - 3 * 24 * 60 * 60 * 1000;
    expect(Math.abs(result.getTime() - expected)).toBeLessThan(5000);
  });

  test("parses '2 hours ago'", () => {
    const result = parseRelativeDate("2 hours ago");
    const expected = now.getTime() - 2 * 60 * 60 * 1000;
    expect(Math.abs(result.getTime() - expected)).toBeLessThan(5000);
  });

  test("parses '30 mins ago'", () => {
    const result = parseRelativeDate("30 mins ago");
    const expected = now.getTime() - 30 * 60 * 1000;
    expect(Math.abs(result.getTime() - expected)).toBeLessThan(5000);
  });

  test("parses '1 week ago'", () => {
    const result = parseRelativeDate("1 week ago");
    const expected = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    expect(Math.abs(result.getTime() - expected)).toBeLessThan(5000);
  });

  test("parses '15 minutes ago' (min variant)", () => {
    const result = parseRelativeDate("15 min ago");
    const expected = now.getTime() - 15 * 60 * 1000;
    expect(Math.abs(result.getTime() - expected)).toBeLessThan(5000);
  });

  test("parses '2 hrs ago' (hr variant)", () => {
    const result = parseRelativeDate("2 hrs ago");
    const expected = now.getTime() - 2 * 60 * 60 * 1000;
    expect(Math.abs(result.getTime() - expected)).toBeLessThan(5000);
  });

  test("returns now for unrecognized format", () => {
    const result = parseRelativeDate("some random date");
    expect(result.getTime()).toBeCloseTo(now.getTime(), -3);
  });

  test("case insensitive", () => {
    const result = parseRelativeDate("3 DAYS AGO");
    const expected = now.getTime() - 3 * 24 * 60 * 60 * 1000;
    expect(Math.abs(result.getTime() - expected)).toBeLessThan(5000);
  });
});

// ─── normalizeCompany ───────────────────────────────────────────────────
describe("normalizeCompany", () => {
  test("removes 'Inc'", () => {
    expect(normalizeCompany("Google Inc")).toBe("google");
    expect(normalizeCompany("Google Inc.")).toBe("google");
  });

  test("removes 'LLC'", () => {
    expect(normalizeCompany("Stripe LLC")).toBe("stripe");
  });

  test("removes 'Ltd'", () => {
    expect(normalizeCompany("Shell Ltd.")).toBe("shell");
  });

  test("lowercases", () => {
    expect(normalizeCompany("GOOGLE")).toBe("google");
  });

  test("removes spaces and special chars", () => {
    expect(normalizeCompany("Meta Platforms, Inc.")).toBe("metaplatforms");
  });

  test("handles already clean names", () => {
    expect(normalizeCompany("google")).toBe("google");
  });

  test("handles empty string", () => {
    expect(normalizeCompany("")).toBe("");
  });
});

// ─── checkRobotstxt ─────────────────────────────────────────────────────
describe("checkRobotstxt", () => {
  test("returns true when fetch fails (default allow)", async () => {
    // Network call will fail in test env — should default to allow
    const result = await checkRobotstxt("this-domain-does-not-exist-12345.com");
    expect(result).toBe(true);
  });
});

// ─── getRandomUserAgent ─────────────────────────────────────────────────
describe("getRandomUserAgent", () => {
  test("returns a non-empty string", () => {
    const ua = getRandomUserAgent();
    expect(typeof ua).toBe("string");
    expect(ua.length).toBeGreaterThan(10);
  });

  test("returns a valid Mozilla user agent", () => {
    const ua = getRandomUserAgent();
    expect(ua.startsWith("Mozilla/5.0")).toBe(true);
  });

  test("returns different agents on multiple calls (probabilistic)", () => {
    const agents = new Set<string>();
    for (let i = 0; i < 20; i++) {
      agents.add(getRandomUserAgent());
    }
    // With 5 agents and 20 draws, very likely to see >1 unique
    expect(agents.size).toBeGreaterThan(1);
  });
});
