# Phase 16: AI Job Matching — CONTEXT

## Objective
Use Groq LLM to score each job against Pratham's full profile (skills, experience, preferences, GitHub repos, resume keywords) for more intelligent matching than keyword-based scoring.

## Requirements
- **AI-01**: Each job scored by LLM against user profile (0-100 scale)
- **AI-02**: AI score combined with existing keyword score (weighted average)
- **AI-03**: AI reasoning stored in job warnings for transparency

## Architecture Notes
- Existing `verifyJobsWithAI` already calls `analyzeJobWithAI` from `src/utils/llm_parser.ts`
- Currently only used for HIGH MATCH verification — need to expand to ALL jobs
- Profile data available at `~/.job-finder/profile.json`
- `--ai-verify` flag already exists in CLI but needs `aiApiKey` wired to pipeline
- Groq LLM (llama-3.3-70b) is fast (~1s per job) — need batching or async parallel calls

## Dependencies
- Phase 13 (SQLite stores AI scores)
- Existing Groq API integration (`src/utils/llm_parser.ts`)

## Known Challenges
- 300+ jobs × 1s each = 5 min pipeline — need parallel calls or sampling
- Cost: ~$0.01 per 1K tokens — manageable with Groq
- Profile data structure needs standardization for consistent AI prompts

## Files to Create/Modify
- `src/utils/profileLoader.ts` — new file: load and format user profile
- `src/ai/matcher.ts` — new file: parallel AI job scoring
- `src/index.ts` — integrate AI matching into pipeline scoring
- `src/cli.ts` — wire `--ai-match` flag

---
*Created: 2026-04-05 for v3.0 Phase 16*
