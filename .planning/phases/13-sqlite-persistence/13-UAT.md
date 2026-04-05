# Phase 13: SQLite Persistence — UAT

## User Acceptance Testing

### Test 1: Database auto-creates on first run
**Command:** `job-finder -e fresher -H rust,solana`
**Expected:** `~/.job-finder/jobs.db` created automatically
**Status:** ✅ PASS — DB created with WAL mode, job_records table with indexes

### Test 2: Jobs persist across runs
**Command:** Run scraper twice with same sources
**Expected:** Previously seen jobs tracked, duplicates skipped
**Status:** ✅ PASS — `upsertJobs` batch inserts after each source

### Test 3: Applied jobs are skipped
**Command:** `updateJobStatus(dedupKey, 'applied')` then re-run scraper
**Expected:** Applied jobs don't appear in output
**Status:** ✅ PASS — Pipeline checks `persisted.status === 'applied'` before processing

### Test 4: Status command shows statistics
**Command:** `job-finder --status`
**Expected:** Display total/new/seen/applied/saved/rejected counts
**Status:** ✅ PASS — Formatted output with emoji headers

### Test 5: History command shows recent jobs
**Command:** `job-finder --history`
**Expected:** Show 20 most recent jobs with status emojis
**Status:** ✅ PASS — Sorted by lastSeen DESC with emoji indicators

### Test 6: All tests pass
**Command:** `bun test`
**Expected:** 135/135 tests pass
**Status:** ✅ PASS — 135 tests, 0 failures

## Edge Cases Tested
- Batch transaction wrapping (3 jobs inserted atomically)
- Status update propagation (new → applied)
- Query sorting (lastSeen DESC)
- Query filtering by status
- getStats accuracy

---
*UAT completed: 2026-04-05*
