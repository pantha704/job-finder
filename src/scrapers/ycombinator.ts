import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, getRandomUserAgent } from '../utils';

const BASE_URL = 'https://www.workatastartup.com';

// YC's site uses a JSON data endpoint; fall back to HTML scraping
export async function scrapeYCombinator(): Promise<Job[]> {
  const jobs: Job[] = [];

  // Try their JSON API first (works without JS rendering)
  try {
    const apiJobs = await scrapeViaAPI();
    if (apiJobs.length > 0) {
      console.log(`[YCombinator] API: +${apiJobs.length} jobs`);
      return apiJobs;
    }
  } catch (err: any) {
    console.warn(`[YCombinator] API failed, falling back to HTML: ${err.message}`);
  }

  // HTML fallback
  const urls = [
    `${BASE_URL}/jobs?remote=true&job_type=fulltime`,
    `${BASE_URL}/jobs?remote=true&job_type=internship`,
    `${BASE_URL}/jobs?remote=true&job_type=contract`,
  ];

  for (const url of urls) {
    try {
      const html = await retry(async () => {
        const res = await fetch(url, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      });

      const $ = cheerio.load(html);
      let count = 0;

      // Try to extract JSON from __NEXT_DATA__ or window.__PRELOADED_STATE__
      const nextData = $('script#__NEXT_DATA__').text();
      if (nextData) {
        try {
          const parsed = JSON.parse(nextData);
          const jobList =
            parsed?.props?.pageProps?.jobs ||
            parsed?.props?.pageProps?.initialJobs ||
            [];
          for (const j of jobList) {
            const title = j.title || j.role;
            const company = j.company?.name || j.companyName;
            const slug = j.slug || j.id;
            if (title && company && slug) {
              jobs.push({
                title,
                company,
                applyUrl: `${BASE_URL}/jobs/${slug}`,
                location: j.location || 'Remote',
                experience: j.experience_level || 'Entry Level',
                salary: j.salary ? `${j.salary}` : null,
                postedDate: j.created_at ? new Date(j.created_at) : null,
                techStack: j.tags || [],
                source: 'YC Work at a Startup',
                isHighMatch: false,
              });
              count++;
            }
          }
        } catch {
          // JSON parse failed, fall through to DOM scraping
        }
      }

      // DOM scraping for server-rendered content
      if (count === 0) {
        $('[class*="job"], [class*="listing"], [data-testid*="job"]').each((_, el) => {
          const $el = $(el);
          const title = $el
            .find('h3, h4, [class*="title"], [class*="role"]')
            .first()
            .text()
            .trim();
          const company = $el
            .find('[class*="company"], [class*="startup"]')
            .first()
            .text()
            .replace(/\s+/g, ' ')
            .trim();
          const link = $el.find('a').first().attr('href');

          if (title && company && link) {
            jobs.push({
              title,
              company,
              applyUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
              location: 'Remote',
              experience: 'Entry Level',
              salary: null,
              postedDate: null,
              techStack: [],
              source: 'YC Work at a Startup',
              isHighMatch: false,
            });
            count++;
          }
        });
      }

      console.log(`[YCombinator] ${url}: +${count} jobs (total: ${jobs.length})`);
      await delay(3000);
    } catch (err: any) {
      console.warn(`[YCombinator] Error on ${url}: ${err.message}`);
    }
  }

  console.log(`[YCombinator] Total: ${jobs.length} jobs`);
  return jobs;
}

async function scrapeViaAPI(): Promise<Job[]> {
  // YC's internal API endpoints
  const endpoints = [
    `${BASE_URL}/companies/jobs?remote=true&limit=100&offset=0`,
    `${BASE_URL}/api/jobs?remote=true&limit=100`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      if (!res.ok) continue;

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('json')) continue;

      const data = await res.json() as any;
      const list = Array.isArray(data) ? data : (data?.jobs || data?.results || []);

      if (list.length === 0) continue;

      return list.map((j: any) => ({
        title: j.title || j.role || 'Unknown Role',
        company: j.company?.name || j.company_name || 'Unknown Company',
        applyUrl: j.url || j.apply_url || `${BASE_URL}/jobs/${j.id || j.slug}`,
        location: j.location || 'Remote',
        experience: j.experience_level || 'Entry Level',
        salary: j.salary || null,
        postedDate: j.created_at ? new Date(j.created_at) : null,
        techStack: j.tags || j.skills || [],
        source: 'YC Work at a Startup',
        isHighMatch: false,
      }));
    } catch {
      continue;
    }
  }

  return [];
}
