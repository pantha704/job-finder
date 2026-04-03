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

export function generateJsonReport(jobs: FilteredJob[], options: PipelineOptions): string {
  return JSON.stringify({
    generated: new Date().toISOString(),
    profile: { roles: options.roles, experience: options.experience, locationScope: options.locationScope },
    total: jobs.length,
    highMatchCount: jobs.filter(j => j.isHighMatch).length,
    jobs: jobs.map(j => ({
      title: j.title,
      company: j.company,
      location: j.location.raw,
      experience: j.experience.raw,
      workType: j.workType,
      compensation: j.compensation.raw || null,
      skills: j.skills.matched.length ? j.skills.matched : j.skills.required,
      isHighMatch: j.isHighMatch,
      matchScore: Math.round(j.matchScore),
      url: j.application.url,
      source: j.metadata.source,
      postedDate: j.temporal.postedDate.toISOString(),
    })),
  }, null, 2);
}

export async function writeJsonReport(filePath: string, jobs: FilteredJob[], options: PipelineOptions) {
  const content = generateJsonReport(jobs, options);
  await fs.writeFile(filePath, content);
}

export function generateCsvReport(jobs: FilteredJob[]): string {
  const headers = ['Title', 'Company', 'Location', 'Experience', 'WorkType', 'Compensation', 'Skills', 'HighMatch', 'Score', 'URL', 'Source', 'PostedDate'];
  const rows = [headers.join(',')];

  for (const j of jobs) {
    const skills = (j.skills.matched.length ? j.skills.matched : j.skills.required).join('; ');
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    rows.push([
      escape(j.title),
      escape(j.company),
      escape(j.location.raw),
      escape(j.experience.raw),
      escape(j.workType),
      escape(j.compensation.raw || ''),
      escape(skills),
      j.isHighMatch ? 'true' : 'false',
      String(Math.round(j.matchScore)),
      escape(j.application.url),
      escape(j.metadata.source),
      j.temporal.postedDate.toISOString(),
    ].join(','));
  }

  return rows.join('\n');
}

export async function writeCsvReport(filePath: string, jobs: FilteredJob[]) {
  const content = generateCsvReport(jobs);
  await fs.writeFile(filePath, content);
}
