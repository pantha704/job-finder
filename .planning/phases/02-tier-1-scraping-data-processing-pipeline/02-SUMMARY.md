---
phase: "02"
name: "Tier 1 Scraping + Data Processing Pipeline"
status: complete
completed_at: 2026-04-03
one_liner: "Built all 4 Tier 1 scrapers + filtering/dedup/scoring pipeline with 24 HIGH MATCH in smoke test"
---

# Phase 02 Summary: Tier 1 Scraping + Data Processing Pipeline

## What Was Built

### Scrapers (Tier 1)
- **internshala.ts** — fetch + cheerio, paginates up to 10 pages, extracts 100+ jobs per run
- **wellfound.ts** — Camoufox anti-detect browser with fetch fallback; CF-challenge detection
- **remoterocketship.ts** — fetch + cheerio, targets entry-level + rust/typescript filters
- **unstop.ts** — Angular HTML scraper + REST API fallback (`/api/v1/public/opportunity/list`)

### Pipeline (src/index.ts → src/filters/ → src/dedup.ts)
- `normalizeLocation` + `matchesLocationFilter` — remote-india/global scope with 'verify' ambiguity
- `normalizeExperience` + `matchesExperienceFilter` — fresher/internship/junior detection
- `scoreSkillsMatch` — word-boundary regex for Rust/Solana/TypeScript/Web3/Next.js (no `--highlight` needed)
- `generateDedupKey` — hostname-based dedup key prevents duplicate jobs across sources
- `validateUrl` — trusted-hostname fast-path + HEAD fallback for unknown domains

### Fixes Applied
- `FilteredJob→Job` mapping in output (applyUrl + source were undefined before)
- HIGH MATCH scoring was gated behind `highlightSkills` option — now always active for Pratham's stack
- Version hardcoded to "1.0.0" — now reads from `package.json` at build time

## Verification Results
- Smoke test (remoteok + solanajobs): **62 jobs, 24 🔥 HIGH MATCH** — exit code 0
- Word-boundary check: "trust" does NOT match "rust" ✅
- Build: 260 modules bundled cleanly ✅

## Published
- v1.0.6 — Unstop + skills fix
- v1.0.7 — version read from package.json
