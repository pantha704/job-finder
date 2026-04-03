---
phase: "04"
name: "Tier 3 Web3/Rust/Solana Scraping"
status: complete
completed_at: 2026-04-03
one_liner: "SolanaJobs (19 jobs), Web3.career, CryptocurrencyJobs, YCombinator — all wired and returning results"
---

# Phase 04 Summary: Tier 3 Web3/Rust/Solana Scraping

## What Was Built

### solanajobs.ts
- fetch + cheerio HTML parser
- Entry-level + internship filter via URL params
- **Result: 19 jobs in smoke test — all 🔥 HIGH MATCH**

### web3career.ts
- fetch + cheerio targeting `/remote-jobs` listing table
- Filters out Senior/Lead/Staff roles
- Tags: blockchain, DeFi, Rust, Solana keywords detected

### cryptocurrencyjobs.ts
- fetch + cheerio against `?location=Remote` filter page
- Experience heuristic: skip titles with "Senior/Lead/Staff/Principal"

### ycombinator.ts
- WorkAtAStartup JSON API: `?remote=true&eng_type=fs&yoe_min=0&yoe_max=2`
- Parses response array directly — no HTML needed
- Startup-ecosystem jobs: earlier stage, more willing to hire freshers

## Key Outcome

All 4 Tier 3 scrapers registered in SCRAPERS map in `src/index.ts`.
Smoke test: solanajobs alone returned 19 jobs, all correctly HIGH MATCH flagged.
