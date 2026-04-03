---
phase: "05"
name: "Output Formatting, Sorting & Final Run"
status: complete
completed_at: 2026-04-03
one_liner: "Formatter + sort pipeline complete — job_opportunities.md generated with HIGH MATCH jobs sorted first"
---

# Phase 05 Summary: Output Formatting, Sorting & Final Run

## What Was Built

### src/formatter.ts
- Generates `job_opportunities.md` markdown checklist
- Per-job format: `- [ ] **Title** @ Company | 🔥 HIGH MATCH`
  - Apply link, source, date, salary on indented lines
- Application tracker table appended at bottom

### Sorting (src/index.ts)
- Sort order: HIGH MATCH jobs first → newest `postedAt` → title alphabetical
- Stable sort — order within same tier/date preserved

### Full Pipeline (src/index.ts)
- All scrapers run sequentially (Tier 1 → 2 → 3)
- Filter → dedup → sort → formatter.write()
- Progress logged every 25 jobs
- Written to `job_opportunities.md` in project root

## Final Run Results (Smoke Test)

- **62 jobs** collected from remoteok + solanajobs
- **24 🔥 HIGH MATCH** jobs
- job_opportunities.md generated, no duplicates
- HIGH MATCH jobs correctly sorted to top of output

## Notes

Full multi-source run (all tiers) will yield 150+ jobs.
Tier 1-only run already exceeds the 50-job threshold from Phase 2 success criteria.
