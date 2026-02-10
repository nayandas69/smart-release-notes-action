import type { Config, PullRequest, Commit, Mode } from "./types";
export declare function generateChangelog(config: Config, pulls: PullRequest[], commits: Commit[], mode: Mode, fromTag: string, toTag: string): string;
