# Phase 17: Auto-Apply — PLAN

## Objective
Automate job applications via agent-browser using saved profile data.

## Implementation

### Step 1: Create `src/autoapply/detector.ts`
- **`detectPlatform(url)`** — parse apply URL to determine ATS type (workday, greenhouse, lever, ashby, linkedin, other)
- Uses domain patterns and URL structure

### Step 2: Create `src/autoapply/filler.ts`
- Platform-specific form fillers for each ATS type
- Each filler: navigate → fill fields → upload resume → submit
- Dry-run mode: fills form but doesn't click submit

### Step 3: Create `src/autoapply/engine.ts`
- **`autoApply(job, profile, dryRun)`** — main entry point
- Detects platform, runs appropriate filler, updates SQLite status

### Step 4: Add CLI flags in `src/cli.ts`
- `--auto-apply` — auto-apply to HIGH MATCH jobs
- `--dry-run` — preview without submitting
- `--apply-threshold <score>` — minimum match score to auto-apply (default: 60)

## Verification
- Manual testing with real ATS platforms
- Dry-run mode verification

---
*Phase 17 plan: 2026-04-05*
