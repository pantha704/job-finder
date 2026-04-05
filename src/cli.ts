#!/usr/bin/env bun
import { parseArgs } from "util";
import { resolve } from "path";
import { version as PKG_VERSION } from "../package.json";
import chalk from "chalk";
import figlet from "figlet";
import { runInteractiveMode } from "./prompts/interactive";
import { runFullPipeline } from "./index";
import { writeMarkdownReport, writeJsonReport, writeCsvReport } from "./formatter";
import { DEFAULT_OPTIONS } from "./config/defaults";
import { loadUserConfig, mergeConfig, getConfigPath } from "./config/userConfig";
import type { PipelineOptions } from "./types/options";
import { logger } from "./utils/logger";

const showBanner = () => {
  const termWidth = process.stdout.columns || 80;

  if (termWidth >= 32) {
    // Fits in any terminal: 30-char-wide ASCII art
    console.log(
      chalk.cyanBright(
        figlet.textSync("DEV-JOB-FINDER", { font: "Digital" })
      )
    );
  } else {
    // Extremely narrow: minimal fallback
    console.log(chalk.cyanBright.bold("  ┌─────────────────┐"));
    console.log(chalk.cyanBright.bold("  │  DEV-JOB-FINDER │"));
    console.log(chalk.cyanBright.bold("  └─────────────────┘"));
  }

  console.log(
    chalk.gray("   Find remote fresher jobs that actually want YOU\n")
  );
  console.log(
    chalk.dim(`v${PKG_VERSION} • `) +
      chalk.green("Built by a fresher, for freshers") +
      chalk.dim(" • ") +
      chalk.blue("github.com/pantha704/job-finder") +
      "\n"
  );
};

const parseCliArgs = (): Partial<PipelineOptions> => {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      experience: { type: "string", short: "e" },
      location: { type: "string", short: "l" },
      roles: { type: "string", short: "R" },
      keywords: { type: "string", short: "k" },
      highlight: { type: "string", short: "H" },
      worktype: { type: "string", short: "w" },
      stage: { type: "string" },
      size: { type: "string" },
      industry: { type: "string" },
      "min-stipend": { type: "string" },
      "min-salary": { type: "string" },
      "max-salary": { type: "string" },
      equity: { type: "boolean" },
      "exclude-companies": { type: "string", short: "x" },
      posted: { type: "string" },
      github: { type: "string", short: "g" },
      resume: { type: "string", short: "r" },
      applied: { type: "string" },
      format: { type: "string", short: "f" },
      output: { type: "string", short: "o" },
      score: { type: "boolean", short: "S" },
      sources: { type: "string", short: "s" },
      browser: { type: "string" },
      headless: { type: "boolean" },
      "max-pages": { type: "string", short: "m" },
      verbose: { type: "boolean", short: "v" },
      browse: { type: "boolean", short: "b" },
      status: { type: "boolean" },
      history: { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "V" },
    },
    strict: false,
    allowPositionals: true
  });

  const toArray = (val: any) =>
    typeof val === "string" ? val.split(",").map((s) => s.trim().toLowerCase()) : undefined;

  return {
    experience: values.experience as any,
    locationScope: values.location as any,
    roles: toArray(values.roles),
    keywords: values.keywords as string | undefined,
    highlightSkills: toArray(values.highlight),
    workType: values.worktype as any,
    companyStage: values.stage as any,
    companySize: values.size as any,
    industries: toArray(values.industry) as any,
    minStipend: values["min-stipend"] ? parseInt(values["min-stipend"] as string) : undefined,
    minSalary: values["min-salary"] ? parseInt(values["min-salary"] as string) : undefined,
    maxSalary: values["max-salary"] ? parseInt(values["max-salary"] as string) : undefined,
    excludeCompanies: toArray(values["exclude-companies"]),
    equity: values.equity as boolean | undefined,
    postedWithin: values.posted ? parseInt(values.posted as string) as any : undefined,
    github: values.github as string | undefined,
    resume: values.resume as string | undefined,
    appliedLog: values.applied as string | undefined,
    format: values.format as any,
    output: values.output as string | undefined,
    showScore: values.score as boolean | undefined,
    sources: toArray(values.sources),
    maxPagesPerSource: values["max-pages"] ? parseInt(values["max-pages"] as string) : undefined,
    aiApiKey: process.env.GROQ_API_KEY || process.env.NVAPI_KEY,
    browser: {
      backend: (values.browser as any) || DEFAULT_OPTIONS.browser?.backend,
      headless: values.headless as boolean | undefined,
    },
    verbose: values.verbose as boolean | undefined,
  };
};

const parseHelpVersion = () => {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "V" },
    },
    strict: false,
    allowPositionals: true,
  });
  return { help: !!values.help, version: !!values.version };
};

const main = async () => {
  showBanner();

  const cliOptions = parseCliArgs();
  const vals = cliOptions as any;

  // Load user config and merge with CLI args
  const userConfig = loadUserConfig();
  const finalOptions: Partial<PipelineOptions> = mergeConfig(userConfig, cliOptions);

  // Handle status command
  if (vals.status) {
    const { getStats, queryHistory } = await import("./db/jobs");
    const stats = getStats();
    console.log(chalk.cyan("📊 Job Database Statistics"));
    console.log(`  Total jobs tracked: ${stats.total}`);
    console.log(`  New: ${stats.new || 0}`);
    console.log(`  Seen: ${stats.seen || 0}`);
    console.log(`  Applied: ${stats.applied || 0}`);
    console.log(`  Saved: ${stats.saved || 0}`);
    console.log(`  Rejected: ${stats.rejected || 0}`);
    process.exit(0);
  }

  // Handle browse command
  if (vals.browse) {
    const { browseJobs } = await import("./tui/browser");
    await browseJobs({ source: 'history' });
    process.exit(0);
  }

  // Handle history command
  if (vals.history) {
    const { queryHistory } = await import("./db/jobs");
    const jobs = queryHistory({ limit: 20 });
    if (jobs.length === 0) {
      console.log(chalk.yellow("No job history found. Run the scraper first."));
    } else {
      console.log(chalk.cyan("📋 Recent Job History"));
      for (const j of jobs) {
        const statusEmoji = j.status === 'applied' ? '✅' : j.status === 'saved' ? '⭐' : j.status === 'rejected' ? '❌' : '👀';
        console.log(`  ${statusEmoji} ${j.title} @ ${j.company} [${j.status}] (score: ${j.matchScore})`);
      }
    }
    process.exit(0);
  }

  const cliOpts = cliOptions as any;
  if (vals.help) {
    console.log(chalk.cyan("Usage:") + "\n  job-finder [options]\n");
    console.log(chalk.cyan("Core Filters:"));
    console.log("  -e, --experience <level>  internship|fresher|junior|mid|senior");
    console.log("  -l, --location <scope>    remote-india|remote-global|hybrid|onsite");
    console.log("  -R, --roles <list>        web3,backend,frontend,fullstack,...");
    console.log("  -H, --highlight <list>    Tech stacks to flag as 🔥 HIGH MATCH");
    console.log("\n" + chalk.cyan("Personalization:"));
    console.log("  -g, --github <user>       Extract skills from GitHub profile");
    console.log("  -r, --resume <path>       Boost matches with resume keywords");
    console.log("\n" + chalk.cyan("Output:"));
    console.log("  -f, --format <fmt>        md|json|csv|all (default: md)");
    console.log("  -o, --output <path>       Output file path");
    console.log("  -S, --score               Show priority score [0-100]");
    console.log("\n" + chalk.cyan("Advanced:"));
    console.log("  -s, --sources <list>      internshala,wellfound,web3career,...");
    console.log("  -m, --max-pages <n>       Max pages per source (default: 3)");
    console.log("\n" + chalk.cyan("Database:"));
    console.log("  --status                  Show job tracking statistics");
    console.log("  --history                 Show recent job history");
    console.log("  -v, --verbose             Debug logging");
    console.log("  -h, --help                Show this help");
    process.exit(0);
  }

  if (vals.version) {
    console.log(`job-finder v${PKG_VERSION}`);
    process.exit(0);
  }

  const { help, version } = parseHelpVersion();

  if (help) {
    console.log(chalk.cyan("Usage:") + "\n  job-finder [options]\n");
    console.log(chalk.cyan("Core Filters:"));
    console.log("  -e, --experience <level>  internship|fresher|junior|mid|senior");
    console.log("  -l, --location <scope>    remote-india|remote-global|hybrid|onsite");
    console.log("  -R, --roles <list>        web3,backend,frontend,fullstack,...");
    console.log("  -H, --highlight <list>    Tech stacks to flag as 🔥 HIGH MATCH");
    console.log("\n" + chalk.cyan("Personalization:"));
    console.log("  -g, --github <user>       Extract skills from GitHub profile");
    console.log("  -r, --resume <path>       Boost matches with resume keywords");
    console.log("\n" + chalk.cyan("Output:"));
    console.log("  -f, --format <fmt>        md|json|csv|all (default: md)");
    console.log("  -o, --output <path>       Output file path (default: job_opportunities.md)");
    console.log("  -S, --score               Show priority score [0-100]");
    console.log("\n" + chalk.cyan("Advanced:"));
    console.log("  -s, --sources <list>      internshala,wellfound,remoteok,solanajobs,...");
    console.log("  -m, --max-pages <n>       Max pages per source (default: 3)");
    console.log("  -v, --verbose             Debug logging");
    console.log("  -h, --help                Show this help");
    process.exit(0);
  }

  if (version) {
    console.log(`job-finder v${PKG_VERSION}`);
    process.exit(0);
  }

  const baseOptions: PipelineOptions = { ...DEFAULT_OPTIONS, ...cliOptions };

  const hasMinimalConfig = baseOptions.roles?.length && baseOptions.sources?.length;
  const finalOptions = !hasMinimalConfig
    ? await runInteractiveMode(baseOptions)
    : baseOptions;

  if (!finalOptions) {
    console.log(chalk.yellow("⚠️  Operation cancelled."));
    process.exit(0);
  }

  try {
    const results = await runFullPipeline({
      ...finalOptions,
      onJobFound: (job, count, total) => {
        const score = finalOptions.showScore ? ` [${job.matchScore}/100]` : "";
        const highlight = job.isHighMatch ? chalk.redBright(" 🔥") : "";
        process.stdout.write(
          `\r✓ [${count}/${total}] ${job.title} at ${job.company}${highlight}${score}   `
        );
      },
      onSourceComplete: (source, count) => {
        console.log(chalk.green(`\n✓ Completed ${source}: ${count} jobs`));
      },
    });

    // AI Verification Step (Optional)
    let finalResults = results;
    if (finalOptions.aiApiKey) {
      console.log(chalk.yellow(`\n🤖 Verifying ${results.filter(j => j.isHighMatch).length} HIGH MATCH jobs with AI...`));
      const { verifyJobsWithAI } = await import("./index");
      finalResults = await verifyJobsWithAI(
        results.filter(j => j.isHighMatch),
        finalOptions.aiApiKey,
        (current, total) => {
          process.stdout.write(`\r🔍 AI Checking: ${current}/${total}`);
        }
      );
      // Re-add non-high-match jobs that weren't verified
      finalResults = [...finalResults, ...results.filter(j => !j.isHighMatch)];
    }

    const highMatches = finalResults.filter((j) => j.isHighMatch).length;
    const format = finalOptions.format || 'md';
    const baseOutput = finalOptions.output || 'job_opportunities';

    const writeTasks: Promise<void>[] = [];
    if (format === 'md' || format === 'all') {
      const path = resolve(process.cwd(), baseOutput.endsWith('.md') ? baseOutput : baseOutput + '.md');
      writeTasks.push(writeMarkdownReport(path, finalResults, finalOptions));
    }
    if (format === 'json' || format === 'all') {
      const path = resolve(process.cwd(), baseOutput.endsWith('.json') ? baseOutput : baseOutput + '.json');
      writeTasks.push(writeJsonReport(path, finalResults, finalOptions));
    }
    if (format === 'csv' || format === 'all') {
      const path = resolve(process.cwd(), baseOutput.endsWith('.csv') ? baseOutput : baseOutput + '.csv');
      writeTasks.push(writeCsvReport(path, finalResults));
    }

    await Promise.all(writeTasks);

    const formatLabel = format === 'all' ? 'md + json + csv' : format.toUpperCase();
    console.log(chalk.green(`\n✨ Done! ${finalResults.length} jobs • ${highMatches} 🔥 HIGH MATCH`));
    console.log(chalk.cyan(`💾 Saved as ${formatLabel}: ${baseOutput}`));
    console.log(chalk.yellow(`💡 Apply to HIGH MATCH jobs within 48 hours!`));

    process.exit(0);
  } catch (error: any) {
    logger.error("Pipeline failed");
    console.error(error);
    console.log(chalk.red("\n❌ Try: job-finder --help for usage tips"));
    process.exit(1);
  }
};

main().catch(console.error);
