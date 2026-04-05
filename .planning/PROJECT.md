# Remote Job Aggregator for Fresher Developers

## What This Is

A CLI tool published as `@pantha704/job-finder` that scrapes 16+ job boards and outputs a curated, de-duplicated markdown checklist (`job_opportunities.md`) with AI-powered match scoring. Purpose-built for Pratham Jaiswal — a 3rd-year BTech student in Kolkata, India — specializing in Rust, TypeScript, Next.js, and Solana/Web3.

## Core Value

Produce a ready-to-use `job_opportunities.md` with 150+ verified, remote-friendly, fresher/entry-level job links that Pratham can track and apply to — with high-relevance Rust/Solana/TypeScript/Next.js matches flagged prominently.

**Shipped v1.0:** 254 jobs found, 22 HIGH MATCH, published to npm.

## Current Milestone: v3.0 — AI-Powered Intelligence

**Goal:** Add AI-powered job matching, auto-apply workflows, and expand scraper coverage.

**Target features:**
- AI job matching (Groq LLM scores each job against Pratham's full profile)
- Auto-apply via browser automation (agent-browser + saved profile)
- LinkedIn scraper (requires auth cookie)
- Email alerts for new HIGH MATCH jobs
- Job recommendation engine (learns from applied/saved/rejected)
- Web dashboard (optional, lightweight)

## Requirements

### Validated (v1.1)

- ✓ All 96 unit tests pass — v1.1
- ✓ Himalayas fixed (43 jobs) — v1.1
- ✓ Cutshort verified (120 jobs) — v1.1
- ✓ Pipeline: 303+ projected jobs, zero undefined fields — v1.1
- ✓ All 22 v1.1 requirements documented — see [.planning/milestones/v1.1-REQUIREMENTS.md](./milestones/v1.1-REQUIREMENTS.md)

- ✓ Auto-detect Camoufox browser endpoint (port scan 9377, 3000, 9222, 8080) or fallback to HTTP fetch — v1.0
- ✓ Respect robots.txt, 3s delay between requests — v1.0
- ✓ Max 3 retries per URL; skip blocked pages with CAPTCHA — v1.0
- ✓ Use bun as runtime — v1.0
- ✓ All 32 v1 requirements satisfied — see [.planning/milestones/v1.0-REQUIREMENTS.md](./milestones/v1.0-REQUIREMENTS.md)

### Active (v2.0 Candidates)

- [ ] Salary range filter
- [ ] Company size filter
- [ ] Company blacklist
- [ ] Interactive job browser
- [ ] SQLite persistence
- [ ] CSV/JSON export (already implemented in v1.0.8)

### Out of Scope

| Feature | Reason |
|---------|--------|
| CAPTCHA bypass/solving | Ethical constraint — non-negotiable |
| Login-gated content | Unauthorized access risk |
| Non-public job data | Scrape only publicly visible listings |
| Mobile/web UI | Script-first, CLI output |
| Proxies/IP rotation | Keep simple for personal use |
| Auto-apply to jobs | Personal use only, not a product feature |

## Context

- **User Profile**: Pratham Jaiswal, 3rd-year BTech, Kolkata, India. Significant OSS contributions: Rust compiler, PyTorch, DeepMind (verified on GitHub).
- **Skills Strength**: Rust (primary), TypeScript/Next.js (secondary), Solana blockchain.
- **Profile Data**: `~/.job-finder/profile.json` — personal auto-apply data (not part of product)
- **Codebase**: 3,154 lines TypeScript, 20+ source files across `src/`
- **Tech Stack**: Bun, TypeScript strict, agent-browser, cheerio, @inquirer/prompts, chalk, figlet, pino
- **Published**: @pantha704/job-finder@1.0.8 on npm
- **Output**: job_opportunities.md with 285 jobs (28 HIGH MATCH) from 8 working sources
- **Working Sources**: Internshala, Web3.career, RemoteOK, SolanaJobs, Cutshort, Himalayas, RemoteRocketship, Unstop
- **Disabled Sources**: Wellfound (DataDome), YCombinator (Algolia locked)
- **Camoufox-Needed Sources**: Remotive, Jobicy, WWR, Jobspresso, CryptocurrencyJobs
- **LinkedIn**: requires auth cookie + Camoufox

## Constraints

- **Ethics**: Respect robots.txt, 3-second delay between requests — non-negotiable
- **Scope**: India-accessible remote jobs only, 0-2 years experience or "Fresher"/"Internship" label

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
