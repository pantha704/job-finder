export type ExperienceLevel = 'internship' | 'fresher' | 'junior' | 'mid' | 'senior' | 'any';
export type WorkType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance' | 'any';
export type LocationScope = 'remote-global' | 'remote-india' | 'hybrid' | 'onsite' | 'any';
export type OutputFormat = 'md' | 'json' | 'csv' | 'all';
export type CompanyStage = 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'scaleup' | 'enterprise' | 'any';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+' | 'any';
export type IndustryVertical =
  | 'fintech' | 'edtech' | 'healthtech' | 'ecommerce' | 'saas'
  | 'web3' | 'ai-ml' | 'gaming' | 'media' | 'consulting' | 'any';

export interface PipelineOptions {
  experience?: ExperienceLevel | ExperienceLevel[];
  minYears?: number;
  maxYears?: number;

  locationScope?: LocationScope;
  locations?: string[]; 
  locationRadius?: 10 | 25 | 50 | 100;
  timezone?: string;
  remoteFromIndia?: boolean;

  roles?: string[];
  keywords?: string;

  requiredSkills?: string[];
  preferredSkills?: string[];
  highlightSkills?: string[];
  excludeSkills?: string[];

  workType?: WorkType | WorkType[];
  hoursPerWeek?: '20' | '30' | '40' | 'flexible';

  companyStage?: CompanyStage | CompanyStage[];
  companySize?: CompanySize | CompanySize[];
  industries?: IndustryVertical | IndustryVertical[];
  companyNames?: string[];
  excludeCompanies?: string[];

  minStipend?: number;
  maxStipend?: number;
  stipendCurrency?: 'INR' | 'USD' | 'any';

  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: 'INR' | 'USD' | 'any';

  equity?: boolean;
  benefits?: string[];

  postedWithin?: number;
  applicationDeadline?: 'open' | 'this-week' | 'this-month' | 'any';
  startDate?: 'immediate' | 'flexible' | 'after-graduation' | 'any';

  educationLevel?: 'any' | 'diploma' | 'btech' | 'mtech' | 'any-degree' | 'no-degree-required';
  collegeTier?: 'any' | 'iit-nit-iiit' | 'top-100' | 'verified';
  certifications?: string[];

  visaSponsorship?: boolean;
  workAuthorization?: 'india-citizen' | 'oci' | 'any';
  remoteEligibility?: 'india-only' | 'global' | 'any';

  easyApplyOnly?: boolean;
  recruiterContact?: boolean;
  responseTime?: '<24h' | '<3d' | '<7d' | 'any';

  github?: string;
  resume?: string;
  appliedLog?: string;
  preferenceLearning?: boolean;

  sources?: string[];
  format?: OutputFormat;
  output?: string;
  includeTracker?: boolean;
  showScore?: boolean;

  maxResults?: number;
  maxPagesPerSource?: number;
  rateLimit?: number;
  respectRobotsTxt?: boolean;
  verbose?: boolean;

  browser?: {
    backend: 'camoufox' | 'puppeteer' | 'playwright' | 'firecrawl';
    endpoint?: string;
    headless?: boolean;
    userAgent?: string | 'rotate';
  };

  linkedin?: {
    cookie?: string;
  };
}

export interface FilteredJob {
  id: string;
  title: string;
  company: string;
  location: {
    raw: string;
    normalized: string;
    scope: LocationScope;
    locationId?: string;
  };
  experience: {
    raw: string;
    level: ExperienceLevel;
    minYears?: number;
    maxYears?: number;
  };
  workType: WorkType;
  compensation: {
    raw?: string;
    min?: number;
    max?: number;
    currency: 'INR' | 'USD' | 'unknown';
    period: 'monthly' | 'annual' | 'hourly' | 'unknown';
    equity?: boolean;
  };
  skills: {
    required: string[];
    preferred: string[];
    matched: string[];
    highlight: boolean;
  };
  companyInfo: {
    stage?: CompanyStage;
    size?: CompanySize;
    industry?: IndustryVertical;
    rating?: number;
  };
  temporal: {
    postedDate: Date;
    applicationDeadline?: Date;
    startDate?: string;
  };
  application: {
    url: string;
    easyApply: boolean;
    recruiterContact?: string;
    external: boolean;
  };
  metadata: {
    source: string;
    scrapedAt: Date;
    lastUpdated: Date;
  };
  matchScore: number;
  isHighMatch: boolean;
  isFresherFriendly: boolean;
  warnings: string[];
}
