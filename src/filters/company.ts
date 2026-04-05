import type { PipelineOptions, FilteredJob } from '../types/options';

/**
 * Check if a job's company matches the company filter (blacklist, size, stage).
 */
export const matchesCompanyFilter = (
  job: FilteredJob,
  options: PipelineOptions
): boolean => {
  const { excludeCompanies, companySize, companyStage } = options;

  // Blacklist check
  if (excludeCompanies && excludeCompanies.length > 0) {
    const companyLower = job.company.toLowerCase();
    const isBlacklisted = excludeCompanies.some(
      (blocked) => companyLower.includes(blocked.toLowerCase())
    );
    if (isBlacklisted) return false;
  }

  // Company size filter
  if (companySize && companySize !== 'any') {
    if (job.companyInfo.size && job.companyInfo.size !== companySize) {
      // If the job has explicit size data, filter by it
      if (!sizeRangesOverlap(job.companyInfo.size, companySize)) {
        return false;
      }
    }
  }

  // Company stage filter
  if (companyStage && companyStage !== 'any') {
    const stages = Array.isArray(companyStage) ? companyStage : [companyStage];
    if (job.companyInfo.stage && !stages.includes(job.companyInfo.stage)) {
      return false;
    }
  }

  return true;
};

/**
 * Check if two company size ranges overlap.
 * e.g. "1-10" overlaps with "1-10" but not "201-500".
 */
const sizeRangesOverlap = (jobSize: string, filterSize: string): boolean => {
  const parseRange = (size: string): [number, number] => {
    const parts = size.replace(/\+/g, '-99999').split('-').map(Number);
    return [parts[0] ?? 0, parts[1] ?? 99999];
  };

  const [jobMin, jobMax] = parseRange(jobSize);
  const [filterMin, filterMax] = parseRange(filterSize);

  return jobMin <= filterMax && filterMin <= jobMax;
};

/**
 * Score how well a job's company matches the user's preferences.
 */
export const scoreCompanyMatch = (
  job: FilteredJob,
  options: PipelineOptions
): number => {
  let score = 0;

  // Prefer startups for fresher roles (more learning opportunities)
  if (options.companyStage) {
    const stages = Array.isArray(options.companyStage) ? options.companyStage : [options.companyStage];
    if (job.companyInfo.stage && stages.includes(job.companyInfo.stage)) {
      score += 10;
    }
  }

  // Prefer small-to-mid companies for direct mentorship
  if (options.companySize && options.companySize !== 'any') {
    if (job.companyInfo.size && sizeRangesOverlap(job.companyInfo.size, options.companySize)) {
      score += 10;
    }
  }

  return Math.min(score, 20);
};
