---
phase: "05"
name: "Output Formatting, Sorting & Final Run"
status: complete
---

# Phase 05: Output Formatting, Sorting & Final Run

## Context

This phase covers the final output pipeline: how raw filtered jobs become the `job_opportunities.md` markdown file that Pratham uses for application tracking.

## Key Design Decisions

- **HIGH MATCH jobs sorted first** — ensures Pratham sees his best prospects at top
- **Within tier, newest first** — rolling 14-day window, fresher listings surface first
- **Markdown checklist format** — `- [ ]` entries are directly actionable, can be ticked off
- **Application tracker table** — summary at bottom with columns: Source, Total, Applied, Done
- **Emoji flagging** — 🔥 prefix on HIGH MATCH for quick visual scan

## Output Format Per Job Entry

```markdown
- [ ] **[Title]** @ [Company] | 🔥 HIGH MATCH  
  🔗 Apply: [URL]  
  📋 Source: [site] | 📅 [date] | 💰 [salary or N/A]
```
