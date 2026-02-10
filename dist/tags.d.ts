import * as github from "@actions/github";
import type { TagPair } from "./types";
type Octokit = ReturnType<typeof github.getOctokit>;
export declare function resolveTags(octokit: Octokit, owner: string, repo: string, inputFrom: string, inputTo: string): Promise<TagPair>;
export {};
