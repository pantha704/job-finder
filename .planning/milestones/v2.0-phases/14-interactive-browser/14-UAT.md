# Phase 14: Interactive Browser — UAT

## User Acceptance Testing

### Test 1: Browse command launches TUI
**Command:** `job-finder --browse`
**Expected:** Interactive job list appears with paginated navigation
**Status:** ✅ PASS — TUI launches with 10 jobs per page, arrow key navigation works

### Test 2: Job detail card displays correctly
**Action:** Select a job from the list
**Expected:** Full details shown (title, company, source, status, score, URL, dates)
**Status:** ✅ PASS — Formatted card with all fields displayed

### Test 3: Mark as Applied updates SQLite
**Action:** Select "✅ Mark as Applied" on a job
**Expected:** Job status changes to 'applied' in SQLite, reflected in UI
**Status:** ✅ PASS — Status emoji changes from 👀 to ✅

### Test 4: Open URL in browser
**Action:** Select "🌐 Open Apply Link"
**Expected:** Default browser opens the job's apply URL
**Status:** ✅ PASS — Uses `xdg-open` on Linux

### Test 5: Copy URL to clipboard
**Action:** Select "📋 Copy URL to Clipboard"
**Expected:** URL copied to system clipboard
**Status:** ✅ PASS — Works with `wl-copy` / `xclip` on Linux

### Test 6: Mark as Saved/Rejected
**Action:** Use status change actions
**Expected:** Status updates in SQLite and UI reflects change
**Status:** ✅ PASS — All status transitions work correctly

### Test 7: Pagination navigation
**Action:** Navigate between pages with Previous/Next
**Expected:** Correct page boundaries, no index out of bounds
**Status:** ✅ PASS — 10 jobs per page, wraps correctly

### Test 8: Quit cleanly
**Action:** Select "❌ Quit" or press Ctrl+C
**Expected:** Exit with goodbye message, no errors
**Status:** ✅ PASS — Clean exit

### Test 9: Empty database handling
**Command:** `job-finder --browse` (with empty DB)
**Expected:** Helpful message telling user to run scraper first
**Status:** ✅ PASS — Shows usage hint

## Edge Cases Tested
- Zero jobs in database → friendly error message
- Single job → pagination handles gracefully
- Large job list (100+) → pagination works correctly
- Status persistence → changes survive browser restart

---
*UAT completed: 2026-04-05*
