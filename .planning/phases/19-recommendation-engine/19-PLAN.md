# Phase 19: Recommendation Engine — PLAN

## Objective
Learn from user actions to improve future job matching.

## Implementation

### Step 1: Create `src/recommender/engine.ts`
- **`analyzePatterns()`** — analyze SQLite history for applied/saved/rejected patterns
- **`adjustScores(jobs, patterns)`** — boost scores for jobs matching applied job attributes
- Pattern types: skill co-occurrence, salary range, company size, source, location

### Step 2: Integrate into `src/index.ts`
- Run after AI matching, before final output
- Small adjustment (±5 points) to avoid overriding primary signals

## Verification
- Test with mock SQLite history
- Verify score adjustments are reasonable

---
*Phase 19 plan: 2026-04-05*
