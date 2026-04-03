import fs from "fs/promises";
import type { FilteredJob, PipelineOptions } from "./types/options";

export function generateMarkdownReport(jobs: FilteredJob[], options: PipelineOptions): string {
  const highMatches = jobs.filter(j => j.isHighMatch).sort((a, b) => b.matchScore - a.matchScore);
  const otherJobs = jobs.filter(j => !j.isHighMatch).sort((a, b) => b.matchScore - a.matchScore);
  
  const sourcesCount = jobs.reduce((acc, job) => {
    acc[job.metadata.source] = (acc[job.metadata.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const profileStr = options.roles?.join(' | ') || 'Configured Roles';
  const locationStr = options.locationScope || 'Remote';
  const expStr = options.experience || 'Fresher/Intern';
  
  let md = `# Remote Job Opportunities for Fresher Developers\n\n`;
  md += `> Generated: ${new Date().toLocaleString()}\n`;
  md += `> Profile: ${profileStr}\n`;
  md += `> Filter: ${locationStr} | ${expStr}\n`;
  md += `> **Total: ${jobs.length} jobs** | 🔥 High Match: ${highMatches.length}\n\n`;
  md += `---\n`;
  
  if (highMatches.length > 0) {
    md += `## 🔥 High Match Jobs (${highMatches.length})\n\n`;
    md += highMatches.map(formatJobMarkdown).join("\n\n");
    md += `\n\n---\n\n`;
  }
  
  if (otherJobs.length > 0) {
    md += `## 📋 All Remote Fresher Jobs (${otherJobs.length})\n\n`;
    md += otherJobs.map(formatJobMarkdown).join("\n\n");
    md += `\n\n---\n\n`;
  }
  
  md += `## 📊 Application Tracker\n\n`;
  md += `| Source | Jobs Found | Applied |\n`;
  md += `|--------|-----------|---------|\n`;
  
  for (const [source, count] of Object.entries(sourcesCount).sort((a, b) => b[1] - a[1])) {
    md += `| ${source} | ${count} | ☐ 0 |\n`;
  }
  md += `| **TOTAL** | **${jobs.length}** | **0** |\n`;
  
  return md;
}

export function formatJobMarkdown(job: FilteredJob): string {
  const flags = [];
  if (job.isHighMatch) flags.push(`[🔥 HIGH MATCH (score: ${Math.round(job.matchScore)})]`);
  if (job.warnings && job.warnings.length > 0) {
    flags.push(`[⚠️ ${job.warnings.join(", ")}]`);
  }
  
  const flagStr = flags.length > 0 ? ` ${flags.join(" ")}` : "";
  const techStack = job.skills.matched.length ? job.skills.matched : job.skills.required;
  const techStr = techStack && techStack.length > 0 ? ` \`${techStack.join(" · ")}\`` : "";
  const salaryStr = job.compensation?.raw ? ` · 💰 ${job.compensation.raw}` : "";
  const dateStr = job.temporal.postedDate ? ` · 📅 ${new Date(job.temporal.postedDate).toLocaleDateString()}` : "";
  
  return `- [ ] **${job.title}** @ **${job.company}**${flagStr}${techStr}${salaryStr}${dateStr}
  - 🔗 [Apply](${job.application.url}) · Source: ${job.metadata.source}`;
}

export async function writeMarkdownReport(filePath: string, jobs: FilteredJob[], options: PipelineOptions) {
  const content = generateMarkdownReport(jobs, options);
  await fs.writeFile(filePath, content);
}
