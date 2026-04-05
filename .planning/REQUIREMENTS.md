# Milestone v2.0 Requirements: CLI Enhancements

## Filters & Control

- [ ] **FLT-01**: User can filter jobs by minimum salary/stipend (e.g., `--min-salary 50000`)
- [ ] **FLT-02**: User can filter jobs by company size (e.g., `--company-size 1-50` for startups)
- [ ] **FLT-03**: User can specify a blacklist of companies to exclude (via CLI flag or config file)
- [ ] **FLT-04**: All filters are composable and work together in a single pipeline run

## Output & Persistence

- [ ] **OUT-01**: User can export results to CSV format (`--format csv`)
- [ ] **OUT-02**: User can export results to JSON format (`--format json`)
- [ ] **OUT-03**: User can export results to all formats simultaneously (`--format all`)
- [ ] **OUT-04**: SQLite database stores seen jobs across runs to prevent duplicate notifications
- [ ] **OUT-05**: User can query job history and application status from the SQLite database

## Interactive Experience

- [ ] **INT-01**: Interactive job browser mode (`--browse`) opens a TUI to preview, filter, and mark jobs
- [ ] **INT-02**: User can mark jobs as "Applied", "Rejected", or "Saved" in the interactive browser
- [ ] **INT-03**: Interactive mode shows job details, company info, and direct apply links

## Configuration

- [ ] **CFG-01**: Global config file (`~/.job-finder/config.json`) stores default filters and preferences
- [ ] **CFG-02**: Company blacklist can be managed via config file
- [ ] **CFG-03**: User can set default salary threshold and company size preferences in config

## Quality

- [ ] **QA-01**: All new filters have unit tests
- [ ] **QA-02**: SQLite persistence layer has integration tests
- [ ] **QA-03**: Existing 96 unit tests continue to pass

---
*Created: 2026-04-05 for v2.0 milestone*
