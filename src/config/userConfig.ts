import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { PipelineOptions } from "../types/options";

const CONFIG_DIR = join(homedir(), ".job-finder");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

/**
 * Default config for a fresher Rust/Solana developer in India.
 */
const DEFAULT_CONFIG: Partial<PipelineOptions> = {
  experience: "fresher",
  locationScope: "remote-global",
  highlightSkills: ["rust", "solana", "typescript", "nextjs"],
  minSalary: undefined,
  maxSalary: undefined,
  excludeCompanies: [],
  format: "md",
  showScore: true,
  maxPagesPerSource: 3,
  sources: [
    "internshala",
    "web3career",
    "remoteok",
    "solanajobs",
    "cutshort",
    "himalayas",
    "remoterocketship",
    "unstop",
  ],
};

export interface UserConfig extends Partial<PipelineOptions> {
  /** Whether the config file has been initialized */
  _initialized: boolean;
}

/**
 * Load user config from ~/.job-finder/config.json.
 * Creates the file with defaults if it doesn't exist.
 */
export function loadUserConfig(): UserConfig {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (!existsSync(CONFIG_PATH)) {
    // Auto-create config file with defaults
    const config: UserConfig = { ...DEFAULT_CONFIG, _initialized: true };
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
    return config;
  }

  try {
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as UserConfig;
    parsed._initialized = true;
    return parsed;
  } catch (error) {
    console.warn(`⚠️  Failed to load config from ${CONFIG_PATH}: ${error}`);
    return { ...DEFAULT_CONFIG, _initialized: true };
  }
}

/**
 * Merge CLI options with user config.
 * CLI options take precedence over config file values.
 */
export function mergeConfig(
  userConfig: UserConfig,
  cliOptions: Partial<PipelineOptions>
): Partial<PipelineOptions> {
  const merged: Partial<PipelineOptions> = { ...userConfig };

  // CLI args override config file
  for (const [key, value] of Object.entries(cliOptions)) {
    if (value !== undefined && value !== null) {
      (merged as any)[key] = value;
    }
  }

  return merged;
}

/**
 * Get the path to the config file (for display purposes).
 */
export function getConfigPath(): string {
  return CONFIG_PATH;
}
