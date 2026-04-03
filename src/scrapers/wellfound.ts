import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, checkRobotstxt } from '../utils';
import { fetchRendered } from '../browser';

export async function scrapeWellfound(): Promise<Job[]> {
  const jobs: Job[] = [];

  const allowed = await checkRobotstxt('wellfound.com', '/jobs');
  if (!allowed) { console.warn('[Wellfound] robots.txt blocked'); return jobs; }

  // Wellfound is Cloudflare-protected — needs Camoufox anti-detect browser.
  // Falls back to: Playwright headless Firefox → plain fetch (may return CF challenge)
  const urls = [
    'https://wellfound.com/jobs?remote=true&jobTypes=full_time&experienceLevels=entry_level',
    'https://wellfound.com/jobs?remote=true&jobTypes=internship',
    'https://wellfound.com/jobs?remote=true&skills=typescript',
    'https://wellfound.com/jobs?remote=true&skills=rust',
    'https://wellfound.com/jobs?remote=true&skills=solana',
  ];

  let totalCount = 0;

  for (const url of urls) {
    try {
      const { html, method } = await fetchRendered(url);
      console.log(`[Wellfound] using ${method} for ${url.split('?')[1]?.slice(0, 30)}`);

      const $ = cheerio.load(html);

      // Check for Cloudflare / JS challenge page
      if (html.includes('captcha-delivery') || html.includes('cf-challenge') || html.includes('Please enable JS')) {
        console.warn('[Wellfound] Cloudflare challenge — try running Camoufox server for bypass');
        continue;
      }

      let count = 0;

      // Wellfound job listing selectors — try multiple strategies
      const cardSelectors = [
        '[data-test="JobListing"]',
        '[class*="JobListing"]',
        '._root', // older class pattern
        'a[href*="/jobs/"]',
      ];

      for (const sel of cardSelectors) {
        $(sel).each((_, el) => {
          const $el = $(el);
          const $card = $el.is('a') ? $el.closest('li, article, div') : $el;

          const title = $card.find('[class*="title"], [class*="Title"], h2, h3, strong').first().text().trim();
          const company = $card.find('[class*="company"], [class*="Company"], [class*="startup"]').first().text().trim();
          const location = $card.find('[class*="location"], [class*="Location"]').first().text().trim() || 'Remote';
          const link = ($el.is('a') ? $el.attr('href') : $card.find('a[href*="/jobs/"]').first().attr('href')) || '';
          const salary = $card.find('[class*="salary"], [class*="compensation"]').first().text().trim();
          const techEls = $card.find('[class*="tag"], [class*="skill"], [class*="tech"]');
          const techStack = techEls.map((_, t) => $(t).text().trim()).get().filter(Boolean);

          const applyUrl = link.startsWith('http') ? link : `https://wellfound.com${link}`;

          if (title && link && !jobs.some(j => j.applyUrl === applyUrl)) {
            jobs.push({
              title,
              company: company || 'Startup',
              applyUrl,
              location,
              experience: 'Entry Level',
              salary: salary || null,
              postedDate: null,
              techStack,
              source: 'Wellfound',
              isHighMatch: false,
            });
            count++;
          }
        });
        if (count > 0) break; // found jobs with this selector — stop trying others
      }

      totalCount += count;
      console.log(`[Wellfound] +${count} (total: ${totalCount})`);
      await delay(3000);
    } catch (err: any) {
      console.warn(`[Wellfound] Error: ${err.message}`);
    }
  }

  return jobs;
}
