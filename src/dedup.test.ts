import { describe, test, expect } from "bun:test";
import { generateDedupKey, mergeJobs, validateUrl } from "./dedup";
import type { Job } from "../types";

// ─── generateDedupKey ───────────────────────────────────────────────────
describe("generateDedupKey", () => {
  test("produces same key for same job from different sources", () => {
    const key1 = generateDedupKey("Google", "Software Engineer", "https://google.com/jobs/123");
    const key2 = generateDedupKey("Google", "Software Engineer", "https://google.com/jobs/123");
    expect(key1).toBe(key2);
  });

  test("produces different keys for different titles", () => {
    const key1 = generateDedupKey("Google", "Software Engineer", "https://google.com/jobs/123");
    const key2 = generateDedupKey("Google", "Data Engineer", "https://google.com/jobs/456");
    expect(key1).not.toBe(key2);
  });

  test("produces different keys for different companies", () => {
    const key1 = generateDedupKey("Google", "Software Engineer", "https://google.com/jobs/123");
    const key2 = generateDedupKey("Meta", "Software Engineer", "https://meta.com/jobs/123");
    expect(key1).not.toBe(key2);
  });

  test("uses hostname from applyLink", () => {
    const key = generateDedupKey("Google", "Engineer", "https://jobs.google.com/apply/123");
    expect(key).toContain("jobs.google.com");
  });

  test("falls back to full URL if URL parsing fails", () => {
    const key = generateDedupKey("Google", "Engineer", "not-a-valid-url");
    expect(key).toContain("not-a-valid-url");
  });

  test("case-insensitive company and title", () => {
    const key1 = generateDedupKey("Google", "Software Engineer", "https://example.com/1");
    const key2 = generateDedupKey("GOOGLE", "SOFTWARE ENGINEER", "https://example.com/1");
    expect(key1).toBe(key2);
  });

  test("trims whitespace", () => {
    const key1 = generateDedupKey("Google ", " Software Engineer", "https://example.com/1");
    const key2 = generateDedupKey("Google", "Software Engineer", "https://example.com/1");
    expect(key1).toBe(key2);
  });
});

// ─── mergeJobs ──────────────────────────────────────────────────────────
describe("mergeJobs", () => {
  const makeJob = (company: string, title: string, score?: number, date?: Date): Job => ({
    title,
    company,
    applyUrl: `https://example.com/${company.toLowerCase()}`,
    location: "Remote",
    experience: "Fresher",
    salary: null,
    postedDate: date || new Date(),
    techStack: [],
    source: "test",
    isHighMatch: false,
    matchScore: score,
  });

  test("returns job with higher matchScore", () => {
    const a = makeJob("A", "Job A", 50);
    const b = makeJob("A", "Job A", 30);
    expect(mergeJobs(a, b)).toBe(a);
  });

  test("returns job with higher matchScore (reversed)", () => {
    const a = makeJob("A", "Job A", 30);
    const b = makeJob("A", "Job A", 50);
    expect(mergeJobs(a, b)).toBe(b);
  });

  test("returns more recent job when scores tie", () => {
    const older = new Date("2026-03-01");
    const newer = new Date("2026-04-01");
    const a = makeJob("A", "Job A", 40, older);
    const b = makeJob("A", "Job A", 40, newer);
    expect(mergeJobs(a, b)).toBe(b);
  });

  test("returns jobB as tiebreaker when everything ties (same score, same date)", () => {
    const now = new Date();
    const a = makeJob("A", "Job A", 40, now);
    const b = makeJob("B", "Job A", 40, now);
    const result = mergeJobs(a, b);
    // When scores tie AND dates are equal, code returns jobB
    expect(result.company).toBe("B");
  });

  test("handles undefined matchScore (both undefined → both default 0 → tie → jobB)", () => {
    const a = makeJob("A", "Job A");
    const b = makeJob("B", "Job A");
    const result = mergeJobs(a, b);
    // Both undefined score → 0, both have same date → returns jobB
    expect(result.company).toBe("B");
  });
});

// ─── validateUrl ────────────────────────────────────────────────────────
describe("validateUrl", () => {
  test("returns true for trusted hostnames without network call", async () => {
    expect(await validateUrl("https://internshala.com/job/123")).toBe(true);
    expect(await validateUrl("https://www.linkedin.com/jobs/123")).toBe(true);
    expect(await validateUrl("https://cutshort.io/job/123")).toBe(true);
    expect(await validateUrl("https://jobs.solana.com/job/123")).toBe(true);
    expect(await validateUrl("https://remoteok.com/job/123")).toBe(true);
  });

  test("returns false for unparseable URL", async () => {
    expect(await validateUrl("not-a-url")).toBe(false);
  });
});
