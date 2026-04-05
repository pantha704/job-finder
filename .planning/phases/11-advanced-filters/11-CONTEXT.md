# Phase 11: Advanced Filters — Context

## Objective
Implement salary range, company size, and company blacklist filters to give users fine-grained control over job results.

## Requirements
- **FLT-01**: Filter by minimum salary/stipend
- **FLT-02**: Filter by company size (startup vs enterprise)
- **FLT-03**: Blacklist specific companies
- **FLT-04**: Filters are composable

## Architecture Notes
- Existing filter modules: `src/filters/location.ts`, `src/filters/experience.ts`, `src/filters/skills.ts`
- New filters will follow the same pattern: `src/filters/salary.ts`, `src/filters/company.ts`
- Pipeline integration in `src/index.ts` — add filter calls after existing location/experience checks
- CLI args in `src/cli.ts` — add `--min-salary`, `--company-size`, `--blacklist` options

## Dependencies
- None (builds on existing filter infrastructure)

## Known Challenges
- Company size data is not available from all scrapers — may need fallback to "unknown"
- Salary parsing varies by source (INR/month vs USD/year) — needs normalization
- Blacklist matching should be case-insensitive and handle partial company names

## Files to Modify
- `src/types/options.ts` — add new filter fields
- `src/filters/salary.ts` — new file
- `src/filters/company.ts` — new file
- `src/index.ts` — integrate new filters into pipeline
- `src/cli.ts` — add CLI arguments
- `src/config/defaults.ts` — add default values

---
*Created: 2026-04-05 for v2.0 Phase 11*
