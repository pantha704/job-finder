# Phase 02: Tier 1 Scraping + Data Processing Pipeline - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Scrape all 4 Tier 1 sources (Internshala, Wellfound, RemoteRocketship, Unstop) and build the complete data processing pipeline (filter, dedup, HIGH MATCH flag, progress reporting).
</domain>

<decisions>
## Implementation Decisions

### Filtering Edge Cases
- **D-01:** Parse explicit experience range first; fallback to fuzzy match keywords (`fresher`, `entry`, `0-1 year`, `new grad`, `intern`).
- **D-02:** If still unclear, include it but add the `isHighMatch` / note flag (or append to title) "⚠️ Verify experience". Better to have extra to manually filter than to miss good jobs.

### HIGH MATCH Detection
- **D-03:** Use Regex Word Boundaries + Case-Insensitive matching (`/\bRust\b/i`, `/\bSolana\b/i`, `/\bTypeScript\b/i`, `/\bNext\.?js\b/i`, `/\bWeb3\b/i`, `/\bAnchor\b/i`, `/\bWASM\b/i`).
- **D-04:** Extend the data model virtually to add a `matchScore` (0-3+) based on how many keywords hit (or reuse `isHighMatch` Boolean alongside it in formatting).

### Data Persistence Strategy
- **D-05:** Emit Partially + Periodic Saves. After every 25 valid jobs extracted, append to output target. Keep an in-memory Set for deduplication. Protects against mid-scrape crashes.

### CLI Progress Reporting
- **D-06:** Use `ora` for the main spinner, log structured updates every 25 jobs (e.g. `✓ [25/200] {title} at {company} - 🔥 HIGH MATCH`), and show a final `console.table` summary.

### Deduplication Logic (Bonus folded)
- **D-07:** Hash key pattern: `${company.toLowerCase()}-${title.toLowerCase()}-${new URL(applyLink).hostname}`. Merge conflict resolution: keep most complete data > most recent posted date > direct apply link.

### "Remote from India" Detection (Bonus folded)
- **D-08:** Positive signals: "Remote (India)", "WFH - India", "Remote - APAC", "Global remote". Negative signals: "US only", "EU timezone", "Must be in California". If ambiguous: include but add "⚠️ Verify location" note.

### Output Validation (Bonus folded)
- **D-09:** Before appending to final output: verify applyLink URLs are reachable (HEAD request, 5s timeout). Remove/skip any 404/403 links automatically.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Base
- `.planning/PROJECT.md` — Core vision and constraints
- `.planning/REQUIREMENTS.md` — Requirement keys
- `src/types.ts` — Existing Data schemas
- `src/utils.ts` — Existing utils library
</canonical_refs>
