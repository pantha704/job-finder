import { PipelineOptions, FilteredJob } from "./types/options";
import { logger } from "./utils/logger";

interface RunPipelineParams extends PipelineOptions {
  onJobFound?: (job: FilteredJob, count: number, total: number) => void;
  onSourceComplete?: (source: string, count: number) => void;
}

export const runFullPipeline = async (params: RunPipelineParams): Promise<FilteredJob[]> => {
  logger.info({
    roles: params.roles,
    experience: params.experience,
    locationScope: params.locationScope,
    sources: params.sources,
  }, "Starting job scraper pipeline with options: ");

  const allJobs: FilteredJob[] = [];
  const sources = params.sources || [];

  for (const source of sources) {
    logger.info(`Scraping source: ${source}`);
    
    // Scraper logic will be modularized and placed here.
    // Simulating finding jobs:
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const count = 0; // Simulated job count
    
    if (params.onSourceComplete) {
      params.onSourceComplete(source, count);
    }
  }

  return allJobs;
};
