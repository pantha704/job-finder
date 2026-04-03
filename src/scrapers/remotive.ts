import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, checkRobotstxt, getRandomUserAgent, parseRelativeDate } from '../utils';

const BASE_URL = 'https://remotive.com';
const MAX_PAGES = 5;

export async function scrapeRemotive(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('remotive.com');
  if (!allowed) { console.warn('[Remotive] robots.txt blocked'); return jobs; }

  const paths = [
    '/remote-jobs/software-dev?search=junior',
    '/remote-jobs/software-dev?search=fresher',
    '/remote-jobs/software-dev?search=entry+level',
    '/remote-jobs/software-dev?search=typescript',
    '/remote-jobs/software-dev?search=rust',
    '/remote-jobs/software-dev?search=solana',
    '/remote-jobs/software-dev?search=web3',
    '/remote-jobs/software-dev?search=intern',
  ];

  for (const path of paths) {
    const url = `${BASE_URL}${path}`;
    try {
      const html = await retry(async () => {
        const res = await fetch(url, {
          headers: { 'User-Agent': getRandomUserAgent(), 'Accept': 'text/html' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      });

      const $ = cheerio.load(html);
      let count = 0;

      $('li[data-url], .job, [class*="job-tile"]').each((_, el) => {
        const $el = $(el);
        const title = $el.find('h2, h3, [class*="title"]').first().text().trim();
        const company = $el.find('[class*="company"], .company').first().text().trim();
        const location = $el.find('[class*="location"], .location').first().text().trim() || 'Remote';
        const link = $el.attr('data-url') || $el.find('a').first().attr('href') || '';
        const dateText = $el.find('time, [class*="date"]').first().attr('datetime') || '';
        const tags = $el.find('[class*="tag"], .tag').map((_, t) => $(t).text().trim()).get();

        if (title && company) {
          const applyUrl = link.startsWith('http') ? link : `${BASE_URL}${link}`;
          jobs.push({
            title, company, applyUrl,
            location,
            experience: 'Entry Level',
            salary: null,
            postedDate: dateText ? new Date(dateText) : null,
            techStack: tags,
            source: 'Remotive',
            isHighMatch: false,
          });
          count++;
        }
      });

      console.log(`[Remotive] ${path}: +${count} (total: ${jobs.length})`);
      await delay(3000);
    } catch (err: any) {
      console.warn(`[Remotive] Error: ${err.message}`);
    }
  }
  return jobs;
}
