# STATE.md — Project Memory

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-04-03)

**Core value:** Produce `job_opportunities.md` with 150+ verified remote fresher job links, Rust/Solana/TS flagged
**Current focus:** Phase 1 — Foundation (project setup, browser integration, ethics)

## Current State

**Milestone:** v1.0
**Phase:** 1 (not started)
**Status:** Ready to plan Phase 1

## What's Done

- [x] Project initialized (git, config)
- [x] Research complete (STACK, FEATURES, ARCHITECTURE, PITFALLS, SUMMARY)
- [x] Requirements defined (32 v1 requirements)
- [x] Roadmap created (5 phases, 100% coverage)

## Key Context for Next Agent

1. **Camoufox ≠ Chrome CDP** — uses Firefox Juggler protocol via Playwright, not `http://localhost:9377/json/version`
2. **Bun is required** — not Node.js, not npm
3. **3s delay mandatory** between requests — ethical constraint
4. **Output file**: `./job_opportunities.md` (project root)
5. **Success threshold**: 150+ unique jobs after dedup+filter
6. **HIGH MATCH keywords**: Rust, Solana, TypeScript, Next.js

## Blockers

None.

---
*STATE.md initialized: 2026-04-03*
