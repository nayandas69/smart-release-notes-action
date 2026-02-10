import * as github from "@actions/github";
import type { Commit } from "./types";
type Octokit = ReturnType<typeof github.getOctokit>;
export declare function fetchCommits(octokit: Octokit, owner: string, repo: string, fromTag: string, toTag: string): Promise<Commit[]>;
export {};
