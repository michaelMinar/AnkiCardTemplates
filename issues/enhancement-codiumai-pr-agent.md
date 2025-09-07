# Enhancement: Integrate CodiumAI PR‑Agent for AI Code Review

## Summary
Adopt CodiumAI PR‑Agent to provide richer, configurable AI reviews on pull requests. Keep the current lightweight OpenAI workflow in place. Start with comment‑triggered reviews restricted to org members to reduce noise and avoid fork‑related secret exposure.

## Motivation
- Higher‑quality, file‑scoped feedback with actionable suggestions and optional commands (e.g., review, summarize, test hints).
- Tunable prompts and provider/model selection without maintaining custom diff logic.
- Complements existing CI and unit tests; aims to shorten review cycles.

## Proposed Approach
Option A — GitHub Action (self‑hosted keys)
- Add a PR‑Agent workflow triggered by issue comments on PRs (e.g., `/ai-review`, `/pr-review`).
- Limit execution to `OWNER/MEMBER/COLLABORATOR` comments.
- Provide provider API key via repository secrets (e.g., `OPENAI_API_KEY`).
- Pin action by commit SHA for supply‑chain safety.

Option B — GitHub App (hosted)
- Install the CodiumAI PR‑Agent GitHub App on this repo.
- Minimal setup, but code is sent to vendor’s service; admin‑controlled permissions.

## Security & Permissions
- Prefer comment‑triggered runs with membership checks; avoid running on untrusted fork code.
- If using `pull_request_target`, do not checkout untrusted refs or expose secrets to user code.
- Use least‑privilege permissions: `contents:read`, `pull-requests:write`, `issues:write`.
- Pin third‑party actions by commit SHA, not tags.

## Draft Workflow (Action)
```yaml
name: CodiumAI PR‑Agent
on:
  issue_comment:
    types: [created]
permissions:
  contents: read
  pull-requests: write
  issues: write
jobs:
  pr_agent:
    runs-on: ubuntu-latest
    if: >
      github.event.issue.pull_request &&
      (contains(github.event.comment.body, '/ai-review') || contains(github.event.comment.body, '/pr-review'))
    steps:
      - name: Require repo member/owner
        uses: actions/github-script@v7
        with:
          script: |
            const role = context.payload.comment.author_association;
            if (!['OWNER','MEMBER','COLLABORATOR'].includes(role)) {
              core.setFailed(`Unauthorized commenter: ${role}`);
            }
      - name: Run PR‑Agent
        uses: CodiumAI/pr-agent@<PINNED_SHA>
        env:
          GITHUB_TOKEN:    ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY:  ${{ secrets.OPENAI_API_KEY }}  # or ANTHROPIC_API_KEY, etc.
        # Optional inputs/vars are configurable per upstream docs
```

## Configuration
- System prompt and verbosity can be customized via the action inputs or a project config file (consult PR‑Agent docs for exact keys and file name).
- Exclude noisy paths (lockfiles, `build/**`, `node_modules/**`, `*.min.*`, `*.md`).
- Set the model (e.g., `o4-mini`, `gpt-4o`, Anthropic) according to cost/quality trade‑offs.

## Rollout Plan
1) Create repo secrets for the selected provider (e.g., `OPENAI_API_KEY`).
2) Add the workflow (comment‑triggered only) and pin action by SHA.
3) Trial on a small PR using `/ai-review`; adjust prompts/exclusions.
4) Document commands in README/AGENTS.md.

## Acceptance Criteria
- Workflow runs only for authorized commenters on PRs and leaves a review/comment.
- Excluded paths are not analyzed.
- No secrets are exposed to untrusted code; permissions are minimal.
- Review output is concise, file‑scoped, and actionable.

## Alternatives
- Keep the current `github-script` reviewer only (max control, minimal deps).
- Use CodeRabbit or Copilot PRs (less config, more vendor coupling).

## Open Questions
- Preferred provider/model and temperature.
- Whether to support additional commands (summaries, test hints) beyond `/ai-review`.

