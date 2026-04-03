import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, checkRobotstxt, getRandomUserAgent, parseRelativeDate } from '../utils';

export async function scrapeRemoteRocketship(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('remoterocketship.com');
  if (!allowed) { console.warn('[RemoteRocketship] robots.txt blocked'); return jobs; }

  const urls = [
    'https://remoterocketship.com/jobs/software-engineer?country=India&seniority=entry_level',
    'https://remoterocketship.com/jobs/software-engineer?country=India&seniority=intern',
    'https://remoterocketship.com/jobs/software-engineer?country=Worldwide&seniority=entry_level',
    'https://remoterocketship.com/jobs/frontend-developer?seniority=entry_level',
    'https://remoterocketship.com/jobs/backend-developer?seniority=entry_level',
    'https://remoterocketship.com/jobs/typescript',
    'https://remoterocketship.com/jobs/rust',
  ];

  for (const url of urls) {
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

      $('a[href*="/job/"]').each((_, el) => {
        const $el = $(el);
        const $parent = $el.closest('[class*="job"], li, article');
        const title = ($parent.find('h2, h3, [class*="title"]').first().text().trim() ||
                       $el.text().trim());
        const company = $parent.find('[class*="company"]').first().text().trim();
        const location = $parent.find('[class*="location"]').first().text().trim() || 'Remote';
        const href = $el.attr('href') || '';
        const applyUrl = href.startsWith('http') ? href : `https://remoterocketship.com${href}`;

        if (title && applyUrl.includes('/job/')) {
          jobs.push({
            title,
            company: company || 'Unknown',
            applyUrl,
            location,
            experience: 'Entry Level',
            salary: null,
            postedDate: null,
            techStack: [],
            source: 'RemoteRocketship',
            isHighMatch: false,
          });
          count++;
        }
      });

      console.log(`[RemoteRocketship] ${url.split('?')[0]}: +${count} (total: ${jobs.length})`);
      await delay(3000);
    } catch (err: any) {
      console.warn(`[RemoteRocketship] Error: ${err.message}`);
    }
  }
  return jobs;
}
