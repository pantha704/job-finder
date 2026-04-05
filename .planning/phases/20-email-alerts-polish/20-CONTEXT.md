# Phase 20: Email Alerts & Polish — CONTEXT

## Objective
Send email notifications for new HIGH MATCH jobs, run final QA across all v3.0 features.

## Requirements
- **EA-01**: Email alerts when new HIGH MATCH jobs found
- **EA-02**: Configurable alert frequency (immediate, daily digest, weekly)
- **QA-04**: All v3.0 features have unit/integration tests
- **QA-05**: Full pipeline test with all sources, all filters, all features

## Architecture Notes
- Can use `nodemailer` with Gmail/SendGrid/Resend
- Email config stored in `~/.job-finder/config.json`
- Alert trigger: compare current run's HIGH MATCH jobs against SQLite history
- Only email jobs not previously seen (new dedup key)

## Dependencies
- All previous phases complete
- User email in config

## Known Challenges
- Email deliverability (spam filters)
- Rate limiting on email providers
- Need to handle unsubscribe/pause

## Files to Create/Modify
- `src/alerts/email.ts` — new file: send email notifications
- `src/cli.ts` — add `--email-alerts` flag
- Test suite expansion for v3.0 features

---
*Created: 2026-04-05 for v3.0 Phase 20*
