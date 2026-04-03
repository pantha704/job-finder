# Phase 02: Tier 1 Scraping + Data Processing Pipeline - Discussion Log

**Gathered:** 2026-04-03

**Q:** Which areas do you want to discuss for Tier 1 Scraping + Data Processing? (1. Filtering Edge Cases, 2. HIGH MATCH Detection, 3. Data Persistence Strategy, 4. CLI Progress Reporting)

**A:**
User answered "all" with strict definitions for implementation approach:
- 1. Fuzzy matching fallback for experience, with `⚠️ Verify experience` tag instead of dropping.
- 2. Regex boundaries `\b` case insensitive for keywords like Rust, Solana, TypeScript, Web3. Plus `matchScore`.
- 3. Emit partially & periodically (save after 25 jobs), with ongoing `Set` to prevent memory blowups and guard against crashes mid-run.
- 4. Use `ora` spinner and structural logs.
- Bonus requests added: advanced dedup based on company-title-host hash, specific remote location logic (APAC, Global, India), and pre-flight HEAD checks on apply URLs.

These choices are recorded as `D-01` to `D-09` in the CONTEXT.md.
