# Phase 19: Recommendation Engine — CONTEXT

## Objective
Learn from user actions (applied/saved/rejected) to improve future job matching scores.

## Requirements
- **RE-01**: Track user actions in SQLite (applied, saved, rejected, ignored)
- **RE-02**: Adjust future job scores based on action patterns
- **RE-03**: Surface similar jobs to ones the user applied to

## Architecture Notes
- SQLite already tracks job records with status field (`new`, `applied`, `saved`, `rejected`)
- Can analyze patterns: company size, salary range, tech stack, source, location
- Simple approach: boost scores for jobs matching attributes of applied jobs
- Advanced approach: lightweight collaborative filtering based on skill co-occurrence

## Dependencies
- Phase 13 (SQLite stores action history)
- Phase 16 (AI matching scores)

## Known Challenges
- Cold start problem: no data until user has applied to several jobs
- Over-fitting: recommending only one type of job
- Need to balance exploration vs exploitation

## Files to Create/Modify
- `src/recommender/engine.ts` — new file: pattern analysis and score adjustment
- `src/index.ts` — integrate recommender into pipeline scoring

---
*Created: 2026-04-05 for v3.0 Phase 19*
