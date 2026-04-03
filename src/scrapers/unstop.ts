import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, getRandomUserAgent, checkRobotstxt } from '../utils';

const BASE_URL = 'https://unstop.com';

export async function scrapeUnstop(): Promise<Job[]> {
  const jobs: Job[] = [];
  
  const allowed = await checkRobotstxt('unstop.com', '/opportunities');
  if (!allowed) { console.warn('[Unstop] robots.txt blocked'); return jobs; }

  const paths = [
    '/opportunities/jobs?filters=work_exp_max~0-2,opportunity_type~jobs,work_mode~3',
    '/opportunities/jobs?filters=work_exp_max~0-0,opportunity_type~jobs,work_mode~3',
    '/opportunities/internships?filters=work_mode~3,opportunity_type~internship',
    '/opportunities/jobs?filters=domain~Technology,work_mode~3,work_exp_max~0-2',
  ];

  for (const path of paths) {
    try {
      const url = `${BASE_URL}${path}`;
      const html = await retry(async () => {
        const res = await fetch(url, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-IN,en;q=0.9',
            'Referer': 'https://unstop.com/',
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      });

      const $ = cheerio.load(html);
      let count = 0;

      // Unstop uses Angular — try multiple selectors
      const cardSelectors = [
        'app-card',
        '.opportunity-listing',
        '[class*="card"]',
        'un-job-card',
        'un-opportunity-card',
      ];

      let found = false;
      for (const sel of cardSelectors) {
        $(sel).each((_, el) => {
          const $el = $(el);
          const title = $el.find('[class*="title"], [class*="name"], h3, h4').first().text().trim();
          const company = $el.find('[class*="org"], [class*="company"], [class*="employer"]').first().text().trim();
          const location = $el.find('[class*="location"], [class*="place"]').first().text().trim() || 'Remote';
          const link = $el.find('a').first().attr('href') || '';
          const applyUrl = link.startsWith('http') ? link : `${BASE_URL}${link}`;

          if (title && link) {
            jobs.push({
              title,
              company: company || 'Company on Unstop',
              applyUrl,
              location,
              experience: 'Fresher',
              salary: null,
              postedDate: null,
              techStack: [],
              source: 'Unstop',
              isHighMatch: false,
            });
            count++;
            found = true;
          }
        });
        if (found) break;
      }

      // Try JSON API  
      if (!found) {
        try {
          const apiUrl = `${BASE_URL}/api/v1/public/opportunity/list?status=open&work_mode=3&opportunity_type=jobs&page=1&size=20&exp_min=0&exp_max=2`;
          const apiRes = await fetch(apiUrl, {
            headers: { 'User-Agent': getRandomUserAgent(), 'Accept': 'application/json' }
          });
          if (apiRes.ok) {
            const data = await apiRes.json() as any;
            const items = data?.data?.data || data?.data || [];
            for (const item of items) {
              const title = item.title || item.name || '';
              const company = item.organisation?.name || item.company || 'Company';
              if (title) {
                jobs.push({
                  title,
                  company,
                  applyUrl: `${BASE_URL}/opportunities/jobs/${item.id}-${title.toLowerCase().replace(/\s+/g, '-')}`,
                  location: 'Remote',
                  experience: 'Fresher',
                  salary: null,
                  postedDate: item.created_at ? new Date(item.created_at) : null,
                  techStack: item.skills?.map((s: any) => s.name) || [],
                  source: 'Unstop',
                  isHighMatch: false,
                });
                count++;
              }
            }
          }
        } catch { /* ignore API fallback errors */ }
      }

      console.log(`[Unstop] ${path.split('?')[0]}: +${count} (total: ${jobs.length})`);
      await delay(3000);
    } catch (err: any) {
      console.warn(`[Unstop] Error: ${err.message}`);
    }
  }

  return jobs;
}
