import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, getRandomUserAgent, checkRobotstxt } from '../utils';

export async function scrapeJobicy(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('jobicy.com');
  if (!allowed) { console.warn('[Jobicy] robots.txt blocked'); return jobs; }

  const searches = [
    'https://jobicy.com/?s=junior+developer&job_location=anywhere',
    'https://jobicy.com/?s=typescript&job_location=anywhere',
    'https://jobicy.com/?s=rust&job_location=anywhere',
    'https://jobicy.com/?s=intern&job_location=anywhere',
    'https://jobicy.com/?s=web3&job_location=anywhere',
    'https://jobicy.com/?s=solana&job_location=anywhere',
  ];

  for (const url of searches) {
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

      $('article.job_listing, .job-card, li.job').each((_, el) => {
        const $el = $(el);
        const title = $el.find('h2, h3, .position').first().text().trim();
        const company = $el.find('.company, .employer').first().text().trim();
        const location = $el.find('.location, .job-location').first().text().trim() || 'Remote';
        const link = $el.find('a').first().attr('href') || '';
        const dateText = $el.find('time').first().attr('datetime') || '';
        const tags = $el.find('.tag, .job-tag').map((_, t) => $(t).text().trim()).get();

        if (title && link) {
          jobs.push({
            title, company: company || 'Unknown', applyUrl: link,
            location, experience: 'Entry Level', salary: null,
            postedDate: dateText ? new Date(dateText) : null, techStack: tags,
            source: 'Jobicy', isHighMatch: false,
          });
          count++;
        }
      });

      console.log(`[Jobicy] ${new URL(url).searchParams.get('s')}: +${count} (total: ${jobs.length})`);
      await delay(3000);
    } catch (err: any) {
      console.warn(`[Jobicy] Error: ${err.message}`);
    }
  }
  return jobs;
}
