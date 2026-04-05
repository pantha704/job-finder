# Phase 15: Config & Polish — UAT

## User Acceptance Testing

### Test 1: Config auto-creates on first run
**Command:** `rm -f ~/.job-finder/config.json && job-finder --help`
**Expected:** Config file created with default values
**Status:** ✅ PASS — `~/.job-finder/config.json` created with fresher defaults

### Test 2: Config values are used as defaults
**Action:** Edit config to set `highlightSkills: ["rust", "solana"]`, run without `-H` flag
**Expected:** Rust and Solana jobs flagged as HIGH MATCH
**Status:** ✅ PASS — Config values merged into pipeline options

### Test 3: CLI args override config
**Action:** Set `experience: "fresher"` in config, run with `-e junior`
**Expected:** Junior experience filter applied (not fresher)
**Status:** ✅ PASS — `mergeConfig` correctly prioritizes CLI args

### Test 4: Company blacklist works from config
**Action:** Add `"excludeCompanies": ["sortwind"]` to config
**Expected:** SortWind jobs excluded from results
**Status:** ✅ PASS — Blacklist filter reads from merged config

### Test 5: Salary thresholds from config
**Action:** Set `"maxSalary": 150000` in config
**Expected:** Jobs above $150k filtered out (seniority guard)
**Status:** ✅ PASS — Salary filter uses merged config values

### Test 6: All QA requirements met
- **QA-01** ✅ All new filters have unit tests (24 tests)
- **QA-02** ✅ SQLite persistence has integration tests (8 tests)
- **QA-03** ✅ All 141 tests pass

## Config File Contents (Default)
```json
{
  "experience": "fresher",
  "locationScope": "remote-global",
  "highlightSkills": ["rust", "solana", "typescript", "nextjs"],
  "excludeCompanies": [],
  "format": "md",
  "showScore": true,
  "maxPagesPerSource": 3,
  "sources": ["internshala", "web3career", "remoteok", "solanajobs", "cutshort", "himalayas", "remoterocketship", "unstop"],
  "_initialized": true
}
```

---
*UAT completed: 2026-04-05*
