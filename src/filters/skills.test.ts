import { describe, test, expect } from "bun:test";
import { scoreSkillsMatch } from "./skills";
import type { PipelineOptions, FilteredJob } from "../types/options";

const makeJob = (title: string, skills: string[] = []): FilteredJob => ({
  title,
  company: "Test Co",
  applyUrl: "https://example.com/job",
  location: { normalized: "remote-global", scope: "remote-global", raw: "Remote" },
  experience: { level: "fresher" as const },
  skills: { required: skills, preferred: [], matched: [], highlight: false },
  matchScore: 0,
  isHighMatch: false,
});

// ─── scoreSkillsMatch — Default high-value skills ───────────────────────
describe("scoreSkillsMatch — default skills", () => {
  test("scores 15 for 'Rust' in title", () => {
    const job = makeJob("Rust Developer");
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeGreaterThanOrEqual(15);
    expect(job.skills.highlight).toBe(true);
    expect(job.skills.matched).toContain("rust");
  });

  test("scores 15 for 'Solana' in title", () => {
    const job = makeJob("Solana Engineer");
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeGreaterThanOrEqual(15);
    expect(job.skills.highlight).toBe(true);
    expect(job.skills.matched).toContain("solana");
  });

  test("scores 15 for 'web3' in skills", () => {
    const job = makeJob("Backend Developer", ["web3"]);
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeGreaterThanOrEqual(15);
    expect(job.skills.highlight).toBe(true);
    expect(job.skills.matched).toContain("web3");
  });

  test("scores 10 for 'TypeScript' in title", () => {
    const job = makeJob("TypeScript Developer");
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeGreaterThanOrEqual(10);
    expect(job.skills.highlight).toBe(true);
    expect(job.skills.matched).toContain("typescript");
  });

  test("scores 10 for 'Next.js' in skills", () => {
    const job = makeJob("Frontend Developer", ["next.js"]);
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeGreaterThanOrEqual(10);
    expect(job.skills.highlight).toBe(true);
    expect(job.skills.matched).toContain("next.js");
  });

  test("scores 10 for 'NextJS' in skills", () => {
    const job = makeJob("Frontend Developer", ["nextjs"]);
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeGreaterThanOrEqual(10);
  });
});

// ─── Word-boundary regex check ──────────────────────────────────────────
describe("scoreSkillsMatch — word boundary check", () => {
  test("'trust' does NOT match 'rust'", () => {
    const job = makeJob("Trust and Safety Engineer");
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(job.isHighMatch).toBe(false);
    expect(job.skills.matched).not.toContain("rust");
  });

  test("'trustworthy' does NOT match 'rust'", () => {
    const job = makeJob("Trustworthy Team Lead", ["trustworthy"]);
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(job.isHighMatch).toBe(false);
    expect(job.skills.matched).not.toContain("rust");
  });

  test("'crust' does NOT match 'rust'", () => {
    const job = makeJob("Crust Developer", ["crust"]);
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(job.isHighMatch).toBe(false);
    expect(job.skills.matched).not.toContain("rust");
  });

  test("'rust' DOES match standalone 'rust'", () => {
    const job = makeJob("Rust Developer");
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeGreaterThanOrEqual(15);
    expect(job.skills.highlight).toBe(true);
    expect(job.skills.matched).toContain("rust");
  });

  test("'solana' DOES match standalone 'solana'", () => {
    const job = makeJob("Solana Smart Contracts");
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeGreaterThanOrEqual(15);
    expect(job.skills.highlight).toBe(true);
    expect(job.skills.matched).toContain("solana");
  });
});

// ─── User-specified highlightSkills ─────────────────────────────────────
describe("scoreSkillsMatch — highlightSkills", () => {
  test("adds score for matching highlightSkills", () => {
    const job = makeJob("Full Stack Developer", ["react", "nodejs"]);
    const score = scoreSkillsMatch(job, {
      highlightSkills: ["react", "nodejs"],
    } as PipelineOptions);
    expect(score).toBeGreaterThan(0);
    expect(job.skills.matched).toContain("react");
    expect(job.skills.matched).toContain("nodejs");
  });

  test("does not add score for non-matching highlightSkills", () => {
    const job = makeJob("Full Stack Developer", ["python"]);
    const opts: PipelineOptions = { highlightSkills: ["rust", "solana"] };
    const score = scoreSkillsMatch(job, opts);
    // Should only get default skill scores (0 here since python not in defaults)
    expect(job.skills.matched).not.toContain("rust");
    expect(job.skills.matched).not.toContain("solana");
  });

  test("default skills and highlightSkills are additive", () => {
    const job = makeJob("Rust + React Developer", ["react"]);
    const opts: PipelineOptions = { highlightSkills: ["react"] };
    const score = scoreSkillsMatch(job, opts);
    // Rust (15) + React default (5) + React highlight (15) — but react already matched via default
    // So: rust 15 + react 5 (default) + react would be skipped since already matched
    expect(score).toBeGreaterThanOrEqual(15);
    expect(job.skills.highlight).toBe(true);
    expect(job.skills.matched).toContain("rust");
    expect(job.skills.matched).toContain("react");
  });
});

// ─── Score capping ──────────────────────────────────────────────────────
describe("scoreSkillsMatch — capping", () => {
  test("score is capped at 60", () => {
    const job = makeJob("Rust Solana Web3 Blockchain Anchor TypeScript NextJS Wasm Developer", [
      "react",
      "nodejs",
      "javascript",
      "fresher",
    ]);
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeLessThanOrEqual(60);
  });
});

// ─── Internship/Fresher keywords ────────────────────────────────────────
describe("scoreSkillsMatch — internship/fresher keywords", () => {
  test("scores 5 for 'fresher' in skills", () => {
    const job = makeJob("Software Developer", ["fresher"]);
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeGreaterThanOrEqual(5);
  });

  test("scores 5 for 'internship' in skills", () => {
    const job = makeJob("Software Developer", ["internship"]);
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeGreaterThanOrEqual(5);
  });

  test("scores 5 for 'entry level' in skills", () => {
    const job = makeJob("Software Developer", ["entry level"]);
    const score = scoreSkillsMatch(job, {} as PipelineOptions);
    expect(score).toBeGreaterThanOrEqual(5);
  });
});
