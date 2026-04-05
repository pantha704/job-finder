# Phase 11: Advanced Filters — SUMMARY

## What was accomplished
Implemented three new composable filters for the job pipeline:

1. **Salary filter** (`src/filters/salary.ts`) — Parses salary text from any format, normalizes to annual USD, and filters by min/max thresholds. `maxSalary` doubles as a seniority filter (very high salaries likely indicate senior roles unsuitable for freshers).

2. **Company filter** (`src/filters/company.ts`) — Supports company blacklist (case-insensitive partial matching), company size range filtering, and company stage filtering. Permissive when job data is unknown.

3. **CLI integration** — Added `--max-salary` and `--exclude-companies` CLI args. Existing `--min-salary`, `--size`, `--stage` args are now wired into the pipeline.

## Files changed
- `src/filters/salary.ts` (NEW) — 153 lines
- `src/filters/company.ts` (NEW) — 80 lines
- `src/filters/salary.test.ts` (NEW) — 96 lines, 12 tests
- `src/filters/company.test.ts` (NEW) — 95 lines, 12 tests
- `src/index.ts` (MODIFIED) — Wired new filters into pipeline
- `src/cli.ts` (MODIFIED) — Added CLI arguments

## Test results
- **127/127 tests pass** (up from 103)
- **178 assertions** across 9 test files

---
*Phase 11 completed: 2026-04-05*
