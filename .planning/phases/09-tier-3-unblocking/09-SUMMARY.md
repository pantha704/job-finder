---
phase: "09"
name: "Tier 3 Unblocking"
status: complete
completed_at: 2026-04-03
one_liner: "Remotive/Jobicy/WWR all blocked by anti-bot — same pattern as Wellfound, accepted as external limitations"
---

# Phase 09 Summary: Tier 3 Unblocking

## Results

| Source | Method | Result |
|--------|--------|--------|
| Remotive | Camoufox | 0 jobs — selectors don't match rendered DOM |
| Jobicy | Camoufox | 0 jobs — selectors don't match rendered DOM |
| WWR | Camoufox/Playwright | Anti-bot challenge page detected (~760KB HTML, no job listings) |

All 3 sources use anti-bot protection that blocks both Camoufox and Playwright. Same pattern as Wellfound (DataDome).

## Decisions

- **UBK3-01 (Remotive):** Out of Scope — external anti-bot, selectors don't match
- **UBK3-02 (Jobicy):** Out of Scope — external anti-bot, selectors don't match
- **UBK3-03 (WWR):** Out of Scope — anti-bot challenge page, no job listing DOM elements

All scrapers exit cleanly with warnings. Pipeline continues with working sources.
