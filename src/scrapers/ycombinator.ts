// YC Work at a Startup uses client-side Algolia search with a restricted API key.
// Jobs are loaded dynamically via JavaScript XHR calls to Algolia.
// This scraper is disabled — returns empty.
//
// Research findings:
// - Algolia App: 45BWZJ1SGC
// - Index pattern: *_production (from decoded API key)
// - API key is restricted (analyticsTags=waas, restrictIndices=*_production)
// - List indices endpoint blocked, individual index queries return 403
// - To re-enable: need to reverse-engineer the full API key or use browser automation
//   that waits for Algolia XHR to complete
//
/*
import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { fetchRendered } from '../browser';
// ... old scraper code ...
*/
import type { Job } from '../types';

export async function scrapeYCombinator(): Promise<Job[]> {
  console.warn('[YCombinator] Disabled — Algolia API key is restricted, jobs load via client-side XHR');
  return [];
}
