---
wave: 1
depends_on: ["04"]
---

# Plan: Output Formatting, Sorting & Final Run

## Tasks

```xml
<task id="05-01">
  <title>Implement formatter.ts</title>
  <action>
    Generate markdown checklist from FilteredJob[].
    Format per job:
      - [ ] **Title** @ Company | 🔥 HIGH MATCH (if applicable)
        🔗 Apply: URL
        📋 Source: site | 📅 date | 💰 salary
    Append application tracker table at bottom.
  </action>
</task>

<task id="05-02">
  <title>Implement sort in index.ts</title>
  <action>
    Sort order: HIGH MATCH → newest postedAt → alphabetical title.
    Use stable sort to preserve order within tier.
  </action>
</task>

<task id="05-03">
  <title>Wire full pipeline</title>
  <action>
    index.ts: run all tiers sequentially → filter → dedup → sort → formatter → write to job_opportunities.md.
    Log progress every 25 jobs.
  </action>
</task>

<task id="05-04">
  <title>Final run verification</title>
  <action>
    Run full scrape against all sources.
    Verify output: ≥150 unique jobs, no duplicates, HIGH MATCH jobs first.
  </action>
</task>
```

## Success Criteria

1. `job_opportunities.md` has ≥150 `- [ ]` entries
2. HIGH MATCH jobs appear before non-HIGH MATCH
3. No duplicate company+title combinations
4. Application tracker table at bottom with correct totals
5. All apply links are valid URLs
