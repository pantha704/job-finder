# Phase 15: Config & Polish — CONTEXT

## Objective
Add global config file for default preferences and complete final QA/testing.

## Requirements
- **CFG-01**: Global config file (`~/.job-finder/config.json`) stores default filters and preferences
- **CFG-02**: Company blacklist can be managed via config file
- **CFG-03**: User can set default salary threshold and company size preferences in config
- **QA-01**: All new filters have unit tests
- **QA-02**: SQLite persistence layer has integration tests
- **QA-03**: Existing tests continue to pass

## Architecture Notes
- Config file: `~/.job-finder/config.json` (same directory as SQLite DB)
- Config merges with CLI args: CLI args take precedence, config provides defaults
- Config schema mirrors `PipelineOptions` but only stores user preferences
- Auto-create config on first run with sensible defaults for Pratham's profile
- QA-01 already done (salary.test.ts, company.test.ts)
- QA-02 already done (jobs.test.ts)
- QA-03: 135/135 tests passing

## Dependencies
- All previous phases (11-14) complete

## Files to Create/Modify
- `src/config/userConfig.ts` — new file: config file management
- `src/cli.ts` — load config and merge with CLI args
- `src/index.ts` — no changes needed (already uses PipelineOptions)

---
*Created: 2026-04-05 for v2.0 Phase 15*
