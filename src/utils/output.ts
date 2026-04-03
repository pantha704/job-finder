import { appendFileSync } from "fs";
import { FilteredJob, PipelineOptions } from "../types/options";

export const writeJobToOutput = (job: FilteredJob, options: PipelineOptions) => {
  const file = options.output || 'job_opportunities.md';
  
  if (options.format === 'md' || options.format === 'all') {
    const highMatchLabel = job.isHighMatch ? " 🔥 **HIGH MATCH**" : "";
    const matchesList = job.skills.matched.length > 0 ? ` _(Matched: ${job.skills.matched.join(', ')})_` : "";

    const content = `
### [ ] [${job.title}](${job.application.url}) ${highMatchLabel}
**Company**: ${job.company}  
**Location**: ${job.location.raw} | **Experience**: ${job.experience.raw} | **Type**: ${job.workType}  
**Skills**: ${job.skills.required.join(', ')} ${matchesList}  
**Score**: ${job.matchScore}/100 | **Source**: ${job.metadata.source}
`;

    appendFileSync(file, content, 'utf-8');
  }

  // Implementation for other formats can be added here
};
