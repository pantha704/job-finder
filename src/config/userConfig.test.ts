import { describe, expect, test } from "bun:test";
import { loadUserConfig, mergeConfig, getConfigPath } from "../config/userConfig";

describe("loadUserConfig", () => {
  test("getConfigPath returns expected path", () => {
    const path = getConfigPath();
    expect(path).toContain(".job-finder");
    expect(path).toContain("config.json");
  });

  test("loadUserConfig returns default-like config", () => {
    const config = loadUserConfig();
    expect(config._initialized).toBe(true);
    expect(config.experience).toBe("fresher");
    expect(config.highlightSkills).toContain("rust");
  });
});

describe("mergeConfig", () => {
  test("CLI args override config values", () => {
    const userConfig = { experience: "fresher", _initialized: true };
    const cliOptions = { experience: "junior" };
    const merged = mergeConfig(userConfig as any, cliOptions as any);
    expect(merged.experience).toBe("junior");
  });

  test("undefined CLI args use config defaults", () => {
    const userConfig = { experience: "fresher", _initialized: true };
    const cliOptions = {};
    const merged = mergeConfig(userConfig as any, cliOptions as any);
    expect(merged.experience).toBe("fresher");
  });

  test("null CLI args use config defaults", () => {
    const userConfig = { experience: "fresher", _initialized: true };
    const cliOptions = { experience: null };
    const merged = mergeConfig(userConfig as any, cliOptions as any);
    expect(merged.experience).toBe("fresher");
  });

  test("highlightSkills from config is preserved when not overridden", () => {
    const userConfig = { highlightSkills: ["rust", "solana"], _initialized: true };
    const cliOptions = { experience: "junior" };
    const merged = mergeConfig(userConfig as any, cliOptions as any);
    expect(merged.highlightSkills).toEqual(["rust", "solana"]);
  });
});
