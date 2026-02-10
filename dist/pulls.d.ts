import * as github from "@actions/github";
import type { PullRequest } from "./types";
type Octokit = ReturnType<typeof github.getOctokit>;
export declare function fetchMergedPulls(octokit: Octokit, owner: string, repo: string, fromTag: string, toTag: string): Promise<PullRequest[]>;
export {};
