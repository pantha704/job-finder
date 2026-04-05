# Phase 16: AI Job Matching — PLAN

## Objective
Use Groq LLM to score each job against Pratham's full profile for intelligent matching.

## Implementation

### Step 1: Create `src/utils/profileLoader.ts`
- Load `~/.job-finder/profile.json`
- Format profile into a structured prompt string
- Include: name, skills (Rust, TS, Next.js, Solana), experience level, location, GitHub repos, resume keywords

### Step 2: Create `src/ai/matcher.ts`
- **`scoreJobWithAI(job, profile, apiKey)`** — sends job + profile to Groq, returns 0-100 score + reasoning
- **`batchScoreJobs(jobs, profile, apiKey, concurrency)`** — parallel scoring with configurable concurrency (default 5)
- Handles rate limiting, retries, fallback to keyword score on failure

### Step 3: Integrate into `src/index.ts`
- New pipeline option: `aiMatchScore: boolean`
- When enabled: run `batchScoreJobs` after keyword scoring
- Combined score: `0.6 * aiScore + 0.4 * keywordScore` (configurable weights)
- Store AI reasoning in `job.warnings`

### Step 4: Add CLI flag in `src/cli.ts`
- `--ai-match` — enable AI job matching (requires `GROQ_API_KEY` or `NVAPI_KEY`)
- `--ai-weight <0-1>` — AI score weight in combined score (default: 0.6)

### Step 5: Tests
- `src/ai/matcher.test.ts` — unit tests for profile loading and scoring
- Mock Groq API responses for deterministic testing

## Verification
- `bun test` — all tests pass
- `bun run build` — succeeds

---
*Phase 16 plan: 2026-04-05*
