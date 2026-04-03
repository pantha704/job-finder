# Phase 3: Tier 2 Scraping (LinkedIn, Cutshort, Himalayas) - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Add all 3 Tier 2 sources with graceful handling for anti-bot measures, ensuring the scraping pipeline continues smoothly even if one source fails.

</domain>

<decisions>
## Implementation Decisions

### LinkedIn Handling
- **D-01:** Implement aggressive graceful degradation. If LinkedIn throws a 429/blocked error or prompts an auth redirect, immediately log a warning and skip to the next source without crashing the main run. Do not attempt complex or unethical bypass workarounds.

### Cutshort Data Extraction
- **D-02:** Attempt a static fetch first for maximum performance. If the results are empty or blocked, fall back to Playwright and attempt to intercept the background XHR requests to grab the JSON payload directly instead of parsing the DOM.

### Himalayas Strategy
- **D-03:** Use a clean static fetch + cheerio parser approach. Extract their explicit tech stack tags to seamlessly feed into our HIGH MATCH (Rust/Solana/TypeScript/Next.js) filter.

### the agent's Discretion
- User-Agent (UA) rotation strings and delay timing jitter (maintaining the 3s ethical constraint).
- Exact CSS selectors used for mapping the data fields (adjust based on live DOM).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Constraints
- `.planning/PROJECT.md` — For ethics constraints, delays, and HIGH MATCH matching logic.
- `.planning/ROADMAP.md` — Phase 3 constraints.
</canonical_refs>
