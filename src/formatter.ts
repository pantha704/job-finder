import fs from "fs/promises";
import type { Job } from "./types";

export function formatJobMarkdown(job: Job): string {
  const flags = [];
  if (job.isHighMatch) flags.push("🔥 HIGH MATCH");
  if (job.isFresher === 'verify') flags.push("⚠️ Verify experience");
  if (job.isRemoteIndia === 'verify') flags.push("⚠️ Verify location");
  
  const flagStr = flags.length > 0 ? ` [${flags.join(", ")}]` : "";
  const techStr = job.techStack && job.techStack.length > 0 ? ` \`[${job.techStack.join(", ")}]\`` : "";
  const salaryStr = job.salary ? ` - 💰 ${job.salary}` : "";
  
  return `- [ ] **${job.title}** at **${job.company}**${flagStr}${techStr}${salaryStr}
  - Apply: ${job.applyUrl}
  - Source: ${job.source}`;
}

export async function appendJobsToFile(filePath: string, jobs: Job[]) {
  if (jobs.length === 0) return;
  const content = jobs.map(formatJobMarkdown).join("\n");
  await fs.appendFile(filePath, content + "\n");
}
