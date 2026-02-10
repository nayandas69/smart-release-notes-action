import * as core from "@actions/core";
import * as github from "@actions/github";
import type { PullRequest } from "./types";

type Octokit = ReturnType<typeof github.getOctokit>;

export async function fetchMergedPulls(
  octokit: Octokit,
  owner: string,
  repo: string,
  fromTag: string,
  toTag: string
): Promise<PullRequest[]> {
  const comparison = await octokit.rest.repos.compareCommitsWithBasehead({
    owner,
    repo,
    basehead: `${fromTag}...${toTag}`,
  });

  const commitShas = new Set(
    comparison.data.commits.map((c) => c.sha)
  );

  const pulls: PullRequest[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "closed",
      sort: "updated",
      direction: "desc",
      per_page: perPage,
      page,
    });

    if (data.length === 0) break;

    for (const pr of data) {
      if (!pr.merged_at || !pr.merge_commit_sha) continue;
      if (!commitShas.has(pr.merge_commit_sha)) continue;

      pulls.push({
        number: pr.number,
        title: pr.title,
        labels: pr.labels.map((l) => l.name ?? ""),
        author: pr.user?.login ?? "unknown",
        mergedAt: pr.merged_at,
      });
    }

    // Stop paginating once we've gone past the range
    if (data.length < perPage) break;
    page++;
  }

  core.info(`Found ${pulls.length} merged PR(s) in range.`);
  return pulls;
}
