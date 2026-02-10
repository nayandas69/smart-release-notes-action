<div align="center">

# Smart Release Notes Action

**Automatically generate clean, categorized release notes from merged PRs and commits.**

[![CI](https://github.com/nayandas69/smart-release-notes-action/actions/workflows/ci.yml/badge.svg)](https://github.com/nayandas69/smart-release-notes-action/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

</div>

---

## Table of Contents

- [What's Included](#whats-included)
- [Setup](#setup)
- [Usage](#usage)
- [Inputs](#inputs)
- [Outputs](#outputs)
- [Configuration](#configuration)
- [Local Development](#local-development)
- [Contributing](#contributing)
- [License](#license)

---

## What's Included

- Automatic tag detection from `git push` events
- Merged PR collection between two tags with label-based categorization
- Commit-based fallback when PRs are unavailable
- Hybrid mode combining PRs and direct commits
- Customizable category mappings via JSON config
- Markdown-formatted changelog ready for GitHub Releases

---

## Setup

1. Ensure your repository uses Git tags for versioning (e.g., `v1.0.0`, `v1.1.0`).
2. Add the workflow file to `.github/workflows/` in your repository.
3. The action uses `${{ secrets.GITHUB_TOKEN }}` which is automatically provided by GitHub Actions.

---

## Usage

### Simple

```yaml
name: Release Notes
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

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          body: ${{ steps.notes.outputs.changelog }}
```

### Advanced

```yaml
- name: Generate Release Notes
  id: notes
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    from_tag: v1.0.0
    to_tag: v2.0.0
    mode: HYBRID
    config_file: .github/release-config.json
```

---

## Inputs

| Input         | Required | Default  | Description                                              |
| ------------- | -------- | -------- | -------------------------------------------------------- |
| `token`       | Yes      | -        | GitHub token for API access.                             |
| `from_tag`    | No       | Auto     | Starting tag. Defaults to the previous tag.              |
| `to_tag`      | No       | Auto     | Ending tag. Defaults to the tag from the push event.     |
| `mode`        | No       | `HYBRID` | Data source: `PR`, `COMMIT`, or `HYBRID`.                |
| `config_file` | No       | -        | Path to a JSON config file for custom category mappings. |

---

## Outputs

| Output     | Description                                    |
| ---------- | ---------------------------------------------- |
| `changelog`| Generated release notes in Markdown format.    |
| `from_tag` | The resolved starting tag used for generation. |
| `to_tag`   | The resolved ending tag used for generation.   |

---

## Configuration

Create a JSON file (e.g., `.github/release-config.json`) to customize how PRs are categorized:

```json
{
  "categories": [
    { "title": "Breaking Changes", "labels": ["breaking", "breaking-change"] },
    { "title": "New Features", "labels": ["feature", "enhancement"] },
    { "title": "Bug Fixes", "labels": ["bug", "bugfix", "fix"] },
    { "title": "Documentation", "labels": ["documentation", "docs"] },
    { "title": "Maintenance", "labels": ["chore", "maintenance", "refactor"] },
    { "title": "Dependencies", "labels": ["dependencies", "deps"] }
  ],
  "uncategorizedTitle": "Other Changes"
}
```

PRs are matched to the first category whose labels intersect with the PR's labels. Unmatched PRs appear under the `uncategorizedTitle` section.

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)

### Setup

```bash
git clone https://github.com/nayandas69/smart-release-notes-action.git
cd smart-release-notes-action
pnpm install
```

### Build

```bash
pnpm build
```

This compiles TypeScript and bundles everything into `dist/index.js` using `@vercel/ncc`.

### Test

```bash
pnpm test
```

### Type Check

```bash
pnpm typecheck
```

### Format

```bash
pnpm format
```

### Format Check

```bash
pnpm format:check
```

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-feature`.
3. Make your changes and add tests.
4. Run `pnpm test`, `pnpm build` and `pnpm format:check` to verify.
5. Submit a pull request.

Please use descriptive PR titles and add appropriate labels for automatic categorization.

---

## License

This project is licensed under the [MIT License](LICENSE).
