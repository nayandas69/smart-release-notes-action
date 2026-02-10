# Advanced Usage Guide

Learn how to customize the Smart Release Notes Action for your specific workflow.

---

## Table of Contents

1. [Release Modes](#release-modes)
2. [Custom Categories](#custom-categories)
3. [Common Configurations](#common-configurations)
4. [Integration Examples](#integration-examples)
5. [Best Practices](#best-practices)

---

## Release Modes

The action supports three data collection modes. Choose the one that fits your workflow.

### PR Mode (PR)

Generates release notes from merged Pull Requests only.

**Use when:**
- Your team uses PRs for all changes
- You want consistent categorization through labels
- You prefer structured PR titles

**Workflow:**

```yaml
- name: Generate Release Notes
  id: notes
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    mode: PR
```

**Example Output:**

```markdown
## New Features
- Add dark mode support (#123)
- Implement user authentication (#124)

## Bug Fixes
- Fix memory leak in background worker (#125)

## Other Changes
- Update dependencies (#126)
```

### COMMIT Mode

Generates release notes from commit messages only.

**Use when:**
- Your team commits directly to main
- You don't use PR labels
- You follow a commit message convention (like Conventional Commits)

**Workflow:**

```yaml
- name: Generate Release Notes
  id: notes
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    mode: COMMIT
```

**Commit Message Format (Recommended):**

```
feat: add dark mode support
fix: resolve memory leak
docs: update installation guide
```

**Example Output:**

```markdown
## Features
- add dark mode support

## Fixes
- resolve memory leak

## Other Changes
- update installation guide
```

### HYBRID Mode (Default)

Combines both PRs and commits for comprehensive release notes.

**Use when:**
- Your team uses both PRs and direct commits
- You want maximum coverage of changes
- You want flexibility in your workflow

**Workflow:**

```yaml
- name: Generate Release Notes
  id: notes
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    mode: HYBRID
```

---

## Custom Categories

### Creating a Config File

Create `.github/release-config.json`:

```json
{
  "categories": [
    {
      "title": "🚀 Features",
      "labels": ["feature", "enhancement", "new"]
    },
    {
      "title": "🐛 Bug Fixes",
      "labels": ["bug", "bugfix", "fix", "hotfix"]
    },
    {
      "title": "⚡ Performance",
      "labels": ["performance", "optimization", "perf"]
    },
    {
      "title": "🛡️ Security",
      "labels": ["security", "security-fix"]
    },
    {
      "title": "📚 Documentation",
      "labels": ["documentation", "docs", "docs-update"]
    },
    {
      "title": "🔄 Refactoring",
      "labels": ["refactor", "refactoring", "cleanup"]
    },
    {
      "title": "📦 Dependencies",
      "labels": ["dependencies", "deps", "npm"]
    },
    {
      "title": "🔧 Maintenance",
      "labels": ["chore", "maintenance", "ci", "build"]
    }
  ],
  "uncategorizedTitle": "🎉 Other Changes"
}
```

### Using the Config File

```yaml
- name: Generate Release Notes
  id: notes
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    config_file: .github/release-config.json
```

### Category Matching Rules

- PRs are matched to the **first category** whose labels intersect with the PR's labels
- A PR with labels `[feature, enhancement]` matches the first category with either label
- Unmatched PRs appear under `uncategorizedTitle`

---

## Common Configurations

### Configuration 1: Node.js Library

For npm packages with strict semver:

```json
{
  "categories": [
    { "title": "Breaking Changes", "labels": ["breaking", "major"] },
    { "title": "New Features", "labels": ["feature", "enhancement"] },
    { "title": "Bug Fixes", "labels": ["bug", "fix"] },
    { "title": "Performance", "labels": ["performance"] },
    { "title": "Documentation", "labels": ["docs"] },
    { "title": "Internal", "labels": ["chore", "refactor"] }
  ],
  "uncategorizedTitle": "Miscellaneous"
}
```

### Configuration 2: Web Application

For product-focused releases:

```json
{
  "categories": [
    { "title": "✨ What's New", "labels": ["feature", "enhancement", "new"] },
    { "title": "🐛 Bug Fixes", "labels": ["bug", "fix", "regression"] },
    { "title": "🎨 UI/UX", "labels": ["ui", "ux", "design"] },
    { "title": "⚡ Performance", "labels": ["performance", "speed"] },
    { "title": "🔒 Security", "labels": ["security"] },
    { "title": "📖 Documentation", "labels": ["docs"] },
    { "title": "🛠️ Internal", "labels": ["chore", "refactor", "ci"] }
  ],
  "uncategorizedTitle": "Miscellaneous"
}
```

### Configuration 3: API Service

For backend services:

```json
{
  "categories": [
    { "title": "API Changes", "labels": ["api", "endpoint", "schema"] },
    { "title": "New Features", "labels": ["feature", "enhancement"] },
    { "title": "Bug Fixes", "labels": ["bug", "fix"] },
    { "title": "Database", "labels": ["database", "migration", "db"] },
    { "title": "Performance", "labels": ["performance", "optimization"] },
    { "title": "Dependencies", "labels": ["dependencies"] },
    { "title": "Infrastructure", "labels": ["infrastructure", "deployment"] }
  ],
  "uncategorizedTitle": "Other"
}
```

---

## Integration Examples

### Example 1: Create Release with Custom Title

```yaml
name: Release
on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate Release Notes
        id: notes
        uses: nayandas69/smart-release-notes-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          config_file: .github/release-config.json

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          name: "Release ${{ steps.notes.outputs.to_tag }}"
          body: ${{ steps.notes.outputs.changelog }}
          draft: false
          prerelease: false
```

### Example 2: Post Release Notes to Slack

```yaml
- name: Generate Release Notes
  id: notes
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}

- name: Send to Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "🚀 New Release: ${{ steps.notes.outputs.to_tag }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "${{ steps.notes.outputs.changelog }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Example 3: Specify Tag Range Manually

```yaml
- name: Generate Release Notes for Patch
  id: notes
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    from_tag: v1.2.0
    to_tag: v1.2.5
    config_file: .github/release-config.json
```

### Example 4: PR Mode for Strict Workflows

```yaml
- name: Generate from PRs Only
  id: notes
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    mode: PR
    config_file: .github/release-config.json
```

---

## Best Practices

### 1. Label Your PRs Consistently

- Use clear, descriptive labels (e.g., `feature`, `bug`, `documentation`)
- Apply labels to every PR before merging
- Use emoji in your config file for better visual distinction

**Example PR labels:**

```
- feature (for new functionality)
- bug (for defect fixes)
- docs (for documentation updates)
- performance (for optimizations)
- security (for security fixes)
```

### 2. Use Conventional Commits with COMMIT/HYBRID Mode

```
feat: add user authentication
fix: resolve race condition
docs: update API documentation
perf: optimize database queries
security: sanitize user input
```

### 3. Organize Categories by Priority

Place more important categories first:

```json
[
  { "title": "🚨 Breaking Changes", "labels": ["breaking"] },
  { "title": "✨ New Features", "labels": ["feature"] },
  { "title": "🐛 Bug Fixes", "labels": ["bug"] },
  { "title": "📚 Other", "labels": [] }
]
```

### 4. Version Your Releases Semantically

Use semantic versioning (MAJOR.MINOR.PATCH):

```
v1.0.0  -> v1.1.0  (minor release)
v1.1.0  -> v1.1.1  (patch release)
v1.1.1  -> v2.0.0  (major release)
```

### 5. Test Before Production

Create a test release with manual `from_tag` and `to_tag`:

```yaml
- name: Test Release Notes Generation
  id: notes
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    from_tag: v0.9.0
    to_tag: v1.0.0
    config_file: .github/release-config.json
```

### 6. Keep Your Config Updated

Regularly review and update your `release-config.json` to match your team's workflow.

---

## Troubleshooting Advanced Scenarios

### PRs Not Appearing in Release Notes

**Check:**
- PRs have labels that match your config file
- PR was merged before the tag
- You're using `PR` or `HYBRID` mode

**Debug:**
```yaml
- name: Generate with PR mode
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    mode: PR  # See if PRs appear
```

### Config File Not Applied

**Ensure:**
- Path is relative to repository root
- File exists and is valid JSON
- No trailing commas in JSON

**Validate JSON:**
```bash
jq . .github/release-config.json
```

### Tag Not Detected Correctly

**Specify tags manually:**
```yaml
from_tag: v1.0.0
to_tag: v2.0.0
```

---

## Learn More

- [Getting Started Guide](./GETTING_STARTED.md)
- [Main README](../README.md)
- [GitHub Actions Documentation](https://docs.github.com/actions)
