import { logger } from './logger';

// Groq API Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

interface JobAnalysis {
  min_years: number;
  is_fresher_friendly: boolean;
  critical_skills: string[];
  match_confidence: 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * Uses Groq LLM to analyze a job description and extract precise requirements.
 * @param title - Job title
 * @param description - Full job description text
 * @param apiKey - Groq API Key
 * @returns Structured analysis of the job
 */
export async function analyzeJobWithAI(
  title: string,
  description: string,
  apiKey: string
): Promise<JobAnalysis> {
  try {
    const prompt = `
You are an expert technical recruiter. Analyze the following job description and extract the requirements strictly.

Job Title: ${title}
Description: ${description.substring(0, 2000)}

Return a JSON object with the following fields:
- min_years: Minimum years of experience required (integer). If not specified, assume 0.
- is_fresher_friendly: Boolean. True only if the job is explicitly open to freshers, interns, or 0-1 years experience. False if it requires 2+ years.
- critical_skills: Array of top 5 technical skills mentioned as "Required" or "Must have".
- match_confidence: "high" if the role matches the skills perfectly, "medium" if partial, "low" if mismatch.
- reason: A one-sentence explanation of the experience requirement.

Example Output:
{
  "min_years": 3,
  "is_fresher_friendly": false,
  "critical_skills": ["Rust", "Solana", "TypeScript"],
  "match_confidence": "medium",
  "reason": "Requires 3+ years of Rust experience in production systems."
}
`;

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API Error: ${res.status}`);
    }

    const data = await res.json() as { choices: { message: { content: string } }[] };
    const content = data.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as JobAnalysis;

  } catch (error) {
    logger.error({ error }, 'AI Job Analysis failed');
    return {
      min_years: 0,
      is_fresher_friendly: true,
      critical_skills: [],
      match_confidence: 'medium',
      reason: 'Analysis failed, assuming default.',
    };
  }
}
