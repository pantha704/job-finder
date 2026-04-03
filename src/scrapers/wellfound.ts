// Wellfound (AngelList) is permanently blocked by DataDome CAPTCHA.
// This scraper is disabled — returns empty.
// Kept as placeholder in case a bypass is discovered in the future.
//
// Previously attempted:
// - Plain fetch → CF challenge page
// - fetchRendered (Camoufox/Playwright) → DataDome 403
// - Multiple URL patterns → all blocked
//
// To re-enable: uncomment the old code below and find a working bypass.
/*
import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, checkRobotstxt } from '../utils';
import { fetchRendered } from '../browser';

export async function scrapeWellfound(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('wellfound.com', '/jobs');
  if (!allowed) { console.warn('[Wellfound] robots.txt blocked'); return jobs; }

  const urls = [
    'https://wellfound.com/jobs?remote=true&jobTypes=full_time&experienceLevels=entry_level',
    'https://wellfound.com/jobs?remote=true&jobTypes=internship',
    'https://wellfound.com/jobs?remote=true&skills=typescript',
    'https://wellfound.com/jobs?remote=true&skills=rust',
    'https://wellfound.com/jobs?remote=true&skills=solana',
  ];

  for (const url of urls) {
    try {
      const { html, method } = await fetchRendered(url);
      const $ = cheerio.load(html);
      // ... selectors ...
    } catch (err: any) {
      console.warn(`[Wellfound] Error: ${err.message}`);
    }
  }
  return jobs;
}
*/
import type { Job } from '../types';

export async function scrapeWellfound(): Promise<Job[]> {
  console.warn('[Wellfound] Disabled — DataDome CAPTCHA blocks all access paths');
  return [];
}
