import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, checkRobotstxt, getRandomUserAgent } from '../utils';

export async function scrapeLinkedIn(): Promise<Job[]> {
  const jobs: Job[] = [];
  // LinkedIn heavily blocks scrapers - we try gracefully and skip on blocks
  const allowed = await checkRobotstxt('linkedin.com');
  if (!allowed) { console.warn('[LinkedIn] robots.txt blocked'); return jobs; }

  const urls = [
    'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=software+engineer+fresher&location=India&f_WT=2&f_E=1&start=0',
    'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=junior+developer+remote&location=India&f_WT=2&f_E=1&start=0',
    'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=rust+developer&location=Worldwide&f_WT=2&f_E=1&start=0',
    'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=solana+developer&location=Worldwide&f_WT=2&f_E=1&start=0',
    'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=typescript+intern&location=India&f_WT=2&start=0',
  ];

  for (const url of urls) {
    try {
      const html = await retry(async () => {
        const res = await fetch(url, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.linkedin.com/',
          }
        });
        if (res.status === 429) throw new Error('captcha rate limit 429');
        if (res.status === 403) throw new Error('captcha blocked 403');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      });

      const $ = cheerio.load(html);
      let count = 0;

      $('li, .job-search-card').each((_, el) => {
        const $el = $(el);
        const title = $el.find('.base-search-card__title, h3, a.job-card-container__link').first().text().trim();
        const company = $el.find('.base-search-card__subtitle, h4').first().text().trim();
        const location = $el.find('.job-search-card__location, .base-search-card__metadata').first().text().trim();
        const link = $el.find('a.base-card__full-link, a[href*="/jobs/view/"]').first().attr('href') || '';
        const dateText = $el.find('time').first().attr('datetime') || '';

        if (title && link && link.includes('/jobs/view/')) {
          jobs.push({
            title, company: company || 'Unknown',
            applyUrl: link.startsWith('http') ? link : `https://linkedin.com${link}`,
            location: location || 'Remote',
            experience: 'Entry Level',
            salary: null,
            postedDate: dateText ? new Date(dateText) : null,
            techStack: [],
            source: 'LinkedIn',
            isHighMatch: false,
          });
          count++;
        }
      });

      console.log(`[LinkedIn] +${count} (total: ${jobs.length})`);
      await delay(3000);
    } catch (err: any) {
      if (err.message.includes('captcha') || err.message.includes('rate limit')) {
        console.warn(`[LinkedIn] Blocked/rate-limited — skipping remaining URLs`);
        break;
      }
      console.warn(`[LinkedIn] Error: ${err.message}`);
    }
  }
  return jobs;
}
