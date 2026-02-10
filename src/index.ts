import * as core from "@actions/core";
import * as github from "@actions/github";
import { getInputs } from "./inputs";
import { loadConfig } from "./config";
import { resolveTags } from "./tags";
import { fetchMergedPulls } from "./pulls";
import { fetchCommits } from "./commits";
import { generateChangelog } from "./changelog";
import type { PullRequest, Commit } from "./types";

async function run(): Promise<void> {
  try {
    const inputs = getInputs();
    const octokit = github.getOctokit(inputs.token);
    const { owner, repo } = github.context.repo;

    core.startGroup("Resolving tags");
    const tags = await resolveTags(
      octokit,
      owner,
      repo,
      inputs.fromTag,
      inputs.toTag
    );
    core.endGroup();

    const config = loadConfig(inputs.configFile);

    let pulls: PullRequest[] = [];
    let commits: Commit[] = [];

    if (inputs.mode === "PR" || inputs.mode === "HYBRID") {
      core.startGroup("Fetching merged pull requests");
      pulls = await fetchMergedPulls(octokit, owner, repo, tags.from, tags.to);
      core.endGroup();
    }

    if (inputs.mode === "COMMIT" || inputs.mode === "HYBRID") {
      core.startGroup("Fetching commits");
      commits = await fetchCommits(octokit, owner, repo, tags.from, tags.to);
      core.endGroup();
    }

    core.startGroup("Generating changelog");
    const changelog = generateChangelog(
      config,
      pulls,
      commits,
      inputs.mode,
      tags.from,
      tags.to
    );
    core.endGroup();

    core.setOutput("changelog", changelog);
    core.setOutput("from_tag", tags.from);
    core.setOutput("to_tag", tags.to);

    core.info("Release notes generated successfully.");
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unexpected error occurred.");
    }
  }
}

run();
