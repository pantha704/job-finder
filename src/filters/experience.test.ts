import { describe, test, expect } from "bun:test";
import { matchesExperienceFilter, normalizeExperience, scoreExperienceMatch } from "./experience";
import type { PipelineOptions, FilteredJob } from "../types/options";

const baseJob = (rawExp: string): FilteredJob => ({
  title: "Test",
  company: "Test Co",
  applyUrl: "https://example.com/job",
  location: { normalized: "remote-global", scope: "remote-global", raw: "Remote" },
  experience: normalizeExperience(rawExp),
  skills: { required: [], preferred: [], matched: [], highlight: false },
  matchScore: 0,
  isHighMatch: false,
});

// ─── normalizeExperience ────────────────────────────────────────────────
describe("normalizeExperience", () => {
  test("parses 'Fresher' as fresher level", () => {
    const result = normalizeExperience("Fresher");
    expect(result.level).toBe("fresher");
  });

  test("parses 'Entry Level' as fresher level", () => {
    const result = normalizeExperience("Entry Level");
    expect(result.level).toBe("fresher");
  });

  test("parses '0-2 years' as fresher level", () => {
    const result = normalizeExperience("0-2 years");
    expect(result.level).toBe("fresher");
    expect(result.minYears).toBe(0);
    expect(result.maxYears).toBe(2);
  });

  test("parses 'Internship' as fresher level (contains 'intern' in fuzzyFresher)", () => {
    const result = normalizeExperience("Internship");
    expect(result.level).toBe("fresher");
  });

  test("parses '5+ years' as mid level (minYears=5 → mid tier)", () => {
    const result = normalizeExperience("5+ years");
    expect(result.level).toBe("mid");
    expect(result.minYears).toBe(5);
  });

  test("parses '2-4 years' as junior level", () => {
    const result = normalizeExperience("2-4 years");
    expect(result.level).toBe("junior");
    expect(result.minYears).toBe(2);
    expect(result.maxYears).toBe(4);
  });

  test("parses '3-5 years' as junior level (minYears=3 → junior tier)", () => {
    const result = normalizeExperience("3-5 years");
    expect(result.level).toBe("junior");
  });

  test("parses 'Lead Engineer' as senior level", () => {
    const result = normalizeExperience("Lead Engineer");
    expect(result.level).toBe("senior");
  });

  test("parses 'Principal Engineer' as senior level", () => {
    const result = normalizeExperience("Principal Engineer");
    expect(result.level).toBe("senior");
  });

  test("returns 'any' for empty input", () => {
    const result = normalizeExperience("");
    expect(result.level).toBe("any");
  });

  test("handles months correctly", () => {
    const result = normalizeExperience("6 months");
    expect(result.level).toBe("fresher");
    expect(result.minYears).toBeCloseTo(0.5, 1);
  });
});

// ─── matchesExperienceFilter ────────────────────────────────────────────
describe("matchesExperienceFilter", () => {
  test("accepts 'Fresher' when experience filter includes 'fresher'", () => {
    const job = baseJob("Fresher");
    const opts: PipelineOptions = { experience: "fresher" };
    expect(matchesExperienceFilter(job, opts)).toBe(true);
  });

  test("rejects '5+ years' when experience filter is 'fresher'", () => {
    const job = baseJob("5+ years");
    const opts: PipelineOptions = { experience: "fresher" };
    expect(matchesExperienceFilter(job, opts)).toBe(false);
  });

  test("accepts 'Entry Level' when experience filter is 'fresher'", () => {
    const job = baseJob("Entry Level");
    const opts: PipelineOptions = { experience: "fresher" };
    expect(matchesExperienceFilter(job, opts)).toBe(true);
  });

  test("accepts 'Internship' when experience filter is 'fresher'", () => {
    const job = baseJob("Internship");
    const opts: PipelineOptions = { experience: "fresher" };
    expect(matchesExperienceFilter(job, opts)).toBe(true);
  });

  test("returns true when no experience filter is set", () => {
    const job = baseJob("5+ years");
    expect(matchesExperienceFilter(job, {} as PipelineOptions)).toBe(true);
  });

  test("allows fresher jobs with maxYears <= 2 even without explicit fresher match", () => {
    const job = baseJob("0-1 year");
    const opts: PipelineOptions = { experience: "fresher" };
    expect(matchesExperienceFilter(job, opts)).toBe(true);
  });
});

// ─── scoreExperienceMatch ───────────────────────────────────────────────
describe("scoreExperienceMatch", () => {
  test("scores 35 for fresher match (exact level + maxYears <= 2 bonus)", () => {
    const job = baseJob("Fresher");
    const opts: PipelineOptions = { experience: "fresher" };
    // Fresher level match = 20, plus maxYears <= 2 bonus = 15 → total 35
    expect(scoreExperienceMatch(job, opts)).toBe(35);
  });

  test("scores 35 for fresher match with maxYears <= 2", () => {
    const job = baseJob("0-1 year");
    const opts: PipelineOptions = { experience: "fresher" };
    expect(scoreExperienceMatch(job, opts)).toBe(35);
  });

  test("scores 0 for non-matching level", () => {
    const job = baseJob("5+ years");
    const opts: PipelineOptions = { experience: "fresher" };
    expect(scoreExperienceMatch(job, opts)).toBe(0);
  });
});
