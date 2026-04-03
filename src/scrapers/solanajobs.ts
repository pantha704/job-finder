import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, checkRobotstxt, getRandomUserAgent } from '../utils';

export async function scrapeSolanaJobs(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('jobs.solana.com');
  if (!allowed) { console.warn('[SolanaJobs] robots.txt blocked'); return jobs; }

  // Try both API and HTML endpoints
  const apiUrls = [
    'https://jobs.solana.com/api/jobs?filter=%7B%22seniority%22%3A%5B%22entry_level%22%2C%22internship%22%5D%7D',
    'https://jobs.solana.com/jobs?filter=%7B%22seniority%22%3A%5B%22entry_level%22%5D%7D',
    'https://jobs.solana.com/jobs',
  ];

  for (const url of apiUrls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': getRandomUserAgent(), 'Accept': 'application/json, text/html' }
      });
      if (!res.ok) { await delay(3000); continue; }

      const ct = res.headers.get('content-type') || '';

      if (ct.includes('json')) {
        const data: any = await res.json();
        const list = Array.isArray(data) ? data : (data.jobs || data.data || []);
        for (const j of list) {
          const seniority: string = (j.seniority || j.level || '').toLowerCase();
          if (!['entry_level', 'internship', 'junior', ''].includes(seniority)) continue;
          jobs.push({
            title: j.title || j.name || 'Unknown',
            company: j.company?.name || j.organization || 'Unknown',
            applyUrl: j.url || j.apply_url || `https://jobs.solana.com/jobs/${j.slug || j.id}`,
            location: j.location || j.remote ? 'Remote' : 'Unknown',
            experience: seniority || 'Entry Level',
            salary: j.salary || j.compensation || null,
            postedDate: j.created_at ? new Date(j.created_at) : null,
            techStack: j.tags || j.skills || [],
            source: 'SolanaJobs',
            isHighMatch: false,
          });
        }
        console.log(`[SolanaJobs] API: +${jobs.length} jobs`);
      } else {
        const html = await res.text();
        const $ = cheerio.load(html);
        let count = 0;
        $('a[href*="/jobs/"]').each((_, el) => {
          const $el = $(el);
          const $card = $el.closest('li, article, [class*="job"]');
          const title = $card.find('h2, h3, [class*="title"]').first().text().trim() || $el.text().trim();
          const company = $card.find('[class*="company"]').first().text().trim();
          const href = $el.attr('href') || '';
          const applyUrl = href.startsWith('http') ? href : `https://jobs.solana.com${href}`;
          if (title && applyUrl.includes('/jobs/') && !title.toLowerCase().startsWith('read more')) {
            jobs.push({
              title, company: company || 'Solana Ecosystem',
              applyUrl,
              location: 'Remote',
              experience: 'Entry Level',
              salary: null, postedDate: null, techStack: ['Solana'],
              source: 'SolanaJobs', isHighMatch: false,
            });
            count++;
          }
        });
        console.log(`[SolanaJobs] HTML: +${count} jobs`);
      }
      if (jobs.length > 0) break;
      await delay(3000);
    } catch (err: any) {
      console.warn(`[SolanaJobs] Error: ${err.message}`);
    }
  }
  return jobs;
}
