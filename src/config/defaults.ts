import { PipelineOptions } from "../types/options";

export const DEFAULT_OPTIONS: PipelineOptions = {
  experience: 'fresher',
  locationScope: 'remote-india',
  workType: 'any',
  format: 'md',
  remoteFromIndia: true,
  showScore: true,
  output: 'job_opportunities.md',
  browser: {
    backend: 'playwright',
    headless: true,
  }
};
