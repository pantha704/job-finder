---
phase: 01
slug: foundation-project-setup-ethics-browser
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bun test |
| **Config file** | none — bun uses default setup |
| **Quick run command** | `bun test` |
| **Full suite command** | `bun test` |
| **Estimated runtime** | ~1 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun test`
- **After every plan wave:** Run `bun test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | SETUP-01 | build | `bun run src/index.ts` | ❌ W0 | ⬜ pending |
| 1-01-02 | 02 | 1 | SETUP-02 | types | `bun --noEmit src/types.ts` | ❌ W0 | ⬜ pending |
| 1-01-03 | 03 | 1 | ETHI-02/04 | test | `bun test src/utils.test.ts` | ❌ W0 | ⬜ pending |
| 1-01-04 | 04 | 2 | BRWS-01/04 | test | `bun test src/browser.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/utils.test.ts` — test suite for utilities (delay, relative dates, normalization)
- [ ] `src/browser.test.ts` — mock test for Browser connection
- [ ] `playwright` installation

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Camoufox Port Scan | BRWS-01 | Setup requires external app | Run Camoufox externally; verify port connects and logs exact endpoint |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
