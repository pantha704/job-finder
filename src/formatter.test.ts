import { describe, test, expect } from "bun:test";
import { generateCsvReport, generateJsonReport } from "./formatter";
import type { FilteredJob, PipelineOptions } from "../types/options";

const makeJob = (title: string, company: string, source: string): FilteredJob => ({
  id: "https://example.com/job",
  title,
  company,
  location: { normalized: "remote-global", scope: "remote-global", raw: "Remote" },
  experience: { level: "fresher" as const, raw: "Fresher" },
  workType: "full-time" as const,
  compensation: { raw: "$50k", currency: "USD" as const, period: "annual" as const },
  skills: { required: ["rust"], preferred: [], matched: ["rust"], highlight: true },
  companyInfo: {},
  temporal: { postedDate: new Date("2026-04-03") },
  application: { url: "https://example.com/apply", easyApply: false, external: true },
  metadata: { source, scrapedAt: new Date(), lastUpdated: new Date() },
  matchScore: 50,
  isHighMatch: true,
  isFresherFriendly: true,
  warnings: [],
});

describe("generateCsvReport", () => {
  test("produces correct CSV header", () => {
    const csv = generateCsvReport([makeJob("Dev", "Co", "Src")]);
    expect(csv.split("\n")[0]).toBe("Title,Company,Location,Experience,WorkType,Compensation,Skills,HighMatch,Score,URL,Source,PostedDate");
  });

  test("escapes commas in job title", () => {
    const csv = generateCsvReport([makeJob("Sr. Dev, Backend", "Co", "Src")]);
    expect(csv).toContain('"Sr. Dev, Backend"');
  });

  test("escapes quotes in company name", () => {
    const csv = generateCsvReport([makeJob("Dev", 'Acme "Inc"', "Src")]);
    expect(csv).toContain('"Acme ""Inc"""');
  });

  test("marks high match correctly", () => {
    const high = makeJob("Rust Dev", "Co", "Src");
    high.isHighMatch = true;
    const low = makeJob("Support", "Co", "Src");
    low.isHighMatch = false;
    low.matchScore = 10;
    const csv = generateCsvReport([high, low]);
    expect(csv).toContain("true");
    expect(csv).toContain("false");
  });

  test("handles empty skills", () => {
    const job = makeJob("Dev", "Co", "Src");
    job.skills.matched = [];
    job.skills.required = [];
    const csv = generateCsvReport([job]);
    expect(csv).toContain('""');
  });
});

describe("generateJsonReport", () => {
  test("produces valid JSON", () => {
    const json = generateJsonReport([makeJob("Dev", "Co", "Src")], {} as PipelineOptions);
    const parsed = JSON.parse(json);
    expect(parsed.total).toBe(1);
    expect(parsed.jobs[0].title).toBe("Dev");
  });

  test("includes highMatchCount", () => {
    const jobs = [makeJob("Rust", "Co", "Src"), makeJob("Support", "Co", "Src")];
    jobs[1].isHighMatch = false;
    jobs[1].matchScore = 5;
    const parsed = JSON.parse(generateJsonReport(jobs, {} as PipelineOptions));
    expect(parsed.highMatchCount).toBe(1);
  });
});
