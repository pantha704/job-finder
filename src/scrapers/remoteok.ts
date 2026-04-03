import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, getRandomUserAgent, checkRobotstxt } from '../utils';

export async function scrapeRemoteOK(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('remoteok.com');
  if (!allowed) { console.warn('[RemoteOK] robots.txt blocked'); return jobs; }

  const tags = ['typescript', 'rust', 'solana', 'web3', 'blockchain', 'junior', 'javascript', 'nodejs', 'react', 'nextjs'];

  // RemoteOK has a JSON API
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'application/json',
      }
    });
    if (res.ok) {
      const data = await res.json() as any[];
      const filtered = data.filter(j => j.slug); // actual jobs have slugs
      let count = 0;
      for (const j of filtered) {
        const jobTags: string[] = j.tags || [];
        const title: string = j.position || '';
        const company: string = j.company || 'Unknown';
        const allText = `${title} ${jobTags.join(' ')}`.toLowerCase();

        // Skip if clearly senior
        if (allText.includes('senior') || allText.includes('lead') || allText.includes('principal') || allText.includes('staff')) continue;

        jobs.push({
          title, company,
          applyUrl: `https://remoteok.com/remote-jobs/${j.slug}`,
          location: 'Remote',
          experience: 'Entry Level',
          salary: j.salary_min ? `$${j.salary_min}–${j.salary_max}/yr` : null,
          postedDate: j.epoch ? new Date(j.epoch * 1000) : null,
          techStack: jobTags,
          source: 'RemoteOK',
          isHighMatch: false,
        });
        count++;
      }
      console.log(`[RemoteOK] API: +${count} jobs`);
      return jobs;
    }
  } catch (err: any) {
    console.warn(`[RemoteOK] API error: ${err.message}`);
  }

  // HTML fallback
  for (const tag of tags) {
    try {
      await delay(3000);
      const html = await retry(async () => {
        const res = await fetch(`https://remoteok.com/remote-${tag}-jobs`, {
          headers: { 'User-Agent': getRandomUserAgent(), 'Accept': 'text/html' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      });

      const $ = cheerio.load(html);
      let count = 0;

      $('tr.job').each((_, el) => {
        const $el = $(el);
        const title = $el.find('[itemprop="title"]').first().text().trim();
        const company = $el.find('[itemprop="name"]').first().text().trim();
        const link = $el.find('a[href*="/remote-jobs/"]').first().attr('href') || '';
        const jobTags = $el.find('.tag').map((_, t) => $(t).text().trim()).get();
        const allText = `${title}`.toLowerCase();
        if (allText.includes('senior') || allText.includes('lead')) return;

        if (title && link) {
          jobs.push({
            title, company: company || 'Unknown',
            applyUrl: `https://remoteok.com${link}`,
            location: 'Remote', experience: 'Entry Level',
            salary: null, postedDate: null, techStack: jobTags,
            source: 'RemoteOK', isHighMatch: false,
          });
          count++;
        }
      });
      console.log(`[RemoteOK] ${tag}: +${count} (total: ${jobs.length})`);
    } catch (err: any) {
      console.warn(`[RemoteOK] Error on ${tag}: ${err.message}`);
    }
  }
  return jobs;
}
