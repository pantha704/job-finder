import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, checkRobotstxt, getRandomUserAgent } from '../utils';

export async function scrapeCutshort(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('cutshort.io', '/jobs');
  if (!allowed) { console.warn('[Cutshort] robots.txt blocked'); return jobs; }

  // Cutshort public job search — try fetch first, fallback gracefully
  const urls = [
    'https://cutshort.io/jobs?job_type=remote&min_exp=0&max_exp=2',
    'https://cutshort.io/jobs?job_type=remote&tech=typescript&min_exp=0',
    'https://cutshort.io/jobs?job_type=remote&tech=react&min_exp=0',
    'https://cutshort.io/jobs?job_type=remote&tech=node.js&min_exp=0',
    'https://cutshort.io/jobs?job_type=remote&tech=rust&min_exp=0',
    'https://cutshort.io/jobs?job_type=remote&tech=solana&min_exp=0',
  ];

  for (const url of urls) {
    try {
      const html = await retry(async () => {
        const res = await fetch(url, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://cutshort.io/',
          }
        });
        if (res.status === 429) throw new Error('captcha rate limit 429');
        if (res.status === 403) throw new Error('captcha blocked 403');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      });

      const $ = cheerio.load(html);
      let count = 0;

      // Multiple selector strategies for Cutshort's dynamic structure
      const selectors = [
        'a[href*="/jobs/"]',
        '[class*="job-card"] a',
        '[class*="JobCard"] a',
        'article a',
      ];

      const seen = new Set<string>();
      for (const sel of selectors) {
        $(sel).each((_, el) => {
          const $el = $(el);
          const href = $el.attr('href') || '';
          if (!href.includes('/jobs/') || seen.has(href)) return;
          seen.add(href);

          const $card = $el.closest('article, [class*="card"], [class*="Card"], li, div[class*="job"]');
          const title = (
            $card.find('h2, h3, [class*="title"], [class*="Title"]').first().text().trim() ||
            $el.text().trim()
          );
          const company = $card.find('[class*="company"], [class*="Company"]').first().text().trim();
          const location = $card.find('[class*="location"], [class*="Location"]').first().text().trim() || 'Remote';
          const salary = $card.find('[class*="salary"], [class*="pay"], [class*="ctc"]').first().text().trim();
          const tags = $card.find('[class*="tag"], [class*="skill"], [class*="Tech"]')
            .map((_, t) => $(t).text().trim()).get().filter(Boolean);

          const applyUrl = href.startsWith('http') ? href : `https://cutshort.io${href}`;

          if (title && applyUrl.includes('/jobs/')) {
            jobs.push({
              title,
              company: company || 'Unknown',
              applyUrl,
              location,
              experience: '0-2 years',
              salary: salary || null,
              postedDate: null,
              techStack: tags,
              source: 'Cutshort',
              isHighMatch: false,
            });
            count++;
          }
        });
        if (count > 0) break; // Use first selector that yields results
      }

      console.log(`[Cutshort] ${url.split('?')[1] || 'base'}: +${count} (total: ${jobs.length})`);
      await delay(3000);
    } catch (err: any) {
      if (err.message.includes('captcha') || err.message.includes('rate limit')) {
        console.warn(`[Cutshort] Blocked — skipping remaining`);
        break;
      }
      console.warn(`[Cutshort] Error on ${url}: ${err.message}`);
    }
  }

  return jobs;
}
