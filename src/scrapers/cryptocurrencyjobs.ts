import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, checkRobotstxt, getRandomUserAgent, parseRelativeDate } from '../utils';

export async function scrapeCryptocurrencyJobs(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('cryptocurrencyjobs.co');
  if (!allowed) { console.warn('[CryptocurrencyJobs] robots.txt blocked'); return jobs; }

  const urls = [
    'https://cryptocurrencyjobs.co/engineering/?location=remote',
    'https://cryptocurrencyjobs.co/engineering/?location=worldwide',
    'https://cryptocurrencyjobs.co/solana/',
    'https://cryptocurrencyjobs.co/rust/',
    'https://cryptocurrencyjobs.co/web3/',
    'https://cryptocurrencyjobs.co/developer/?location=remote',
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

      $('a[href*="/job/"]').closest('article, li, .job').each((_, el) => {
        const $el = $(el);
        const title = $el.find('h2, h3, [class*="title"]').first().text().trim();
        const company = $el.find('[class*="company"]').first().text().trim();
        const location = $el.find('[class*="location"]').first().text().trim() || 'Remote';
        const link = $el.find('a[href*="/job/"]').first().attr('href') || '';
        const tags = $el.find('[class*="tag"]').map((_, t) => $(t).text().trim()).get();
        const dateText = $el.find('time').first().attr('datetime') || '';

        const applyUrl = link.startsWith('http') ? link : `https://cryptocurrencyjobs.co${link}`;

        if (title && company && link) {
          jobs.push({
            title, company, applyUrl,
            location,
            experience: 'Entry Level',
            salary: null,
            postedDate: dateText ? new Date(dateText) : null,
            techStack: tags,
            source: 'CryptocurrencyJobs',
            isHighMatch: false,
          });
          count++;
        }
      });

      console.log(`[CryptocurrencyJobs] ${url}: +${count} (total: ${jobs.length})`);
      await delay(3000);
    } catch (err: any) {
      console.warn(`[CryptocurrencyJobs] Error: ${err.message}`);
    }
  }
  return jobs;
}
