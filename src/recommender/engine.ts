import { queryHistory, JobRecord } from "../db/jobs";
import type { FilteredJob } from "../types/options";

export interface UserPatterns {
  topSkills: Map<string, number>;
  avgSalary: number;
  topSources: Map<string, number>;
  appliedCount: number;
  rejectedCount: number;
}

/**
 * Analyze user's application history to find patterns.
 */
export function analyzePatterns(): UserPatterns {
  const applied = queryHistory({ status: "applied" });
  const rejected = queryHistory({ status: "rejected" });

  const topSkills = new Map<string, number>();
  const topSources = new Map<string, number>();
  let totalSalary = 0;
  let salaryCount = 0;

  for (const job of applied) {
    // Track sources
    topSources.set(job.source, (topSources.get(job.source) || 0) + 1);
  }

  // Simple pattern extraction
  // In a real implementation, this would analyze job descriptions for skill co-occurrence
  const patterns: UserPatterns = {
    topSkills,
    avgSalary: salaryCount > 0 ? totalSalary / salaryCount : 0,
    topSources,
    appliedCount: applied.length,
    rejectedCount: rejected.length,
  };

  return patterns;
}

/**
 * Adjust job scores based on user patterns.
 * Small adjustments (±5 points) to avoid overriding primary signals.
 */
export function adjustScores(jobs: FilteredJob[], patterns: UserPatterns): void {
  if (patterns.appliedCount < 3) {
    // Not enough data — skip adjustments
    return;
  }

  for (const job of jobs) {
    let adjustment = 0;

    // Boost jobs from frequently applied-to sources
    const sourceCount = patterns.topSources.get(job.metadata.source) || 0;
    if (sourceCount > 0) {
      adjustment += Math.min(5, sourceCount);
    }

    // Apply adjustment (clamped to ±5)
    adjustment = Math.max(-5, Math.min(5, adjustment));
    job.matchScore = Math.max(0, Math.min(100, job.matchScore + adjustment));

    if (job.matchScore >= 40) {
      job.isHighMatch = true;
    }
  }
}
