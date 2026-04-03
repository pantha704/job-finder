import type { Job } from "./types";

export function generateDedupKey(company: string, title: string, applyLink: string): string {
  let hostname = '';
  try {
    const url = new URL(applyLink);
    hostname = url.hostname;
  } catch(e) {
    hostname = applyLink; // fallback
  }
  return `${company.toLowerCase().trim()}-${title.toLowerCase().trim()}-${hostname}`;
}

export function mergeJobs(jobA: Job, jobB: Job): Job {
  const scoreA = jobA.matchScore ?? 0;
  const scoreB = jobB.matchScore ?? 0;
  
  if (scoreA > scoreB) return jobA;
  if (scoreB > scoreA) return jobB;
  
  if (jobA.postedDate && jobB.postedDate) {
    if (jobA.postedDate > jobB.postedDate) return jobA;
    return jobB;
  }
  
  // Tiebreaker
  return jobA;
}

// Known job boards always return auth-gated responses to HEAD —
// trust their scraped URLs directly instead of wasting 5s per URL.
const TRUSTED_HOSTNAMES = new Set([
  "internshala.com", "wellfound.com", "unstop.com", "remoterocketship.com",
  "linkedin.com", "www.linkedin.com", "cutshort.io", "himalayas.app",
  "jobs.solana.com", "cryptocurrencyjobs.co",
  "remoteok.com", "remoteok.io", "remotive.com", "weworkremotely.com",
  "jobicy.com", "jobspresso.co",
]);

export async function validateUrl(url: string, timeoutMs: number = 4000): Promise<boolean> {
  try {
    const hostname = new URL(url).hostname;
    if (TRUSTED_HOSTNAMES.has(hostname)) return true; // trust known boards
  } catch {
    return false; // unparseable URL → reject
  }

  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobBot/1.0)" },
    });
    // Accept any non-5xx response; job boards often return 403 on HEAD
    return res.status < 500;
  } catch {
    return false;
  }
}

