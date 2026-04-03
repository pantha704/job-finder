import type { PipelineOptions, FilteredJob } from "../types/options";

export const scoreSkillsMatch = (
  job: FilteredJob,
  options: PipelineOptions
): number => {
  let score = 0;
  
  if (options.highlightSkills && options.highlightSkills.length > 0) {
    const jobSkills = [...job.skills.required, ...job.skills.preferred].map(s => s.toLowerCase());
    
    for (const highlight of options.highlightSkills) {
      if (jobSkills.includes(highlight.toLowerCase())) {
        job.skills.matched.push(highlight);
        score += 15;
      }
    }

    if (job.skills.matched.length > 0) {
      job.skills.highlight = true;
      job.isHighMatch = true;
    }
  }

  return Math.min(score, 50); // Max skill score 50
};
