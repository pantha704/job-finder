import { describe, expect, test } from "bun:test";
import { normalizeSalary, matchesSalaryFilter, scoreSalaryMatch } from "./salary";
import type { FilteredJob, PipelineOptions } from "../types/options";

const makeJob = (salaryRaw?: string): FilteredJob => ({
  id: "test-job-1",
  title: "Blockchain Developer",
  company: "TestCorp",
  location: { raw: "Remote", normalized: "remote-global", scope: "remote-global" },
  experience: { raw: "0-1 years", level: "fresher", minYears: 0, maxYears: 1 },
  workType: "full-time",
  compensation: { raw: salaryRaw, currency: "USD", period: "annual" },
  skills: { required: ["rust"], preferred: [], matched: [], highlight: true },
  companyInfo: {},
  temporal: { postedDate: new Date() },
  application: { url: "https://test.com", easyApply: false, external: true },
  metadata: { source: "test", scrapedAt: new Date(), lastUpdated: new Date() },
  matchScore: 0,
  isHighMatch: false,
  isFresherFriendly: true,
  warnings: [],
});

const makeOptions = (min?: number, max?: number): PipelineOptions => ({
  experience: "fresher",
  locationScope: "remote-global",
  minSalary: min,
  maxSalary: max,
});

describe("normalizeSalary", () => {
  test("parses simple USD annual salary", () => {
    const result = normalizeSalary("$125,000");
    expect(result.currency).toBe("USD");
    expect(result.min).toBe(125000);
    expect(result.max).toBe(125000);
    expect(result.period).toBe("annual");
  });

  test("parses salary range", () => {
    const result = normalizeSalary("$125,000 – $165,000");
    expect(result.min).toBe(125000);
    expect(result.max).toBe(165000);
  });

  test("parses K notation", () => {
    const result = normalizeSalary("$150k");
    expect(result.min).toBe(150000);
  });

  test("detects monthly period", () => {
    const result = normalizeSalary("₹50K/mo");
    expect(result.currency).toBe("INR");
    expect(result.period).toBe("monthly");
  });

  test("handles empty input", () => {
    const result = normalizeSalary(undefined);
    expect(result.min).toBeNull();
    expect(result.max).toBeNull();
  });
});

describe("matchesSalaryFilter", () => {
  test("passes when no filter is set", () => {
    const job = makeJob("$100,000");
    expect(matchesSalaryFilter(job, {})).toBe(true);
  });

  test("passes when salary meets minimum", () => {
    const job = makeJob("$125,000");
    expect(matchesSalaryFilter(job, makeOptions(100000))).toBe(true);
  });

  test("fails when salary is below minimum", () => {
    const job = makeJob("$50,000");
    expect(matchesSalaryFilter(job, makeOptions(100000))).toBe(false);
  });

  test("fails when salary exceeds maximum (senior filter)", () => {
    const job = makeJob("$200,000");
    expect(matchesSalaryFilter(job, makeOptions(undefined, 150000))).toBe(false);
  });

  test("passes when salary data is unknown (permissive)", () => {
    const job = makeJob(undefined);
    expect(matchesSalaryFilter(job, makeOptions(100000))).toBe(true);
  });
});

describe("scoreSalaryMatch", () => {
  test("returns 0 when no minSalary set", () => {
    const job = makeJob("$100,000");
    expect(scoreSalaryMatch(job, {})).toBe(0);
  });

  test("gives positive score when salary meets threshold", () => {
    const job = makeJob("$125,000");
    expect(scoreSalaryMatch(job, makeOptions(100000))).toBeGreaterThan(0);
  });
});
