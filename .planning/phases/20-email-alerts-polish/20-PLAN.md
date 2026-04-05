# Phase 20: Email Alerts & Polish — PLAN

## Objective
Email notifications for new HIGH MATCH jobs, final QA.

## Implementation

### Step 1: Create `src/alerts/email.ts`
- **`sendAlert(jobs, config)`** — send email with new HIGH MATCH jobs
- Uses nodemailer with user's SMTP config
- Template: formatted HTML with job cards (title, company, score, apply link)

### Step 2: Add CLI flag in `src/cli.ts`
- `--email-alerts` — send email when new HIGH MATCH jobs found
- Config from `~/.job-finder/config.json`

### Step 3: Final QA
- Test all v3.0 features end-to-end
- Update test suite for all new modules
- Verify build, publish flow

## Verification
- `bun test` — all tests pass
- `bun run build` — succeeds
- Manual email send test

---
*Phase 20 plan: 2026-04-05*
