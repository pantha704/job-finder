import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, checkRobotstxt, getRandomUserAgent, parseRelativeDate } from '../utils';

const BASE_URL = 'https://internshala.com';
const MAX_PAGES = 3;

export async function scrapeInternshala(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('internshala.com');
  if (!allowed) {
    console.warn('[Internshala] Blocked by robots.txt');
    return jobs;
  }

  const paths = [
    '/internships/work-from-home-internships/',
    '/jobs/work-from-home-jobs/',
    '/internships/computer-science-internships/',
    '/internships/web-development-internships/',
    '/internships/software-development-internships/',
    '/jobs/software-engineer-jobs-in-india/'
  ];

  for (const basePath of paths) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = page === 1 ? `${BASE_URL}${basePath}` : `${BASE_URL}${basePath}/${page}`;
      try {
        const html = await retry(async () => {
          const res = await fetch(url, {
            headers: {
              'User-Agent': getRandomUserAgent(),
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
            }
          });
          if (res.status === 403 || res.status === 429) throw new Error('captcha or rate limit');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        });

        const $ = cheerio.load(html);
        let pageCount = 0;

        // Internshala internship cards
        $('.internship_meta, .individual_internship, [class*="internship-list"] .internship').each((_, el) => {
          const $el = $(el);
          const title = $el.find('.profile, .job-internship-name, h3').first().text().trim();
          const company = $el.find('.company_name, .company-name, h4').first().text().replace(/\s+/g, ' ').trim().replace(/\s+Actively hiring.*$/i, '').trim();
          const location = $el.find('.location_link, .location, .location-link').first().text().trim() || 'Remote';
          const link = $el.find('a[href*="/internship/detail/"], a[href*="/job/detail/"]').first().attr('href');
          const dateText = $el.find('.status-success, [class*="posted"], .date').first().text().trim();
          const stipend = $el.find('.stipend, .salary').first().text().trim();

          if (title && company && link) {
            jobs.push({
              title,
              company,
              applyUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
              location: location || 'Remote',
              experience: 'Fresher/Internship',
              salary: stipend || null,
              postedDate: dateText ? parseRelativeDate(dateText) : null,
              techStack: [],
              source: 'Internshala',
              isHighMatch: false,
            });
            pageCount++;
          }
        });

        // Also try job cards
        $('.job-list-item, .jobs-list .individual_internship').each((_, el) => {
          const $el = $(el);
          const title = $el.find('.job-internship-name, .profile').first().text().trim();
          const company = $el.find('.company-name, h4').first().text().replace(/\s+/g, ' ').trim().replace(/\s+Actively hiring.*$/i, '').trim();
          const location = $el.find('.location-link, .location').first().text().trim() || 'Remote';
          const link = $el.find('a').first().attr('href');
          const stipend = $el.find('.salary, .stipend').first().text().trim();

          if (title && company && link && !jobs.find(j => j.applyUrl.includes(link.replace(/\/+$/, '')))) {
            jobs.push({
              title,
              company,
              applyUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
              location,
              experience: 'Entry Level',
              salary: stipend || null,
              postedDate: null,
              techStack: [],
              source: 'Internshala',
              isHighMatch: false,
            });
            pageCount++;
          }
        });

        console.log(`[Internshala] ${basePath} page ${page}: +${pageCount} jobs (total: ${jobs.length})`);
        if (pageCount === 0) break; // No more results
        await delay(3000);
      } catch (err: any) {
        console.warn(`[Internshala] Error on ${url}: ${err.message}`);
        break;
      }
    }
  }

  console.log(`[Internshala] Total: ${jobs.length} jobs`);
  return jobs;
}
