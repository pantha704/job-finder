<!-- GSD:project-start source:PROJECT.md -->
## Project

**Remote Job Aggregator for Fresher Developers**

An automated web scraper that collects 200+ remote, entry-level and internship job listings from multiple job boards (Internshala, Wellfound, LinkedIn, Cutshort, Solana Jobs, etc.) and outputs a curated, de-duplicated markdown checklist (`job_opportunities.md`) with application tracking. The tool is purpose-built for Pratham Jaiswal — a 3rd-year BTech student in Kolkata, India — specializing in Rust, TypeScript, Next.js, and Solana/Web3.

**Core Value:** Produce a ready-to-use `job_opportunities.md` with 150+ verified, remote-friendly, fresher/entry-level job links that Pratham can track and apply to — with high-relevance Rust/Solana/TypeScript matches flagged prominently.

### Constraints

- **Ethics**: Respect robots.txt, 3-second delay between requests, no CAPTCHA bypass — non-negotiable
- **Scope**: India-accessible remote jobs only, 0-2 years experience or "Fresher"/"Internship" label
- **Recency**: Posted within last 14 days (March 20 – April 3, 2026)
- **Volume**: Target 150+ unique jobs (success threshold), ideally 200+
- **Tech**: Use bun as runtime; scraping via browser CDP (Camofox) or fetch fallback
- **Retry Policy**: Max 3 retries per URL; skip blocked pages with CAPTCHA
- **Pagination**: Max 10 pages per site
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Runtime & Language
- **Bun** (required by user rule) — zero-config TypeScript, native `fetch`, fast startup
- **TypeScript** — strict mode, interfaces for job data, type safety across scrapers
## HTTP / Scraping Layer
| Approach | When to Use | Confidence |
|----------|------------|------------|
| `fetch` (native Bun) | Static HTML pages, simple JSON APIs | HIGH |
| `cheerio@1.x` | HTML parsing with jQuery selectors | HIGH |
| Playwright via Camoufox | JS-rendered pages (LinkedIn, Wellfound) | HIGH |
## Browser Automation
- **Camoufox** — Firefox-based anti-detect browser, NOT Chrome CDP
- **@playwright/test** or `playwright` package — use `firefox` browserType
## Deduplication
- Simple hash: `crypto.createHash('sha256').update(company + title + applyUrl).digest('hex')`
- Store seen hashes in a `Set<string>` during scraping run
- No fuzzy matching needed for this one-shot script
## Output
- Markdown file (`job_opportunities.md`) — standard Node `fs.writeFile`
- Append mode per source, final sort + de-dupe at write time
## Dev Dependencies
## What NOT to Use
- ❌ Python/Scrapy — user uses Bun
- ❌ Puppeteer — Camoufox is Firefox-based, use Playwright
- ❌ External CAPTCHA APIs — ethical constraint
- ❌ Selenium — slower, heavier, less maintainable
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
