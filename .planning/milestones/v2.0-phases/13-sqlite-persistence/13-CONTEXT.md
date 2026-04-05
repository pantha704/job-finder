# Phase 13: SQLite Persistence — CONTEXT

## Objective
Store seen jobs in a local SQLite database to prevent duplicate notifications across runs and enable querying job history and application status.

## Requirements
- **OUT-04**: SQLite database stores seen jobs across runs
- **OUT-05**: User can query job history and application status

## Architecture Notes
- **Bun has built-in SQLite** via `Bun.SQLiteDatabase` (no external deps needed)
- Database location: `~/.job-finder/jobs.db`
- Schema should track: job ID, title, company, apply URL, source, first seen, last seen, status (new/seen/applied/saved/rejected)
- Pipeline integration: before processing a raw job, check if dedup key exists in SQLite. If yes, skip or update timestamp. If no, insert new record.
- CLI commands: `--status` to show stats, `--history` to list seen jobs, `--mark-applied <url>` to update status

## Dependencies
- Phase 12 (export formats inform data schema — we'll reuse the same job fields)

## Known Challenges
- SQLite file locking if multiple runs overlap (use WAL mode)
- Migration handling if schema changes between versions
- Performance: inserting 300+ jobs per run should be batched in transactions

## Files to Create/Modify
- `src/db/schema.ts` — new file: database initialization and migrations
- `src/db/jobs.ts` — new file: CRUD operations for job records
- `src/index.ts` — check SQLite before adding to dedup map
- `src/cli.ts` — add `--status`, `--history`, `--mark-applied` commands

---
*Created: 2026-04-05 for v2.0 Phase 13*
