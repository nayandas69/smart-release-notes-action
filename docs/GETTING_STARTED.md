# Getting Started with Smart Release Notes Action

A step-by-step guide to integrate the Smart Release Notes Action into your GitHub repository.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Basic Setup](#basic-setup)
4. [Testing Your Setup](#testing-your-setup)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, ensure you have:

- A GitHub repository with Git tags for versioning (e.g., `v1.0.0`, `v1.1.0`)
- At least one existing tag in your repository
- Basic knowledge of GitHub Actions YAML syntax
- `write` permissions on the repository (for creating releases)

---

## Installation

### Step 1: Create the Workflow Directory

If you don't already have a `.github/workflows/` directory, create it:

```bash
mkdir -p .github/workflows
```

### Step 2: Create a Workflow File

Create a new file named `.github/workflows/release-notes.yml`:

```yaml
name: Generate Release Notes
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

### Step 3: Commit and Push

```bash
git add .github/workflows/release-notes.yml
git commit -m "ci: add smart release notes workflow"
git push origin main
```

---

## Basic Setup

### Minimal Configuration

For most projects, the minimal setup is sufficient:

```yaml
- name: Generate Release Notes
  id: notes
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

This will:
- Auto-detect the previous tag as `from_tag`
- Use the current tag as `to_tag`
- Use `HYBRID` mode (combines PRs and commits)
- Use default category mappings

### With Custom Configuration

For more control, add optional inputs:

```yaml
- name: Generate Release Notes
  id: notes
  uses: nayandas69/smart-release-notes-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    mode: PR  # Use only PRs (not commits)
    config_file: .github/release-config.json  # Custom categories
```

---

## Testing Your Setup

### Test with a Tag Push

1. Create a new tag locally:

```bash
git tag -a v1.0.0 -m "First release"
```

2. Push the tag to GitHub:

```bash
git push origin v1.0.0
```

3. Go to your repository's **Actions** tab to watch the workflow run.

4. Once complete, visit the **Releases** page to see the generated release notes.

### View Workflow Logs

If something goes wrong:

1. Go to **Actions** → **Generate Release Notes**
2. Click on the failed run
3. Expand the "Generate Release Notes" step to see logs
4. Check [Troubleshooting](#troubleshooting) section

---

## Troubleshooting

### Issue: "No tags found in the repository"

**Solution:** Create at least one tag before pushing a new release:

```bash
git tag v0.1.0
git push origin v0.1.0
git tag v1.0.0
git push origin v1.0.0
```

### Issue: "Workflow doesn't trigger on tag push"

**Solution:** Verify your workflow file has the correct trigger:

```yaml
on:
  push:
    tags:
      - "v*"  # Matches v1.0.0, v2.1.0, etc.
```

### Issue: "Empty changelog generated"

**Possible Causes:**
- No PRs merged between the two tags
- No commits between the two tags
- Check if your PRs have the correct labels matching your config

### Issue: "Config file not found"

**Solution:** Ensure the `config_file` path is relative to the repository root:

```yaml
config_file: .github/release-config.json  # ✓ Correct
config_file: release-config.json          # ✗ Wrong
```

### Issue: "Permission denied" error

**Solution:** Add `permissions` to your job:

```yaml
permissions:
  contents: write  # Required to create releases
```

---

## Next Steps

- Learn about [Advanced Configuration](./ADVANCED_USAGE.md)
- [Customize Categories](./ADVANCED_USAGE.md#custom-categories) for your project
- [Switch Release Modes](./ADVANCED_USAGE.md#release-modes) based on your workflow

---

## Need Help?

- Check the [main README](../README.md)
- Review [Common Configurations](./ADVANCED_USAGE.md#common-configurations)
- Open an issue on GitHub
