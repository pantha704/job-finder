import { describe, expect, test } from "bun:test";
import { matchesCompanyFilter, scoreCompanyMatch } from "./company";
import type { FilteredJob, PipelineOptions } from "../types/options";

const makeJob = (company?: string, size?: string, stage?: string): FilteredJob => ({
  id: "test-job-1",
  title: "Blockchain Developer",
  company: company || "TestCorp",
  location: { raw: "Remote", normalized: "remote-global", scope: "remote-global" },
  experience: { raw: "0-1 years", level: "fresher", minYears: 0, maxYears: 1 },
  workType: "full-time",
  compensation: { currency: "USD", period: "annual" },
  skills: { required: ["rust"], preferred: [], matched: [], highlight: true },
  companyInfo: { size: size as any, stage: stage as any },
  temporal: { postedDate: new Date() },
  application: { url: "https://test.com", easyApply: false, external: true },
  metadata: { source: "test", scrapedAt: new Date(), lastUpdated: new Date() },
  matchScore: 0,
  isHighMatch: false,
  isFresherFriendly: true,
  warnings: [],
});

const makeOptions = (exclude?: string[], size?: string, stage?: string): PipelineOptions => ({
  experience: "fresher",
  locationScope: "remote-global",
  excludeCompanies: exclude,
  companySize: size as any,
  companyStage: stage as any,
});

describe("matchesCompanyFilter — blacklist", () => {
  test("passes when no blacklist is set", () => {
    const job = makeJob("TestCorp");
    expect(matchesCompanyFilter(job, {})).toBe(true);
  });

  test("fails when company is blacklisted", () => {
    const job = makeJob("SortWind");
    expect(matchesCompanyFilter(job, makeOptions(["sortwind"]))).toBe(false);
  });

  test("is case-insensitive", () => {
    const job = makeJob("SORTWIND");
    expect(matchesCompanyFilter(job, makeOptions(["sortwind"]))).toBe(false);
  });

  test("passes when company is not in blacklist", () => {
    const job = makeJob("Ondo Finance");
    expect(matchesCompanyFilter(job, makeOptions(["sortwind"]))).toBe(true);
  });

  test("matches partial company names", () => {
    const job = makeJob("Franklin Templeton Inc");
    expect(matchesCompanyFilter(job, makeOptions(["franklin"]))).toBe(false);
  });
});

describe("matchesCompanyFilter — size", () => {
  test("passes when size matches filter", () => {
    const job = makeJob("StartupCo", "1-10");
    expect(matchesCompanyFilter(job, makeOptions(undefined, "1-10"))).toBe(true);
  });

  test("fails when size doesn't match filter", () => {
    const job = makeJob("BigCorp", "500+");
    expect(matchesCompanyFilter(job, makeOptions(undefined, "1-10"))).toBe(false);
  });

  test("passes when job has no size data (permissive)", () => {
    const job = makeJob("UnknownSize");
    expect(matchesCompanyFilter(job, makeOptions(undefined, "1-10"))).toBe(true);
  });
});

describe("matchesCompanyFilter — stage", () => {
  test("passes when stage matches", () => {
    const job = makeJob("EarlyStage", undefined, "seed");
    expect(matchesCompanyFilter(job, makeOptions(undefined, undefined, "seed"))).toBe(true);
  });

  test("fails when stage doesn't match", () => {
    const job = makeJob("Enterprise", undefined, "enterprise");
    expect(matchesCompanyFilter(job, makeOptions(undefined, undefined, "seed"))).toBe(false);
  });
});

describe("scoreCompanyMatch", () => {
  test("returns 0 when no preferences set", () => {
    const job = makeJob("TestCorp");
    expect(scoreCompanyMatch(job, {})).toBe(0);
  });

  test("gives points when stage matches", () => {
    const job = makeJob("StartupCo", undefined, "seed");
    expect(scoreCompanyMatch(job, makeOptions(undefined, undefined, "seed"))).toBeGreaterThan(0);
  });
});
