# Roadmap: Remote Job Aggregator

## Milestones

- ✅ **v1.0 Single-Run Job Scraper** — Phases 1-5 (shipped 2026-04-03) — [.planning/milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Reliability & Coverage** — Phases 6-10 (shipped 2026-04-03) — [.planning/milestones/v1.1-ROADMAP.md](./milestones/v1.1-ROADMAP.md)
- 🔄 **v2.0 CLI Enhancements** — Phases 11-15 (in progress)

## v2.0 Progress

| Phase | Milestone | Plans Complete | Status     | Completed |
|-------|-----------|----------------|------------|-----------|
| 11    | v2.0      | 0/1            | Planned    | —         |
| 12    | v2.0      | 0/1            | Planned    | —         |
| 13    | v2.0      | 0/1            | Planned    | —         |
| 14    | v2.0      | 0/1            | Planned    | —         |
| 15    | v2.0      | 0/1            | Planned    | —         |

## Phase Details

### Phase 11: Advanced Filters
**Goal:** Implement salary range, company size, and blacklist filters.
**Requirements:** FLT-01, FLT-02, FLT-03, FLT-04
**Dependencies:** None (builds on existing filter infrastructure)

### Phase 12: Export Formats
**Goal:** Add CSV and JSON export capabilities alongside existing markdown.
**Requirements:** OUT-01, OUT-02, OUT-03
**Dependencies:** Phase 11 (filters affect export output)

### Phase 13: SQLite Persistence
**Goal:** Store seen jobs and application status in a local SQLite database.
**Requirements:** OUT-04, OUT-05
**Dependencies:** Phase 12 (export formats inform data schema)

### Phase 14: Interactive Browser
**Goal:** Build a TUI-based job browser for previewing and managing applications.
**Requirements:** INT-01, INT-02, INT-03
**Dependencies:** Phase 13 (needs job history from SQLite)

### Phase 15: Configuration & Polish
**Goal:** Global config file, default preferences, and final QA.
**Requirements:** CFG-01, CFG-02, CFG-03, QA-01, QA-02, QA-03
**Dependencies:** All previous phases

---
*Created: 2026-04-05 for v2.0 milestone*
