---
phase: 09
slug: tier-3-unblocking
created: "2026-04-03"
milestone: v1.1
---

# Phase 09 — CONTEXT: Tier 3 Unblocking (Remotive, Jobicy, WWR)

## Domain

Unblock 3 Tier 3 sources blocked by 403 anti-bot: Remotive, Jobicy, WeWorkRemotely. These are lower-priority sources compared to Tier 1/2 but add volume.

## Canonical Refs

- `.planning/REQUIREMENTS.md` — UBK3-01, UBK3-02, UBK3-03
- `src/scrapers/remotive.ts` — 403 blocked
- `src/scrapers/jobicy.ts` — 403 blocked
- `src/scrapers/weworkremotely.ts` — 403 blocked
- `src/browser.ts` — `fetchRendered()` with Camoufox → Playwright → fetch

## Decisions

### Approach
- **Try `fetchRendered()` for all 3** — Camoufox anti-detect may bypass 403
- **If 403 persists** — accept as external limitation (same pattern as Wellfound DataDome)
- **No residential proxies** — out of scope for personal tool
- **Graceful degradation** — log warning, skip, continue

### Remotive (UBK3-01)
- Current: Plain fetch → 403
- Decision: Try `fetchRendered()` first. If 403 persists, accept limitation.

### Jobicy (UBK3-02)
- Current: Plain fetch → 403
- Decision: Same as Remotive.

### WeWorkRemotely (UBK3-03)
- Current: Plain fetch → 403
- Decision: Same as Remotive.

## Defer
- All three if 403 persists after Camoufox attempt

## Scope Creep Guard
This phase is **Tier 3 unblocking only**. No new features.

---
*Context created: 2026-04-03*
