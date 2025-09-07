# AnkiCardTemplates

Source code for Javascript based Anki Card templates. I'm particularly interested in creating dynamic mathematics test cards. For instance, rather than giving me the same pair of 2 digit numbers to mulitpy together, we should generate random numbers each time. 

## AI Reviews

- Default reviewer: Anthropic Claude Opus 4.1 runs on all PRs to `main` via GitHub Actions.
- On-demand reviewers (comment on a PR):
  - `/codex-review` → OpenAI `gpt-5`
  - `/gemini-review` → Google `gemini-2.5-pro`
- Access: only repo Owner/Member/Collaborator comments are honored; forks don’t receive secrets.
- Secrets required: `ANTHROPIC_API_KEY` (default), and optionally `OPENAI_API_KEY` and `GEMINI_API_KEY` for the comment triggers.
- Exclusions: lockfiles, `node_modules/**`, `build/**`, `*.min.*`, and `*.md` are ignored to reduce noise.
- Configuration lives in `.github/workflows/ai-code-review.yml`. Future option: CodiumAI PR‑Agent (see `issues/enhancement-codiumai-pr-agent.md`).
