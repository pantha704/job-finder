import chalk from "chalk";
import { select, confirm, input } from "@inquirer/prompts";
import { queryHistory, updateJobStatus, JobRecord } from "../db/jobs";

export type BrowseSource = 'live' | 'history';

export interface BrowseOptions {
  source: BrowseSource;
  limit?: number;
  statusFilter?: string;
  scoreThreshold?: number;
}

interface JobDisplay {
  value: string;
  name: string;
  record: JobRecord;
}

/**
 * Format a job record for display in the TUI.
 */
const formatJobLine = (job: JobRecord): string => {
  const statusEmoji =
    job.status === 'applied' ? '✅' :
    job.status === 'saved' ? '⭐' :
    job.status === 'rejected' ? '❌' :
    '👀';

  const score = job.matchScore >= 40
    ? chalk.redBright(`🔥 ${job.matchScore}`)
    : chalk.gray(`${job.matchScore}`);

  return `${statusEmoji} [${score}] ${job.title} @ ${job.company} (${job.source})`;
};

/**
 * Display full job details card.
 */
const showJobCard = (job: JobRecord): void => {
  console.log('\n' + chalk.bold.cyan('═'.repeat(60)));
  console.log(chalk.bold.cyan('  📋 JOB DETAILS'));
  console.log(chalk.bold.cyan('═'.repeat(60)));
  console.log(`  ${chalk.bold('Title:')}    ${job.title}`);
  console.log(`  ${chalk.bold('Company:')}  ${job.company}`);
  console.log(`  ${chalk.bold('Source:')}   ${job.source}`);
  console.log(`  ${chalk.bold('Status:')}   ${job.status.toUpperCase()}`);
  console.log(`  ${chalk.bold('Score:')}    ${job.matchScore}/100`);
  console.log(`  ${chalk.bold('High Match:')} ${job.isHighMatch ? '🔥 YES' : 'No'}`);
  console.log(`  ${chalk.bold('URL:')}      ${job.applyUrl}`);
  console.log(`  ${chalk.bold('First Seen:')} ${new Date(job.firstSeen).toLocaleDateString()}`);
  console.log(`  ${chalk.bold('Last Seen:')}  ${new Date(job.lastSeen).toLocaleDateString()}`);
  console.log(chalk.bold.cyan('═'.repeat(60)) + '\n');
};

/**
 * Interactive TUI job browser.
 */
export async function browseJobs(options?: BrowseOptions): Promise<void> {
  // Load jobs from history (live scraping + SQLite merge happens in the pipeline)
  let jobs = queryHistory({
    limit: options?.limit || 100,
    status: options?.statusFilter as any,
  });

  // Apply score threshold filter
  if (options?.scoreThreshold) {
    jobs = jobs.filter(j => j.matchScore >= options.scoreThreshold!);
  }

  if (jobs.length === 0) {
    console.log(chalk.yellow('\nNo jobs found in database. Run the scraper first with:'));
    console.log(chalk.cyan('  job-finder -e fresher -H rust,solana\n'));
    return;
  }

  console.log(chalk.bold(`\n🔍 Browsing ${jobs.length} jobs\n`));

  let currentIndex = 0;

  while (true) {
    // Build choices for the select menu (show 10 at a time)
    const pageSize = 10;
    const startIdx = Math.floor(currentIndex / pageSize) * pageSize;
    const pageJobs = jobs.slice(startIdx, startIdx + pageSize);

    const choices: { value: string; name: string; record: JobRecord }[] = pageJobs.map((job, idx) => ({
      value: `job-${startIdx + idx}`,
      name: formatJobLine(job),
      record: job,
    }));

    // Add navigation and action choices
    choices.push(
      { value: 'prev-page', name: chalk.yellow('⬆️  Previous Page'), record: jobs[0] },
      { value: 'next-page', name: chalk.yellow('⬇️  Next Page'), record: jobs[0] },
      { value: 'quit', name: chalk.red('❌ Quit'), record: jobs[0] },
    );

    const selectedValue = await select({
      message: `Jobs ${startIdx + 1}-${Math.min(startIdx + pageSize, jobs.length)} of ${jobs.length} (select action):`,
      choices,
      default: `job-${currentIndex}`,
    });

    if (selectedValue === 'quit') {
      console.log(chalk.yellow('\n👋 Goodbye!'));
      break;
    }

    if (selectedValue === 'prev-page') {
      currentIndex = Math.max(0, currentIndex - pageSize);
      continue;
    }

    if (selectedValue === 'next-page') {
      currentIndex = Math.min(jobs.length - 1, currentIndex + pageSize);
      continue;
    }

    // A job was selected
    const jobIdx = parseInt(selectedValue.replace('job-', ''), 10);
    const selectedJob = jobs[jobIdx];

    if (!selectedJob) continue;
    currentIndex = jobIdx;

    // Show job details
    showJobCard(selectedJob);

    // Ask user what to do
    const action = await select({
      message: `What would you like to do with "${selectedJob.title}"?`,
      choices: [
        { value: 'open', name: '🌐 Open Apply Link' },
        { value: 'applied', name: '✅ Mark as Applied' },
        { value: 'saved', name: '⭐ Mark as Saved' },
        { value: 'rejected', name: '❌ Mark as Rejected' },
        { value: 'new', name: '👀 Reset to New' },
        { value: 'copy-url', name: '📋 Copy URL to Clipboard' },
        { value: 'back', name: '⬅️  Back to List' },
      ],
    });

    switch (action) {
      case 'open':
        console.log(chalk.cyan(`\n🔗 Opening: ${selectedJob.applyUrl}\n`));
        // Open URL in browser (platform-agnostic)
        const { execSync } = await import('child_process');
        try {
          execSync(`xdg-open "${selectedJob.applyUrl}" 2>/dev/null || open "${selectedJob.applyUrl}" 2>/dev/null || echo "Could not open browser. URL: ${selectedJob.applyUrl}"`, { stdio: 'pipe' });
        } catch {
          console.log(chalk.yellow(`Could not auto-open. URL: ${selectedJob.applyUrl}`));
        }
        break;

      case 'applied':
      case 'saved':
      case 'rejected':
      case 'new': {
        const dedupKey = selectedJob.id;
        updateJobStatus(dedupKey, action as any);
        const emoji = action === 'applied' ? '✅' : action === 'saved' ? '⭐' : action === 'rejected' ? '❌' : '👀';
        console.log(chalk.green(`\n${emoji} Marked as ${action.toUpperCase()}\n`));
        // Update local array so display reflects change
        const localIdx = jobs.findIndex(j => j.id === dedupKey);
        if (localIdx >= 0) {
          jobs[localIdx] = { ...jobs[localIdx], status: action as any };
        }
        break;
      }

      case 'copy-url':
        // Copy to clipboard using platform-specific commands
        const { execSync: execSync2 } = await import('child_process');
        try {
          execSync2(`echo -n "${selectedJob.applyUrl}" | wl-copy 2>/dev/null || echo -n "${selectedJob.applyUrl}" | xclip -selection clipboard 2>/dev/null || echo -n "${selectedJob.applyUrl}" | pbcopy 2>/dev/null`, { stdio: 'pipe' });
          console.log(chalk.green('\n📋 URL copied to clipboard!\n'));
        } catch {
          console.log(chalk.yellow(`\n📋 Could not copy automatically. URL: ${selectedJob.applyUrl}\n`));
        }
        break;

      case 'back':
        continue;
    }
  }
}
