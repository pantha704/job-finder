import type { PipelineOptions, FilteredJob } from "../types/options";

// Pratham's primary stack — always scored even without explicit --skills flag
const DEFAULT_HIGH_VALUE_SKILLS: Record<string, number> = {
  // Tier 1 — core skills (15 pts each)
  rust: 15,
  solana: 15,
  web3: 15,
  blockchain: 15,
  anchor: 15,            // Solana framework
  // Tier 2 — secondary skills (10 pts each)
  typescript: 10,
  nextjs: 10,
  'next.js': 10,
  wasm: 10,
  'web assembly': 10,
  // Tier 3 — supporting skills (5 pts each)
  react: 5,
  nodejs: 5,
  'node.js': 5,
  javascript: 5,
  // Internship/Fresher keywords (5 pts)
  fresher: 5,
  internship: 5,
  trainee: 5,
  'entry level': 5,
  'entry-level': 5,
};

export const scoreSkillsMatch = (
  job: FilteredJob,
  options: PipelineOptions
): number => {
  let score = 0;

  // Build combined text corpus from job fields for matching
  const jobSkillTokens = [
    ...job.skills.required,
    ...job.skills.preferred,
  ].map(s => s.toLowerCase());

  const titleAndSkillText = [
    job.title.toLowerCase(),
    ...jobSkillTokens,
  ].join(' ');

  // --- Default high-value skill scoring (always active) ---
  for (const [skill, pts] of Object.entries(DEFAULT_HIGH_VALUE_SKILLS)) {
    // Use word-boundary style check to avoid "trust" matching "rust"
    const pattern = new RegExp(`(?<![a-z])${skill.replace('.', '\\.')}(?![a-z])`, 'i');
    if (pattern.test(titleAndSkillText)) {
      if (!job.skills.matched.includes(skill)) {
        job.skills.matched.push(skill);
      }
      score += pts;
    }
  }

  // --- User-specified highlightSkills (additive) ---
  if (options.highlightSkills && options.highlightSkills.length > 0) {
    for (const highlight of options.highlightSkills) {
      const hl = highlight.toLowerCase();
      if (!job.skills.matched.includes(hl) && jobSkillTokens.includes(hl)) {
        job.skills.matched.push(hl);
        score += 15;
      }
    }
  }

  if (job.skills.matched.length > 0) {
    job.skills.highlight = true;
    job.isHighMatch = true;   // skill match always = HIGH MATCH
  }

  return Math.min(score, 60); // cap at 60 pts for skill component
};
