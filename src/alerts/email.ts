import type { FilteredJob } from "../types/options";

export interface EmailConfig {
  to: string;
  from: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  frequency: "immediate" | "daily" | "weekly";
}

/**
 * Generate HTML email body for new HIGH MATCH jobs.
 */
export function generateAlertEmail(jobs: FilteredJob[]): string {
  const rows = jobs
    .sort((a, b) => b.matchScore - a.matchScore)
    .map(
      (job) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        <strong>${job.title}</strong><br/>
        <span style="color: #666;">${job.company} · ${job.location.raw}</span><br/>
        <span style="color: #e74c3c;">🔥 Score: ${job.matchScore}/100</span> ·
        <a href="${job.application.url}" style="color: #3498db;">Apply</a>
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
  table { width: 100%; border-collapse: collapse; }
  h1 { color: #2c3e50; }
  .footer { margin-top: 20px; color: #999; font-size: 12px; }
</style></head>
<body>
  <h1>🔥 ${jobs.length} New HIGH MATCH Jobs</h1>
  <p>Here are your top job matches for today:</p>
  <table>${rows}</table>
  <div class="footer">
    <p>Sent by job-finder v2.0 · <a href="https://github.com/pantha704/job-finder">GitHub</a></p>
    <p>To unsubscribe, remove --email-alerts from your config.</p>
  </div>
</body>
</html>`;
}

/**
 * Send email alert with new HIGH MATCH jobs.
 * Uses nodemailer under the hood.
 */
export async function sendAlertEmail(jobs: FilteredJob[], config: EmailConfig): Promise<boolean> {
  if (jobs.length === 0) {
    console.log("[Email] No new HIGH MATCH jobs — skipping alert");
    return false;
  }

  try {
    const { default: nodemailer } = await import("nodemailer");

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    });

    await transporter.sendMail({
      from: config.from,
      to: config.to,
      subject: `🔥 ${jobs.length} New HIGH MATCH Jobs — job-finder`,
      html: generateAlertEmail(jobs),
    });

    console.log(`[Email] Alert sent to ${config.to} with ${jobs.length} jobs`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send alert: ${error}`);
    return false;
  }
}
