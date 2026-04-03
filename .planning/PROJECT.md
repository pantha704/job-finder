# Remote Job Aggregator for Fresher Developers

## What This Is

A CLI tool published as `@pantha704/job-finder` that scrapes 16+ job boards and outputs a curated, de-duplicated markdown checklist (`job_opportunities.md`) with AI-powered match scoring. Purpose-built for Pratham Jaiswal — a 3rd-year BTech student in Kolkata, India — specializing in Rust, TypeScript, Next.js, and Solana/Web3.

## Core Value

Produce a ready-to-use `job_opportunities.md` with 150+ verified, remote-friendly, fresher/entry-level job links that Pratham can track and apply to — with high-relevance Rust/Solana/TypeScript/Next.js matches flagged prominently.

**Shipped v1.0:** 254 jobs found, 22 HIGH MATCH, published to npm.

## Current Milestone: v1.1 — Reliability & Coverage

**Goal:** Close every gap from the v1.0 audit — unblock all 6 blocked sources, add a unit test suite, verify the full multi-source pipeline, and complete traceability documentation.

**Target features:**
- Unit test suite for utils, browser, filter, and dedup modules
- Wellfound: Camoufox anti-detect bypass of DataDome CAPTCHA
- LinkedIn: Auth cookie injection to bypass 429 rate-limit
- Himalayas & Cutshort: Playwright `fetchRendered` for non-zero SPA results
- Remotive, Jobicy, WeWorkRemotely: Headless browser bypass of 403 anti-bot
- Full pipeline verification: ≥150 jobs with all tiers, zero undefined fields
- Complete REQUIREMENTS.md traceability for all phases

## Requirements

### Validated (v1.0)

- ✓ Auto-detect Camoufox browser endpoint (port scan 9377, 3000, 9222, 8080) or fallback to HTTP fetch — v1.0
- ✓ Respect robots.txt, 3s delay between requests — v1.0
- ✓ Max 3 retries per URL; skip blocked pages with CAPTCHA — v1.0
- ✓ Use bun as runtime — v1.0
- ✓ All 32 v1 requirements satisfied — see [.planning/milestones/v1.0-REQUIREMENTS.md](./milestones/v1.0-REQUIREMENTS.md)

### Active (v1.1 / v2.0 Candidates)

- [ ] Add unit test suite (VALIDATION.md nyquist_compliant: false)
- [ ] Unblock Wellfound scraper (DataDome CAPTCHA — needs Camoufox anti-detect)
- [ ] Unblock Remotive, Jobicy, WeWorkRemotely (403 anti-bot — needs headless browser)
- [ ] Verify LinkedIn scraper with real production data (429 rate-limited in testing)
- [ ] Verify Himalayas Playwright rewrite with real data (React SPA)
- [ ] Verify full 150+ threshold with all tiers enabled simultaneously
- [ ] Fix REQUIREMENTS.md traceability completeness for Phase 3-5 entries
- [ ] Add CryptoCurrencyJobs smoke test

### Out of Scope

| Feature | Reason |
|---------|--------|
| CAPTCHA bypass/solving | Ethical constraint — non-negotiable |
| Auto-apply to jobs | Out of ethical + legal scope |
| Login-gated content | Unauthorized access risk |
| Non-public job data | Scrape only publicly visible listings |
| Real-time monitoring | Single-run tool for v1; scheduler is v2 |
| Mobile/web UI | Script-first, markdown output |
| Proxies/IP rotation | Keep simple for personal use |

## Context

- **User Profile**: Pratham Jaiswal, 3rd-year BTech, Kolkata, India. Significant OSS contributions: Rust compiler, PyTorch, DeepMind (verified on GitHub).
- **Skills Strength**: Rust (primary), TypeScript/Next.js (secondary), Solana blockchain.
- **Codebase**: 3,154 lines TypeScript, 20+ source files across `src/`
- **Tech Stack**: Bun, TypeScript strict, Playwright (Firefox/Juggler), cheerio, @inquirer/prompts, chalk, figlet, pino
- **Published**: @pantha704/job-finder@1.0.7 on npm
- **Output**: job_opportunities.md with 254 jobs (22 HIGH MATCH)
- **Working Sources**: Internshala (173), RemoteOK (43), SolanaJobs (19), Cutshort (20), RemoteRocketship (4)
- **Blocked Sources**: Wellfound (CAPTCHA), Remotive/Jobicy/WWR (403), LinkedIn (429), Himalayas (SPA = 0 results via cheerio)

## Constraints

- **Ethics**: Respect robots.txt, 3-second delay between requests — non-negotiable
- **Scope**: India-accessible remote jobs only, 0-2 years experience or "Fresher"/"Internship" label
- **Tech**: Use bun as runtime; scraping via browser (Camoufox/Playwright) or fetch fallback
- **Retry Policy**: Max 3 retries per URL with exponential backoff; skip CAPTCHA
- **Pagination**: Max 10 pages per site

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Camoufox CDP first, then HTTP fetch | Camoufox handles JS-rendered pages; HTTP fetch for static sites | ✓ Implemented v1.0 |
| Bun as runtime | User preference (global rule) | ✓ Implemented v1.0 |
| Markdown checklist format | `- [ ]` enables direct tracking in any markdown viewer | ✓ Implemented v1.0 |
| 🔥 HIGH MATCH flag for Rust/Solana/TS/Next.js | Pratham's strongest skills; need high-signal filtering | ✓ Implemented v1.0 |
| De-dupe by hash(company + title + link) | Prevents same job appearing from multiple sources | ✓ Implemented v1.0 |
| 3-tier scraping strategy | Tier 1 (India-focused) → Tier 2 (major boards) → Tier 3 (Web3 niche) | ✓ Implemented v1.0 |
| Incremental saves every 25 jobs | Progress not lost on failure | ✓ Implemented v1.0 |
| Word-boundary regex for HIGH MATCH | Prevents "trust" matching "rust" | ✓ Implemented v1.0 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-04-03 after v1.0 milestone*
