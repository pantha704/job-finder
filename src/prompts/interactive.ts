import {
  select,
  checkbox,
  input,
  number,
  confirm
} from "@inquirer/prompts";
import chalk from "chalk";
import { searchLocations } from "../config/locations";
import type { PipelineOptions } from "../types/options";
import { validateExperience, validateLocationScope } from "./validators";
import { extractSkillsFromGitHub } from "../utils/github";

export const runInteractiveMode = async (
  baseOptions: Partial<PipelineOptions>
): Promise<PipelineOptions | null> => {
  let options = { ...baseOptions };

  try {
    if (!options.github) {
      const github = await input({
        message: "What's your GitHub username? (optional, for skill extraction)",
        default: "",
        validate: (val) => !val || /^[a-zA-Z0-9-]+$/.test(val) || "Invalid username",
      });
      if (github) options.github = github;
    }

    if (options.github && (!options.highlightSkills || options.highlightSkills.length === 0)) {
      try {
        const extracted = await extractSkillsFromGitHub(options.github);
        if (extracted.length > 0) {
          console.log(`✓ Found skills: ${extracted.join(", ")}`);
          options.highlightSkills = extracted;
        }
      } catch {
        console.log("⚠ Could not fetch GitHub; using defaults");
      }
    }

    if (!options.experience) {
      const exp = await select({
        message: "Select experience level:",
        choices: [
          { value: "fresher", name: "🎓 Fresher (0-1 years)", description: "Entry-level, new grads welcome" },
          { value: "internship", name: "📚 Internship", description: "3-6 month stipend roles" },
          { value: "junior", name: "🚀 Junior (1-3 years)", description: "Some experience required" },
          { value: "any", name: "✨ Any", description: "Show all levels (broadest results)" },
        ],
        default: "fresher",
      });
      options.experience = exp as any;
    }

    if (!options.locationScope) {
      const loc = await select({
        message: "Location preference:",
        choices: [
          { value: "remote-india", name: "🇮🇳 Remote from India", description: "Companies hiring remotely in India" },
          { value: "remote-global", name: "🌍 Remote Global", description: "Worldwide remote (timezone flexible)" },
          { value: "hybrid", name: "🏢 Hybrid", description: "Mix of remote + occasional onsite" },
          { value: "onsite", name: "📍 Onsite Only", description: "Full-time office presence" },
          { value: "any", name: "✨ Any", description: "All location types" },
        ],
        default: "remote-india",
      });
      options.locationScope = loc as any;
    }

    if (options.locationScope && ["hybrid", "onsite"].includes(options.locationScope) && !options.locations) {
      const searchQuery = await input({
        message: "Search for cities/states in India (type to filter):",
        default: "",
      });

      if (searchQuery) {
        const matches = searchLocations(searchQuery);
        if (matches.length > 0) {
          const locations = await checkbox({
            message: "Select locations:",
            choices: matches.map((loc) => ({
              value: loc.id,
              name: `${loc.name} ${loc.state ? `(${loc.state})` : ""}`,
              description: loc.remoteFriendly ? "✓ Remote-friendly" : undefined,
            })),
            validate: (vals) => vals.length > 0 || "Select at least one location",
          });
          options.locations = locations;
        }
      }
    }

    if (!options.roles) {
      const roles = await checkbox({
        message: "Select target roles:",
        choices: [
          { value: "web3", name: "⛓️ Web3/Blockchain", checked: true },
          { value: "backend", name: "⚙️ Backend/Systems", checked: true },
          { value: "frontend", name: "🎨 Frontend", checked: false },
          { value: "fullstack", name: "🔄 Fullstack", checked: false },
          { value: "mobile", name: "📱 Mobile (iOS/Android)", checked: false },
          { value: "devops", name: "🔧 DevOps/SRE", checked: false },
          { value: "data", name: "📊 Data Engineering", checked: false },
          { value: "ai-ml", name: "🤖 AI/ML Engineering", checked: false },
          { value: "qa", name: "🧪 QA/Testing", checked: false },
        ],
        validate: (vals) => vals.length > 0 || "Select at least one role",
      });
      options.roles = roles;
    }

    if (!options.highlightSkills || options.highlightSkills.length === 0) {
      const highlightSkills = await checkbox({
        message: `Flag these as ${chalk.redBright("🔥 HIGH MATCH")}:`,
        choices: [
          { value: "rust", name: "Rust", checked: true },
          { value: "solana", name: "Solana", checked: true },
          { value: "typescript", name: "TypeScript", checked: true },
          { value: "nextjs", name: "Next.js", checked: false },
          { value: "react", name: "React", checked: false },
          { value: "nodejs", name: "Node.js", checked: false },
          { value: "python", name: "Python", checked: false },
          { value: "wasm", name: "WebAssembly", checked: false },
          { value: "anchor", name: "Anchor Framework", checked: false },
        ],
      });
      options.highlightSkills = highlightSkills;
    }

    if (!options.workType) {
      const workType = await select({
        message: "Work arrangement:",
        choices: [
          { value: "full-time", name: "💼 Full-time", description: "40 hrs/week, permanent" },
          { value: "internship", name: "🎓 Internship", description: "3-6 months, stipend" },
          { value: "part-time", name: "⏱️ Part-time", description: "20-30 hrs/week" },
          { value: "contract", name: "📄 Contract", description: "Fixed-term project" },
          { value: "any", name: "✨ Any", description: "All work types" },
        ],
        default: "any",
      });
      options.workType = workType as any;
    }

    const wantsCompensationFilter = await confirm({
      message: "Filter by salary/stipend range?",
      default: false,
    });
    
    if (wantsCompensationFilter) {
      if (options.experience === "internship") {
        const minStipend = await number({
          message: "Minimum monthly stipend (INR):",
          min: 0,
        });
        if (minStipend !== undefined) options.minStipend = minStipend;
      } else {
        const minSalary = await number({
          message: "Minimum annual CTC (INR):",
          min: 0,
        });
        if (minSalary !== undefined) options.minSalary = minSalary;
      }
    }

    if (!options.sources) {
      const isIndiaRemote = options.locationScope === "remote-india";
      const sources = await checkbox({
        message: "Select job boards to scrape:",
        choices: [
          { value: "internshala", name: "Internshala", description: "Best for Indian freshers ✓", checked: true },
          { value: "wellfound", name: "Wellfound (AngelList)", description: "Startup roles ✓", checked: true },
          { value: "web3career", name: "Web3.career", description: "Crypto/Web3 roles ✓", checked: true },
          { value: "ycombinator", name: "YC Work at a Startup", description: "Global startups ✓", checked: true },
          { value: "remoterocketship", name: "Remote Rocketship", description: "Hidden remote gems", checked: false },
          { value: "cutshort", name: "Cutshort", description: "India startup roles ✓", checked: isIndiaRemote },
          { value: "unstop", name: "Unstop", description: "Internships + hackathons", checked: false },
          { value: "himalayas", name: "Himalayas", description: "Global remote", checked: false },
          { value: "linkedin", name: "LinkedIn", description: "⚠️ Requires auth", checked: false },
        ],
        validate: (vals) => vals.length > 0 || "Select at least one source",
      });
      options.sources = sources;
    }

    if (!options.maxPagesPerSource) {
      const maxPages = await number({
        message: "Max pages to fetch per source (higher = more jobs but slower):",
        default: 3,
        min: 1,
        max: 20,
      });
      if (maxPages !== undefined) options.maxPagesPerSource = maxPages;
    }

    if (!options.format) {
      const format = await select({
        message: "Output format:",
        choices: [
          { value: "md", name: "📝 Markdown", description: "Human-readable + [ ] checkboxes" },
          { value: "json", name: "🔧 JSON", description: "For automation/piping" },
          { value: "csv", name: "📊 CSV", description: "Excel/Google Sheets compatible" },
          { value: "all", name: "✨ All formats", description: "Generate .md + .json + .csv" },
        ],
        default: "md",
      });
      options.format = format as any;
    }

    if (!options.output) {
      const ext = options.format === "json" ? "json" : options.format === "csv" ? "csv" : "md";
      const output = await input({
        message: "Save to:",
        default: `job_opportunities.${ext}`,
        validate: (val) => /\.(md|json|csv)$/.test(val) || "File must end with .md, .json, or .csv",
      });
      options.output = output;
    }

    return options as PipelineOptions;
  } catch (err: any) {
    if (err.name === 'ExitPromptError') {
      console.log("Operation cancelled.");
      return null;
    }
    throw err;
  }
};
