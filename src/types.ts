export interface Job {
  title: string;
  company: string;
  applyUrl: string;
  location: string;
  experience: string;
  salary: string | null;
  postedDate: Date | null;
  techStack: string[];
  source: string;
  isHighMatch: boolean;
  matchScore?: number;
  isRemoteIndia?: boolean | 'verify';
  isFresher?: boolean | 'verify';
}

export interface ScrapeResult {
  source: string;
  jobs: Job[];
  errors: ErrorLog[];
}

export interface ErrorLog {
  url: string;
  reason: string;
  timestamp: Date;
}
