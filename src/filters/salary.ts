import type { PipelineOptions, FilteredJob } from '../types/options';

/**
 * Parse raw salary text (e.g. "$125,000 – $165,000", "₹50K/mo", "150k USD") into structured data.
 * Normalizes to annual USD for consistent comparison.
 */
export const normalizeSalary = (raw: string | undefined): {
  raw: string;
  min: number | null;
  max: number | null;
  currency: 'USD' | 'INR' | 'EUR' | 'GBP' | 'unknown';
  period: 'annual' | 'monthly' | 'hourly' | 'unknown';
} => {
  if (!raw) {
    return { raw: '', min: null, max: null, currency: 'unknown', period: 'unknown' };
  }

  const lower = raw.toLowerCase().trim();
  const currency: 'USD' | 'INR' | 'EUR' | 'GBP' | 'unknown' =
    lower.includes('$') ? 'USD' :
    lower.includes('₹') || lower.includes('inr') ? 'INR' :
    lower.includes('€') || lower.includes('eur') ? 'EUR' :
    lower.includes('£') || lower.includes('gbp') ? 'GBP' :
    'unknown';

  // Extract all numbers (handle "125,000", "125k", "50K")
  const nums: number[] = [];
  const numMatches = raw.match(/\d[\d,]*(?:\.\d+)?[kKmM]?/g);
  if (numMatches) {
    for (const match of numMatches) {
      const cleaned = match.replace(/[,\s]/g, '');
      let num = parseFloat(cleaned);
      if (cleaned.toLowerCase().endsWith('k') || cleaned.toLowerCase().endsWith('m')) {
        num = num * 1000;
      }
      nums.push(num);
    }
  }

  const period: 'annual' | 'monthly' | 'hourly' | 'unknown' =
    lower.includes('/mo') || lower.includes('/month') || lower.includes('monthly') ? 'monthly' :
    lower.includes('/hr') || lower.includes('/hour') || lower.includes('hourly') ? 'hourly' :
    lower.includes('/yr') || lower.includes('/year') || lower.includes('annually') || lower.includes('annual') ? 'annual' :
    // Default: bare numbers with large values (>= 10000) are likely annual
    (nums.some(n => n >= 10000) ? 'annual' : 'unknown');

  let min: number | null = null;
  let max: number | null = null;

  if (nums.length >= 2) {
    min = Math.min(...nums);
    max = Math.max(...nums);
  } else if (nums.length === 1) {
    min = nums[0];
    max = nums[0];
  }

  // Convert to annual USD
  if (min !== null) {
    min = toAnnualUSD(min, currency, period);
  }
  if (max !== null && max !== min) {
    max = toAnnualUSD(max, currency, period);
  }

  return { raw: raw.trim(), min, max, currency, period };
};

/**
 * Convert a salary amount to annual USD equivalent.
 * Approximate exchange rates (hardcoded for offline use).
 */
const toAnnualUSD = (amount: number, currency: string, period: string): number => {
  // Period conversion
  let annual = amount;
  if (period === 'monthly') annual = amount * 12;
  else if (period === 'hourly') annual = amount * 2080; // 40hrs * 52 weeks

  // Currency conversion (approximate 2026 rates)
  const rates: Record<string, number> = {
    'USD': 1,
    'INR': 0.012,  // 1 INR ≈ 0.012 USD
    'EUR': 1.08,
    'GBP': 1.27,
  };
  const rate = rates[currency] ?? 1;

  return Math.round(annual * rate);
};

/**
 * Check if a job's compensation meets the minimum salary threshold.
 * Returns true if no minSalary is set, or if the job meets the threshold.
 */
export const matchesSalaryFilter = (
  job: FilteredJob,
  options: PipelineOptions
): boolean => {
  const { minSalary, maxSalary, salaryCurrency } = options;

  // No filter applied
  if (minSalary === undefined && maxSalary === undefined) {
    return true;
  }

  const salary = normalizeSalary(job.compensation.raw);

  // If salary data is unknown, be permissive (don't filter out jobs with missing salary)
  if (salary.min === null && salary.max === null) {
    return true;
  }

  // Use the midpoint if we have a range, otherwise the single value
  const effectiveSalary = (salary.min !== null && salary.max !== null && salary.min !== salary.max)
    ? (salary.min + salary.max) / 2
    : (salary.min ?? salary.max ?? 0);

  // Minimum threshold check
  if (minSalary !== undefined && effectiveSalary < minSalary) {
    return false;
  }

  // Maximum threshold check (filter out jobs that pay too much — likely senior)
  if (maxSalary !== undefined && effectiveSalary > maxSalary) {
    return false;
  }

  return true;
};

/**
 * Score how well a job's salary matches the user's preferences.
 * Higher score for jobs that meet or exceed the minimum threshold.
 */
export const scoreSalaryMatch = (
  job: FilteredJob,
  options: PipelineOptions
): number => {
  if (!options.minSalary) return 0;

  const salary = normalizeSalary(job.compensation.raw);
  const effective = salary.max ?? salary.min;

  if (effective === null) return 0;

  // Full points if max salary meets or exceeds minimum
  if (effective >= options.minSalary) {
    return Math.min(15, Math.round((effective / options.minSalary) * 10));
  }

  return 0;
};
