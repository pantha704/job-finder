import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, checkRobotstxt } from '../utils';
import { fetchRendered } from '../browser';

export async function scrapeHimalayas(): Promise<Job[]> {
  const jobs: Job[] = [];

  const allowed = await checkRobotstxt('himalayas.app', '/jobs');
  if (!allowed) { console.warn('[Himalayas] robots.txt blocked'); return jobs; }

  // Himalayas is a React SPA — falls back to: Playwright → plain fetch (SSR may work)
  const urls = [
    'https://himalayas.app/jobs?experienceLevel=entry_level&workplaceType=remote',
    'https://himalayas.app/jobs?experienceLevel=internship&workplaceType=remote',
    'https://himalayas.app/jobs?skill=typescript&workplaceType=remote',
    'https://himalayas.app/jobs?skill=rust&workplaceType=remote',
    'https://himalayas.app/jobs?skill=solana&workplaceType=remote',
    'https://himalayas.app/jobs?skill=web3&workplaceType=remote',
  ];

  let totalCount = 0;

  for (const url of urls) {
    try {
      const { html, method } = await fetchRendered(url);
      console.log(`[Himalayas] using ${method} for ${url.split('?')[1]?.slice(0, 30)}`);

      const $ = cheerio.load(html);
      let count = 0;

      // Himalayas job card selectors
      $('a[href*="/jobs/"]').each((_, el) => {
        const $link = $(el);
        const href = $link.attr('href') || '';

        // Only match actual job listing links (not pagination, nav, etc.)
        if (!href.match(/\/jobs\/[a-z0-9-]+-at-[a-z0-9-]+/)) return;

        const $card = $link.closest('article, li, [class*="card"], [class*="job"]');
        const title = $card.find('h2, h3, [class*="title"]').first().text().trim()
          || $link.text().trim();
        const company = $card.find('[class*="company"], [class*="employer"]').first().text().trim();
        const location = $card.find('[class*="location"]').first().text().trim() || 'Remote';
        const salary = $card.find('[class*="salary"], [class*="pay"]').first().text().trim();
        const techEls = $card.find('[class*="tag"], [class*="skill"]');
        const techStack = techEls.map((_, t) => $(t).text().trim()).get().filter(Boolean);
        const applyUrl = href.startsWith('http') ? href : `https://himalayas.app${href}`;

        if (title && !jobs.some(j => j.applyUrl === applyUrl)) {
          jobs.push({
            title,
            company: company || 'Unknown',
            applyUrl,
            location,
            experience: 'Entry Level',
            salary: salary || null,
            postedDate: null,
            techStack,
            source: 'Himalayas',
            isHighMatch: false,
          });
          count++;
        }
      });

      totalCount += count;
      console.log(`[Himalayas] +${count} (total: ${totalCount})`);
      await delay(3000);
    } catch (err: any) {
      console.warn(`[Himalayas] Error: ${err.message}`);
    }
  }

  return jobs;
}
