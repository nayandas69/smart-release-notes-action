import * as core from "@actions/core";
import * as github from "@actions/github";
import type { Commit } from "./types";

type Octokit = ReturnType<typeof github.getOctokit>;

export async function fetchCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  fromTag: string,
  toTag: string
): Promise<Commit[]> {
  const comparison = await octokit.rest.repos.compareCommitsWithBasehead({
    owner,
    repo,
    basehead: `${fromTag}...${toTag}`,
  });

  const commits: Commit[] = comparison.data.commits
    .filter((c) => {
      // Skip merge commits to avoid duplication with PRs
      const isMerge = c.parents && c.parents.length > 1;
      return !isMerge;
    })
    .map((c) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split("\n")[0],
      author: c.author?.login ?? c.commit.author?.name ?? "unknown",
      date: c.commit.author?.date ?? "",
    }));

  core.info(`Found ${commits.length} commit(s) in range.`);
  return commits;
}
