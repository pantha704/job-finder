import { logger } from "../utils/logger";
import type { FilteredJob } from "../types/options";
import type { UserProfile } from "../utils/profileLoader";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export interface AIScore {
  score: number;
  reasoning: string;
}

/**
 * Score a single job against the user profile using Groq LLM.
 */
export async function scoreJobWithAI(
  job: FilteredJob,
  profileText: string,
  apiKey: string
): Promise<AIScore> {
  const prompt = `You are an expert technical recruiter. Score how well this job matches the candidate's profile.

${profileText}

---
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location.raw}
Required Skills: ${job.skills.required.join(", ")}
Description excerpt: ${job.skills.preferred.join(", ")}

Return a JSON object:
{
  "score": 0-100 (integer, how well this job matches the candidate),
  "reasoning": "one sentence explaining the score"
}

Consider: skill match, experience level fit, remote accessibility, and overall alignment with the candidate's Rust/Solana/TypeScript strengths.`;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API Error: ${res.status}`);
    }

    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    const content = data.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content) as AIScore;

    return {
      score: Math.min(100, Math.max(0, parsed.score)),
      reasoning: parsed.reasoning || "No reasoning provided.",
    };
  } catch (error) {
    logger.warn({ err: error }, "AI scoring failed for job, falling back to keyword score");
    return { score: job.matchScore, reasoning: "AI scoring failed, using keyword score." };
  }
}

/**
 * Score multiple jobs in parallel with configurable concurrency.
 */
export async function batchScoreJobs(
  jobs: FilteredJob[],
  profileText: string,
  apiKey: string,
  concurrency: number = 5
): Promise<AIScore[]> {
  const results: AIScore[] = new Array(jobs.length);
  const batches: Promise<void>[] = [];

  for (let i = 0; i < jobs.length; i += concurrency) {
    const batch = jobs.slice(i, i + concurrency);
    const batchStart = i;

    batches.push(
      Promise.all(
        batch.map(async (job, idx) => {
          const score = await scoreJobWithAI(job, profileText, apiKey);
          results[batchStart + idx] = score;
        })
      ).then(() => {})
    );
  }

  await Promise.all(batches);
  return results;
}

/**
 * Combine AI score with keyword score using weighted average.
 */
export function combineScores(keywordScore: number, aiScore: number, aiWeight: number = 0.6): number {
  return Math.round(aiWeight * aiScore + (1 - aiWeight) * keywordScore);
}
