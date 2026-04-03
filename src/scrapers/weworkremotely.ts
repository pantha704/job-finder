import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, getRandomUserAgent, checkRobotstxt } from '../utils';

export async function scrapeWeWorkRemotely(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('weworkremotely.com');
  if (!allowed) { console.warn('[WWR] robots.txt blocked'); return jobs; }

  const urls = [
    'https://weworkremotely.com/categories/remote-programming-jobs',
    'https://weworkremotely.com/categories/remote-full-stack-programming-jobs',
    'https://weworkremotely.com/remote-jobs/search?term=typescript',
    'https://weworkremotely.com/remote-jobs/search?term=rust',
    'https://weworkremotely.com/remote-jobs/search?term=junior',
    'https://weworkremotely.com/remote-jobs/search?term=intern',
    'https://weworkremotely.com/remote-jobs/search?term=solana',
    'https://weworkremotely.com/remote-jobs/search?term=web3',
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

      $('ul.jobs li').each((_, el) => {
        const $el = $(el);
        if ($el.hasClass('view-all')) return;

        const $link = $el.find('a[href*="/remote-jobs/"]').first();
        const href = $link.attr('href') || '';
        const title = $el.find('.title, span.title').first().text().trim();
        const company = $el.find('.company, span.company').first().text().trim();
        const region = $el.find('.region').first().text().trim() || 'Worldwide';
        const applyUrl = href.startsWith('http') ? href : `https://weworkremotely.com${href}`;

        if (title && href.includes('/remote-jobs/')) {
          jobs.push({
            title, company: company || 'Unknown',
            applyUrl, location: region,
            experience: 'Entry Level',
            salary: null, postedDate: null, techStack: [],
            source: 'WeWorkRemotely', isHighMatch: false,
          });
          count++;
        }
      });

      console.log(`[WWR] ${url.split('/').pop()}: +${count} (total: ${jobs.length})`);
      await delay(3000);
    } catch (err: any) {
      console.warn(`[WWR] Error: ${err.message}`);
    }
  }
  return jobs;
}
