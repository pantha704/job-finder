# Roadmap: Remote Job Aggregator

## Milestones

- ✅ **v1.0 Single-Run Job Scraper** — Phases 1-5 (shipped 2026-04-03) — [.planning/milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Reliability & Coverage** — Phases 6-10 (shipped 2026-04-03) — [.planning/milestones/v1.1-ROADMAP.md](./milestones/v1.1-ROADMAP.md)
- ✅ **v2.0 CLI Enhancements** — Phases 11-15 (shipped 2026-04-05) — archived in `.planning/milestones/v2.0-phases/`
- 🔄 **v3.0 AI-Powered Intelligence** — Phases 16-20 (planned)

## v3.0 Progress

| Phase | Milestone | Plans Complete | Status     | Completed |
|-------|-----------|----------------|------------|-----------|
| 16    | v3.0      | 0/1            | Planned    | —         |
| 17    | v3.0      | 0/1            | Planned    | —         |
| 18    | v3.0      | 0/1            | Planned    | —         |
| 19    | v3.0      | 0/1            | Planned    | —         |
| 20    | v3.0      | 0/1            | Planned    | —         |

## Phase Details

### Phase 16: AI Job Matching
**Goal:** Use Groq LLM to score each job against Pratham's full profile (skills, experience, preferences)
**Requirements:** AI-01, AI-02, AI-03
**Dependencies:** None (uses existing Groq integration)

### Phase 17: Auto-Apply Workflow
**Goal:** Automate job applications via agent-browser with saved profile data
**Requirements:** AA-01, AA-02, AA-03
**Dependencies:** Phase 16 (AI matching identifies best targets)

### Phase 18: LinkedIn Scraper
**Goal:** Add LinkedIn jobs source with auth cookie support
**Requirements:** LI-01, LI-02
**Dependencies:** None (standalone scraper)

### Phase 19: Recommendation Engine
**Goal:** Learn from user actions (applied/saved/rejected) to improve future matches
**Requirements:** RE-01, RE-02, RE-03
**Dependencies:** Phase 13 (SQLite stores action history)

### Phase 20: Email Alerts & Polish
**Goal:** Send email notifications for new HIGH MATCH jobs, final QA
**Requirements:** EA-01, EA-02, QA-04, QA-05
**Dependencies:** All previous phases

---
*Created: 2026-04-05 for v3.0 milestone*
