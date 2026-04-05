# Phase 15: Config & Polish — PLAN

## Objective
Add global config file for default preferences and complete final QA/testing.

## Implementation (COMPLETED)

### Step 1: Created `src/config/userConfig.ts`
- **`loadUserConfig()`** — Loads `~/.job-finder/config.json`, auto-creates with defaults
- **`mergeConfig(userConfig, cliOptions)`** — CLI args override config values
- **`getConfigPath()`** — Returns config path for display
- Default config tailored to Pratham's profile: fresher, remote-global, highlight rust/solana/ts/nextjs

### Step 2: Wired into `src/cli.ts`
- `loadUserConfig()` called at start of `main()`
- `mergeConfig()` combines config file values with CLI args
- CLI args always take precedence

### Step 3: Tests
- `src/config/userConfig.test.ts` — 6 tests covering load, merge, and precedence
- **Total: 141 tests, all passing**

### Step 4: QA Status
- **QA-01** ✅ All new filters have unit tests (salary.test.ts: 12, company.test.ts: 12)
- **QA-02** ✅ SQLite persistence has integration tests (jobs.test.ts: 8)
- **QA-03** ✅ All 141 tests pass (up from 103)

## Config File Structure

`~/.job-finder/config.json`:
```json
{
  "experience": "fresher",
  "locationScope": "remote-global",
  "highlightSkills": ["rust", "solana", "typescript", "nextjs"],
  "excludeCompanies": [],
  "minSalary": null,
  "maxSalary": null,
  "format": "md",
  "showScore": true,
  "maxPagesPerSource": 3,
  "sources": ["internshala", "web3career", "remoteok", ...],
  "_initialized": true
}
```

## Usage

```bash
# First run auto-creates config file
job-finder

# Edit config to customize defaults
nano ~/.job-finder/config.json

# CLI args still override config
job-finder --min-salary 50000 --exclude-companies "sortwind"
```

## Verification
- ✅ `bun test` — 141/141 pass
- ✅ `bun run build` — succeeds

---
*Phase 15 completed: 2026-04-05*
