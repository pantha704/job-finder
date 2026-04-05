# Phase 17: Auto-Apply — CONTEXT

## Objective
Automate job applications via agent-browser using saved profile data from `~/.job-finder/profile.json`.

## Requirements
- **AA-01**: Auto-fill application forms with profile data (name, email, phone, resume, cover letter)
- **AA-02**: Support multiple ATS platforms (Workday, Greenhouse, Lever, Ashby)
- **AA-03**: Track application status in SQLite with timestamps

## Architecture Notes
- Profile data already exists at `~/.job-finder/profile.json`
- `agent-browser` skill is installed and tested
- ATS detection: parse apply URL to determine platform type
- Each ATS has different form structure — need platform-specific fill strategies
- Resume upload via file input: `~/Documents/Pratham_Jaiswal_Resume.pdf`

## Dependencies
- Phase 16 (AI matching identifies best targets to apply to)
- Phase 13 (SQLite tracks application status)
- `agent-browser` CLI installed

## Known Challenges
- CAPTCHA blocks on some ATS platforms
- File upload automation varies by browser
- Some applications redirect to external portals (LinkedIn Easy Apply, etc.)
- Need dry-run mode to preview without submitting

## Files to Create/Modify
- `src/autoapply/detector.ts` — new file: detect ATS platform from URL
- `src/autoapply/filler.ts` — new file: fill forms for each platform
- `src/autoapply/engine.ts` — new file: orchestrate auto-apply flow
- `src/cli.ts` — add `--auto-apply` and `--dry-run` flags

---
*Created: 2026-04-05 for v3.0 Phase 17*
