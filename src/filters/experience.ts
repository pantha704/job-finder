import type { PipelineOptions, FilteredJob, ExperienceLevel } from '../types/options';

export const normalizeExperience = (raw: string): {
  level: ExperienceLevel;
  minYears?: number;
  maxYears?: number;
} => {
  if (!raw) return { level: 'any' };

  const lower = raw.toLowerCase().trim();
  
  const numMatches = lower.match(/\d+(?:\.\d+)?/g);
  let minYears: number | undefined = undefined;
  let maxYears: number | undefined = undefined;

  if (numMatches && numMatches.length > 0) {
    const nums = numMatches.map(n => parseFloat(n));
    if (nums.length === 1) {
      if (lower.includes('up to') || lower.includes('max') || lower.includes('<')) {
        maxYears = nums[0];
        minYears = 0;
      } else if (lower.includes('+') || lower.includes('min') || lower.includes('>')) {
        minYears = nums[0];
      } else {
        minYears = nums[0];
        maxYears = nums[0];
      }
    } else {
      minYears = Math.min(...nums);
      maxYears = Math.max(...nums);
    }
  }

  // Handle months
  if (lower.includes('month')) {
     if (minYears !== undefined) minYears = minYears / 12;
     if (maxYears !== undefined) maxYears = maxYears / 12;
  }

  const fuzzyFresher = ["fresher", "entry", "0-1", "0-2", "new grad", "intern"];
  if (fuzzyFresher.some(kw => lower.includes(kw))) {
    return { level: 'fresher', minYears: minYears || 0, maxYears: maxYears || 1 };
  }
  
  if (minYears !== undefined) {
    if (minYears <= 1) return { level: 'fresher', minYears, maxYears };
    if (minYears <= 3) return { level: 'junior', minYears, maxYears };
    if (minYears <= 5) return { level: 'mid', minYears, maxYears };
    return { level: 'senior', minYears, maxYears };
  }

  if (lower.includes('intern')) return { level: 'internship' };
  if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal')) return { level: 'senior' };
  if (lower.includes('mid')) return { level: 'mid' };
  if (lower.includes('junior')) return { level: 'junior' };

  return { level: 'any', minYears, maxYears };
};

export const matchesExperienceFilter = (
  job: FilteredJob,
  options: PipelineOptions
): boolean => {
  const { experience, minYears, maxYears } = options;

  if (!experience && minYears === undefined && maxYears === undefined) {
    return true;
  }

  const jobExp = job.experience;

  if (experience) {
    const expArray = Array.isArray(experience) ? experience : [experience];
    if (!expArray.includes('any') && !expArray.includes(jobExp.level)) {
      // Allow fallback: If we look for intern/fresher, tolerate if maxYears fits well
      if (!(expArray.includes('fresher') && jobExp.maxYears !== undefined && jobExp.maxYears <= 2)) {
         return false;
      }
    }
  }

  if (minYears !== undefined) {
    if (jobExp.minYears !== undefined && jobExp.minYears > minYears) return false;
  }

  if (maxYears !== undefined) {
     if (jobExp.minYears !== undefined && jobExp.minYears > maxYears) return false;
  }

  return true;
};

export const scoreExperienceMatch = (
  job: FilteredJob,
  options: PipelineOptions
): number => {
  let score = 0;

  const jobExp = job.experience;
  const targetLevels = Array.isArray(options.experience) ? options.experience : (options.experience ? [options.experience] : []);

  if (targetLevels.includes(jobExp.level)) {
    score += 20;
  }

  if (targetLevels.includes('fresher') && jobExp.maxYears !== undefined && jobExp.maxYears <= 2) {
    score += 15;
  }

  return Math.min(score, 35);
};
