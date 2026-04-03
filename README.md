# 🎯 job-finder — Remote Jobs CLI for Fresher Devs

> **Automated, ethical job scraper** that hits 14 job boards and outputs a curated, de-duplicated markdown checklist ready for your application tracking.

[![npm](https://img.shields.io/npm/v/@pantha704/job-finder)](https://www.npmjs.com/package/@pantha704/job-finder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

**Features:** CLI Interface • 16+ Data Sources • Smart Deduplication • AI Match Scoring • Headless Bypasses 

<details>
<summary><b>Table of Contents</b></summary>

- [📦 Install](#-install)
- [⚡ Quick Start](#-quick-start)
- [🖥️ CLI Reference](#️-cli-reference)
- [📋 Output Format](#-output-format)
- [🌐 Sources](#-sources)
- [🏗️ Architecture](#️-architecture)
- [🦊 Camoufox](#-camoufox-optional--for-wellfound--himalayas)
- [🔧 Ethics Rules](#-ethics-rules-non-negotiable)
- [➕ Adding a New Scraper](#-adding-a-new-scraper)
- [📝 Local Development](#-local-development)

</details>

---

## 📦 Install

```bash
# Global install (recommended — gives you the `job-finder` command)
bun add -g @pantha704/job-finder

# Or with npm/npx
npm install -g @pantha704/job-finder

# One-off without installing
bunx @pantha704/job-finder
npx @pantha704/job-finder
```

> **One-time setup:** Install Playwright Firefox for JS-rendered sites (Wellfound, Himalayas):
> ```bash
> bunx playwright install firefox
> ```

---

## ⚡ Quick Start

```bash
# Interactive mode — prompts guide you through options
job-finder

# Fully non-interactive — freshers, remote from India, Rust/TS/Solana
job-finder -e fresher -l remote-india -R web3,backend -H rust,typescript,solana

# Specific sources only
job-finder -s remoteok,solanajobs,cryptocurrencyjobs

# Save output to a custom file
job-finder -o ~/Documents/my_job_list

# Show match scores and verbose logging
job-finder -S -v
```

Output is saved to the file you specify (default: `job_opportunities.md` in your current directory). The **absolute path is always printed** at the end so you know where to find it.

---

## 🖥️ CLI Reference

```
Usage:
  job-finder [options]

Core Filters:
  -e, --experience <level>   internship | fresher | junior | mid | senior | any
  -l, --location <scope>     remote-india | remote-global | hybrid | onsite | any
  -R, --roles <list>         Comma-separated: web3,backend,frontend,fullstack,devops,...
  -k, --keywords <text>      Free-text keyword filter across title + description
  -H, --highlight <list>     Tech stack to flag as 🔥 HIGH MATCH (e.g. rust,solana,typescript)
  -w, --worktype <type>      full-time | part-time | contract | internship | any

Advanced Filters:
      --stage <stage>        startup stage: pre-seed | seed | series-a | ...
      --size <size>          company size: 1-10 | 11-50 | 51-200 | 201-500 | 500+
      --industry <list>      fintech,web3,ai,saas,...
      --min-stipend <num>    Minimum monthly stipend (INR)
      --min-salary <num>     Minimum annual salary (INR)
      --equity               Only show jobs with equity
      --posted <days>        Only jobs posted within N days (default: 14)

Personalization:
  -g, --github <username>    Extract skills from your GitHub profile to boost matching
  -r, --resume <path>        Path to resume text file for keyword boosting
      --applied <path>       Path to applied-log file to skip already-applied jobs

Output:
  -f, --format <fmt>         md | json | csv | all  (default: md)
  -o, --output <path>        Output file path  (default: job_opportunities.md)
  -S, --score                Show priority match score [0–100] on each job

Sources:
  -s, --sources <list>       Comma-separated list of sources to run (default: all)
                              Available: internshala, wellfound, cutshort, himalayas,
                              remoteok, remotive, solanajobs, cryptocurrencyjobs,
                              jobicy, jobspresso, weworkremotely, unstop,
                              web3career, ycombinator

Browser:
      --browser <engine>     playwright | fetch  (default: playwright)
      --headless             Run browser in headless mode (default: true)

Misc:
  -v, --verbose              Debug logging
  -V, --version              Show version
  -h, --help                 Show this help
```

---

## 📋 Output Format

`job_opportunities.md` (or your chosen filename) is structured as:

```markdown
- [ ] **Full-Stack Engineer** @ **Razorpay** 🔥 **HIGH MATCH**
  **Company**: Razorpay
  **Location**: Remote | **Experience**: 0-2 years | **Type**: full-time
  **Skills**: TypeScript, Next.js, React
  **Score**: 72/100 | **Source**: Cutshort

- [ ] **Rust Developer Intern** @ **Drift Protocol**
  ...
```

Check the box `[x]` when you apply to track progress.

---

## 🌐 Sources

| Source | Tier | Method | Notes |
|--------|------|--------|-------|
| **Internshala** | 1 | fetch + cheerio | Best for India internships |
| **RemoteRocketship** | 1 | fetch + cheerio | Quality remote-first listings |
| **Unstop** | 1 | Playwright | Mostly hackathons + internships |
| **Wellfound** | 2 | Playwright | ⚠️ Needs Camoufox for realistic fingerprint |
| **Cutshort** | 2 | fetch + cheerio | Good India startup job board |
| **Himalayas** | 2 | Playwright | Remote-first global board |
| **RemoteOK** | 3 | JSON API | Best public remote job API |
| **SolanaJobs** | 3 | HTML + API | Dedicated Solana/Web3 jobs |
| **CryptocurrencyJobs** | 3 | fetch + cheerio | Web3/Crypto focused |
| **Remotive** | 3 | fetch + cheerio | Large remote-only board |
| **WeWorkRemotely** | 3 | fetch + cheerio | Classic remote board |
| **Jobicy** | 3 | fetch + cheerio | Remote jobs aggregator |
| **Jobspresso** | 3 | fetch + cheerio | Curated remote jobs |
| **Web3.career** | 3 | fetch + cheerio | Remote crypto and blockchain jobs |
| **YC Work at a Startup** | 3 | JSON API + fetch | Global startups backed by YC |
| **LinkedIn** | — | — | ❌ Requires `--linkedin-cookie` auth |

### Run specific sources:
```bash
# Web3 + crypto only
job-finder -s solanajobs,cryptocurrencyjobs,remoteok -H solana,rust,web3

# India-first + internship boards
job-finder -s internshala,unstop,cutshort -e internship

# All sources (default)
job-finder
```

---

## 🏗️ Architecture

```
src/
├── cli.ts                    ← Entry point — interactive + flag-based CLI
├── index.ts                  ← Pipeline orchestrator (scrape → filter → dedup → write)
├── types/
│   └── options.ts            ← PipelineOptions interface
├── config/
│   ├── defaults.ts           ← Default pipeline options
│   └── locations.ts          ← India city/state lookup table
├── filters/
│   ├── location.ts           ← Normalise + filter by location scope
│   ├── experience.ts         ← Parse experience strings, classify level
│   └── skills.ts             ← HIGH MATCH scoring against user's highlight skills
├── prompts/
│   ├── interactive.ts        ← Inquirer-based interactive wizard
│   └── validators.ts         ← Input validators
├── utils/
│   ├── logger.ts             ← Pino structured logger
│   ├── output.ts             ← Markdown formatter
│   └── github.ts             ← GitHub profile skill extractor
├── dedup.ts                  ← Deduplication + URL validation
├── formatter.ts              ← File append + batch write
├── browser.ts                ← Playwright / Camoufox / fetch fallback chain
├── utils.ts                  ← retry(), delay(), checkRobotstxt(), UA rotation
└── scrapers/                 ← 16+ source-specific extraction scripts
    ├── internshala.ts
    ├── wellfound.ts
    ├── web3career.ts
    ├── ycombinator.ts
    └── ...                   ← (other scrapers here)
```

### Pipeline Flow

```
job-finder CLI
     │
     ▼
Interactive Wizard (if no --roles/--sources flags)
     │
     ▼
Pipeline Orchestrator (src/index.ts)
     │
     ├─ for each source (in parallel batches):
     │       Scraper → raw Job[]
     │           │
     │           ▼
     │       Location Filter  (remote-global = workable from India ✓)
     │           │
     │           ▼
     │       Experience Filter (fresher/internship pass)
     │           │
     │           ▼
     │       Skills Scoring   (HIGH MATCH if score ≥ 35/100)
     │           │
     │           ▼
     │       Dedup Check      (company + title + hostname)
     │           │
     │           ▼
     │       URL Validation   (trusted boards skip HEAD check)
     │
     ▼
Write to file every 25 jobs (incremental save)
     │
     ▼
💾 Saved: /absolute/path/to/job_opportunities.md
```

---

## 🦊 Camoufox (Optional — For Wellfound / Himalayas)

Some sites aggressively block headless browsers. [Camoufox](https://github.com/daijro/camoufox) is an anti-detect Firefox that provides a highly realistic browser fingerprint to prevent being instantly flagged as a bot. **It does not solve CAPTCHAs** — it simply helps the scraper look like a real user browsing ethically.

```bash
# Install the Python Camoufox server
pip install camoufox[geoip]
python -m camoufox server   # → starts on http://localhost:9377

# The scraper auto-detects it
# ✓ Camoufox detected on port 9377 — using anti-detect Firefox
```

Without it, the tool falls back to:
1. Standard Playwright headless Firefox
2. Plain `fetch` with browser headers (may fail on Cloudflare-protected sites)

---

## 🔧 Ethics Rules (Non-Negotiable)

- ✅ `robots.txt` checked before every scrape
- ✅ 3-second delay between every request
- ✅ Max 3 retries per URL with exponential backoff
- ✅ Max 10 pages per site
- ❌ No CAPTCHA bypass
- ❌ No credential injection or session hijacking

---

## ➕ Adding a New Scraper

### 1. Create `src/scrapers/yoursite.ts`

```ts
import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, checkRobotstxt, getRandomUserAgent } from '../utils';

export async function scrapeYourSite(): Promise<Job[]> {
  const jobs: Job[] = [];
  const allowed = await checkRobotstxt('yoursite.com', '/jobs');
  if (!allowed) { console.warn('[YourSite] robots.txt blocked'); return jobs; }

  const html = await retry(async () => {
    const res = await fetch('https://yoursite.com/jobs?remote=true', {
      headers: { 'User-Agent': getRandomUserAgent() }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  });

  const $ = cheerio.load(html);
  $('a[href*="/jobs/"]').closest('article, li').each((_, el) => {
    const $el = $(el);
    jobs.push({
      title: $el.find('h2, h3').first().text().trim(),
      company: $el.find('[class*="company"]').first().text().trim() || 'Unknown',
      applyUrl: `https://yoursite.com${$el.find('a').first().attr('href')}`,
      location: 'Remote',
      experience: 'Entry Level',
      salary: null, postedDate: null, techStack: [],
      source: 'YourSite', isHighMatch: false,
    });
  });

  await delay(3000);
  return jobs;
}
```

### 2. Register in `src/index.ts`

```ts
import { scrapeYourSite } from './scrapers/yoursite';

const SCRAPERS = {
  // ...existing...
  yoursite: scrapeYourSite,
};
```

### 3. Add to trusted hostnames in `src/dedup.ts`

```ts
const TRUSTED_HOSTNAMES = new Set([
  // ...existing...
  'yoursite.com',
]);
```

---

## 📝 Local Development

```bash
git clone https://github.com/pantha704/job-finder
cd job-finder
bun install

# Run directly (no build needed)
bun run src/cli.ts --help

# Build + link globally
bun run build
bun link        # makes `job-finder` available system-wide

# Type check
bun tsc --noEmit
```

---

## 📄 License

MIT © [Pratham Jaiswal](https://github.com/pantha704)
