import { generateChangelog } from "../src/changelog";
import type { Config, PullRequest, Commit } from "../src/types";

const defaultConfig: Config = {
  categories: [
    { title: "New Features", labels: ["feature", "enhancement"] },
    { title: "Bug Fixes", labels: ["bug", "fix"] },
    { title: "Documentation", labels: ["docs"] },
  ],
  uncategorizedTitle: "Other Changes",
};

describe("generateChangelog", () => {
  it("should categorize PRs by label in PR mode", () => {
    const pulls: PullRequest[] = [
      {
        number: 1,
        title: "Add login page",
        labels: ["feature"],
        author: "alice",
        mergedAt: "2024-01-01T00:00:00Z",
      },
      {
        number: 2,
        title: "Fix crash on startup",
        labels: ["bug"],
        author: "bob",
        mergedAt: "2024-01-02T00:00:00Z",
      },
    ];

    const result = generateChangelog(
      defaultConfig,
      pulls,
      [],
      "PR",
      "v1.0.0",
      "v1.1.0"
    );

    expect(result).toContain("## What's Changed (v1.0.0 → v1.1.0)");
    expect(result).toContain("### New Features");
    expect(result).toContain("- Add login page (#1) @alice");
    expect(result).toContain("### Bug Fixes");
    expect(result).toContain("- Fix crash on startup (#2) @bob");
  });

  it("should place unlabeled PRs in the uncategorized section", () => {
    const pulls: PullRequest[] = [
      {
        number: 5,
        title: "Random change",
        labels: [],
        author: "charlie",
        mergedAt: "2024-01-03T00:00:00Z",
      },
    ];

    const result = generateChangelog(
      defaultConfig,
      pulls,
      [],
      "PR",
      "v1.0.0",
      "v1.1.0"
    );

    expect(result).toContain("### Other Changes");
    expect(result).toContain("- Random change (#5) @charlie");
  });

  it("should format commits in COMMIT mode", () => {
    const commits: Commit[] = [
      {
        sha: "abc1234",
        message: "Initial commit",
        author: "dave",
        date: "2024-01-01T00:00:00Z",
      },
    ];

    const result = generateChangelog(
      defaultConfig,
      [],
      commits,
      "COMMIT",
      "v1.0.0",
      "v1.1.0"
    );

    expect(result).toContain("### Commits");
    expect(result).toContain("- `abc1234` Initial commit (@dave)");
  });

  it("should include both PRs and commits in HYBRID mode", () => {
    const pulls: PullRequest[] = [
      {
        number: 10,
        title: "Add search",
        labels: ["feature"],
        author: "eve",
        mergedAt: "2024-01-01T00:00:00Z",
      },
    ];

    const commits: Commit[] = [
      {
        sha: "def5678",
        message: "Update readme",
        author: "frank",
        date: "2024-01-02T00:00:00Z",
      },
    ];

    const result = generateChangelog(
      defaultConfig,
      pulls,
      commits,
      "HYBRID",
      "v1.0.0",
      "v1.1.0"
    );

    expect(result).toContain("### New Features");
    expect(result).toContain("- Add search (#10) @eve");
    expect(result).toContain("### Commits");
    expect(result).toContain("- `def5678` Update readme (@frank)");
  });

  it("should show fallback message when no changes exist", () => {
    const result = generateChangelog(
      defaultConfig,
      [],
      [],
      "PR",
      "v1.0.0",
      "v1.1.0"
    );

    expect(result).toContain("_No notable changes in this release._");
  });
});
