import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { retry, getRandomUserAgent } from '../utils';

const BASE_URL = 'https://web3.career';

export async function scrapeWeb3Career(): Promise<Job[]> {
  const jobs: Job[] = [];

  const paths = [
    '/remote-jobs',
    '/entry-level-web3-jobs',
    '/junior-web3-jobs',
    '/blockchain-jobs',
    '/solana-jobs',
  ];

  for (const path of paths) {
    const url = `${BASE_URL}${path}`;
    try {
      const html = await retry(async () => {
        const res = await fetch(url, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml',
          },
        });
        if (res.status === 403 || res.status === 429) throw new Error(`HTTP ${res.status}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      });

      const $ = cheerio.load(html);
      let count = 0;

      // Web3.career embeds each job as a separate <script type="application/ld+json"> JobPosting block
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const raw = $(el).text().trim();
          const data = JSON.parse(raw);
          if (data['@type'] !== 'JobPosting') return;

          const title = data.title || '';
          const company = data.hiringOrganization?.name || '';
          if (!title || !company) return;

          // Dedup by title+company
          const dedupKey = `${company.toLowerCase().trim()}-${title.toLowerCase().trim()}`;
          if (jobs.some(x => `${x.company.toLowerCase().trim()}-${x.title.toLowerCase().trim()}` === dedupKey)) return;

          const location = data.jobLocation?.address?.addressCountry || data.applicantLocationRequirements?.name || 'Remote';
          const salary = data.baseSalary
            ? `${data.baseSalary.value?.minValue || data.baseSalary.value?.value || data.baseSalary.value || ''} ${data.baseSalary.currency || ''}`
            : '';

          // Extract tech keywords from description
          const desc = (data.description || '').toLowerCase();
          const techStack: string[] = [];
          for (const [keyword, tag] of [
            ['rust', 'rust'], ['solana', 'solana'], ['typescript', 'typescript'],
            ['react', 'react'], ['node', 'nodejs'], ['web3', 'web3'],
            ['blockchain', 'blockchain'], ['smart contract', 'solidity'],
            ['anchor', 'anchor'], ['wasm', 'wasm'], ['next.js', 'nextjs'], ['nextjs', 'nextjs'],
          ] as const) {
            if (desc.includes(keyword) && !techStack.includes(tag)) techStack.push(tag);
          }

          jobs.push({
            title,
            company,
            applyUrl: url,
            location,
            experience: 'Entry Level',
            salary: salary || null,
            postedDate: data.datePosted ? new Date(data.datePosted) : null,
            techStack,
            source: 'Web3.career',
            isHighMatch: false,
          });
          count++;
        } catch {
          // skip parse errors or non-JobPosting blocks
        }
      });

      console.log(`[Web3.career] ${path}: +${count} jobs (total: ${jobs.length})`);
    } catch (err: any) {
      console.warn(`[Web3.career] Error on ${url}: ${err.message}`);
    }
  }

  console.log(`[Web3.career] Total: ${jobs.length} jobs`);
  return jobs;
}
