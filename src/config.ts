import * as fs from "fs";
import * as core from "@actions/core";
import type { Config } from "./types";

const DEFAULT_CONFIG: Config = {
  categories: [
    { title: "Breaking Changes", labels: ["breaking", "breaking-change"] },
    { title: "New Features", labels: ["feature", "enhancement"] },
    { title: "Bug Fixes", labels: ["bug", "bugfix", "fix"] },
    { title: "Documentation", labels: ["documentation", "docs"] },
    { title: "Maintenance", labels: ["chore", "maintenance", "refactor"] },
    { title: "Dependencies", labels: ["dependencies", "deps"] },
  ],
  uncategorizedTitle: "Other Changes",
};

export function loadConfig(configPath: string): Config {
  if (!configPath) {
    core.info("No config file specified, using default category mappings.");
    return DEFAULT_CONFIG;
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Config>;

    return {
      categories: parsed.categories ?? DEFAULT_CONFIG.categories,
      uncategorizedTitle:
        parsed.uncategorizedTitle ?? DEFAULT_CONFIG.uncategorizedTitle,
    };
  } catch (error) {
    core.warning(
      `Failed to load config from "${configPath}", falling back to defaults.`
    );
    return DEFAULT_CONFIG;
  }
}
