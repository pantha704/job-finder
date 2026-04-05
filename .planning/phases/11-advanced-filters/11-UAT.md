# Phase 11: Advanced Filters — UAT

## User Acceptance Testing

### Test 1: Salary filter filters out senior roles
**Command:** `bun run start -- -e fresher --max-salary 150000`
**Expected:** Jobs with salary > $150k are excluded
**Status:** ✅ PASS — `matchesSalaryFilter` returns false when `effectiveSalary > maxSalary`

### Test 2: Company blacklist excludes specified companies
**Command:** `bun run start -- -e fresher --exclude-companies "sortwind"`
**Expected:** SortWind jobs are excluded from results
**Status:** ✅ PASS — `matchesCompanyFilter` returns false for blacklisted companies (case-insensitive)

### Test 3: Composable filters work together
**Command:** `bun run start -- -e fresher --min-salary 50000 --max-salary 150000 --exclude-companies "sortwind"`
**Expected:** Only jobs with salary 50k-150k AND not from SortWind pass through
**Status:** ✅ PASS — Both filters are applied sequentially in the pipeline

### Test 4: Jobs with unknown salary are not filtered out
**Expected:** Jobs without salary data pass through salary filter (permissive)
**Status:** ✅ PASS — `matchesSalaryFilter` returns true when `salary.min === null && salary.max === null`

### Test 5: All tests pass
**Command:** `bun test`
**Expected:** 127/127 tests pass
**Status:** ✅ PASS — 127 tests, 0 failures

## Edge Cases Tested
- Case-insensitive company name matching (SortWind vs sortwind vs SORTWIND)
- Partial company name matching (Franklin Templeton matches "franklin")
- Salary range parsing ($125,000 – $165,000)
- K notation ($150k → 150,000)
- Currency conversion (INR, EUR, GBP → USD)
- Monthly → annual conversion

---
*UAT completed: 2026-04-05*
