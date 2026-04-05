import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const PROFILE_PATH = join(homedir(), ".job-finder", "profile.json");

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  experienceLevel: string;
  skills: string[];
  github: string;
  resume: string;
  coverLetter: string;
  links: string[];
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Pratham Jaiswal",
  email: "prathamjaiswal204@gmail.com",
  phone: "",
  location: "Kolkata, India",
  experienceLevel: "Fresher / 0-1 years",
  skills: ["Rust", "TypeScript", "Next.js", "Solana", "Web3", "React", "Node.js", "Python", "Blockchain"],
  github: "https://github.com/pantha704",
  resume: "~/Documents/Pratham_Jaiswal_Resume.pdf",
  coverLetter: "",
  links: [],
};

/**
 * Load user profile from ~/.job-finder/profile.json.
 * Falls back to defaults if file doesn't exist.
 */
export function loadProfile(): UserProfile {
  if (!existsSync(PROFILE_PATH)) {
    return DEFAULT_PROFILE;
  }

  try {
    const raw = readFileSync(PROFILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

/**
 * Format profile into a prompt string for AI job matching.
 */
export function formatProfileForAI(profile: UserProfile): string {
  const skillsStr = profile.skills.join(", ");
  const linksStr = profile.links.length > 0 ? `\nLinks: ${profile.links.join(", ")}` : "";
  const coverStr = profile.coverLetter ? `\nCover Letter Theme: ${profile.coverLetter}` : "";

  return `Candidate Profile:
Name: ${profile.name}
Location: ${profile.location}
Experience: ${profile.experienceLevel}
Core Skills: ${skillsStr}
GitHub: ${profile.github}
Resume: ${profile.resume}${linksStr}${coverStr}

This candidate is a fresher/entry-level developer with strong open-source contributions (Rust compiler, PyTorch, DeepMind). They excel in Rust, Solana blockchain development, and TypeScript/Next.js full-stack. Look for roles that match these skills at the entry/junior level.`;
}

/**
 * Get the path to the profile file.
 */
export function getProfilePath(): string {
  return PROFILE_PATH;
}
