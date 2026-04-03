# Remote Job Aggregator for Fresher Developers

## What This Is

An automated web scraper that collects 200+ remote, entry-level and internship job listings from multiple job boards (Internshala, Wellfound, LinkedIn, Cutshort, Solana Jobs, etc.) and outputs a curated, de-duplicated markdown checklist (`job_opportunities.md`) with application tracking. The tool is purpose-built for Pratham Jaiswal — a 3rd-year BTech student in Kolkata, India — specializing in Rust, TypeScript, Next.js, and Solana/Web3.

## Core Value

Produce a ready-to-use `job_opportunities.md` with 150+ verified, remote-friendly, fresher/entry-level job links that Pratham can track and apply to — with high-relevance Rust/Solana/TypeScript matches flagged prominently.

## Requirements

### Validated

- [x] Auto-detect Camofox browser endpoint (port scan 9377, 3000, 9222, 8080) or fallback to HTTP fetch (Validated in Phase 01)
- [x] Respect robots.txt, 3s delay between requests, no CAPTCHA bypass (Validated in Phase 01)
- [x] Max 3 retries per URL; skip blocked pages with CAPTCHA (Validated in Phase 01)
- [x] Use bun as runtime (Validated in Phase 01)

### Active

- [ ] Scrape Tier 1 sources: Internshala, Wellfound, RemoteRocketship, Unstop
- [ ] Scrape Tier 2 sources: LinkedIn, Cutshort, Himalayas
- [ ] Scrape Tier 3 Web3/Rust/Solana sources: jobs.solana.com, cryptocurrencyjobs.co
- [ ] Filter jobs: Remote from India, 0-2 years exp or "Fresher"/"Internship" label
- [ ] Extract per-job: Title, Company, Apply Link, Location, Experience, Salary, Posted Date, Tech Stack
- [ ] Filter to last 14 days only
- [ ] Flag jobs matching Rust/Solana/TypeScript/Next.js with "🔥 HIGH MATCH"
- [ ] De-duplicate jobs by company+title+link hash
- [ ] Output `job_opportunities.md` as markdown checklist with `- [ ]` tracking
- [ ] Include application tracker table at bottom of output
- [ ] Report progress every 25 jobs extracted
- [ ] Filter to last 14 days only
- [ ] Flag jobs matching Rust/Solana/TypeScript/Next.js with "🔥 HIGH MATCH"
- [ ] De-duplicate jobs by company+title+link hash
- [ ] Output `job_opportunities.md` as markdown checklist with `- [ ]` tracking
- [ ] Include application tracker table at bottom of output
- [ ] Report progress every 25 jobs extracted

### Out of Scope

- Real-time job monitoring / recurring scheduler — single-run scrape only
- Job application automation — tracking only, no auto-apply
- Authentication flows on job boards — skip gated content
- CAPTCHA solving — ethical scraping only, skip if blocked
- Non-remote or non-India-accessible jobs — filter out

## Context

- **User Profile**: Pratham Jaiswal, 3rd-year BTech, Kolkata, India. Significant OSS contributions: Rust compiler, PyTorch, DeepMind (verified on GitHub).
- **Skills Strength**: Rust (primary), TypeScript/Next.js (secondary), Solana blockchain.
- **Browser Setup**: Camofox browser may be running on port 9377 (CDP endpoint). Auto-detection required before falling back to static HTTP fetch.
- **Date**: April 2026 — "last 14 days" filter means March 20 – April 3, 2026.
- **Ethics First**: robots.txt compliance, 3s delays, no CAPTCHA bypass. Projects on ethics.
- **Output Location**: `./job_opportunities.md` in `/home/panther/Documents/jobs/`

## Constraints

- **Ethics**: Respect robots.txt, 3-second delay between requests, no CAPTCHA bypass — non-negotiable
- **Scope**: India-accessible remote jobs only, 0-2 years experience or "Fresher"/"Internship" label
- **Recency**: Posted within last 14 days (March 20 – April 3, 2026)
- **Volume**: Target 150+ unique jobs (success threshold), ideally 200+
- **Tech**: Use bun as runtime; scraping via browser CDP (Camofox) or fetch fallback
- **Retry Policy**: Max 3 retries per URL; skip blocked pages with CAPTCHA
- **Pagination**: Max 10 pages per site

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Camofox CDP first, then HTTP fetch | Camofox handles JS-rendered pages; HTTP fetch for static sites | Phase 01 Implemented |
| Bun as runtime | User preference (global rule) | Phase 01 Implemented |
| Markdown checklist format | `- [ ]` enables direct tracking in any markdown viewer | — Pending |
| 🔥 HIGH MATCH flag for Rust/Solana/TS/Next.js | Pratham's strongest skills; need high-signal filtering | — Pending |
| De-dupe by hash(company + title + link) | Prevents same job appearing from multiple sources | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-03 after Phase 01 completion*
