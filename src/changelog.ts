import type {
  Config,
  PullRequest,
  Commit,
  ChangelogEntry,
  Mode,
} from "./types";

export function generateChangelog(
  config: Config,
  pulls: PullRequest[],
  commits: Commit[],
  mode: Mode,
  fromTag: string,
  toTag: string
): string {
  const sections: string[] = [];
  sections.push(`## What's Changed (${fromTag} → ${toTag})\n`);

  if (mode === "PR" || mode === "HYBRID") {
    const prEntries = categorizePulls(config, pulls);
    if (prEntries.length > 0) {
      for (const entry of prEntries) {
        sections.push(`### ${entry.category}\n`);
        for (const item of entry.items) {
          sections.push(item);
        }
        sections.push("");
      }
    }
  }

  if (mode === "COMMIT" || mode === "HYBRID") {
    const commitLines = formatCommits(commits, pulls);
    if (commitLines.length > 0) {
      sections.push("### Commits\n");
      for (const line of commitLines) {
        sections.push(line);
      }
      sections.push("");
    }
  }

  if (sections.length <= 1) {
    sections.push("_No notable changes in this release._\n");
  }

  return sections.join("\n").trim();
}

function categorizePulls(
  config: Config,
  pulls: PullRequest[]
): ChangelogEntry[] {
  const categoryMap = new Map<string, string[]>();
  const matched = new Set<number>();

  for (const cat of config.categories) {
    categoryMap.set(cat.title, []);
  }

  for (const pr of pulls) {
    let placed = false;
    for (const cat of config.categories) {
      const hasMatch = pr.labels.some((label) =>
        cat.labels.includes(label.toLowerCase())
      );
      if (hasMatch) {
        categoryMap
          .get(cat.title)!
          .push(`- ${pr.title} (#${pr.number}) @${pr.author}`);
        matched.add(pr.number);
        placed = true;
        break;
      }
    }
    if (!placed) {
      if (!categoryMap.has(config.uncategorizedTitle)) {
        categoryMap.set(config.uncategorizedTitle, []);
      }
      categoryMap
        .get(config.uncategorizedTitle)!
        .push(`- ${pr.title} (#${pr.number}) @${pr.author}`);
    }
  }

  const entries: ChangelogEntry[] = [];
  for (const [category, items] of categoryMap) {
    if (items.length > 0) {
      entries.push({ category, items });
    }
  }

  return entries;
}

function formatCommits(
  commits: Commit[],
  pulls: PullRequest[]
): string[] {
  // In HYBRID mode, exclude commits already covered by PRs
  const prMergeShas = new Set<string>();
  for (const pr of pulls) {
    // PR merge commits are filtered in commits.ts, but we also
    // skip commits whose messages reference a PR number
    prMergeShas.add(`#${pr.number}`);
  }

  return commits
    .filter((c) => {
      const referencedByPR = [...prMergeShas].some((ref) =>
        c.message.includes(ref)
      );
      return !referencedByPR;
    })
    .map((c) => `- \`${c.sha}\` ${c.message} (@${c.author})`);
}
