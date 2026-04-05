import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { updateJobStatus } from "../db/jobs";

const PROFILE_DIR = join(homedir(), ".job-finder");

export interface AutoApplyConfig {
  dryRun: boolean;
  threshold: number;
  skipCompanies: string[];
}

/**
 * Detect the ATS platform from an application URL.
 */
export function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("myworkdayjobs") || lower.includes("wd")) return "workday";
  if (lower.includes("greenhouse.io")) return "greenhouse";
  if (lower.includes("lever.co")) return "lever";
  if (lower.includes("jobs.ashbyhq.com")) return "ashby";
  if (lower.includes("linkedin.com/jobs")) return "linkedin";
  if (lower.includes("jobs.smartrecruiters.com")) return "smartrecruiters";
  if (lower.includes("oraclecloud.com")) return "oracle";
  return "unknown";
}

/**
 * Generate the agent-browser command sequence for applying to a job.
 * Returns a shell command string that can be executed.
 */
export function generateApplyCommand(
  url: string,
  platform: string,
  profilePath: string,
  dryRun: boolean
): string {
  const resumePath = join(homedir(), "Documents", "Pratham_Jaiswal_Resume.pdf");

  // Base agent-browser commands
  const cmds: string[] = [];

  cmds.push(`agent-browser open "${url}" --args "--no-sandbox"`);
  cmds.push("agent-browser wait --load networkidle");

  switch (platform) {
    case "workday":
      cmds.push("agent-browser snapshot -i");
      cmds.push("# Workday: fill first name, last name, email, phone, upload resume");
      cmds.push("agent-browser fill @firstName '<NAME>'");
      cmds.push("agent-browser fill @lastName '<LAST_NAME>'");
      cmds.push("agent-browser fill @email '<EMAIL>'");
      cmds.push("agent-browser fill @phone '<PHONE>'");
      if (!dryRun) {
        cmds.push("agent-browser click @submit");
      }
      break;

    case "greenhouse":
      cmds.push("agent-browser snapshot -i");
      cmds.push("# Greenhouse: fill name, email, resume upload");
      cmds.push("agent-browser fill @first_name '<NAME>'");
      cmds.push("agent-browser fill @last_name '<LAST_NAME>'");
      cmds.push("agent-browser fill @email '<EMAIL>'");
      if (!dryRun) {
        cmds.push("agent-browser click @submit_application");
      }
      break;

    case "lever":
      cmds.push("agent-browser snapshot -i");
      cmds.push("# Lever: fill name, email, resume");
      cmds.push("agent-browser fill @name '<NAME>'");
      cmds.push("agent-browser fill @email '<EMAIL>'");
      if (!dryRun) {
        cmds.push("agent-browser click @submit");
      }
      break;

    default:
      cmds.push("agent-browser snapshot -i");
      cmds.push("# Unknown platform — review form fields manually");
      cmds.push(`echo "Apply URL: ${url}"`);
      break;
  }

  if (dryRun) {
    cmds.push(`echo "DRY RUN — would apply to: ${url}"`);
  }

  return cmds.join(" && ");
}

/**
 * Auto-apply to a single job.
 * Returns true if applied, false if skipped.
 */
export async function autoApplyJob(
  applyUrl: string,
  jobId: string,
  config: AutoApplyConfig
): Promise<boolean> {
  const platform = detectPlatform(applyUrl);

  if (platform === "unknown") {
    console.log(`⚠️  Unknown ATS platform for: ${applyUrl}`);
    return false;
  }

  const cmd = generateApplyCommand(applyUrl, platform, "", config.dryRun);

  if (config.dryRun) {
    console.log(`🔍 DRY RUN — Would apply to ${applyUrl} via ${platform}`);
    return true;
  }

  try {
    const { execSync } = await import("child_process");
    execSync(cmd, { stdio: "inherit", timeout: 120000 });
    updateJobStatus(jobId, "applied");
    console.log(`✅ Applied to ${applyUrl} via ${platform}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to apply to ${applyUrl}: ${error}`);
    return false;
  }
}
