# Phase 13: SQLite Persistence — PLAN

## Objective
Store seen jobs in a local SQLite database to prevent duplicate notifications across runs and enable querying job history and application status.

## Implementation (COMPLETED)

### Step 1: Created `src/db/jobs.ts`
- **Database initialization** using Bun's built-in `bun:sqlite` (zero external deps)
- **Schema**: `job_records` table with id, title, company, applyUrl, source, firstSeen, lastSeen, status, matchScore, isHighMatch
- **WAL mode** enabled for concurrent read/write safety
- **CRUD operations**: `findJob`, `upsertJob`, `upsertJobs` (batch), `updateJobStatus`
- **Query operations**: `getStats`, `queryHistory` (with status/source/limit/offset filters)
- DB stored at `~/.job-finder/jobs.db`

### Step 2: Wired into `src/index.ts`
- Check `findJob(dedupKey)` before processing — skip jobs already marked as `applied`
- `upsertJobs(batch)` called after each source completes, persisting all new/seen jobs
- `closeDb()` called at pipeline end

### Step 3: Added CLI commands in `src/cli.ts`
- `--status` — Show job tracking statistics (total, new, seen, applied, saved, rejected)
- `--history` — Show 20 most recent jobs with status emoji indicators
- Added to help text under new "Database" section

### Step 4: Tests
- `src/db/jobs.test.ts` — 8 tests covering insert, update, batch, status, stats, query
- **Total: 135 tests, all passing**

## Usage Examples

```bash
# Check database statistics
job-finder --status

# View recent job history
job-finder --history

# Run scraper (auto-persists to SQLite)
job-finder -e fresher -H rust,solana
```

## Verification
- ✅ `bun test` — 135/135 pass
- ✅ `bun run build` — succeeds

---
*Phase 13 completed: 2026-04-05*
