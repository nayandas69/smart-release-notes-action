export type Mode = "PR" | "COMMIT" | "HYBRID";

export interface ActionInputs {
  token: string;
  fromTag: string;
  toTag: string;
  mode: Mode;
  configFile: string;
}

export interface CategoryConfig {
  title: string;
  labels: string[];
}

export interface Config {
  categories: CategoryConfig[];
  uncategorizedTitle: string;
}

export interface PullRequest {
  number: number;
  title: string;
  labels: string[];
  author: string;
  mergedAt: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface ChangelogEntry {
  category: string;
  items: string[];
}

export interface TagPair {
  from: string;
  to: string;
}
