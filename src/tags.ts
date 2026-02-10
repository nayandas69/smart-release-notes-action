import * as core from "@actions/core";
import * as github from "@actions/github";
import type { TagPair } from "./types";

type Octokit = ReturnType<typeof github.getOctokit>;

export async function resolveTags(
  octokit: Octokit,
  owner: string,
  repo: string,
  inputFrom: string,
  inputTo: string
): Promise<TagPair> {
  let toTag = inputTo;
  let fromTag = inputFrom;

  // Resolve "to" tag from the current ref if not provided
  if (!toTag) {
    const ref = github.context.ref;
    if (ref.startsWith("refs/tags/")) {
      toTag = ref.replace("refs/tags/", "");
    } else {
      throw new Error(
        `Could not determine the current tag from ref "${ref}". Please provide "to_tag" input.`
      );
    }
  }

  // Resolve "from" tag by finding the previous tag if not provided
  if (!fromTag) {
    fromTag = await findPreviousTag(octokit, owner, repo, toTag);
  }

  core.info(`Resolved tag range: ${fromTag} -> ${toTag}`);
  return { from: fromTag, to: toTag };
}

async function findPreviousTag(
  octokit: Octokit,
  owner: string,
  repo: string,
  currentTag: string
): Promise<string> {
  const { data: tags } = await octokit.rest.repos.listTags({
    owner,
    repo,
    per_page: 100,
  });

  const tagNames = tags.map((t) => t.name);
  const currentIndex = tagNames.indexOf(currentTag);

  if (currentIndex === -1) {
    throw new Error(
      `Tag "${currentTag}" not found in the repository's tag list.`
    );
  }

  if (currentIndex + 1 >= tagNames.length) {
    throw new Error(
      `No previous tag found before "${currentTag}". This appears to be the first tag.`
    );
  }

  return tagNames[currentIndex + 1];
}
