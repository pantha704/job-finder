# Phase 14: Interactive Browser — CONTEXT

## Objective
Build a TUI-based job browser for previewing, filtering, and managing job applications.

## Requirements
- **INT-01**: Interactive job browser mode (`--browse`) opens a TUI to preview, filter, and mark jobs
- **INT-02**: User can mark jobs as "Applied", "Rejected", or "Saved" in the interactive browser
- **INT-03**: Interactive mode shows job details, company info, and direct apply links

## Architecture Notes
- Use `@inquirer/prompts` (already installed) for TUI interactions
- `select` for job list navigation, `confirm` for status updates
- Fetch fresh jobs from pipeline or load from SQLite history
- Show job details in a formatted card (title, company, location, salary, skills, score, apply URL)
- After marking status, update SQLite record
- Can filter interactively: by score threshold, by source, by keyword

## Dependencies
- Phase 13 (needs SQLite for status persistence)
- `@inquirer/prompts` (already in package.json)

## Known Challenges
- Terminal width limits how much detail we can show
- Large job lists (300+) need pagination or virtual scrolling
- Copying apply URLs to clipboard may require `xclip`/`wl-copy`

## Files to Create/Modify
- `src/tui/browser.ts` — new file: TUI job browser implementation
- `src/cli.ts` — add `--browse` flag

---
*Created: 2026-04-05 for v2.0 Phase 14*
