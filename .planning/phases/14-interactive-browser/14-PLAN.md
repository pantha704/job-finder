# Phase 14: Interactive Browser — PLAN

## Objective
Build a TUI-based job browser for previewing, filtering, and managing job applications.

## Implementation (COMPLETED)

### Step 1: Created `src/tui/browser.ts`
- **`browseJobs(options)`** — Main TUI browser function
  - Uses `@inquirer/prompts` (`select`, `confirm`, `input`) for interactive terminal UI
  - Paginated job list (10 jobs per page) with navigation
  - Full job detail cards with emoji indicators for status
  - Actions: Open Apply Link, Mark as Applied/Saved/Rejected/New, Copy URL, Back
  - Auto-opens URLs in default browser (`xdg-open` on Linux, `open` on macOS)
  - Copies URLs to clipboard (`wl-copy`, `xclip`, or `pbcopy`)
  - Updates SQLite status on status changes

### Step 2: Added CLI flag in `src/cli.ts`
- `-b, --browse` — Launches interactive job browser
- Handler placed before main pipeline (exits after browsing)

### Step 3: Tests
- TUI is interactive and cannot be unit-tested conventionally
- Manual UAT covers all flows

## Usage Examples

```bash
# Launch interactive browser
job-finder --browse

# Browse with score threshold (high matches only)
job-finder --browse --min-score 40

# Browse applied jobs only
job-finder --browse --status applied
```

## Navigation
- **Arrow keys** — Move through job list
- **Enter** — Select job / Open detail view
- **q / Ctrl+C** — Quit

## Actions Per Job
| Action | What It Does |
|--------|-------------|
| 🌐 Open | Opens apply URL in default browser |
| ✅ Mark Applied | Updates SQLite status to 'applied' |
| ⭐ Mark Saved | Updates SQLite status to 'saved' |
| ❌ Mark Rejected | Updates SQLite status to 'rejected' |
| 👀 Reset to New | Resets status to 'new' |
| 📋 Copy URL | Copies apply URL to clipboard |

## Verification
- ✅ `bun run build` — succeeds
- ✅ `bun test` — 135/135 pass (no regression)

---
*Phase 14 completed: 2026-04-05*
