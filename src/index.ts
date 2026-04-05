import type { PipelineOptions, FilteredJob } from "./types/options";
import type { Job } from "./types";
import { logger } from "./utils/logger";
import { generateDedupKey, mergeJobs, validateUrl } from "./dedup";
import { normalizeLocation, matchesLocationFilter, scoreLocationMatch } from "./filters/location";
import { normalizeExperience, matchesExperienceFilter, scoreExperienceMatch } from "./filters/experience";
import { scoreSkillsMatch } from "./filters/skills";
import { normalizeSalary, matchesSalaryFilter, scoreSalaryMatch } from "./filters/salary";
import { matchesCompanyFilter, scoreCompanyMatch } from "./filters/company";
import { analyzeJobWithAI } from "./utils/llm_parser";
import { loadProfile, formatProfileForAI } from "./utils/profileLoader";
import { batchScoreJobs, combineScores } from "./ai/matcher";
import { upsertJobs, closeDb, getJobIdsByStatus } from "./db/jobs";

// Tier 1 Scrapers
import { scrapeInternshala } from "./scrapers/internshala";
import { scrapeWellfound } from "./scrapers/wellfound";
import { scrapeUnstop } from "./scrapers/unstop";
import { scrapeRemoteRocketship } from "./scrapers/remoterocketship";

// Tier 2 Scrapers
import { scrapeLinkedIn } from "./scrapers/linkedin";
import { scrapeCutshort } from "./scrapers/cutshort";
import { scrapeHimalayas } from "./scrapers/himalayas";

// Tier 3 — Public APIs & niche boards
import { scrapeRemoteOK } from "./scrapers/remoteok";
import { scrapeRemotive } from "./scrapers/remotive";
import { scrapeSolanaJobs } from "./scrapers/solanajobs";
import { scrapeCryptocurrencyJobs } from "./scrapers/cryptocurrencyjobs";
import { scrapeJobicy } from "./scrapers/jobicy";
import { scrapeJobspresso } from "./scrapers/jobspresso";
import { scrapeWeWorkRemotely } from "./scrapers/weworkremotely";
import { scrapeWeb3Career } from "./scrapers/web3career";
import { scrapeYCombinator } from "./scrapers/ycombinator";

interface RunPipelineParams extends PipelineOptions {
  onJobFound?: (job: FilteredJob, count: number, total: number) => void;
  onSourceComplete?: (source: string, count: number) => void;
}

interface ScraperOptions {
  maxPages?: number;
}

const SCRAPERS: Record<string, (opts?: ScraperOptions) => Promise<Job[]>> = {
  // Tier 1
  internshala: scrapeInternshala,
  wellfound: scrapeWellfound,
  unstop: scrapeUnstop,
  remoterocketship: scrapeRemoteRocketship,
  // Tier 2
  linkedin: scrapeLinkedIn,
  cutshort: scrapeCutshort,
  himalayas: scrapeHimalayas,
  // Tier 3
  remoteok: scrapeRemoteOK,
  remotive: scrapeRemotive,
  solanajobs: scrapeSolanaJobs,
  cryptocurrencyjobs: scrapeCryptocurrencyJobs,
  jobicy: scrapeJobicy,
  jobspresso: scrapeJobspresso,
  weworkremotely: scrapeWeWorkRemotely,
  // New scrapers
  web3career: scrapeWeb3Career,
  ycombinator: scrapeYCombinator,
};

export const runFullPipeline = async (params: RunPipelineParams): Promise<FilteredJob[]> => {
  logger.info({
    roles: params.roles,
    experience: params.experience,
    locationScope: params.locationScope,
    sources: params.sources,
  }, "Starting job scraper pipeline with options: ");

  const sources = params.sources || Object.keys(SCRAPERS);
  const dedupMap = new Map<string, FilteredJob>();

  // Pre-load applied job IDs into a Set for O(1) lookup (fixes N+1 query issue)
  const appliedJobs = getJobIdsByStatus('applied');

  let totalSaved = 0;
  let batch: FilteredJob[] = [];
  const outputFile = params.output || 'job_opportunities.md';

  for (const source of sources) {
    logger.info(`Scraping source: ${source}`);
    const scraperFn = SCRAPERS[source.toLowerCase()];
    if (!scraperFn) {
      logger.warn(`No scraper found for source: ${source}`);
      continue;
    }

    if (source.toLowerCase() === "linkedin" && !params.linkedin?.cookie) {
      logger.warn("Skipping LinkedIn: requires --linkedin-cookie for auth");
      continue;
    }

    try {
      const scraperOpts: ScraperOptions = {
        maxPages: params.maxPagesPerSource,
      };
      const rawJobs = await scraperFn(scraperOpts);
      let sourceCount = 0;

      for (const raw of rawJobs) {
        // Map Job to FilteredJob internally
        const locationNorm = normalizeLocation(raw.location, params);
        const expNorm = normalizeExperience(raw.experience);

        const filteredJob: FilteredJob = {
          id: raw.applyUrl,
          title: raw.title,
          company: raw.company,
          location: { raw: raw.location, ...locationNorm },
          experience: { raw: raw.experience, ...expNorm },
          workType: 'full-time', // placeholder, can be enhanced
          compensation: {
            raw: raw.salary || undefined,
            currency: raw.salary?.includes('$') ? 'USD' : 'INR',
            period: raw.salary?.toLowerCase().includes('month') ? 'monthly' : 'annual'
          },
          skills: {
            required: raw.techStack || [],
            preferred: [],
            matched: [],
            highlight: false
          },
          companyInfo: {},
          temporal: {
            postedDate: raw.postedDate || new Date(),
          },
          application: {
            url: raw.applyUrl,
            easyApply: false,
            external: true
          },
          metadata: {
            source: raw.source,
            scrapedAt: new Date(),
            lastUpdated: new Date()
          },
          matchScore: 0,
          isHighMatch: false,
          isFresherFriendly: expNorm.level === 'fresher' || expNorm.level === 'internship',
          warnings: []
        };

        // Pass through filters
        if (!matchesLocationFilter(filteredJob, params)) continue;
        if (!matchesExperienceFilter(filteredJob, params)) continue;
        if (!matchesSalaryFilter(filteredJob, params)) continue;
        if (!matchesCompanyFilter(filteredJob, params)) continue;

        // Apply scoring (Priority scoring & India-first based on params)
        let score = 0;
        score += scoreLocationMatch(filteredJob, params);
        score += scoreExperienceMatch(filteredJob, params);
        score += scoreSkillsMatch(filteredJob, params);
        score += scoreSalaryMatch(filteredJob, params);
        score += scoreCompanyMatch(filteredJob, params);

        filteredJob.matchScore = score;
        if (score >= 40) {
          filteredJob.isHighMatch = true;
        }

        // Dedup Check (in-memory + SQLite persistence)
        const dedupKey = generateDedupKey(filteredJob.company, filteredJob.title, filteredJob.application.url);
        if (dedupMap.has(dedupKey)) {
           // Overwrite if new has better score
           const existing = dedupMap.get(dedupKey)!;
           if (filteredJob.matchScore > existing.matchScore) {
             dedupMap.set(dedupKey, filteredJob);
           }
           continue;
        }

        // Check SQLite persistence for previously seen jobs (O(1) Set lookup)
        if (appliedJobs.has(dedupKey)) {
           // Skip jobs already marked as applied by the user
           continue;
        }

        // Validate URL if not highly active
        const isValid = await validateUrl(filteredJob.application.url);
        if (!isValid) {
           logger.warn(`Skipping job - invalid or dead application link: ${filteredJob.application.url}`);
           continue;
        }

        dedupMap.set(dedupKey, filteredJob);
        batch.push(filteredJob);
        sourceCount++;
        totalSaved++;

        if (params.onJobFound) {
          params.onJobFound(filteredJob, totalSaved, Array.from(dedupMap.keys()).length);
        }

      }

      if (params.onSourceComplete) {
        params.onSourceComplete(source, sourceCount);
      }

      // Persist batch to SQLite
      if (batch.length > 0) {
        upsertJobs(batch.map(job => ({
          id: generateDedupKey(job.company, job.title, job.application.url),
          title: job.title,
          company: job.company,
          applyUrl: job.application.url,
          source: job.metadata.source,
          firstSeen: job.metadata.scrapedAt.toISOString(),
          lastSeen: job.metadata.scrapedAt.toISOString(),
          status: 'new' as const,
          matchScore: job.matchScore,
          isHighMatch: job.isHighMatch,
        })));
        batch = []; // Clear batch after persisting (fixes duplicate inserts)
      }
    } catch (err) {
      logger.error({ err }, `Error scraping ${source}`);
    }
  }

  closeDb();

  const finalJobs = Array.from(dedupMap.values());

  // AI Job Matching (optional, enabled via aiMatch flag)
  if ((params as any).aiMatch && (params as any).aiApiKey) {
    logger.info("🤖 Running AI job matching...");
    const profile = loadProfile();
    const profileText = formatProfileForAI(profile);
    const aiWeight = (params as any).aiWeight ?? 0.6;

    const aiScores = await batchScoreJobs(
      finalJobs,
      profileText,
      (params as any).aiApiKey,
      (params as any).aiConcurrency ?? 5
    );

    for (let i = 0; i < finalJobs.length; i++) {
      const job = finalJobs[i];
      const ai = aiScores[i];
      if (ai) {
        job.matchScore = combineScores(job.matchScore, ai.score, aiWeight);
        job.warnings.push(`🤖 AI: ${ai.reasoning}`);
        if (job.matchScore >= 40) {
          job.isHighMatch = true;
        }
      }
    }

    // Re-sort by score
    finalJobs.sort((a, b) => b.matchScore - a.matchScore);
    logger.info(`AI matching complete — ${finalJobs.filter(j => j.isHighMatch).length} HIGH MATCH jobs`);
  }

  return finalJobs;
};

/**
 * AI Verification Step:
 * Runs High Match jobs through LLM to verify seniority and skill match.
 * Removes jobs that are actually Senior-level or mismatch.
 */
export const verifyJobsWithAI = async (
  jobs: FilteredJob[],
  apiKey: string,
  onProgress?: (current: number, total: number) => void
): Promise<FilteredJob[]> => {
  logger.info(`Starting AI verification for ${jobs.length} jobs...`);
  const verified: FilteredJob[] = [];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    if (onProgress) onProgress(i + 1, jobs.length);

    // Construct a rich description for the LLM
    const description = [
      job.title,
      job.company,
      job.skills.required.join(', '),
      job.skills.matched.join(', '),
    ].join(' | ');

    const analysis = await analyzeJobWithAI(job.title, description, apiKey);

    // AI Verdict: If the job is NOT fresher friendly, drop it.
    if (!analysis.is_fresher_friendly || analysis.min_years > 2) {
      logger.info(`[AI] Rejected: ${job.title} @ ${job.company} (${analysis.reason})`);
      continue;
    }

    // Update job metadata with AI insights
    job.warnings = [analysis.reason];
    job.matchScore = analysis.match_confidence === 'high' ? job.matchScore + 10 : job.matchScore;
    verified.push(job);
  }

  logger.info(`AI Verification complete: ${verified.length} jobs remain.`);
  return verified;
};
