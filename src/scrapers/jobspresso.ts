import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, getRandomUserAgent, checkRobotstxt } from '../utils';

export async function scrapeJobspresso(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('jobspresso.co');
  if (!allowed) { console.warn('[Jobspresso] robots.txt blocked'); return jobs; }

  const urls = [
    'https://jobspresso.co/remote-work/?filter_category=engineering-development&filter_type=full-time',
    'https://jobspresso.co/remote-work/?filter_category=engineering-development&filter_type=contract',
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

      $('li.job_listing, article.job').each((_, el) => {
        const $el = $(el);
        const title = $el.find('.position h3, h3, h2').first().text().trim();
        const company = $el.find('.company strong, .company').first().text().trim();
        const location = $el.find('.location').first().text().trim() || 'Remote';
        const link = $el.find('a').first().attr('href') || '';
        const dateText = $el.find('time').first().attr('datetime') || '';

        if (title && link) {
          jobs.push({
            title, company: company || 'Unknown', applyUrl: link,
            location, experience: 'Entry Level', salary: null,
            postedDate: dateText ? new Date(dateText) : null, techStack: [],
            source: 'Jobspresso', isHighMatch: false,
          });
          count++;
        }
      });

      console.log(`[Jobspresso] +${count} (total: ${jobs.length})`);
      await delay(3000);
    } catch (err: any) {
      console.warn(`[Jobspresso] Error: ${err.message}`);
    }
  }
  return jobs;
}
