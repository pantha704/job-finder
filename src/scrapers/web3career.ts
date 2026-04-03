import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, checkRobotstxt, getRandomUserAgent } from '../utils';

const BASE_URL = 'https://web3.career';

export async function scrapeWeb3Career(): Promise<Job[]> {
  const jobs: Job[] = [];

  const allowed = await checkRobotstxt('web3.career');
  if (!allowed) {
    console.warn('[Web3.career] Blocked by robots.txt');
    return jobs;
  }

  // Paths most likely to have entry-level/remote roles
  const paths = [
    '/remote-jobs',
    '/entry-level-web3-jobs',
    '/junior-web3-jobs',
    '/remote+junior-web3-jobs',
    '/blockchain-jobs',
    '/solana-jobs',
    '/typescript-jobs',
  ];

  for (const basePath of paths) {
    for (let page = 1; page <= 3; page++) {
      const url = page === 1
        ? `${BASE_URL}${basePath}`
        : `${BASE_URL}${basePath}?page=${page}`;

      try {
        const html = await retry(async () => {
          const res = await fetch(url, {
            headers: {
              'User-Agent': getRandomUserAgent(),
              'Accept': 'text/html,application/xhtml+xml',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          });
          if (res.status === 403 || res.status === 429) throw new Error(`HTTP ${res.status}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        });

        const $ = cheerio.load(html);
        let pageCount = 0;

        // web3.career job rows are <tr> or <div> cards
        $('tr.job_row, tr[data-id], .job-card, [class*="job-list"] > div').each((_, el) => {
          const $el = $(el);

          const title = $el
            .find('h2, h3, .job-title, [class*="title"] a, a[href*="/web3-jobs/"], a[href*="/job/"]')
            .first()
            .text()
            .trim();

          const company = $el
            .find('.company-name, [class*="company"] a, td:nth-child(2), h4')
            .first()
            .text()
            .replace(/\s+/g, ' ')
            .trim();

          const link =
            $el.find('a[href*="/web3-jobs/"], a[href*="/job/"], a[href^="/"]').first().attr('href') ||
            $el.find('a').first().attr('href');

          const tags = $el
            .find('.tag, .skill, .badge, [class*="tag"]')
            .map((_, t) => $(t).text().trim())
            .get()
            .filter(Boolean);

          const salary = $el.find('.salary, .compensation, [class*="salary"]').first().text().trim();

          if (title && company && link) {
            jobs.push({
              title,
              company,
              applyUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
              location: 'Remote',
              experience: 'Entry Level',
              salary: salary || null,
              postedDate: null,
              techStack: tags.slice(0, 8),
              source: 'Web3.career',
              isHighMatch: false,
            });
            pageCount++;
          }
        });

        console.log(`[Web3.career] ${basePath} page ${page}: +${pageCount} jobs (total: ${jobs.length})`);
        if (pageCount === 0) break;
        await delay(3000);
      } catch (err: any) {
        console.warn(`[Web3.career] Error on ${url}: ${err.message}`);
        break;
      }
    }
  }

  console.log(`[Web3.career] Total: ${jobs.length} jobs`);
  return jobs;
}
