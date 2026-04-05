# Phase 11: Advanced Filters — PLAN

## Objective
Implement salary range, company size, and company blacklist filters to give users fine-grained control over job results.

## Implementation (COMPLETED)

### Step 1: Created `src/filters/salary.ts`
- **`normalizeSalary(raw)`** — Parses salary text into structured data (min, max, currency, period)
  - Handles formats: `$125,000`, `$150k`, `₹50K/mo`, ranges with `–`
  - Converts all currencies to annual USD for consistent comparison
  - Uses hardcoded 2026 exchange rates (INR: 0.012, EUR: 1.08, GBP: 1.27)
- **`matchesSalaryFilter(job, options)`** — Filters by min/max salary thresholds
  - Permissive when salary data is unknown (doesn't filter out jobs with missing salary)
  - `maxSalary` acts as a seniority filter (very high salaries likely indicate senior roles)
- **`scoreSalaryMatch(job, options)`** — Scores jobs that meet/exceed minimum threshold

### Step 2: Created `src/filters/company.ts`
- **`matchesCompanyFilter(job, options)`** — Checks blacklist, size, and stage
  - Blacklist is case-insensitive and supports partial name matching
  - Size filter checks range overlap (e.g. "1-10" overlaps with "1-10")
  - Stage filter checks against `CompanyStage` enum values
  - Permissive when job data is unknown
- **`scoreCompanyMatch(job, options)`** — Scores preferred company stage/size

### Step 3: Wired into `src/index.ts`
- Added imports for `normalizeSalary`, `matchesSalaryFilter`, `scoreSalaryMatch`, `matchesCompanyFilter`, `scoreCompanyMatch`
- Added filter calls in pipeline: `if (!matchesSalaryFilter(filteredJob, params)) continue;` and `if (!matchesCompanyFilter(filteredJob, params)) continue;`
- Added scoring calls: `score += scoreSalaryMatch(...)` and `score += scoreCompanyMatch(...)`

### Step 4: Added CLI args in `src/cli.ts`
- `--max-salary <amount>` — Maximum salary threshold (filters out senior roles)
- `--exclude-companies <name1,name2>` — Company blacklist (comma-separated)
- Existing args already supported: `--min-salary`, `--size`, `--stage`

### Step 5: Tests
- `src/filters/salary.test.ts` — 12 tests covering parsing, filtering, and scoring
- `src/filters/company.test.ts` — 12 tests covering blacklist, size, stage, and scoring
- **Total: 127 tests, all passing**

## Usage Examples

```bash
# Filter out jobs paying more than $100k (likely senior roles)
job-finder -e fresher --max-salary 100000

# Exclude specific companies
job-finder -e fresher --exclude-companies "sortwind,tcs,infosys"

# Combine all filters
job-finder -e fresher -H rust,solana --min-salary 50000 --max-salary 150000 --exclude-companies "sortwind"
```

## Verification
- ✅ `bun test` — 127/127 pass
- ✅ `bun run build` — succeeds

---
*Phase 11 completed: 2026-04-05*
