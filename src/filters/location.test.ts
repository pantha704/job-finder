import { describe, test, expect } from "bun:test";
import { matchesLocationFilter, normalizeLocation, scoreLocationMatch } from "./location";
import type { PipelineOptions, FilteredJob } from "../types/options";

const baseJob = (raw: string): FilteredJob => ({
  title: "Test",
  company: "Test Co",
  applyUrl: "https://example.com/job",
  location: normalizeLocation(raw, {} as PipelineOptions),
  experience: { level: "fresher" as const },
  skills: { required: [], preferred: [], matched: [], highlight: false },
  matchScore: 0,
  isHighMatch: false,
});

// ─── normalizeLocation ──────────────────────────────────────────────────
describe("normalizeLocation", () => {
  test("normalizes 'Remote, India' to remote-india scope", () => {
    const result = normalizeLocation("Remote, India", {} as PipelineOptions);
    expect(result.scope).toBe("remote-india");
    expect(result.normalized).toBe("remote-india");
  });

  test("normalizes 'Remote, Global' to remote-global scope", () => {
    const result = normalizeLocation("Remote, Global", {} as PipelineOptions);
    expect(result.scope).toBe("remote-global");
  });

  test("normalizes 'Remote, Worldwide' to remote-global scope", () => {
    const result = normalizeLocation("Remote, Worldwide", {} as PipelineOptions);
    expect(result.scope).toBe("remote-global");
  });

  test("normalizes bare 'Remote' to remote-global scope", () => {
    const result = normalizeLocation("Remote", {} as PipelineOptions);
    expect(result.scope).toBe("remote-global");
  });

  test("normalizes 'Hybrid' to hybrid scope", () => {
    const result = normalizeLocation("Hybrid, Bangalore", {} as PipelineOptions);
    expect(result.scope).toBe("hybrid");
  });
});

// ─── matchesLocationFilter ──────────────────────────────────────────────
describe("matchesLocationFilter", () => {
  test("accepts remote-india when remoteFromIndia is true", () => {
    const job = baseJob("Remote, India");
    const opts: PipelineOptions = { remoteFromIndia: true };
    expect(matchesLocationFilter(job, opts)).toBe(true);
  });

  test("accepts remote-global when remoteFromIndia is true (workable from India)", () => {
    const job = baseJob("Remote, Global");
    const opts: PipelineOptions = { remoteFromIndia: true };
    expect(matchesLocationFilter(job, opts)).toBe(true);
  });

  test("rejects onsite-only when remoteFromIndia is true", () => {
    const job = baseJob("Bangalore, India");
    const opts: PipelineOptions = { remoteFromIndia: true };
    // Onsite jobs with unknown scope should be rejected by remoteFromIndia filter
    expect(matchesLocationFilter(job, opts)).toBe(false);
  });

  test("accepts 'Work from Home' as remote", () => {
    const job = baseJob("Work from Home");
    const opts: PipelineOptions = { remoteFromIndia: true };
    expect(matchesLocationFilter(job, opts)).toBe(true);
  });

  test("returns true when no location filter is set", () => {
    const job = baseJob("Bangalore, India");
    expect(matchesLocationFilter(job, {} as PipelineOptions)).toBe(true);
  });

  test("accepts remote-india when locationScope is remote-india", () => {
    const job = baseJob("Remote, India");
    const opts: PipelineOptions = { locationScope: "remote-india" };
    expect(matchesLocationFilter(job, opts)).toBe(true);
  });

  test("accepts remote-global when locationScope is remote-india", () => {
    const job = baseJob("Remote, Global");
    const opts: PipelineOptions = { locationScope: "remote-india" };
    expect(matchesLocationFilter(job, opts)).toBe(true);
  });
});

// ─── scoreLocationMatch ─────────────────────────────────────────────────
describe("scoreLocationMatch", () => {
  test("scores 25 for remote-india match when remoteFromIndia is true", () => {
    const job = baseJob("Remote, India");
    const opts: PipelineOptions = { remoteFromIndia: true };
    expect(scoreLocationMatch(job, opts)).toBe(25);
  });

  test("scores 0 for non-matching location", () => {
    const job = baseJob("New York, USA");
    const opts: PipelineOptions = { remoteFromIndia: true };
    expect(scoreLocationMatch(job, opts)).toBe(0);
  });
});
